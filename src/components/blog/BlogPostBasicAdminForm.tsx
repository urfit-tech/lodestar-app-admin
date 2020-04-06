import { Button, Form, Icon, Input, Select, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { useIntl } from 'react-intl'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import { StyledTips } from '../admin'

type BlogPostBasicAdminFormProps = BlogPostProps & FormComponentProps

const BlogPostBasicAdminForm: React.FC<BlogPostBasicAdminFormProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()

  const handleSubmit = () => {
    validateFields((error, { title, categoryIds, tags, codeName }) => {
      if (error) {
      }
    })
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
      <Form.Item label={formatMessage(commonMessages.term.title)}>
        {getFieldDecorator('title', { initialValue: post.title })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)}>
        {getFieldDecorator('categoryIds', {
          initialValue: post.categories.map(category => category.id),
        })(
          <Select mode="multiple" style={{ width: '100%' }} onChange={() => {}}>
            {post.categories.map(category => (
              <Select.Option key={category.id}>{category.name}</Select.Option>
            ))}
          </Select>,
        )}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tag)}>
        {getFieldDecorator('tags', {
          initialValue: post.tagNames,
        })(<Select />)}
      </Form.Item>
      <Form.Item
        label={
          <>
            {formatMessage(blogMessages.label.codeName)}
            <Tooltip placement="topLeft" title={<StyledTips>{formatMessage(blogMessages.text.url)}</StyledTips>}>
              <Icon type="question-circle" theme="filled" className="ml-2" />
            </Tooltip>
          </>
        }
      >
        {getFieldDecorator('codeName', {
          initialValue: '',
        })(<Input />)}
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
        <Button className="ml-2" type="primary" htmlType="submit">
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create<BlogPostBasicAdminFormProps>()(BlogPostBasicAdminForm)
