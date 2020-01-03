import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { object } from 'yup'
import { activitySchema, activityTicketSchema } from '../schemas/activity'
import types from '../types'
import { ActivityProps } from '../types/activity'

export const usePublishedActivityCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_PUBLISHED_ACTIVITY_COLLECTION>(gql`
    query GET_PUBLISHED_ACTIVITY_COLLECTION {
      activity(where: { published_at: { _is_null: false } }, order_by: [{ position: asc }, { published_at: desc }]) {
        id
        title
        cover_url
        published_at
        is_participants_visible
        organizer_id
        activity_categories {
          id
          category {
            id
            name
            position
          }
        }
        activity_enrollments_aggregate {
          aggregate {
            count
          }
        }
        activity_sessions_aggregate {
          aggregate {
            min {
              started_at
            }
            max {
              ended_at
            }
          }
        }
      }
    }
  `)

  const activities: ActivityProps[] =
    loading || error || !data
      ? []
      : data.activity
          .filter(activity => activity.published_at && new Date(activity.published_at).getTime() < Date.now())
          .map(activity => ({
            id: activity.id,
            coverUrl: activity.cover_url,
            title: activity.title,
            description: '',
            isParticipantsVisible: activity.is_participants_visible,
            participantCount: activity.activity_enrollments_aggregate.aggregate
              ? activity.activity_enrollments_aggregate.aggregate.count || 0
              : 0,
            publishedAt: activity.published_at,
            isPublished: activity.published_at ? new Date(activity.published_at).getTime() < Date.now() : false,
            startedAt:
              activity.activity_sessions_aggregate.aggregate &&
              activity.activity_sessions_aggregate.aggregate.min &&
              activity.activity_sessions_aggregate.aggregate.min.started_at
                ? new Date(activity.activity_sessions_aggregate.aggregate.min.started_at)
                : null,
            endedAt:
              activity.activity_sessions_aggregate.aggregate &&
              activity.activity_sessions_aggregate.aggregate.max &&
              activity.activity_sessions_aggregate.aggregate.max.ended_at
                ? new Date(activity.activity_sessions_aggregate.aggregate.max.ended_at)
                : null,
            link: `/activities/${activity.id}`,
            appId: localStorage.getItem('kolable.app.id') || '',
            organizerId: activity.organizer_id,

            categories: activity.activity_categories.map(activityCategory => ({
              id: activityCategory.id,
              category: {
                id: activityCategory.category.id,
                name: activityCategory.category.name,
                position: activityCategory.category.position,
              },
            })),
            sessions: [],
            tickets: [],
          }))

  return {
    loadingActivities: loading,
    errorActivities: error,
    refetchActivities: refetch,
    activities,
  }
}

export const useEnrolledActivityTickets = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_ENROLLED_ACTIVITY_TICKETS,
    types.GET_ENROLLED_ACTIVITY_TICKETSVariables
  >(
    gql`
      query GET_ENROLLED_ACTIVITY_TICKETS($memberId: String!) {
        activity_ticket_enrollment(where: { member_id: { _eq: $memberId } }) {
          order_log_id
          order_product_id
          activity_ticket_id
        }
      }
    `,
    { variables: { memberId } },
  )

  const enrolledActivityTickets: {
    orderLogId: string
    orderProductId: string
    activityTicketId: string
  }[] =
    loading || error || !data
      ? []
      : data.activity_ticket_enrollment.map(ticketEnrollment => ({
          orderLogId: ticketEnrollment.order_log_id || '',
          orderProductId: ticketEnrollment.order_product_id || '',
          activityTicketId: ticketEnrollment.activity_ticket_id,
        }))

  return {
    loadingTickets: loading,
    errorTickets: error,
    refetchTickets: refetch,
    enrolledActivityTickets,
  }
}

export const useActivityTicket = (ticketId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_TICKET, types.GET_TICKETVariables>(
    gql`
      query GET_TICKET($ticketId: uuid!) {
        activity_ticket_by_pk(id: $ticketId) {
          id
          title
          description
          is_published
          started_at
          ended_at
          count
          price

          activity_session_tickets(order_by: { activity_session: { started_at: asc } }) {
            activity_session {
              id
              title
              description
              location
              started_at
              ended_at
              threshold
            }
          }

          activity {
            id
            title
            is_participants_visible
            cover_url
            published_at
            activity_categories {
              category {
                id
                name
              }
              position
            }
          }
        }
      }
    `,
    {
      variables: { ticketId },
    },
  )

  const castData = object({
    activity_ticket_by_pk: activityTicketSchema
      .concat(
        object({
          activity: activitySchema,
        }).camelCase(),
      )
      .nullable()
      .camelCase(),
  }).cast(data)

  return {
    loadingTicket: loading,
    errorTicket: error,
    refetchTicket: refetch,
    ticket: castData.activity_ticket_by_pk,
  }
}
