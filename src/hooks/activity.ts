import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { prop, sortBy, sum } from 'ramda'
import hasura from '../hasura'
import { notEmpty } from '../helpers'
import { ActivityAdminProps, ActivityTicketSessionType } from '../types/activity'
import { Category } from '../types/general'

export const useActivityCollection = (condition: hasura.GET_ACTIVITY_COLLECTION_ADMINVariables['condition']) => {
  const limit = 20
  const { loading, error, data, fetchMore, refetch } = useQuery<
    hasura.GET_ACTIVITY_COLLECTION_ADMIN,
    hasura.GET_ACTIVITY_COLLECTION_ADMINVariables
  >(
    gql`
      query GET_ACTIVITY_COLLECTION_ADMIN($condition: activity_bool_exp, $limit: Int) {
        activity(where: $condition, order_by: { created_at: desc_nulls_last }, limit: $limit) {
          id
          cover_url
          title
          published_at
          is_private
          created_at
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
        activity_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { condition, limit } },
  )

  const loadMoreActivities =
    (data?.activity_aggregate.aggregate?.count || 0) > limit
      ? () => {
          const lastActivity = data?.activity[data.activity.length - 1]
          return fetchMore({
            variables: {
              condition: {
                _and: [
                  condition,
                  {
                    created_at: {
                      _lte: lastActivity?.created_at,
                    },
                    id: {
                      _nin: data?.activity.filter(v => v.created_at === lastActivity?.created_at).map(v => v.id) || [],
                    },
                  },
                ],
              },
              limit,
            },
            updateQuery: (prev: hasura.GET_ACTIVITY_COLLECTION_ADMIN, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                activity_aggregate: fetchMoreResult.activity_aggregate,
                activity: [...prev.activity, ...fetchMoreResult.activity],
              }
            },
          })
        }
      : undefined

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
    isPrivate: boolean
  }[] =
    loading || error || !data
      ? []
      : data.activity.map(activity => ({
          id: activity.id,
          coverUrl: activity.cover_url,
          title: activity.title,
          publishedAt: activity.published_at && new Date(activity.published_at),
          isPrivate: activity.is_private,
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
    currentTabActivityCount: data?.activity_aggregate.aggregate?.count,
    refetchActivities: refetch,
    loadMoreActivities,
  }
}

export const useActivityAdmin = (activityId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_ACTIVITY_ADMIN, hasura.GET_ACTIVITY_ADMINVariables>(
    gql`
      query GET_ACTIVITY_ADMIN($activityId: uuid!) {
        activity(where: { id: { _eq: $activityId }, deleted_at: { _is_null: true } }) {
          id
          title
          description
          cover_url
          is_participants_visible
          organizer_id
          published_at
          support_locales
          is_private
          activity_categories(order_by: { position: asc }) {
            id
            category {
              id
              name
            }
          }
          activity_tags(order_by: { position: asc }) {
            id
            tag {
              name
            }
          }
          activity_tickets(where: { deleted_at: { _is_null: true } }, order_by: { ended_at: asc }) {
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
          activity_sessions(where: { deleted_at: { _is_null: true } }, order_by: { started_at: asc }) {
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
    loading || error || !data || !data?.activity
      ? null
      : {
          id: data.activity[0]?.id,
          coverUrl: data.activity[0]?.cover_url,
          title: data.activity[0]?.title,
          publishedAt: data.activity[0]?.published_at && new Date(data.activity[0]?.published_at),
          description: data.activity[0]?.description,
          isParticipantsVisible: data.activity[0]?.is_participants_visible,
          organizerId: data.activity[0]?.organizer_id,
          supportLocales: data.activity[0]?.support_locales || [],
          isPrivate: data.activity[0]?.is_private || false,
          categories:
            data.activity[0]?.activity_categories.map(v => ({
              id: v.category.id,
              name: v.category.name,
            })) || [],
          tags: data.activity[0]?.activity_tags.map(activityTag => activityTag.tag.name) || [],
          tickets:
            data?.activity[0]?.activity_tickets?.map(v => ({
              id: v.id,
              title: v.title,
              startedAt: new Date(v.started_at),
              endedAt: new Date(v.ended_at),
              currencyId: v.currency_id,
              price: v.price,
              count: v.count,
              description: v.description,
              isPublished: v.is_published,
              sessions: v.activity_session_tickets.map(v => ({
                id: v.activity_session.id,
                type: v.activity_session_type as ActivityTicketSessionType,
                title: v.activity_session.title,
                location: v.activity_session.location,
                onlineLink: v.activity_session.online_link,
              })),
              enrollmentsCount: v.activity_ticket_enrollments_aggregate.aggregate?.count || 0,
            })) || [],
          sessions:
            data?.activity[0]?.activity_sessions?.map(v => ({
              id: v.id,
              title: v.title,
              startedAt: new Date(v.started_at),
              endedAt: new Date(v.ended_at),
              location: v.location,
              onlineLink: v.online_link,
              threshold: v.threshold,
              description: v.description,
              maxAmount: {
                online: sum(
                  v.activity_session_tickets
                    .filter(w => ['online', 'both'].includes(w.activity_session_type))
                    .map(x => x.activity_ticket?.count || 0),
                ),
                offline: sum(
                  v.activity_session_tickets
                    .filter(w => ['offline', 'both'].includes(w.activity_session_type))
                    .map(x => x.activity_ticket?.count || 0),
                ),
              },
              enrollmentsCount: {
                online: v.ticket_enrollment_count?.online_session_ticket_count || 0,
                offline: v.ticket_enrollment_count?.offline_session_ticket_count || 0,
              },
            })) || [],
        }

  return {
    loadingActivityAdmin: loading,
    errorActivityAdmin: error,
    activityAdmin,
    refetchActivityAdmin: refetch,
  }
}


export const useCategroyCollection = (condition: hasura.GET_ACTIVITIES_CATEGORIESVariables['condition']) => {
  const { loading, error, data } = useQuery<
    hasura.GET_ACTIVITIES_CATEGORIES,
    hasura.GET_ACTIVITIES_CATEGORIESVariables
  >(
    gql`
      query GET_ACTIVITIES_CATEGORIES($condition: activity_bool_exp) {
        category(where: {activity_categories: {
          activity: $condition
        }}) {
          id
          name
          position
        }
      }
    `,
    { variables: { condition } },
  )
  const categories: Category[] | null =
  loading || error || !data ? null : sortBy(prop('position'))(data.category,)
  return { loadingCategories: loading, errorCategories: error, categories }
}
