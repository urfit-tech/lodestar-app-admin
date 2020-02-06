import { useMutation } from '@apollo/react-hooks'
import { message, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import ActivityTicketsAdminBlockComponent from '../../components/activity/ActivityTicketsAdminBlock'
import ActivityContext from '../../contexts/ActivityContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const ActivityTicketsAdminBlock: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loadingActivity, errorActivity, activity, refetchActivity } = useContext(ActivityContext)
  const [insertActivityTicket] = useMutation<types.INSERT_ACTIVITY_TICKET, types.INSERT_ACTIVITY_TICKETVariables>(
    INSERT_ACTIVITY_TICKET,
  )
  const [updateActivityTicket] = useMutation<types.UPDATE_ACTIVITY_TICKET, types.UPDATE_ACTIVITY_TICKETVariables>(
    UPDATE_ACTIVITY_TICKET,
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
      sessionIds: string[]
      isPublished: boolean
      startedAt: Date
      endedAt: Date
      price: number
      count: number
      description: string | null
    },
  ) => void = (setLoading, setVisible, data) => {
    setLoading(true)

    insertActivityTicket({
      variables: {
        activityId: activity.id,
        title: data.title,
        activitySessionTickets: data.sessionIds.map(sessionId => ({
          activity_session_id: sessionId,
        })),
        isPublished: data.isPublished,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
        price: data.price,
        count: data.count,
        description: data.description,
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
      activityTicketId: string
      title: string
      sessionIds: string[]
      isPublished: boolean
      startedAt: Date
      endedAt: Date
      price: number
      count: number
      description: string | null
    },
  ) => void = (setLoading, setVisible, data) => {
    setLoading(true)

    updateActivityTicket({
      variables: {
        activityTicketId: data.activityTicketId,
        title: data.title,
        activitySessionTickets: data.sessionIds.map(sessionId => ({
          activity_ticket_id: data.activityTicketId,
          activity_session_id: sessionId,
        })),
        isPublished: data.isPublished,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
        price: data.price,
        count: data.count,
        description: data.description,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        setVisible(false)
        refetchActivity && refetchActivity()
      })
      .catch(error => handleError(error))
      .finally(() => setLoading(false))
  }

  return <ActivityTicketsAdminBlockComponent activityAdmin={activity} onInsert={handleInsert} onUpdate={handleUpdate} />
}

const INSERT_ACTIVITY_TICKET = gql`
  mutation INSERT_ACTIVITY_TICKET(
    $activityId: uuid!
    $title: String!
    $activitySessionTickets: [activity_session_ticket_insert_input!]!
    $isPublished: Boolean!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $price: numeric!
    $count: Int
    $description: String
  ) {
    insert_activity_ticket(
      objects: {
        activity_id: $activityId
        title: $title
        is_published: $isPublished
        started_at: $startedAt
        ended_at: $endedAt
        price: $price
        count: $count
        description: $description
        activity_session_tickets: { data: $activitySessionTickets }
      }
    ) {
      affected_rows
    }
  }
`
const UPDATE_ACTIVITY_TICKET = gql`
  mutation UPDATE_ACTIVITY_TICKET(
    $activityTicketId: uuid!
    $title: String!
    $activitySessionTickets: [activity_session_ticket_insert_input!]!
    $isPublished: Boolean!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $price: numeric!
    $count: Int
    $description: String
  ) {
    update_activity_ticket(
      where: { id: { _eq: $activityTicketId } }
      _set: {
        title: $title
        is_published: $isPublished
        started_at: $startedAt
        ended_at: $endedAt
        price: $price
        count: $count
        description: $description
      }
    ) {
      affected_rows
    }
    delete_activity_session_ticket(where: { activity_ticket_id: { _eq: $activityTicketId } }) {
      affected_rows
    }
    insert_activity_session_ticket(objects: $activitySessionTickets) {
      affected_rows
    }
  }
`

export default ActivityTicketsAdminBlock
