import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
import { StyledTips } from '../admin'
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
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item
        label={
          <>
            {formatMessage(merchandiseMessages.label.images)}
            <Tooltip title={<StyledTips>{formatMessage(merchandiseMessages.text.imageTips)}</StyledTips>}>
              <Icon type="question-circle" theme="filled" />
            </Tooltip>
          </>
        }
        wrapperCol={{ span: 24, md: { span: 16 } }}
      >
        <MerchandiseImagesUploader merchandiseId={merchandiseId} images={merchandise.images} onChange={handleUpload} />
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.abstract)}>
        {form.getFieldDecorator('abstract', {
          initialValue: merchandise.abstract,
        })(<Input.TextArea rows={5} />)}
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
    mutation UPDATE_MERCHANDISE_INTRODUCTION($merchandiseId: uuid!, $abstract: String, $meta: String) {
      update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { abstract: $abstract, meta: $meta }) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseIntroduction: (data: { abstract: string; meta: string }) => Promise<void> = async ({
    abstract,
    meta,
  }) => {
    try {
      await updateIntroduction({
        variables: {
          merchandiseId,
          abstract,
          meta,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseIntroduction
}

export default Form.create<MerchandiseIntroductionFormProps>()(MerchandiseIntroductionForm)
