import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, message, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import { StyledTips } from '../admin'
import { CustomRatioImage } from '../common/Image'
import MerchandiseSelector from '../common/MerchandiseSelector'
import SingleUploader from '../common/SingleUploader'
import { CoverBlock } from '../program/ProgramIntroAdminCard'

type BlogPostSettingFormProps = BlogPostProps & FormComponentProps

const StyledSingleUploader = styled(SingleUploader)`
  && {
    width: auto;
  }

  .ant-upload.ant-upload-select-picture-card {
    margin: 0;
    height: auto;
    width: 120px;
    border: none;
    background: none;

    .ant-upload {
      padding: 0;
    }
  }
`

const BlogPostSettingForm: React.FC<BlogPostSettingFormProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const { id: appId } = useContext(AppContext)
  const updatePostSetting = useUpdatePostSetting(post.id)

  const handleUpload = () => {
    validateFields((err, { merchandiseIds }) => {
      if (!err) {
        setLoading(true)
        const uploadTime = Date.now()

        updatePostSetting({
          coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/post_covers/${appId}/${post.id}?t=${uploadTime}`,
          merchandiseIds,
        })
          .then(() => {
            onRefetch && onRefetch()
            message.success(formatMessage(commonMessages.event.successfullySaved))
          })
          .finally(() => setLoading(false))
      }
    })
  }

  const handleSubmit = () => {
    validateFields((err, { cover, merchandiseIds }) => {
      if (!err) {
        setLoading(true)
        const uploadTime = Date.now()

        updatePostSetting({
          coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/post_covers/${appId}/${post.id}?t=${uploadTime}`,
          merchandiseIds,
        })
          .then(() => {
            onRefetch && onRefetch()
            message.success(formatMessage(commonMessages.event.successfullySaved))
          })
          .finally(() => setLoading(false))
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
      <Form.Item
        label={
          <>
            {formatMessage(commonMessages.term.cover)}
            <Tooltip
              placement="topLeft"
              title={<StyledTips>{formatMessage(blogMessages.text.suggestedPictureSize)}</StyledTips>}
            >
              <Icon type="question-circle" theme="filled" className="ml-2" />
            </Tooltip>
          </>
        }
      >
        <div className="d-flex align-items-center justify-content-between">
          {!!post.coverUrl && (
            <CoverBlock>
              <CustomRatioImage src={post.coverUrl} width="100%" ratio={9 / 16} />
            </CoverBlock>
          )}

          {getFieldDecorator('postCover')(
            <StyledSingleUploader
              accept="image/*"
              listType="picture-card"
              path={`post_covers/${appId}/${post.id}`}
              showUploadList={false}
              onSuccess={() => handleUpload()}
              isPublic
            />,
          )}
        </div>
      </Form.Item>
      <Form.Item label={formatMessage(blogMessages.label.merchandises)}>
        {getFieldDecorator('merchandiseIds', {
          initialValue: post.merchandiseIds,
        })(<MerchandiseSelector />)}
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
        <Button className="ml-2" type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const useUpdatePostSetting = (postId: string) => {
  const [updateSetting] = useMutation(gql`
    mutation UPDATE_POST_SETTING($postId: uuid!, $coverUrl: String, $merchandises: [post_merchandise_insert_input!]!) {
      update_post(_set: { cover_url: $coverUrl }, where: { id: { _eq: $postId } }) {
        affected_rows
      }

      # update post merchandises
      delete_post_merchandise(where: { post_id: { _eq: $postId } }) {
        affected_rows
      }
      insert_post_merchandise(objects: $merchandises) {
        affected_rows
      }
    }
  `)

  const updatePostSetting: (data: { coverUrl: string; merchandiseIds: string[] }) => Promise<void> = async ({
    coverUrl,
    merchandiseIds,
  }) => {
    const merchandises = merchandiseIds.map((merchandiseId, i) => ({
      post_id: postId,
      merchandise_id: merchandiseId,
      position: i,
    }))

    try {
      await updateSetting({
        variables: {
          postId,
          coverUrl,
          merchandises,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }
  return updatePostSetting
}

export default Form.create<BlogPostSettingFormProps>()(BlogPostSettingForm)
