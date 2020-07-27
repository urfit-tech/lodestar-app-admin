import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Input, message, Tooltip } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
import { StyledTips } from '../admin'
import MemberShopSelector from './MemberShopSelector'
import MerchandiseImagesUploader from './MerchandiseImagesUploader'

type MerchandiseIntroductionFormProps = FormComponentProps & {
  merchandise: MerchandiseProps
  merchandiseId: string
  refetch?: () => void
}
const MerchandiseIntroductionForm: React.FC<MerchandiseIntroductionFormProps> = ({
  form,
  merchandise,
  merchandiseId,
  refetch,
}) => {
  const { formatMessage } = useIntl()
  const updateMerchandiseImages = useUpdateMerchandiseImages(merchandiseId)
  const updateMerchandiseIntroduction = useUpdateMerchandiseIntroduction(merchandiseId)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateMerchandiseIntroduction({
        abstract: values.abstract,
        meta: values.meta,
        memberShopId: values.memberShopId,
      })
        .then(() => {
          refetch && refetch()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .finally(() => setLoading(false))
    })
  }

  const handleUpload = (images: MerchandiseProps['images']) => {
    updateMerchandiseImages({ images }).then(() => refetch && refetch())
  }

  return (
    <Form
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item
        label={
          <span>
            {formatMessage(merchandiseMessages.label.images)}
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(merchandiseMessages.text.imageTips)}</StyledTips>}
            >
              <QuestionCircleFilled />
            </Tooltip>
          </span>
        }
        wrapperCol={{ span: 24, md: { span: 16 } }}
      >
        <MerchandiseImagesUploader merchandiseId={merchandiseId} images={merchandise.images} onChange={handleUpload} />
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.abstract)}>
        {form.getFieldDecorator('abstract', {
          initialValue: merchandise.abstract,
        })(
          <Input.TextArea
            rows={5}
            maxLength={200}
            placeholder={formatMessage(merchandiseMessages.text.abstractLimit)}
          />,
        )}
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.meta)}>
        {form.getFieldDecorator('meta', {
          initialValue: merchandise.meta,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(merchandiseMessages.label.meta),
              }),
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.memberShop)}>
        {form.getFieldDecorator('memberShopId', {
          initialValue: merchandise.memberShopId,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(merchandiseMessages.label.memberShop),
              }),
            },
          ],
        })(<MemberShopSelector />)}
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const useUpdateMerchandiseImages = (merchandiseId: string) => {
  const [updateImages] = useMutation<types.UPDATE_MERCHANDISE_IMAGES, types.UPDATE_MERCHANDISE_IMAGESVariables>(gql`
    mutation UPDATE_MERCHANDISE_IMAGES($merchandiseId: uuid!, $merchandiseImages: [merchandise_img_insert_input!]!) {
      delete_merchandise_img(where: { merchandise_id: { _eq: $merchandiseId } }) {
        affected_rows
      }
      insert_merchandise_img(objects: $merchandiseImages) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseImages: (data: {
    images: {
      url: string
      isCover: boolean
    }[]
  }) => Promise<void> = async ({ images }) => {
    try {
      await updateImages({
        variables: {
          merchandiseId,
          merchandiseImages: images.map((image, index) => ({
            merchandise_id: merchandiseId,
            url: image.url,
            type: image.isCover ? 'cover' : 'common',
            position: index,
          })),
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseImages
}

const useUpdateMerchandiseIntroduction = (merchandiseId: string) => {
  const [updateIntroduction] = useMutation<
    types.UPDATE_MERCHANDISE_INTRODUCTION,
    types.UPDATE_MERCHANDISE_INTRODUCTIONVariables
  >(gql`
    mutation UPDATE_MERCHANDISE_INTRODUCTION(
      $merchandiseId: uuid!
      $abstract: String
      $meta: String
      $memberShopId: uuid
    ) {
      update_merchandise(
        where: { id: { _eq: $merchandiseId } }
        _set: { abstract: $abstract, meta: $meta, member_shop_id: $memberShopId }
      ) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseIntroduction: (data: {
    abstract: string
    meta: string
    memberShopId: string
  }) => Promise<void> = async ({ abstract, meta, memberShopId }) => {
    try {
      await updateIntroduction({
        variables: {
          merchandiseId,
          abstract,
          meta,
          memberShopId,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseIntroduction
}

export default Form.create<MerchandiseIntroductionFormProps>()(MerchandiseIntroductionForm)
