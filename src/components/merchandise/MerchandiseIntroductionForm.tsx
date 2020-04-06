import { Button, Form, Icon, Input, message, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import AppContext from '../../contexts/AppContext'
import { commonMessages, merchandiseMessages, podcastMessages } from '../../helpers/translation'
import { useUpdateMerchandiseIntroduction } from '../../hooks/merchandise'
import { StyledTips } from '../admin'
import SingleUploader from '../common/SingleUploader'

export type MerchandiseIntroductionProps = {
  images: {
    url: string
    isCover: boolean
  }[]
  abstract: string
  link: string
}
type MerchandiseIntroductionFormProps = FormComponentProps &
  MerchandiseIntroductionProps & {
    merchandiseId: string
    refetch?: () => void
  }
const MerchandiseIntroductionForm: React.FC<MerchandiseIntroductionFormProps> = ({
  form,
  images,
  abstract,
  link,
  merchandiseId,
  refetch,
}) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const { updateIntroduction } = useUpdateMerchandiseIntroduction(merchandiseId)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateIntroduction({
        images: [],
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
        <SingleUploader
          listType="picture-card"
          accept="image/*"
          path={`merchandise_covers/${app.id}/${uuid()}`}
          isPublic={true}
        />
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.abstract)}>
        {form.getFieldDecorator('abstract', {
          initialValue: abstract,
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.paymentLink)}>
        {form.getFieldDecorator('link', {
          initialValue: link,
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

export default Form.create<MerchandiseIntroductionFormProps>()(MerchandiseIntroductionForm)
