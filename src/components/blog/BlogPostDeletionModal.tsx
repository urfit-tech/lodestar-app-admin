import { useMutation } from '@apollo/react-hooks'
import { Button, message, Modal, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'

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

const StyledModal = styled(Modal)`
  && {
    .ant-modal-body {
      padding: 32px 32px 0;
    }
    .ant-modal-footer {
      border-top: 0;
      padding: 20px;
    }
  }
`
const StyledModalTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: var(--gray-darker);
  letter-spacing: 0.8px;
`
const StyledModalParagraph = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
  line-height: 1.5;
`

const BlogPostDeletionModal: React.FC<BlogPostProps> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [isVisible, setVisible] = useState(false)
  const archivePost = useUpdatePostIsDeleted()

  const handleArchive = () => {
    archivePost({
      variables: {
        postId: post.id,
      },
    }).then(() => {
      onRefetch && onRefetch()
      message.success(formatMessage(commonMessages.event.successfullyDeleted))
    })
  }

  return (
    <>
      <StyledModal
        visible={isVisible}
        okText={formatMessage(commonMessages.ui.delete)}
        onOk={() => {
          handleArchive()
          setVisible(false)
        }}
        cancelText={formatMessage(commonMessages.ui.back)}
        onCancel={() => setVisible(false)}
      >
        <StyledModalTitle className="mb-4">{formatMessage(commonMessages.ui.deletePost)}</StyledModalTitle>
        <StyledModalParagraph>{formatMessage(messages.deletePostConfirmation)}</StyledModalParagraph>
      </StyledModal>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex flex-column">
          <Typography.Text>{formatMessage(messages.deletePostWarning)}</Typography.Text>
        </div>
        {post?.isDeleted ? (
          <Button disabled>{formatMessage(commonMessages.ui.deleted)}</Button>
        ) : (
          <Button type="primary" onClick={() => setVisible(true)}>
            {formatMessage(commonMessages.ui.deletePost)}
          </Button>
        )}
      </div>
    </>
  )
}

const useUpdatePostIsDeleted = () => {
  const [archivePost] = useMutation(UPDATE_POST_IS_DELETED)

  return archivePost
}

const UPDATE_POST_IS_DELETED = gql`
  mutation UPDATE_POST_IS_DELETED($postId: uuid) {
    update_post(where: { id: { _eq: $postId } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`

export default BlogPostDeletionModal
