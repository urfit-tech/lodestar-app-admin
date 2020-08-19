import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { PostProps } from '../../types/blog'
import AdminBraftEditor from '../admin/AdminBraftEditor'

const BlogPostContentForm: React.FC<{
  post: PostProps | null
  refetch?: () => {}
}> = ({ post, refetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updatePostDescription] = useMutation<types.UPDATE_POST_DESCRIPTION, types.UPDATE_POST_DESCRIPTIONVariables>(
    UPDATE_POST_DESCRIPTION,
  )
  const [loading, setLoading] = useState(false)

  if (!post) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updatePostDescription({
      variables: {
        id: post.id,
        description: values.description.toRAW(),
      },
    })
      .then(() => {
        refetch && refetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      onFinish={handleSubmit}
      initialValues={{
        description: BraftEditor.createEditorState(post.description),
      }}
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
