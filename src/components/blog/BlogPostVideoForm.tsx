import { CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import types from '../../types'
import { PostProps } from '../../types/blog'

const StyledStatusBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 160px;
  background-color: var(--gray-lighter);
`
const StyledNotation = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

type FieldProps = {
  videoUrl: string
}

const BlogPostVideoForm: React.FC<{
  post: PostProps | null
  onRefetch?: () => void
}> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updatePostVideoUrl] = useMutation<types.UPDATE_POST_VIDEO_URL, types.UPDATE_POST_VIDEO_URLVariables>(
    UPDATE_POST_VIDEO_URL,
  )
  const [loading, setLoading] = useState(false)

  if (!post) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePostVideoUrl({
      variables: {
        id: post.id,
        videoUrl: values.videoUrl,
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
    <div className="row">
      <div className="col-9">
        <Form
          form={form}
          colon={false}
          hideRequiredMark
          initialValues={{
            videoUrl: post.videoUrl,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item name="videoUrl">
            <Input className="mr-4" placeholder={formatMessage(blogMessages.term.pasteVideoUrl)} />
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
      </div>
      <div className="col-3">
        <div>
          {(form.getFieldValue('videoUrl') || post.videoUrl) && (
            <BlogPostPlayer url={form.getFieldValue('videoUrl') || post.videoUrl} />
          )}
        </div>
      </div>
    </div>
  )
}

const BlogPostPlayer: React.FC<{
  url: string | null
}> = ({ url }) => {
  const { formatMessage } = useIntl()
  const [status, setStatus] = useState('loading')

  return (
    <div>
      {status === 'loading' && (
        <StyledStatusBlock>
          <StyledNotation>
            <LoadingOutlined style={{ fontSize: 22 }} spin />
            <div>{formatMessage(blogMessages.text.uploading)}</div>
          </StyledNotation>
        </StyledStatusBlock>
      )}
      {status === 'error' && (
        <StyledStatusBlock>
          <StyledNotation>
            <CloseCircleOutlined style={{ fontSize: 22 }} />
            <div>{formatMessage(blogMessages.text.noVideoFound)}</div>
          </StyledNotation>
        </StyledStatusBlock>
      )}
      <ReactPlayer
        url={url || ''}
        style={{
          display: status === 'ready' ? 'block' : 'none',
        }}
        width="100%"
        height="100%"
        controls
        onReady={() => setStatus('ready')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}

const UPDATE_POST_VIDEO_URL = gql`
  mutation UPDATE_POST_VIDEO_URL($id: uuid!, $videoUrl: String!) {
    update_post(where: { id: { _eq: $id } }, _set: { video_url: $videoUrl }) {
      affected_rows
    }
  }
`

export default BlogPostVideoForm
