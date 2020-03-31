import { useMutation } from '@apollo/react-hooks'
import { Button, message, Typography } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminCard from '../admin/AdminCard'

type BlogPostContentAdminCardProps = BlogPostProps & FormComponentProps

const BlogPostContentAdminCard: React.FC<BlogPostContentAdminCardProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()
  const updatePostDescription = useUpdatePostDescription()

  const handleSubmit = () => {
    validateFields((err, { description }) => {
      if (!err) {
        updatePostDescription({
          variables: {
            id: post.id,
            description: description.toRAW(),
          },
        })
          .then(() => {
            onRefetch && onRefetch()
            message.success(formatMessage(commonMessages.event.successfullySaved))
          })
          .catch(handleError)
      }
    })
  }

  return (
    <AdminCard>
      <Typography.Title className="pb-4" level={4}>
        {formatMessage(blogMessages.ui.contentDescription)}
      </Typography.Title>
      <Form
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {post.description && (
          <Form.Item>
            {getFieldDecorator('description', {
              initialValue: BraftEditor.createEditorState(post.description),
            })(<AdminBraftEditor />)}
          </Form.Item>
        )}
        <Form.Item>
          <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
          <Button className="ml-2" type="primary" htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </Form>
    </AdminCard>
  )
}

const useUpdatePostDescription = () => {
  const [updatePostDescription] = useMutation(UPDATE_POST_DESCRIPTION)

  return updatePostDescription
}

const UPDATE_POST_DESCRIPTION = gql`
  mutation UPDATE_POST_DESCRIPTION($id: uuid!, $description: String!) {
    update_post(where: { id: { _eq: $id } }, _set: { description: $description }) {
      affected_rows
    }
  }
`

export default Form.create<BlogPostContentAdminCardProps>()(BlogPostContentAdminCard)
