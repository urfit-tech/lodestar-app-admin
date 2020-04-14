import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { BlogPostProps } from '../../types/blog'
import AdminPublishBlock, { ChecklistItemProps, PublishEvent, PublishStatus } from '../admin/AdminPublishBlock'

const messages = defineMessages({
  noTitle: { id: 'merchandise.text.noTitle', defaultMessage: '尚未填寫名稱' },
  noAbstract: { id: 'merchandise.text.noAbstract', defaultMessage: '尚未填寫規格' },
  noLink: { id: 'merchandise.text.noLink', defaultMessage: '尚未設定付款連結' },
  noPrice: { id: 'merchandise.text.noPrice', defaultMessage: '尚未設定售價' },

  notCompleteNotation: {
    id: 'merchandise.status.notCompleteNotation',
    defaultMessage: '請填寫以下必填資料，填寫完畢即可由此發佈',
  },
  unpublishedNotation: {
    id: 'merchandise.status.unpublishedNotation',
    defaultMessage: '你的商品未發佈，此商品並不會顯示在頁面上。',
  },
  publishedNotation: {
    id: 'merchandise.status.publishedNotation',
    defaultMessage: '現在你的商品已發佈，此商品會出現在頁面上。',
  },
})

const BlogPostPublishBlock: React.FC<BlogPostProps> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  const publishPost = usePublishPost(post.id)

  const checklist: ChecklistItemProps[] = []

  !post.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(messages.noTitle),
      tabkey: 'general',
    })

  const publishStatus: PublishStatus = checklist.length > 0 ? 'alert' : !post.publishedAt ? 'ordinary' : 'success'

  let [title, description] = ['', '']
  if (publishStatus === 'alert')
    [title, description] = [
      formatMessage(commonMessages.status.notComplete),
      formatMessage(messages.notCompleteNotation),
    ]
  if (publishStatus === 'ordinary')
    [title, description] = [
      formatMessage(commonMessages.status.unpublished),
      formatMessage(messages.unpublishedNotation),
    ]
  if (publishStatus === 'success')
    [title, description] = [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishPost({
      publishedAt: values.publishedAt,
    })
      .then(() => {
        onRefetch && onRefetch()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  return (
    <AdminPublishBlock
      type={publishStatus}
      title={title}
      description={description}
      checklist={checklist}
      onPublish={handlePublish}
    />
  )
}

const usePublishPost = (postId: string) => {
  const [publish] = useMutation<types.PUBLISH_POST, types.PUBLISH_POSTVariables>(gql`
    mutation PUBLISH_POST($postId: uuid!, $publishedAt: timestamptz) {
      update_post(_set: { published_at: $publishedAt }, where: { id: { _eq: $postId } }) {
        affected_rows
      }
    }
  `)

  const publishPost: (data: { publishedAt: Date | null }) => Promise<void> = async ({ publishedAt }) => {
    try {
      await publish({
        variables: {
          postId,
          publishedAt,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return publishPost
}

export default BlogPostPublishBlock
