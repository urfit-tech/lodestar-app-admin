import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import hasura from '../hasura'
import { notEmpty } from '../helpers'
import { ActivityAdminProps, ActivityTicketSessionType } from '../types/activity'

export const useActivityCollection = (memberId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_ACTIVITY_COLLECTION_ADMIN,
    hasura.GET_ACTIVITY_COLLECTION_ADMINVariables
  >(
    gql`
      query GET_ACTIVITY_COLLECTION_ADMIN($memberId: String) {
        activity(where: { organizer_id: { _eq: $memberId } }) {
          id
          cover_url
          title
          published_at
          activity_sessions {
            location
            online_link
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
          session_ticket_enrollment_count {
            activity_online_session_ticket_count
            activity_offline_session_ticket_count
          }
        }
      }
    `,
    { variables: { memberId } },
  )

  const activities: {
    id: string
    coverUrl: string | null
    title: string
    publishedAt: Date | null
    includeSessionTypes: ('offline' | 'online')[]
    participantsCount: {
      online: number
      offline: number
    }
    startedAt: Date | null
    endedAt: Date | null
  }[] =
    loading || error || !data
      ? []
      : data.activity.map(activity => ({
          id: activity.id,
          coverUrl: activity.cover_url,
          title: activity.title,
          publishedAt: activity.published_at && new Date(activity.published_at),
          participantsCount: {
            online: sum(activity.session_ticket_enrollment_count.map(v => v.activity_online_session_ticket_count || 0)),
            offline: sum(
              activity.session_ticket_enrollment_count.map(v => v.activity_offline_session_ticket_count || 0),
            ),
          },
          includeSessionTypes: [
            activity.activity_sessions.find(v => v.location) ? ('offline' as const) : null,
            activity.activity_sessions.find(v => v.online_link) ? ('online' as const) : null,
          ].filter(notEmpty),
          startedAt:
            activity.activity_sessions_aggregate.aggregate?.min?.started_at &&
            new Date(activity.activity_sessions_aggregate.aggregate.min.started_at),
          endedAt:
            activity.activity_sessions_aggregate.aggregate?.max?.ended_at &&
            new Date(activity.activity_sessions_aggregate.aggregate.max.ended_at),
        }))

  return {
    loadingActivities: loading,
    errorActivities: error,
    activities,
    refetchActivities: refetch,
  }
}

export const useActivityAdmin = (activityId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_ACTIVITY_ADMIN, hasura.GET_ACTIVITY_ADMINVariables>(
    gql`
      query GET_ACTIVITY_ADMIN($activityId: uuid!) {
        activity_by_pk(id: $activityId) {
          id
          title
          description
          cover_url
          is_participants_visible
          organizer_id
          published_at
          support_locales
          activity_categories(order_by: { position: asc }) {
            id
            category {
              id
              name
            }
          }
          activity_tickets(order_by: { started_at: asc }) {
            id
            title
            started_at
            ended_at
            price
            count
            description
            is_published
            currency_id
            activity_session_tickets {
              id
              activity_session_type
              activity_session {
                id
                title
                location
                online_link
              }
            }
            activity_ticket_enrollments_aggregate {
              aggregate {
                count
              }
            }
          }
          activity_sessions(order_by: { started_at: asc }) {
            id
            title
            started_at
            ended_at
            location
            online_link
            threshold
            description
            activity_enrollments_aggregate {
              aggregate {
                count
              }
            }
            activity_session_tickets {
              activity_session_type
              activity_ticket {
                count
              }
            }
            ticket_enrollment_count {
              offline_session_ticket_count: activity_offline_session_ticket_count
              online_session_ticket_count: activity_online_session_ticket_count
            }
          }
        }
      }
    `,
    { variables: { activityId } },
  )

  const activityAdmin: ActivityAdminProps | null =
    loading || error || !data || !data?.activity_by_pk
      ? null
      : {
          id: data.activity_by_pk.id,
          coverUrl: data.activity_by_pk.cover_url,
          title: data.activity_by_pk.title,
          publishedAt: data.activity_by_pk.published_at && new Date(data.activity_by_pk.published_at),
          description: data.activity_by_pk.description,
          isParticipantsVisible: data.activity_by_pk.is_participants_visible,
          organizerId: data.activity_by_pk.organizer_id,
          supportLocales: data.activity_by_pk.support_locales || [],

          categories: data.activity_by_pk.activity_categories.map(activityCategory => ({
            id: activityCategory.category.id,
            name: activityCategory.category.name,
          })),
          tickets: data.activity_by_pk.activity_tickets.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            startedAt: new Date(ticket.started_at),
            endedAt: new Date(ticket.ended_at),
            currencyId: ticket.currency_id,
            price: ticket.price,
            count: ticket.count,
            description: ticket.description,
            isPublished: ticket.is_published,
            sessions: ticket.activity_session_tickets.map(sessionTicket => ({
              id: sessionTicket.activity_session.id,
              type: sessionTicket.activity_session_type as ActivityTicketSessionType,
              title: sessionTicket.activity_session.title,
              location: sessionTicket.activity_session.location,
              onlineLink: sessionTicket.activity_session.online_link,
            })),
            enrollmentsCount: ticket.activity_ticket_enrollments_aggregate.aggregate?.count || 0,
          })),
          sessions: data.activity_by_pk.activity_sessions.map(session => ({
            id: session.id,
            title: session.title,
            startedAt: new Date(session.started_at),
            endedAt: new Date(session.ended_at),
            location: session.location,
            onlineLink: session.online_link,
            threshold: session.threshold,
            description: session.description,
            maxAmount: {
              online: sum(
                session.activity_session_tickets
                  .filter(v => ['online', 'both'].includes(v.activity_session_type))
                  .map(sessionTicket => sessionTicket.activity_ticket?.count || 0),
              ),
              offline: sum(
                session.activity_session_tickets
                  .filter(v => ['offline', 'both'].includes(v.activity_session_type))
                  .map(sessionTicket => sessionTicket.activity_ticket?.count || 0),
              ),
            },
            enrollmentsCount: {
              online: session.ticket_enrollment_count?.online_session_ticket_count || 0,
              offline: session.ticket_enrollment_count?.offline_session_ticket_count || 0,
            },
          })),
        }

  return {
    loadingActivityAdmin: loading,
    errorActivityAdmin: error,
    activityAdmin,
    refetchActivityAdmin: refetch,
  }
}
