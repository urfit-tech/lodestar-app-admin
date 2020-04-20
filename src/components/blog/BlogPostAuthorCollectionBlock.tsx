import { useMutation } from '@apollo/react-hooks'
import { Button, message, Modal } from 'antd'
import Form from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { BlogPostProps } from '../../types/blog'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import CreatorSelector from '../common/CreatorSelector'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const BlogPostAuthorCollectionBlock: React.FC<BlogPostProps> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [isVisible, setVisible] = useState<boolean>(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const updatePostRole = useUpdatePostRole(post.id)

  const handleDelete = () => {
    updatePostRole({
      postRoleIds: [],
    }).then(() => {
      onRefetch && onRefetch()
      message.success(formatMessage(commonMessages.event.successfullySaved))
    })
  }

  const handleSubmit = () => {
    const postRoleIds: string[] = []
    postRoleIds.push(selectedMemberId || '')

    updatePostRole({
      postRoleIds,
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .finally(() => setVisible(false))
  }

  return (
    <>
      {post.authors &&
        post.authors.map(author => (
          <RoleAdminBlock
            key={author.id}
            name={author.name}
            pictureUrl={author.pictureUrl}
            onDelete={() => handleDelete()}
          />
        ))}

      {post.authors && post.authors.length < 1 && (
        <Button type="link" icon="plus" size="small" onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.addAuthor)}
        </Button>
      )}

      <Modal title={null} footer={null} centered destroyOnClose visible={isVisible} onCancel={() => setVisible(false)}>
        <StyledModalTitle>{formatMessage(commonMessages.ui.addAuthor)}</StyledModalTitle>

        <Form
          hideRequiredMark
          colon={false}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Form.Item label={formatMessage(commonMessages.label.selectAuthor)}>
            <CreatorSelector value={selectedMemberId || ''} onChange={value => setSelectedMemberId(value)} />
          </Form.Item>
          <Form.Item className="text-right">
            <Button onClick={() => setVisible(false)} className="mr-2">
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit">
              {formatMessage(commonMessages.ui.add)}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const useUpdatePostRole = (postId: string) => {
  const [updateRole] = useMutation<types.UPDATE_POST_ROLE, types.UPDATE_POST_ROLEVariables>(gql`
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
  `)

  const updatePostRole: (variables: { postRoleIds: string[] }) => Promise<void> = async ({ postRoleIds }) => {
    try {
      await updateRole({
        variables: {
          postId,
          updatedAt: new Date(),
          postRoles: postRoleIds.map((postRoleId, i) => ({
            post_id: postId,
            member_id: postRoleId,
            name: 'author',
            position: i,
          })),
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updatePostRole
}

export default BlogPostAuthorCollectionBlock
