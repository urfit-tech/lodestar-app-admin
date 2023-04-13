import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { PostProps } from '../../types/blog'
import AdminBraftEditor from '../form/AdminBraftEditor'

type FieldProps = {
  description: EditorState
}

const BlogPostContentForm: React.FC<{
  post: PostProps | null
  onRefetch?: () => {}
}> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updatePostDescription] = useMutation<hasura.UPDATE_POST_DESCRIPTION, hasura.UPDATE_POST_DESCRIPTIONVariables>(
    UPDATE_POST_DESCRIPTION,
  )
  const [loading, setLoading] = useState(false)

  if (!post) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePostDescription({
      variables: {
        id: post.id,
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      initialValues={{
        description: BraftEditor.createEditorState(post.description),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="description">
        <AdminBraftEditor />
      </Form.Item>

      <Form.Item>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_POST_DESCRIPTION = gql`
  mutation UPDATE_POST_DESCRIPTION($id: uuid!, $description: String!) {
    update_post(where: { id: { _eq: $id } }, _set: { description: $description }) {
      affected_rows
    }
  }
`

export default BlogPostContentForm
