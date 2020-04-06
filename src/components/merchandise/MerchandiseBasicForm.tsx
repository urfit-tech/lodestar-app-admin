import { Button, Form, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import TagSelector from '../../containers/common/TagSelector'
import { commonMessages, errorMessages } from '../../helpers/translation'
import ProgramCategorySelector from '../program/ProgramCategorySelector'

export type MerchandiseBasicProps = {
  title: string
  categoryIds: string[]
  merchandiseTags: string[]
}
type MerchandiseBasicFormProps = FormComponentProps &
  MerchandiseBasicProps & {
    onSave?: (data: MerchandiseBasicProps) => Promise<any>
  }
const MerchandiseBasicForm: React.FC<MerchandiseBasicFormProps> = ({
  form,
  title,
  categoryIds,
  merchandiseTags,
  onSave,
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      if (onSave) {
        setLoading(true)
        onSave({
          title: values.title,
          categoryIds: values.categoryIds,
          merchandiseTags: values.tags,
        })
          .then(() => message.success(formatMessage(commonMessages.event.successfullySaved)))
          .finally(() => setLoading(false))
      }
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
      <Form.Item label={formatMessage(commonMessages.term.title)}>
        {form.getFieldDecorator('title', {
          initialValue: title,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.title),
              }),
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)}>
        {form.getFieldDecorator('categoryIds', {
          initialValue: categoryIds,
        })(<ProgramCategorySelector />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tags)}>
        {form.getFieldDecorator('tags', {
          initialValue: merchandiseTags,
        })(<TagSelector />)}
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

export default Form.create<MerchandiseBasicFormProps>()(MerchandiseBasicForm)
