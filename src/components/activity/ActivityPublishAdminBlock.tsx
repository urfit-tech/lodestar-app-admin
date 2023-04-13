import { gql, useMutation } from '@apollo/client'
import { Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { ActivityAdminProps } from '../../types/activity'
import AdminPublishBlock, { ChecklistItemProps, PublishEvent, PublishStatus } from '../admin/AdminPublishBlock'

const messages = defineMessages({
  noTicketPlan: { id: 'activity.text.noTicketPlan', defaultMessage: '尚未訂定票券方案' },
  noDescription: { id: 'activity.text.noDescription', defaultMessage: '尚未填寫活動簡介' },
  notCompleteNotation: {
    id: 'activity.text.notCompleteNotation',
    defaultMessage: '請填寫以下必填資料，填寫完畢即可由此發佈',
  },
  unpublishedNotation: {
    id: 'activity.text.unpublishedNotation',
    defaultMessage: '因你的活動未發佈，此活動並不會顯示在頁面上。',
  },
  publishedNotation: {
    id: 'activity.text.publishedNotation',
    defaultMessage: '現在你的活動已經發佈，此活動會出現在頁面上。',
  },
  privatelyPublishedNotation: {
    id: 'activity.text.privatelyPublishedNotation',
    defaultMessage: '你的活動已經私密發佈，此活動不會出現在頁面上，學生僅能透過連結進入瀏覽。',
  },
})

const ActivityPublishAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps | null
  onRefetch?: () => void
}> = ({ activityAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [publishActivity] = useMutation<hasura.PUBLISH_ACTIVITY, hasura.PUBLISH_ACTIVITYVariables>(PUBLISH_ACTIVITY)

  if (!activityAdmin) {
    return <Skeleton active />
  }

  const checklist: ChecklistItemProps[] = []

  activityAdmin.tickets.length === 0 &&
    checklist.push({
      id: 'NO_TICKET',
      text: formatMessage(messages.noTicketPlan),
      tab: 'tickets',
    })

  !activityAdmin.description &&
    checklist.push({
      id: 'NO_DESCRIPTION',
      text: formatMessage(messages.noDescription),
      tab: 'settings',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !activityAdmin.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(messages.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(messages.unpublishedNotation)]
      : publishStatus === 'success' && activityAdmin.isPrivate
      ? [formatMessage(commonMessages.status.privatelyPublished), formatMessage(messages.privatelyPublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishActivity({
      variables: {
        activityId: activityAdmin.id,
        isPrivate: values.isPrivate,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        onRefetch?.()
        onSuccess?.()
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
      isPrivateEnabled={enabledModules.private_activity}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_ACTIVITY = gql`
  mutation PUBLISH_ACTIVITY($activityId: uuid!, $isPrivate: Boolean!, $publishedAt: timestamptz) {
    update_activity(where: { id: { _eq: $activityId } }, _set: { published_at: $publishedAt, is_private: $isPrivate }) {
      affected_rows
    }
  }
`

export default ActivityPublishAdminBlock
