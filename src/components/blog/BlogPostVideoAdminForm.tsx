import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'

type BlogPostVideoAdminFormProps = BlogPostProps & FormComponentProps

const BlogPostVideoAdminForm: React.FC<BlogPostVideoAdminFormProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()
  const updatePostVideoUrl = useUpdatePostVideoUrl()

  const handleSubmit = () => {
    validateFields((err, { videoUrl }) => {
      if (!err) {
        updatePostVideoUrl({
          variables: {
            id: post.id,
            videoUrl,
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
      wrapperCol={{ span: 24 }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item>
        {getFieldDecorator('videoUrl', {
          initialValue: post.videoUrl,
        })(<Input placeholder={formatMessage(blogMessages.term.pasteVideoUrl)} />)}
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

const useUpdatePostVideoUrl = () => {
  const [updatePostVideoUrl] = useMutation(UPDATE_POST_VIDEO_URL)

  return updatePostVideoUrl
}

const UPDATE_POST_VIDEO_URL = gql`
  mutation UPDATE_POST_VIDEO_URL($id: uuid!, $videoUrl: String!) {
    update_post(where: { id: { _eq: $id } }, _set: { video_url: $videoUrl }) {
      affected_rows
    }
  }
`

export default Form.create<BlogPostVideoAdminFormProps>()(BlogPostVideoAdminForm)
