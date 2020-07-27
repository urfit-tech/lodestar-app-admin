import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Col, Input, message, Row } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'

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

type BlogPostVideoFormProps = BlogPostProps & FormComponentProps

const BlogPostVideoForm: React.FC<BlogPostVideoFormProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()
  const updatePostVideoUrl = useUpdatePostVideoUrl()
  const [videoUrl, setVideoUrl] = useState<string>('')

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
    <Row>
      <Col span={18}>
        <Form
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Form.Item>
            <div className="d-flex align-items-center">
              {getFieldDecorator('videoUrl', {
                initialValue: post.videoUrl,
              })(
                <Input
                  className="mr-4"
                  placeholder={formatMessage(blogMessages.term.pasteVideoUrl)}
                  onChange={e => {
                    setVideoUrl(e.target.value)
                    return e.target.value
                  }}
                />,
              )}
            </div>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
            <Button className="ml-2" type="primary" htmlType="submit">
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      </Col>
      <Col span={6}>
        <div>{(videoUrl || post.videoUrl) && <BlogPostPlayer url={videoUrl || post.videoUrl} />}</div>
      </Col>
    </Row>
  )
}

const BlogPostPlayer: React.FC<{ url: string | null }> = ({ url }) => {
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

export default Form.create<BlogPostVideoFormProps>()(BlogPostVideoForm)
