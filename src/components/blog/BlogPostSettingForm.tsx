import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
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
  const [updatePostCover] = useMutation<hasura.UPDATE_POST_COVER, hasura.UPDATE_POST_COVERVariables>(UPDATE_POST_COVER)
  const [updatePostMerchandises] = useMutation<
    hasura.UPDATE_POST_MERCHANDISE_COLLECTION,
    hasura.UPDATE_POST_MERCHANDISE_COLLECTIONVariables
  >(UPDATE_POST_MERCHANDISE_COLLECTION)
  const [loading, setLoading] = useState(false)
  const coverId = uuid()

  if (!post) {
    return <Skeleton active />
  }

  const handleUpload = () => {
    setLoading(true)
    updatePostCover({
      variables: {
        postId: post.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/post_covers/${appId}/${post.id}/${coverId}/1200`,
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
          <span className="d-flex align-items-center">
            {formatMessage(commonMessages.label.cover)}
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
          path={`post_covers/${appId}/${post.id}/${coverId}`}
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
