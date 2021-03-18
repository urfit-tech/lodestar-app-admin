import { useMutation } from '@apollo/react-hooks'
import { Button, message, Skeleton, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { PostProps } from '../../types/blog'
import { StyledModal, StyledModalParagraph, StyledModalTitle } from '../program/ProgramDeletionAdminCard'

const messages = defineMessages({
  deletePostConfirmation: {
    id: 'blog.text.deletePostConfirmation',
    defaultMessage: '文章一經刪除即不可恢復，確定要刪除嗎？',
  },
  deletePostWarning: {
    id: 'program.text.deletePostWarning',
    defaultMessage: '請仔細確認是否真的要刪除，因為一旦刪除就無法恢復。',
  },
})

const BlogPostDeletionModal: React.FC<{
  post: PostProps | null
  onRefetch?: () => void
}> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [archivePost] = useMutation<hasura.DELETE_POST, hasura.DELETE_POSTVariables>(DELETE_POST)
  const [isVisible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!post) {
    return <Skeleton active />
  }

  const handleArchive = () => {
    setLoading(true)
    archivePost({
      variables: {
        postId: post.id,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyDeleted))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="d-flex flex-column">
        <Typography.Text>{formatMessage(messages.deletePostWarning)}</Typography.Text>
      </div>
      {post.isDeleted ? (
        <Button disabled>{formatMessage(commonMessages.ui.deleted)}</Button>
      ) : (
        <Button type="primary" danger onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.deletePost)}
        </Button>
      )}

      <StyledModal
        visible={isVisible}
        okText={formatMessage(commonMessages.ui.delete)}
        okButtonProps={{ danger: true, loading }}
        cancelText={formatMessage(commonMessages.ui.back)}
        onOk={() => handleArchive()}
        onCancel={() => setVisible(false)}
      >
        <StyledModalTitle className="mb-4">{formatMessage(commonMessages.ui.deletePost)}</StyledModalTitle>
        <StyledModalParagraph>{formatMessage(messages.deletePostConfirmation)}</StyledModalParagraph>
      </StyledModal>
    </div>
  )
}

const DELETE_POST = gql`
  mutation DELETE_POST($postId: uuid) {
    update_post(where: { id: { _eq: $postId } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`

export default BlogPostDeletionModal
