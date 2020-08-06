import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useContext } from 'react'
import AppContext from '../contexts/AppContext'
import types from '../types'
import { ActivityBriefProps } from '../types/activity'

export const useActivityCollection = (memberId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_ACTIVITY_COLLECTION_ADMIN,
    types.GET_ACTIVITY_COLLECTION_ADMINVariables
  >(
    gql`
      query GET_ACTIVITY_COLLECTION_ADMIN($memberId: String) {
        activity(where: { organizer_id: { _eq: $memberId } }) {
          id
          cover_url
          title
          published_at
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
    `,
    { variables: { memberId } },
  )

  const activities: ActivityBriefProps[] =
    loading || error || !data
      ? []
      : data.activity.map(activity => ({
          id: activity.id,
          coverUrl: activity.cover_url,
          title: activity.title,
          publishedAt: activity.published_at && new Date(activity.published_at),
          participantsCount: activity.activity_enrollments_aggregate.aggregate?.count || 0,
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

export const useCreateActivity = () => {
  const { id: appId } = useContext(AppContext)
  const [insertActivity] = useMutation<types.INSERT_ACTIVITY, types.INSERT_ACTIVITYVariables>(gql`
    mutation INSERT_ACTIVITY(
      $title: String!
      $memberId: String!
      $appId: String!
      $activityCategories: [activity_category_insert_input!]!
    ) {
      insert_activity(
        objects: {
          title: $title
          organizer_id: $memberId
          app_id: $appId
          activity_categories: { data: $activityCategories }
        }
      ) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  return ({ title, memberId, categoryIds }: { title: string; memberId: string; categoryIds: string[] }) =>
    insertActivity({
      variables: {
        title,
        memberId,
        appId,
        activityCategories: categoryIds.map((categoryId, index) => ({
          category_id: categoryId,
          position: index,
        })),
      },
    })
}
