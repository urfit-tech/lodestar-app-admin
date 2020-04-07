import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Skeleton, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages, podcastMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
import { StyledTips } from '../admin'
import SingleUploader from '../common/SingleUploader'
import styled from 'styled-components'

const StyledUploader = styled(SingleUploader)``

type MerchandiseIntroductionFormProps = FormComponentProps & {
  merchandise: MerchandiseProps | null
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
  const app = useContext(AppContext)
  const updateMerchandiseImages = useUpdateMerchandiseImages(merchandiseId)
  const updateMerchandiseIntroduction = useUpdateMerchandiseIntroduction(merchandiseId)
  const [fieldId, setFieldId] = useState(uuid())
  const [loading, setLoading] = useState(false)

  if (!merchandise) {
    return <Skeleton active />
  }

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateMerchandiseIntroduction({
        abstract: values.abstract,
        link: values.link,
      })
        .then(() => {
          refetch && refetch()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .finally(() => setLoading(false))
    })
  }

  const handleUpload = () => {
    updateMerchandiseImages({
      images: [
        ...merchandise.images,
        {
          url: `merchandise_images/${app.id}/${merchandiseId}/${fieldId}`,
          isCover: false,
        },
      ],
    }).then(() => {
      setFieldId(uuid())
      refetch && refetch()
    })
  }

  return (
    <Form
      hideRequiredMark
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
            <Tooltip title={<StyledTips>{formatMessage(podcastMessages.text.audioFileTips)}</StyledTips>}>
              <Icon type="question-circle" theme="filled" />
            </Tooltip>
          </>
        }
      >
        {/* {merchandise.images.map(image => (
          <span key={image.url}>{image.url}</span>
        ))} */}
        {form.getFieldDecorator('image')(
          <StyledUploader
            listType="picture-card"
            accept="image/*"
            path={`merchandise_images/${app.id}/${merchandiseId}/${fieldId}`}
            isPublic={true}
            trigger={({ loading, value }) => <Button type="link" icon="plus" loading={loading} disabled={loading} />}
            onSuccess={handleUpload}
            fileList={merchandise.images.map(image => ({
              uid: image.url,
              size: 0, // dummy
              name: image.url,
              status: 'done',
              type: 'image/*',
              url: `https://${process.env.REACT_APP_S3_BUCKET}/${image.url}`,
            }))}
          />,
        )}
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.abstract)}>
        {form.getFieldDecorator('abstract', {
          initialValue: merchandise.abstract,
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.paymentLink)}>
        {form.getFieldDecorator('link', {
          initialValue: merchandise.link,
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
    mutation UPDATE_MERCHANDISE_INTRODUCTION($merchandiseId: uuid!, $abstract: String, $link: String) {
      update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { abstract: $abstract, link: $link }) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseIntroduction: (data: { abstract: string; link: string }) => Promise<void> = async ({
    abstract,
    link,
  }) => {
    try {
      await updateIntroduction({
        variables: {
          merchandiseId: merchandiseId,
          abstract,
          link,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseIntroduction
}

export default Form.create<MerchandiseIntroductionFormProps>()(MerchandiseIntroductionForm)
