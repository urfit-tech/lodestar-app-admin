import { Button, Form, Icon, Input, Select, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import { StyledTips } from '../admin'
import CategorySelector from '../common/CategorySelector'

type BlogPostBasicAdminFormProps = BlogPostProps & FormComponentProps

const StyledText = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  line-height: 1.2;
`

const BlogPostBasicAdminForm: React.FC<BlogPostBasicAdminFormProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { settings } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const [codeName, setCodeName] = useState<string>('')

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
        })(<CategorySelector classType="program" />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tag)}>
        {getFieldDecorator('tags', {
          initialValue: post.tagNames,
        })(<Select mode="tags" />)}
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
        })(<Input onChange={e => setCodeName(e.target.value)} />)}
        <StyledText>{`https://${settings['host']}/posts/${codeName}`}</StyledText>
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
