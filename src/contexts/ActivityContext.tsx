import { useQuery } from '@apollo/react-hooks'
import { ApolloError } from 'apollo-client'
import gql from 'graphql-tag'
import React, { createContext } from 'react'
import { ActivitySessionProps } from '../components/activity/ActivitySessionsAdminBlock'
import { ActivityTicketProps } from '../components/activity/ActivityTicket'
import types from '../types'

export type ActivityAdminProps = {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  isParticipantsVisible: boolean
  organizerId: string
  publishedAt: Date | null

  activityCategories: {
    id: string
    category: {
      id: string
      name: string
    }
    position: number
  }[]
  activitySessions: ActivitySessionProps[]
  activityTickets: ActivityTicketProps[]
}

const ActivityContext = createContext<{
  loadingActivity: boolean
  errorActivity?: ApolloError
  activity?: ActivityAdminProps
  refetchActivity?: () => {}
}>({
  loadingActivity: true,
})

export const ActivityProvider: React.FC<{
  activityId: string
}> = ({ activityId, children }) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ACTIVITY_ADMIN, types.GET_ACTIVITY_ADMINVariables>(
    GET_ACTIVITY_ADMIN,
    {
      variables: {
        activityId,
      },
    },
  )

  const activity: ActivityAdminProps | undefined =
    loading || !!error || !data || !data.activity_by_pk
      ? undefined
      : {
          id: data.activity_by_pk.id,
          title: data.activity_by_pk.title,
          description: data.activity_by_pk.description,
          coverUrl: data.activity_by_pk.cover_url,
          isParticipantsVisible: data.activity_by_pk.is_participants_visible,
          organizerId: data.activity_by_pk.organizer_id,
          publishedAt: data.activity_by_pk.published_at ? new Date(data.activity_by_pk.published_at) : null,

          activityCategories: data.activity_by_pk.activity_categories.map(activityCategory => ({
            id: activityCategory.id,
            category: {
              id: activityCategory.category.id,
              name: activityCategory.category.name,
            },
            position: activityCategory.position,
          })),

          activitySessions: data.activity_by_pk.activity_sessions.map(session => ({
            id: session.id,
            title: session.title,
            description: session.description,
            location: session.location,
            threshold: session.threshold,
            startedAt: new Date(session.started_at),
            endedAt: new Date(session.ended_at),
            participants: session.activity_enrollments_aggregate.aggregate
              ? session.activity_enrollments_aggregate.aggregate.count || 0
              : 0,
          })),

          activityTickets: data.activity_by_pk.activity_tickets.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            price: ticket.price,
            count: ticket.count,
            startedAt: new Date(ticket.started_at),
            endedAt: new Date(ticket.ended_at),
            isPublished: ticket.is_published,
            activitySessionTickets: ticket.activity_session_tickets.map(sessionTicket => ({
              id: sessionTicket.id,
              activitySession: {
                id: sessionTicket.activity_session.id,
                title: sessionTicket.activity_session.title,
              },
            })),
            participants: ticket.activity_ticket_enrollments_aggregate.aggregate
              ? ticket.activity_ticket_enrollments_aggregate.aggregate.count || 0
              : 0,
          })),
        }

  return (
    <ActivityContext.Provider
      value={{
        loadingActivity: loading,
        errorActivity: error,
        activity,
        refetchActivity: refetch,
      }}
    >
      {children}
    </ActivityContext.Provider>
  )
}

const GET_ACTIVITY_ADMIN = gql`
  query GET_ACTIVITY_ADMIN($activityId: uuid!) {
    activity_by_pk(id: $activityId) {
      id
      title
      description
      cover_url
      is_participants_visible
      organizer_id
      published_at
      activity_categories {
        id
        category {
          id
          name
        }
        position
      }
      activity_enrollments_aggregate {
        aggregate {
          count
        }
      }
      activity_sessions(order_by: { started_at: asc }) {
        id
        title
        description
        location
        threshold
        started_at
        ended_at
        activity_enrollments_aggregate {
          aggregate {
            count
          }
        }
      }
      activity_tickets(order_by: { started_at: asc }) {
        id
        title
        description
        price
        count
        started_at
        ended_at
        is_published
        activity_session_tickets {
          id
          activity_session {
            id
            title
          }
        }
        activity_ticket_enrollments_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`

export default ActivityContext
