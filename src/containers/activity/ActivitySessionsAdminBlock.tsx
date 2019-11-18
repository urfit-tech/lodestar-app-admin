import { message } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useMutation } from 'react-apollo-hooks'
import { ActivityAdminProps } from '../../components/activity/ActivityAdminBlock'
import ActivitySessionsAdminBlockComponent from '../../components/activity/ActivitySessionsAdminBlock'
import types from '../../types'

const ActivitySessionsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps
  onChangeTab?: () => void
  onRefetch?: () => void
}> = ({ activityAdmin, onRefetch, onChangeTab }) => {
  const insertActivitySession = useMutation<types.INSERT_ACTIVITY_SESSION, types.INSERT_ACTIVITY_SESSIONVariables>(
    INSERT_ACTIVITY_SESSION,
  )
  const updateActivitySession = useMutation<types.UPDATE_ACTIVITY_SESSION, types.UPDATE_ACTIVITY_SESSIONVariables>(
    UPDATE_ACTIVITY_SESSION,
  )

  const handleInsert: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      startedAt: Date
      endedAt: Date
      location: string
      description: string | null
      threshold: number | null
    },
  ) => void = (setLoading, setVisible, data) => {
    setLoading(true)

    insertActivitySession({
      variables: {
        activityId: activityAdmin.id,
        ...data,
      },
    })
      .then(() => {
        message.success('建立成功')
        setVisible(false)
        if (onRefetch) {
          onRefetch()
        }
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
        message.error('建立失敗')
      })
      .finally(() => setLoading(false))
  }

  const handleUpdate: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      activitySessionId: string
      title: string
      startedAt: Date
      endedAt: Date
      location: string
      description: string | null
      threshold: number | null
    },
  ) => void = (setLoading, setVisible, data) => {
    setLoading(true)

    updateActivitySession({
      variables: data,
    })
      .then(() => {
        message.success('編輯成功')
        setVisible(false)
        if (onRefetch) {
          onRefetch()
        }
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
        message.error('編輯失敗')
      })
      .finally(() => setLoading(false))
  }

  return (
    <ActivitySessionsAdminBlockComponent
      activityAdmin={activityAdmin}
      onInsert={handleInsert}
      onUpdate={handleUpdate}
      onChangeTab={onChangeTab}
    />
  )
}

const INSERT_ACTIVITY_SESSION = gql`
  mutation INSERT_ACTIVITY_SESSION(
    $activityId: uuid!
    $title: String!
    $startedAt: timestamptz
    $endedAt: timestamptz
    $location: String!
    $description: String
    $threshold: numeric
  ) {
    insert_activity_session(
      objects: {
        activity_id: $activityId
        title: $title
        started_at: $startedAt
        ended_at: $endedAt
        location: $location
        description: $description
        threshold: $threshold
      }
    ) {
      affected_rows
    }
  }
`
const UPDATE_ACTIVITY_SESSION = gql`
  mutation UPDATE_ACTIVITY_SESSION(
    $activitySessionId: uuid!
    $title: String!
    $startedAt: timestamptz
    $endedAt: timestamptz
    $location: String!
    $description: String
    $threshold: numeric
  ) {
    update_activity_session(
      where: { id: { _eq: $activitySessionId } }
      _set: {
        title: $title
        started_at: $startedAt
        ended_at: $endedAt
        location: $location
        description: $description
        threshold: $threshold
      }
    ) {
      affected_rows
    }
  }
`

export default ActivitySessionsAdminBlock
