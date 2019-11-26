import { useMutation, useQuery } from '@apollo/react-hooks'
import { message } from 'antd'
import gql from 'graphql-tag'
import { reverse } from 'ramda'
import React from 'react'
import useRouter from 'use-react-router'
import { ActivityProps } from '../../components/activity/Activity'
import ActivityCollectionAdminBlockComponent from '../../components/activity/ActivityCollectionAdminBlock'
import types from '../../types'
import ActivityParticipantCollection from './ActivityParticipantCollection'

const ActivityCollectionAdminBlock: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { loading, error, data } = useQuery<
    types.GET_ACTIVITY_COLLECTION_ADMIN,
    types.GET_ACTIVITY_COLLECTION_ADMINVariables
  >(GET_ACTIVITY_COLLECTION_ADMIN, {
    variables: { memberId },
  })
  const { history } = useRouter()
  const [insertActivity] = useMutation<types.INSERT_ACTIVITY, types.INSERT_ACTIVITYVariables>(INSERT_ACTIVITY)

  const activities: ActivityProps[] =
    loading || error || !data
      ? []
      : data.activity.map(activity => ({
          id: activity.id,
          title: activity.title,
          coverUrl: activity.cover_url,
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
          link: `/studio/activities/${activity.id}`,
          action: (
            <div className="text-right" onClick={e => e.preventDefault()}>
              <ActivityParticipantCollection activityId={activity.id} />
            </div>
          ),
        }))

  const handleCreate: (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      description: string
      activityCategoryIds: string[]
    },
  ) => void = (setVisible, setLoading, { title, description, activityCategoryIds }) => {
    setLoading(true)

    insertActivity({
      variables: {
        title,
        description,
        activityCategories: activityCategoryIds.map((categoryId, index) => ({
          category_id: categoryId,
          position: index,
        })),
        memberId,
        appId: process.env.REACT_APP_ID || '',
      },
    })
      .then(({ data }) => {
        message.success('成功建立活動')
        if (data && data.insert_activity) {
          const activityId = data.insert_activity.returning[0].id
          history.push(`/studio/activities/${activityId}`)
        }
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
        message.error('建立活動失敗')
      })
      .finally(() => setLoading(false))
  }

  return <ActivityCollectionAdminBlockComponent activities={reverse(activities)} onCreate={handleCreate} />
}

const GET_ACTIVITY_COLLECTION_ADMIN = gql`
  query GET_ACTIVITY_COLLECTION_ADMIN($memberId: String!) {
    activity(where: { organizer_id: { _eq: $memberId } }) {
      id
      title
      cover_url
      published_at
      is_participants_visible
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
`

const INSERT_ACTIVITY = gql`
  mutation INSERT_ACTIVITY(
    $title: String!
    $description: String!
    $memberId: String!
    $appId: String!
    $activityCategories: [activity_category_insert_input!]!
  ) {
    insert_activity(
      objects: {
        title: $title
        description: $description
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
`

export default ActivityCollectionAdminBlock
