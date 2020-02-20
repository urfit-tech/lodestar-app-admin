import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { groupBy } from 'ramda'
import React from 'react'
import ActivityParticipantCollectionModal, {
  ActivitySessionParticipantProps,
} from '../../components/activity/ActivityParticipantCollectionModal'
import types from '../../types'

const ActivityParticipantCollection: React.FC<{
  activityId: string
}> = ({ activityId }) => {
  const { loading, error, data } = useQuery<types.GET_ACTIVITY_PARTICIPANTS, types.GET_ACTIVITY_PARTICIPANTSVariables>(
    GET_ACTIVITY_PARTICIPANTS,
    {
      variables: {
        activityId,
      },
    },
  )

  const sessions: ActivitySessionParticipantProps[] =
    loading || error || !data || !data.activity_enrollment
      ? []
      : (() => {
          const sessionParticipants = groupBy(enrollment => enrollment.activity_session_id, data.activity_enrollment)

          return data.activity_session.map(session => ({
            id: session.id,
            title: session.title,
            participants: sessionParticipants[session.id]
              ? sessionParticipants[session.id].map(participant => ({
                  id: participant.member_id || '',
                  name: participant.member_name || '',
                  phone: participant.member_phone || '',
                  email: participant.member_email || '',
                  orderLogId: participant.order_log_id || ''
                }))
              : [],
          }))
        })()

  return <ActivityParticipantCollectionModal sessions={sessions} />
}

const GET_ACTIVITY_PARTICIPANTS = gql`
  query GET_ACTIVITY_PARTICIPANTS($activityId: uuid!) {
    activity_enrollment(where: { activity_id: { _eq: $activityId } }, order_by: {}) {
      activity_session_id
      member_id
      member_name
      member_email
      member_phone
      order_log_id
    }
    activity_session(where: { activity_id: { _eq: $activityId } }, order_by: { started_at: asc }) {
      id
      title
      started_at
    }
  }
`

export default ActivityParticipantCollection
