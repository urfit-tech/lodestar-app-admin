import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import types from '../../types'
import { PostProps } from '../../types/blog'
import { StyledTips } from '../admin'
import ImageInput from '../form/ImageInput'
import MerchandiseSelector from '../form/MerchandiseSelector'

type FieldProps = {
  merchandiseIds: string[]
}

const BlogPostSettingForm: React.FC<{
  post: PostProps | null
  onRefetch?: () => void
}> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const [updatePostCover] = useMutation<types.UPDATE_POST_COVER, types.UPDATE_POST_COVERVariables>(UPDATE_POST_COVER)
  const [updatePostMerchandises] = useMutation<
    types.UPDATE_POST_MERCHANDISE_COLLECTION,
    types.UPDATE_POST_MERCHANDISE_COLLECTIONVariables
  >(UPDATE_POST_MERCHANDISE_COLLECTION)
  const [loading, setLoading] = useState(false)

  if (!post) {
    return <Skeleton active />
  }

  const handleUpload = () => {
    setLoading(true)
    const uploadTime = Date.now()
    updatePostCover({
      variables: {
        postId: post.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/post_covers/${appId}/${post.id}?t=${uploadTime}`,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePostMerchandises({
      variables: {
        postId: post.id,
        merchandises: values.merchandiseIds.map((merchandiseId: string, index: number) => ({
          post_id: post.id,
          merchandise_id: merchandiseId,
          position: index,
        })),
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
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        merchandiseIds: post.merchandiseIds,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={
          <span>
            {formatMessage(commonMessages.term.cover)}
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(blogMessages.text.suggestedPictureSize)}</StyledTips>}
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
        <ImageInput
          path={`post_covers/${appId}/${post.id}`}
          image={{
            width: '160px',
            ratio: 9 / 16,
          }}
          value={post.coverUrl}
          onChange={() => handleUpload()}
        />
      </Form.Item>
      <Form.Item label={formatMessage(blogMessages.label.merchandises)} name="merchandiseIds">
        <MerchandiseSelector />
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
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

const UPDATE_POST_COVER = gql`
  mutation UPDATE_POST_COVER($postId: uuid!, $coverUrl: String) {
    update_post(where: { id: { _eq: $postId } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`
const UPDATE_POST_MERCHANDISE_COLLECTION = gql`
  mutation UPDATE_POST_MERCHANDISE_COLLECTION($postId: uuid!, $merchandises: [post_merchandise_insert_input!]!) {
    delete_post_merchandise(where: { post_id: { _eq: $postId } }) {
      affected_rows
    }
    insert_post_merchandise(objects: $merchandises) {
      affected_rows
    }
  }
`

export default BlogPostSettingForm
