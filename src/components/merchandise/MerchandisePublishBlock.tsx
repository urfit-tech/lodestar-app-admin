import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
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

const MerchandisePublishBlock: React.FC<{
  merchandise: MerchandiseProps | null
  merchandiseId: string
  refetch?: () => void
}> = ({ merchandise, merchandiseId, refetch }) => {
  const { formatMessage } = useIntl()
  const [publishMerchandise] = useMutation<types.PUBLISH_MERCHANDISE, types.PUBLISH_MERCHANDISEVariables>(
    PUBLISH_MERCHANDISE,
  )

  if (!merchandise) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []

  !merchandise.title &&
    checklist.push({
      id: 'NO_TITLE',
      text: formatMessage(messages.noTitle),
      tabkey: 'settings',
    })
  !merchandise.abstract &&
    checklist.push({
      id: 'NO_ABSTRACT',
      text: formatMessage(messages.noAbstract),
      tabkey: 'settings',
    })
  !merchandise.link &&
    checklist.push({
      id: 'NO_LINK',
      text: formatMessage(messages.noLink),
      tabkey: 'settings',
    })
  !merchandise.price &&
    checklist.push({
      id: 'NO_PRICE',
      text: formatMessage(messages.noPrice),
      tabkey: 'sales',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !merchandise.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(messages.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(messages.unpublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishMerchandise({
      variables: {
        merchandiseId,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        refetch && refetch()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  return (
    <AdminPublishBlock
      type={publishStatus}
      checklist={checklist}
      title={title}
      description={description}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_MERCHANDISE = gql`
  mutation PUBLISH_MERCHANDISE($merchandiseId: uuid!, $publishedAt: timestamptz) {
    update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default MerchandisePublishBlock
