import { useMutation } from '@apollo/react-hooks'
import { Button, message } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import AdminBraftEditor from '../admin/AdminBraftEditor'

type BlogPostContentFormProps = BlogPostProps & FormComponentProps

const BlogPostContentForm: React.FC<BlogPostContentFormProps> = ({
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
    <Form
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item>
        {getFieldDecorator('description', {
          initialValue: post.description && BraftEditor.createEditorState(post.description),
        })(<AdminBraftEditor />)}
      </Form.Item>
      <Form.Item>
        <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
        <Button className="ml-2" type="primary" htmlType="submit">
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
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

export default Form.create<BlogPostContentFormProps>()(BlogPostContentForm)
