import { PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Modal, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { PostProps } from '../../types/blog'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import ContentCreatorSelector from '../form/ContentCreatorSelector'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const BlogPostAuthorCollectionBlock: React.FC<{
  post: PostProps | null
  onRefetch?: () => {}
}> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updatePostRole] = useMutation<types.UPDATE_POST_ROLE, types.UPDATE_POST_ROLEVariables>(UPDATE_POST_ROLE)
  const [isVisible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!post) {
    return <Skeleton active />
  }

  const handleDelete = () => {
    setLoading(true)
    updatePostRole({
      variables: {
        postId: post.id,
        updatedAt: new Date(),
        postRoles: [],
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    const memberIds: string[] = [values.memberId]
    updatePostRole({
      variables: {
        postId: post.id,
        updatedAt: new Date(),
        postRoles: memberIds.map((postRoleId: string, index: number) => ({
          post_id: post.id,
          member_id: postRoleId,
          name: 'author',
          position: index,
        })),
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => {
        setVisible(false)
        setLoading(false)
      })
  }

  return (
    <>
      {post.authors?.map(author => (
        <RoleAdminBlock
          key={author.id}
          name={author.name}
          pictureUrl={author.pictureUrl}
          onDelete={() => handleDelete()}
        />
      ))}

      {(!post.authors || post.authors.length < 1) && (
        <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.addAuthor)}
        </Button>
      )}

      <Modal footer={null} centered destroyOnClose visible={isVisible} onCancel={() => setVisible(false)}>
        <StyledModalTitle className="mb-4">{formatMessage(commonMessages.ui.addAuthor)}</StyledModalTitle>

        <Form form={form} layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
          <Form.Item label={formatMessage(commonMessages.label.selectAuthor)} name="memberId">
            <ContentCreatorSelector />
          </Form.Item>

          <Form.Item className="text-right">
            <Button className="mr-2" onClick={() => setVisible(false)}>
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.add)}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const UPDATE_POST_ROLE = gql`
  mutation UPDATE_POST_ROLE($postId: uuid!, $postRoles: [post_role_insert_input!]!, $updatedAt: timestamptz!) {
    update_post(_set: { updated_at: $updatedAt }, where: { id: { _eq: $postId } }) {
      affected_rows
    }

    # update post roles
    delete_post_role(where: { post_id: { _eq: $postId }, name: { _eq: "author" } }) {
      affected_rows
    }
    insert_post_role(objects: $postRoles) {
      affected_rows
    }
  }
`

export default BlogPostAuthorCollectionBlock
