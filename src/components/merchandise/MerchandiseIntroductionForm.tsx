import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { MerchandiseProps } from '../../types/merchandise'
import { StyledTips } from '../admin'
import MerchandiseImagesUploader from './MerchandiseImagesUploader'

type FieldProps = {
  abstract: string
}

const MerchandiseIntroductionForm: React.FC<{
  merchandise: MerchandiseProps
  merchandiseId: string
  onRefetch?: () => void
}> = ({ merchandise, merchandiseId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateMerchandiseImages] = useMutation<
    hasura.UPDATE_MERCHANDISE_IMAGES,
    hasura.UPDATE_MERCHANDISE_IMAGESVariables
  >(UPDATE_MERCHANDISE_IMAGES)
  const [updateMerchandiseIntroduction] = useMutation<
    hasura.UPDATE_MERCHANDISE_INTRODUCTION,
    hasura.UPDATE_MERCHANDISE_INTRODUCTIONVariables
  >(UPDATE_MERCHANDISE_INTRODUCTION)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMerchandiseIntroduction({
      variables: {
        merchandiseId,
        abstract: values.abstract || '',
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleUpload = (images: MerchandiseProps['images']) => {
    updateMerchandiseImages({
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
      .then(() => onRefetch?.())
      .catch(handleError)
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        abstract: merchandise.abstract || '',
        memberShopId: merchandise.memberShopId,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(merchandiseMessages.label.images)}
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(merchandiseMessages.text.imageTips)}</StyledTips>}
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
        wrapperCol={{ span: 24, md: { span: 16 } }}
      >
        <MerchandiseImagesUploader merchandiseId={merchandiseId} images={merchandise.images} onChange={handleUpload} />
      </Form.Item>
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(merchandiseMessages.label.abstract)}
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(merchandiseMessages.text.abstractTips)}</StyledTips>}
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
        name="abstract"
      >
        <Input.TextArea rows={5} maxLength={200} placeholder={formatMessage(merchandiseMessages.text.abstractLimit)} />
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

const UPDATE_MERCHANDISE_IMAGES = gql`
  mutation UPDATE_MERCHANDISE_IMAGES($merchandiseId: uuid!, $merchandiseImages: [merchandise_img_insert_input!]!) {
    delete_merchandise_img(where: { merchandise_id: { _eq: $merchandiseId } }) {
      affected_rows
    }
    insert_merchandise_img(objects: $merchandiseImages) {
      affected_rows
    }
  }
`
const UPDATE_MERCHANDISE_INTRODUCTION = gql`
  mutation UPDATE_MERCHANDISE_INTRODUCTION($merchandiseId: uuid!, $abstract: String) {
    update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { abstract: $abstract }) {
      affected_rows
    }
  }
`

export default MerchandiseIntroductionForm
