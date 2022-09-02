import { PlusOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, Input, Radio, Space, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { Fragment, useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import pageMessages from '../../pages/translation'
import { StyledTips } from '../admin'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ImageInput from '../form/ImageInput'

export type GiftPlanFields = {
  giftPlanTitle: string
  customGifts: TokenGift[]
  customGiftName: string
  customGiftCoverUrl: string
  deliverMethod: string
}

type TokenGift = {
  id: string
  title: string
  coverUrl: string | null
  isDeliverable: boolean
}

const GiftPlanCollectionEditAdminModal: React.VFC<
  AdminModalProps & {
    giftPlanId?: string
    giftPlanTitle?: string
    giftIdList: string[]
    onRefetch?: () => void
  }
> = ({ giftPlanId, giftPlanTitle, giftIdList, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [form] = useForm<GiftPlanFields>()
  const [loading, setLoading] = useState(false)
  const giftId = uuid()
  const { giftCollection, refetchGiftCollection, giftCollectionLoading, giftCollectionError } = useGiftCollection(
    giftIdList,
    appId,
  )
  const [updateCustomGiftCoverUrl] = useMutation<
    hasura.UPDATE_CUSTOM_GIFT_COVER_URL,
    hasura.UPDATE_CUSTOM_GIFT_COVER_URLVariables
  >(UPDATE_CUSTOM_GIFT_COVER_URL)

  const coverUrlList = giftCollection.map(gift => gift.coverUrl)

  const handleUpload = (value: string | null) => {
    if (value) {
      const tokenId = value.split('/')[2]
      const coverUrl = `https://${process.env.REACT_APP_S3_BUCKET}/${value}`
      // console.log(tokenId)
      // console.log(coverUrl)
      updateCustomGiftCoverUrl({
        variables: {
          tokenId: tokenId,
          coverUrl: coverUrl,
        },
      })
        .then(() => refetchGiftCollection())
        .catch(err => console.log(err))
    }

    // console.log(
    //   `https://${process.env.REACT_APP_S3_BUCKET}/gift_plan_covers/${appId}/${
    //     (coverUrlList && coverUrlList[idx].id) || giftId
    //   }/${coverId}`,
    // )
  }

  const handleSubmit = (setVisible: (visible: boolean) => void, giftPlanId?: string) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        refetchGiftCollection()
        const values = form.getFieldsValue()
        console.log(values)
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].editGiftPlan)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              handleSubmit(setVisible, giftPlanId)
            }}
          >
            {formatMessage(commonMessages['ui'].confirm)}
          </Button>
        </div>
      )}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          giftPlanTitle: giftPlanTitle || '',
          customGifts:
            giftCollection.length > 0
              ? giftCollection.map((gift, idx) => {
                  return {
                    id: gift.id,
                    title: gift.title,
                    coverUrl: coverUrlList[idx],
                    isDeliverable: gift.isDeliverable,
                  }
                })
              : [{ id: uuid(), title: '', coverUrl: '', isDeliverable: true }],
        }}
      >
        <Form.Item
          label={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlanTitle)}
          name="giftPlanTitle"
          rules={[
            {
              required: true,
              message: formatMessage(promotionMessages['*'].isRequired, {
                field: formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlanTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.List name="customGifts">
          {(fields, { add, remove }) => {
            return (
              <>
                {fields.map((gift, idx) => {
                  const coverId = uuid()
                  return (
                    <Fragment key={gift.key}>
                      <Form.Item
                        label={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftItemName)}
                        name={[gift.name, 'title']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage(promotionMessages['*'].isRequired, {
                              field: formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftItemName),
                            }),
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span className="d-flex align-items-center">
                            {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftCover)}
                            <Tooltip
                              placement="top"
                              title={
                                <StyledTips>
                                  {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftCoverTips)}
                                </StyledTips>
                              }
                            >
                              <QuestionCircleFilled className="ml-2" />
                            </Tooltip>
                          </span>
                        }
                        name={[gift.name, 'coverUrl']}
                      >
                        <>
                          <ImageInput
                            path={`gift_plan_covers/${appId}/${giftCollection[idx]?.id || giftId}/${coverId}`}
                            image={{
                              width: '120px',
                              ratio: 1,
                            }}
                            value={coverUrlList[idx]}
                            onChange={value => {
                              handleUpload(value)
                            }}
                          />
                        </>
                      </Form.Item>
                      <Form.Item
                        label={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftDeliverMethod)}
                        name={[gift.name, 'isDeliverable']}
                      >
                        <Radio.Group>
                          <Space direction="vertical">
                            <Radio value={true}>
                              {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].isDeliverable)}
                            </Radio>
                            <Radio value={false}>
                              {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].isNotDeliverable)}
                            </Radio>
                          </Space>
                        </Radio.Group>
                      </Form.Item>
                    </Fragment>
                  )
                })}
                <Form.Item>
                  <Button type="primary" onClick={() => add({ id: uuid() })} icon={<PlusOutlined />}>
                    新增欄位
                  </Button>
                </Form.Item>
              </>
            )
          }}
        </Form.List>
      </Form>
    </AdminModal>
  )
}

export default GiftPlanCollectionEditAdminModal

const useGiftCollection = (giftIdList: string[], appId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_GIFT_COLLECTION, hasura.GET_GIFT_COLLECTIONVariables>(
    GET_GIFT_COLLECTION,
    {
      variables: {
        giftIdList,
        appId,
      },
    },
  )
  const giftCollection: TokenGift[] =
    data?.token.map(v => ({
      id: v.id,
      title: v.title,
      coverUrl: v.cover_url,
      isDeliverable: v.is_deliverable,
    })) || []

  return {
    giftCollection: giftCollection,
    refetchGiftCollection: refetch,
    giftCollectionLoading: loading,
    giftCollectionError: error,
  }
}

const GET_GIFT_COLLECTION = gql`
  query GET_GIFT_COLLECTION($giftIdList: [uuid!]!, $appId: String!) {
    token(where: { id: { _in: $giftIdList }, app_id: { _eq: $appId }, type: { _eq: "gift" } }) {
      id
      title
      cover_url
      is_deliverable
    }
  }
`

const UPDATE_CUSTOM_GIFT_COVER_URL = gql`
  mutation UPDATE_CUSTOM_GIFT_COVER_URL($tokenId: uuid!, $coverUrl: String!) {
    update_token(where: { id: { _eq: $tokenId } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`
