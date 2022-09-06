import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { FormControl, Input, Radio, RadioGroup, Stack } from '@chakra-ui/react'
import { Button, message, Tooltip } from 'antd'
import axios, { Canceler } from 'axios'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { uploadFile } from 'lodestar-app-element/src/helpers'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import pageMessages from '../../pages/translation'
import { StyledTips } from '../admin'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ImageUploader from '../common/ImageUploader'

const StyledLabel = styled.label`
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
`
const StyledFormItem = styled.div`
  margin-bottom: 32px;
`

export type GiftPlanFields = {
  giftPlanTitle?: string
  tokenId?: string
  customGiftName?: string
  customGiftCoverUrl?: string
  isDeliverable?: boolean | string
}

type TokenGift = {
  id: string
  title: string
  coverUrl: string | null
  isDeliverable?: boolean
}

const GiftPlanCollectionEditAdminModal: React.VFC<
  AdminModalProps & {
    giftPlan?: {
      id?: string
      title?: string
      giftPlanProductId?: string
    }
    giftId?: string
    onRefetch?: () => void
  }
> = ({ giftPlan, giftId, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { currentMemberId, authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<GiftPlanFields>()
  const [coverImg, setCoverImg] = useState<File | null>(null)
  const { gift, refetchGift, giftLoading, giftError } = useGift({
    id: giftId !== undefined ? { _eq: giftId } : { _is_null: true },
  })
  const { control, reset, getValues } = useForm<GiftPlanFields>()
  const [updateCustomGiftCoverUrl] = useMutation<
    hasura.UPDATE_CUSTOM_GIFT_COVER_URL,
    hasura.UPDATE_CUSTOM_GIFT_COVER_URLVariables
  >(UPDATE_CUSTOM_GIFT_COVER_URL)
  const [insertGiftPlan] = useMutation<hasura.INSERT_GIFT_PLAN, hasura.INSERT_GIFT_PLANVariables>(INSERT_GIFT_PLAN)
  const [updateGiftPlan] = useMutation<hasura.UPDATE_GIFT_PLAN, hasura.UPDATE_GIFT_PLANVariables>(UPDATE_GIFT_PLAN)
  const [upsertGift] = useMutation<hasura.UPSERT_GIFT, hasura.UPSERT_GIFTVariables>(UPSERT_GIFT)

  const handleSubmit = (setVisible: (visible: boolean) => void) => {
    setLoading(true)
    const values = getValues()
    const upsertGiftPlanProductId = giftPlan?.giftPlanProductId || uuid()
    const upsertGiftPlanId = giftPlan?.id || uuid()
    const upsertGiftId = values.tokenId || uuid()

    upsertGift({
      variables: {
        tokens: [
          {
            id: upsertGiftId,
            app_id: appId,
            type: 'gift',
            title: values.customGiftName,
            cover_url: values.customGiftCoverUrl,
            is_deliverable: values.isDeliverable === 'true',
          },
        ],
      },
    })
      .then(async () => {
        if (coverImg) {
          const coverId = uuid()
          try {
            await uploadFile(`gift_images/${appId}/${values.tokenId || upsertGiftId}/${coverId}`, coverImg, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
            return error
          }
          await updateCustomGiftCoverUrl({
            variables: {
              tokenId: values.tokenId || upsertGiftId,
              coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/gift_images/${appId}/${
                values.tokenId || upsertGiftId
              }/${coverId}/400`,
            },
          }).catch(err => {
            console.log(err)
          })
        }
      })
      .catch(err => console.log(err))
      .finally(() => {
        if (giftPlan?.giftPlanProductId !== undefined) {
          updateGiftPlan({
            variables: {
              giftPlanId: upsertGiftPlanId,
              title: values.giftPlanTitle || '',
            },
          })
            .then(() => {
              onRefetch?.()
              refetchGift().then(() => {
                setLoading(false)
                setVisible(false)
                message.success(formatMessage(commonMessages.event.successfullySaved))
              })
            })
            .catch(err => console.log(err))
        } else {
          insertGiftPlan({
            variables: {
              giftPlanId: upsertGiftPlanId,
              appId: appId,
              giftPlanTitle: values.giftPlanTitle || '',
              editorId: currentMemberId,
              giftPlanProductId: upsertGiftPlanProductId,
              productId: `Token_${upsertGiftId}`,
            },
          })
            .then(() => {
              onRefetch?.()
              refetchGift().then(() => {
                setLoading(false)
                setVisible(false)
                message.success(formatMessage(commonMessages.event.successfullySaved))
              })
            })
            .catch(err => console.log(err))
        }
      })
  }

  useEffect(() => {
    setFormData({
      tokenId: gift.id,
      giftPlanTitle: giftPlan?.title || '',
      customGiftName: gift.title,
      customGiftCoverUrl: gift.coverUrl || '',
      isDeliverable: gift.isDeliverable?.toString(),
    })
  }, [gift.coverUrl, gift.id, gift.isDeliverable, gift.title, giftPlan?.title])

  useEffect(() => {
    reset(formData)
  }, [formData, reset])

  return (
    <AdminModal
      title={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].editGiftPlan)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages['ui'].confirm)}
          </Button>
        </>
      )}
      {...props}
    >
      <form style={{ marginBottom: '32px' }}>
        <FormControl id="tokenId">
          <StyledFormItem>
            <Controller
              name="tokenId"
              control={control}
              rules={{ required: true }}
              render={field => <Input {...field} hidden />}
            />
          </StyledFormItem>
        </FormControl>
        <FormControl id="giftPlanTitle">
          <StyledFormItem>
            <StyledLabel htmlFor="giftPlanTitle">
              {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlanTitle)}
            </StyledLabel>
            <Controller
              name="giftPlanTitle"
              control={control}
              rules={{ required: true }}
              render={field => (
                <Input
                  {...field}
                  onBlur={e => {
                    setFormData({
                      ...formData,
                      giftPlanTitle: e.target.value,
                    })
                  }}
                />
              )}
            />
          </StyledFormItem>
        </FormControl>
        <FormControl id="customGiftName">
          <StyledFormItem>
            <StyledLabel htmlFor="customGiftName">
              {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftItemName)}
            </StyledLabel>
            <Controller
              name="customGiftName"
              control={control}
              rules={{ required: true }}
              render={field => (
                <Input
                  {...field}
                  onBlur={e => {
                    setFormData({
                      ...formData,
                      customGiftName: e.target.value,
                    })
                  }}
                />
              )}
            />
          </StyledFormItem>
        </FormControl>
        <FormControl id="customGiftCoverUrl">
          <StyledFormItem>
            <StyledLabel className="d-flex align-items-center">
              {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftCover)}
              <Tooltip
                placement="top"
                title={
                  <StyledTips>{formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftCoverTips)}</StyledTips>
                }
              >
                <QuestionCircleFilled className="ml-2" />
              </Tooltip>
            </StyledLabel>
            <Controller
              name="customGiftCoverUrl"
              control={control}
              render={field => {
                return (
                  <ImageUploader
                    file={coverImg}
                    initialCoverUrl={formData?.customGiftCoverUrl || null}
                    onChange={file => setCoverImg(file)}
                  />
                  // <ImageInput
                  //   path={`gift_plan_covers/${appId}/${gift?.id || newGiftId}/${coverId}`}
                  //   image={{
                  //     width: '120px',
                  //     ratio: 1,
                  //   }}
                  //   value={formData?.customGiftCoverUrl}
                  //   onChange={value => {
                  //     handleUpload(value)
                  //   }}
                  // />
                )
              }}
            />
          </StyledFormItem>
        </FormControl>
        <FormControl id="isDeliverable">
          <StyledFormItem>
            <StyledLabel className="d-flex align-items-center">
              {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftDeliverMethod)}
            </StyledLabel>
            <Controller
              name="isDeliverable"
              control={control}
              render={field => (
                <RadioGroup
                  {...field}
                  defaultValue="true"
                  onChange={e => {
                    setFormData({
                      ...formData,
                      isDeliverable: e.toLocaleString(),
                    })
                  }}
                >
                  <Stack direction="column">
                    <Radio size="md" value="true">
                      {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].isDeliverable)}
                    </Radio>
                    <Radio size="md" value="false">
                      {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].isNotDeliverable)}
                    </Radio>
                  </Stack>
                </RadioGroup>
              )}
            />
          </StyledFormItem>
        </FormControl>
      </form>
    </AdminModal>
  )
}

export default GiftPlanCollectionEditAdminModal

const useGift = (condition: hasura.GET_GIFTVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_GIFT, hasura.GET_GIFTVariables>(GET_GIFT, {
    variables: {
      condition,
    },
  })

  const gift: TokenGift = {
    id: data?.token[0]?.id,
    title: data?.token[0]?.title || '',
    coverUrl: data?.token[0]?.cover_url || '',
    isDeliverable: data?.token[0]?.is_deliverable,
  } || {
    id: uuid(),
    title: '',
    coverUrl: '',
    isDeliverable: true,
  }

  return {
    gift: gift,
    refetchGift: refetch,
    giftLoading: loading,
    giftError: error,
  }
}

const GET_GIFT = gql`
  query GET_GIFT($condition: token_bool_exp!) {
    token(where: $condition) {
      id
      title
      cover_url
      is_deliverable
    }
  }
`

const UPSERT_GIFT = gql`
  mutation UPSERT_GIFT($tokens: [token_insert_input!]!) {
    insert_token(
      objects: $tokens
      on_conflict: { constraint: token_pkey, update_columns: [title, cover_url, is_deliverable] }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

const INSERT_GIFT_PLAN = gql`
  mutation INSERT_GIFT_PLAN(
    $giftPlanId: uuid!
    $appId: String!
    $giftPlanTitle: String!
    $editorId: String
    $giftPlanProductId: uuid!
    $productId: String!
  ) {
    insert_gift_plan(
      objects: {
        gift_plan_products: { data: { id: $giftPlanProductId, product_id: $productId } }
        id: $giftPlanId
        app_id: $appId
        title: $giftPlanTitle
        editor_id: $editorId
      }
      on_conflict: { constraint: gift_plan_pkey, update_columns: title }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

const UPDATE_GIFT_PLAN = gql`
  mutation UPDATE_GIFT_PLAN($giftPlanId: uuid!, $title: String!) {
    update_gift_plan(where: { id: { _eq: $giftPlanId } }, _set: { title: $title }) {
      affected_rows
      returning {
        app_id
      }
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
