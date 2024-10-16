import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import hasura from '../hasura'
import { deleteZoomMeet, handleError } from '../helpers'
import { Meet, OverlapMeets } from '../types/meet'

export const GetOverlapMeets = gql`
  query GetOverlapMeets($appId: String!, $startedAt: timestamptz!, $endedAt: timestamptz!) {
    meet(
      where: {
        app_id: { _eq: $appId }
        started_at: { _lt: $endedAt }
        ended_at: { _gt: $startedAt }
        deleted_at: { _is_null: true }
        meet_members: { deleted_at: { _is_null: true } }
      }
    ) {
      id
      target
      host_member_id
      service_id
      meet_members {
        id
        member_id
      }
      gateway
    }
  }
`

export const GetMeetById = gql`
  query GetMeetById($meetId: uuid!) {
    meet_by_pk(id: $meetId) {
      id
      type
      gateway
    }
  }
`

export const useOverlapMeets = (startedAt: Date | null, endedAt: Date | null) => {
  const { id: appId } = useApp()
  const { loading, data } = useQuery<hasura.GetOverlapMeets, hasura.GetOverlapMeetsVariables>(GetOverlapMeets, {
    variables: { appId, startedAt, endedAt },
  })
  const overlapMeets: Pick<Meet, 'id' | 'target' | 'hostMemberId' | 'serviceId'>[] =
    data?.meet.map(v => ({
      id: v.id,
      target: v.target,
      hostMemberId: v.host_member_id,
      serviceId: v.service_id,
    })) || []
  return { loading, overlapMeets }
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
  const [deleteGeneralMeet] = useMutation<hasura.DeleteMeet, hasura.DeleteMeetVariables>(gql`
    mutation DeleteMeet($meetId: uuid!) {
      update_meet_by_pk(pk_columns: { id: $meetId }, _set: { deleted_at: "now()" }) {
        id
      }
    }
  `)
  return {
    insertMeet,
    updateMeet,
    deleteGeneralMeet,
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
      update_meet_member(
        where: { meet_id: { _eq: $meetId }, member_id: { _eq: $memberId } }
        _set: { deleted_at: "now()" }
      ) {
        affected_rows
      }
    }
  `)

  const [updateMeetMember] = useMutation<hasura.UpdateMeetMember, hasura.UpdateMeetMemberVariables>(gql`
    mutation UpdateMeetMember($meetId: uuid!, $memberId: String!, $meetMemberData: meet_member_set_input!) {
      update_meet_member(where: { meet_id: { _eq: $meetId }, member_id: { _eq: $memberId } }, _set: $meetMemberData) {
        affected_rows
      }
    }
  `)
  return {
    insertMeetMember,
    deleteMeetMember,
    updateMeetMember,
  }
}

export const useDeleteMeet = () => {
  const { deleteGeneralMeet } = useMutateMeet()
  const { deleteMeetMember } = useMutateMeetMember()
  const { authToken } = useAuth()

  const deleteMeet = async ({
    memberTaskMeetId,
    memberTaskMemberId,
    memberTaskMeetingGateway,
  }: {
    memberTaskMeetId: string
    memberTaskMemberId: string
    memberTaskMeetingGateway: string
  }) => {
    await deleteMeetMember({ variables: { meetId: memberTaskMeetId, memberId: memberTaskMemberId } }).catch(error =>
      handleError({ message: `delete meet member failed. error:${error}` }),
    )
    // The general meet is no need service id meet. e.g. jitsi
    await deleteGeneralMeet({ variables: { meetId: memberTaskMeetId } }).catch(error =>
      handleError({ message: `delete meet failed. error:${error}` }),
    )
    if (memberTaskMeetingGateway === 'zoom') {
      await deleteZoomMeet(memberTaskMeetId, authToken).catch(handleError)
    }
  }

  return { deleteMeet }
}

export const useGetOverlapMeet = () => {
  const apolloClient = useApolloClient()
  const { id: appId } = useApp()
  const getOverlapMeets = async ({ startedAt, endedAt }: { startedAt: string; endedAt: string }) => {
    let overlapMeets: OverlapMeets = []
    const { data: overlapMeetsData } = await apolloClient.query<
      hasura.GetOverlapMeets,
      hasura.GetOverlapMeetsVariables
    >({
      query: GetOverlapMeets,
      variables: {
        appId,
        startedAt,
        endedAt,
      },
      fetchPolicy: 'network-only',
    })
    overlapMeets =
      overlapMeetsData?.meet.map(v => ({
        id: v.id,
        target: v.target,
        hostMemberId: v.host_member_id,
        serviceId: v.service_id,
        meetMembers: v.meet_members.map(meetMember => ({
          id: meetMember.id,
          memberId: meetMember.member_id,
        })),
        meetingGateway: v.gateway,
      })) || []

    return {
      overlapMeets,
    }
  }
  return { getOverlapMeets }
}
