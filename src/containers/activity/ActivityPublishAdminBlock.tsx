import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import AdminPublishBlock, {
  ChecklistItemProps,
  PublishEvent,
  PublishStatus,
} from '../../components/admin/AdminPublishBlock'
import ActivityContext from '../../contexts/ActivityContext'
import types from '../../types'

const ActivityPublishAdminBlock: React.FC = () => {
  const { loadingActivity, errorActivity, activity, refetchActivity } = useContext(ActivityContext)
  const [publishActivity] = useMutation<types.PUBLISH_ACTIVITY, types.PUBLISH_ACTIVITYVariables>(PUBLISH_ACTIVITY)

  if (loadingActivity) {
    return <Skeleton active />
  }

  if (errorActivity || !activity) {
    return <div>讀取錯誤</div>
  }

  const checklist: ChecklistItemProps[] = []

  activity.activityTickets.length === 0 &&
    checklist.push({
      id: 'NO_TICKET',
      text: '尚未訂定票券方案',
      tabkey: 'tickets',
    })

  !activity.description &&
    checklist.push({
      id: 'NO_DESCRIPTION',
      text: '尚未填寫活動簡介',
      tabkey: 'settings',
    })

  const publishStatus: PublishStatus = checklist.length > 0 ? 'alert' : !activity.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? ['尚有未完成項目', '請填寫以下必填資料，填寫完畢即可由此發佈']
      : publishStatus === 'ordinary'
      ? ['尚未發佈', '因你的活動未發佈，此活動並不會顯示在頁面上。']
      : publishStatus === 'success'
      ? ['已發佈', '現在你的活動已經發佈，此活動會出現在頁面上。']
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishActivity({
      variables: {
        activityId: activity.id,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        refetchActivity && refetchActivity()
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

const PUBLISH_ACTIVITY = gql`
  mutation PUBLISH_ACTIVITY($activityId: uuid!, $publishedAt: timestamptz) {
    update_activity(where: { id: { _eq: $activityId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default ActivityPublishAdminBlock
