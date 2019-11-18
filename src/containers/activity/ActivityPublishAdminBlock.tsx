import { message } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useMutation } from 'react-apollo-hooks'
import { ActivityAdminProps } from '../../components/activity/ActivityAdminBlock'
import ActivityPublishAdminBlockComponent from '../../components/activity/ActivityPublishAdminBlock'
import types from '../../types'

const ActivityPublishAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps
  onChangeTab?: (key: string) => void
  onRefetch?: () => void
}> = ({ activityAdmin, onChangeTab, onRefetch }) => {
  const publishActivity = useMutation<types.PUBLISH_ACTIVITY, types.PUBLISH_ACTIVITYVariables>(PUBLISH_ACTIVITY)

  const handlePublish: (setLoading: React.Dispatch<React.SetStateAction<boolean>>, publishedAt: Date | null) => void = (
    setLoading,
    publishedAt,
  ) => {
    setLoading(true)

    publishActivity({
      variables: {
        activityId: activityAdmin.id,
        publishedAt,
      },
    })
      .then(() => {
        if (publishedAt) {
          message.success('發佈成功')
        } else {
          message.success('已取消發佈')
        }
        if (onRefetch) {
          onRefetch()
        }
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
        message.error('發佈失敗')
      })
      .finally(() => setLoading(false))
  }

  return (
    <ActivityPublishAdminBlockComponent
      activityAdmin={activityAdmin}
      onPublish={handlePublish}
      onChangeTab={onChangeTab}
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
