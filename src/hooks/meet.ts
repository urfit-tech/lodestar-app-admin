import { gql, useMutation, useQuery } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import hasura from '../hasura'

export const useOverLapCreatorMeets = (target: string, startedAt: Date, endedAt: Date, hostMemberId?: string) => {
  const { id: appId } = useApp()
  const { loading, data } = useQuery<hasura.GetOverlapCreatorMeets, hasura.GetOverlapCreatorMeetsVariables>(
    GetOverlapCreatorMeets,
    {
      variables: { appId, target, startedAt, endedAt, hostMemberId },
    },
  )
  const overLapCreatorMeets: {
    id: string
    hostMemberId: string
    serviceId: string
  }[] =
    data?.meet.map(v => ({
      id: v.id,
      hostMemberId: v.host_member_id,
      serviceId: v.service_id,
    })) || []
  return { loading, overLapCreatorMeets }
}

export const useMutateMeet = () => {
  const [insertMeet] = useMutation<hasura.InsertMeet, hasura.InsertMeetVariables>(
    gql`
      mutation InsertMeet($meet: meet_insert_input!) {
        insert_meet_one(object: $meet) {
          id
        }
      }
    `,
  )
  const [updateMeet] = useMutation<hasura.UpdateMeet, hasura.UpdateMeetVariables>(gql`
    mutation UpdateMeet($meetId: uuid!, $data: meet_set_input) {
      update_meet_by_pk(pk_columns: { id: $meetId }, _set: $data) {
        id
      }
    }
  `)
  const [deleteMeet] = useMutation<hasura.DeleteMeet, hasura.DeleteMeetVariables>(gql`
    mutation DeleteMeet($meetId: uuid!) {
      delete_meet_by_pk(id: $meetId) {
        id
      }
    }
  `)
  return {
    insertMeet,
    updateMeet,
    deleteMeet,
  }
}

export const useMutateMeetMember = () => {
  const [insertMeetMember] = useMutation<hasura.InsertMeetMember, hasura.InsertMeetMemberVariables>(gql`
    mutation InsertMeetMember($meetMember: meet_member_insert_input!) {
      insert_meet_member_one(object: $meetMember) {
        id
      }
    }
  `)
  const [deleteMeetMember] = useMutation<hasura.DeleteMeetMember, hasura.DeleteMeetMemberVariables>(gql`
    mutation DeleteMeetMember($meetId: uuid!, $memberId: String!) {
      delete_meet_member(where: { meet_id: { _eq: $meetId }, member_id: { _eq: $memberId } }) {
        affected_rows
      }
    }
  `)
  return {
    insertMeetMember,
    deleteMeetMember,
  }
}

export const GetOverlapCreatorMeets = gql`
  query GetOverlapCreatorMeets(
    $appId: String!
    $target: uuid
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $hostMemberId: String
  ) {
    meet(
      where: {
        app_id: { _eq: $appId }
        target: { _neq: $target }
        started_at: { _lte: $endedAt }
        ended_at: { _gte: $startedAt }
        deleted_at: { _is_null: false }
        host_member_id: { _eq: $hostMemberId }
      }
    ) {
      id
      host_member_id
      service_id
    }
  }
`

export const GetMeetById = gql`
  query GetMeetById($meetId: uuid!) {
    meet_by_pk(id: $meetId) {
      id
      type
    }
  }
`
