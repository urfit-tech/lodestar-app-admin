import { useMutation } from '@apollo/react-hooks'
import { message, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import ActivitySessionsAdminBlockComponent from '../../components/activity/ActivitySessionsAdminBlock'
import ActivityContext from '../../contexts/ActivityContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const ActivitySessionsAdminBlock: React.FC<{
  onChangeTab?: () => void
}> = ({ onChangeTab }) => {
  const { formatMessage } = useIntl()
  const { loadingActivity, errorActivity, activity, refetchActivity } = useContext(ActivityContext)
  const [insertActivitySession] = useMutation<types.INSERT_ACTIVITY_SESSION, types.INSERT_ACTIVITY_SESSIONVariables>(
    INSERT_ACTIVITY_SESSION,
  )
  const [updateActivitySession] = useMutation<types.UPDATE_ACTIVITY_SESSION, types.UPDATE_ACTIVITY_SESSIONVariables>(
    UPDATE_ACTIVITY_SESSION,
  )

  if (loadingActivity) {
    return <Skeleton active />
  }

  if (errorActivity || !activity) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

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
        activityId: activity.id,
        ...data,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyCreated))
        setVisible(false)
        refetchActivity && refetchActivity()
      })
      .catch(error => handleError(error))
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
        message.success(formatMessage(commonMessages.event.successfullySaved))
        setVisible(false)
        refetchActivity && refetchActivity()
      })
      .catch(error => handleError(error))
      .finally(() => setLoading(false))
  }

  return (
    <ActivitySessionsAdminBlockComponent
      activityAdmin={activity}
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
