import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import moment from 'moment'
import { sum } from 'ramda'
import hasura from '../hasura'
import { SalesProps, Manager } from '../types/sales'
import { useMemo } from 'react'

export const useManagers = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MANAGER_COLLECTION>(
    gql`
      query GET_MANAGER_COLLECTION {
        member_permission(where: { permission_id: { _eq: "BACKSTAGE_ENTER" } }) {
          member {
            id
            name
            picture_url
            username
            email
          }
        }
      }
    `,
  )

  const { data: managerTelephoneExtData } = useQuery<
    hasura.GET_MANAGER_TELEPHONE_EXT,
    hasura.GET_MANAGER_TELEPHONE_EXTVariables
  >(
    gql`
      query GET_MANAGER_TELEPHONE_EXT($memberIds: [String!]!) {
        member_property(where: { member_id: { _in: $memberIds }, property: { name: { _eq: "分機號碼" } } }) {
          value
          member_id
        }
      }
    `,
    {
      variables: {
        memberIds: data?.member_permission.map(d => d.member?.id || '') || [],
      },
    },
  )

  const managers: Manager[] = useMemo(
    () =>
      data?.member_permission.map(v => ({
        id: v.member?.id || '',
        name: v.member?.name || '',
        username: v.member?.username || '',
        avatarUrl: v.member?.picture_url || null,
        email: v.member?.email || '',
        telephone: managerTelephoneExtData?.member_property.find(d => d.member_id === v.member?.id)?.value || '',
      })) || [],
    [data, managerTelephoneExtData],
  )

  return {
    loading,
    error,
    managers,
    refetch,
  }
}

export const useSales = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_SALES, hasura.GET_SALESVariables>(
    gql`
      query GET_SALES($salesId: String!, $startOfToday: timestamptz!, $startOfMonth: timestamptz!) {
        member_by_pk(id: $salesId) {
          id
          picture_url
          name
          username
          email
          metadata
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
          attends(where: { ended_at: { _is_null: false } }, order_by: [{ started_at: desc }], limit: 1) {
            id
            started_at
            ended_at
          }
        }
        order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
          order_executor_id
          total_price
          ratio
        }
        member_note_aggregate(
          where: {
            author_id: { _eq: $salesId }
            type: { _eq: "outbound" }
            status: { _eq: "answered" }
            duration: { _gt: 0 }
            created_at: { _gte: $startOfToday }
          }
        ) {
          aggregate {
            count
            sum {
              duration
            }
          }
        }
      }
    `,
    {
      variables: {
        salesId,
        startOfToday: moment().startOf('day').toDate(),
        startOfMonth: moment().startOf('month').toDate(),
      },
    },
  )

  const sales: SalesProps | null = data?.member_by_pk
    ? {
        id: data.member_by_pk.id,
        pictureUrl: data.member_by_pk.picture_url || null,
        name: data.member_by_pk.name,
        email: data.member_by_pk.email,
        telephone: data.member_by_pk.member_properties[0]?.value || '',
        metadata: data.member_by_pk.metadata,
        baseOdds: parseFloat(data.member_by_pk.metadata?.assignment?.odds || '0'),
        lastAttend: data.member_by_pk.attends[0]
          ? {
              startedAt: new Date(data.member_by_pk.attends[0].started_at),
              endedAt: new Date(data.member_by_pk.attends[0].ended_at),
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        sharingOrdersOfMonth: data.order_executor_sharing.length,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
      }
    : null

  return {
    loadingSales: loading,
    errorSales: error,
    sales,
    refetchSales: refetch,
  }
}

export const useValidManagerMemberIds = (managerId: string) => {
  const { data, loading, refetch } = useQuery<hasura.GetValidManagerMembers, hasura.GetValidManagerMembersVariables>(
    gql`
      query GetValidManagerMembers($managerId: String!) {
        member(where: { manager_id: { _eq: $managerId }, member_phones: { phone: { _is_null: false } } }) {
          id
        }
      }
    `,
    {
      variables: { managerId: managerId },
    },
  )
  const validManagerMemberIds: string[] = data?.member.map(v => v.id) || []
  return {
    validManagerMemberIds,
    loading,
    refetch,
  }
}

export const useActiveContractMemberIds = (managerMemberIds: string) => {
  const { data, loading, refetch } = useQuery<
    hasura.GetActiveContractMemberIds,
    hasura.GetActiveContractMemberIdsVariables
  >(
    gql`
      query GetActiveContractMemberIds($memberIds: [String!]!) {
        member_contract(where: { member_id: { _in: $memberIds }, agreed_at: { _is_null: false } }) {
          member_id
        }
      }
    `,
    { variables: { memberIds: managerMemberIds } },
  )
  const activeContractMemberIds = data?.member_contract.map(v => v.member_id) || []
  return {
    activeContractMemberIds,
    loading,
    refetch,
  }
}

export const useMemberTasks = (memberIds: string[]) => {
  const { loading, error, data, refetch } = useQuery<hasura.GetMemberTasks, hasura.GetMemberTasksVariables>(
    gql`
      query GetMemberTasks($memberIds: [String!]!) {
        member_task(where: { member_id: { _in: $memberIds } }, distinct_on: [member_id]) {
          member_id
          status
        }
      }
    `,
    { variables: { memberIds } },
  )

  const memberTasks: {
    memberId: string
    status: string
  }[] =
    data?.member_task.map(v => ({
      memberId: v.member_id,
      status: v.status,
    })) || []

  return {
    loading,
    error,
    memberTasks,
    refetch,
  }
}

export const useSalesLeadMemberCount = (
  managerId: string,
  activeContractMemberIds: string[],
  validManagerMemberIds: string[],
  memberTasks: { memberId: string; status: string }[],
) => {
  const {
    loading: loadingTotalSalesLeadMemberAggregate,
    data: totalSalesLeadMemberAggregateData,
    refetch: refetchTotalSalesLeadMembersAggregate,
  } = useQuery<hasura.GetTotalSalesLeadMemberAggregate, hasura.GetTotalSalesLeadMemberAggregateVariables>(
    gql`
      query GetTotalSalesLeadMemberAggregate($managerId: String!) {
        member_aggregate(where: { manager_id: { _eq: $managerId }, member_phones: { phone: { _is_null: false } } }) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { managerId } },
  )
  const {
    loading: loadingFollowedSalesLeadMemberAggregate,
    data: followedSalesLeadMemberAggregateData,
    refetch: refetchFollowedSalesLeadMemberAggregate,
  } = useQuery<hasura.GetFollowedSalesLeadMemberAggregate, hasura.GetFollowedSalesLeadMemberAggregateVariables>(
    gql`
      query GetFollowedSalesLeadMemberAggregate($managerId: String!) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: false }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { managerId } },
  )
  const {
    loading: loadingClosedSalesLeadMemberAggregate,
    data: closedSalesLeadMemberAggregateData,
    refetch: refetchClosedSalesLeadMemberAggregate,
  } = useQuery<hasura.GetClosedSalesLeadMemberAggregate, hasura.GetClosedSalesLeadMemberAggregateVariables>(
    gql`
      query GetClosedSalesLeadMemberAggregate($managerId: String!) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: false }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { managerId } },
  )
  const {
    loading: loadingCompletedSalesLeadMemberAggregate,
    data: completedSalesLeadMemberAggregateData,
    refetch: refetchCompletedSalesLeadMemberAggregate,
  } = useQuery<hasura.GetCompletedSalesLeadMemberAggregate, hasura.GetCompletedSalesLeadMemberAggregateVariables>(
    gql`
      query GetCompletedSalesLeadMemberAggregate($managerId: String!) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: true }
            completed_at: { _is_null: false }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { managerId } },
  )
  const {
    loading: loadingSignedSalesLeadMemberAggregate,
    data: signedSalesLeadMemberAggregateData,
    refetch: refetchSignedSalesLeadMemberAggregate,
  } = useQuery<hasura.GetSignedSalesLeadMemberAggregate, hasura.GetSignedSalesLeadMemberAggregateVariables>(
    gql`
      query GetSignedSalesLeadMemberAggregate($managerId: String!, $activeContractMemberIds: [String!]) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: true }
            completed_at: { _is_null: true }
            id: { _in: $activeContractMemberIds }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { managerId, activeContractMemberIds } },
  )
  const {
    loading: loadingPresentedSalesLeadMemberAggregate,
    data: presentedSalesLeadMemberAggregateData,
    refetch: refetchPresentedSalesLeadMemberAggregate,
  } = useQuery<hasura.GetPresentedSalesLeadMemberAggregate, hasura.GetPresentedSalesLeadMemberAggregateVariables>(
    gql`
      query GetPresentedSalesLeadMemberAggregate(
        $managerId: String!
        $activeContractMemberIds: [String!]
        $doneTaskMembers: [String!]
      ) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: true }
            completed_at: { _is_null: true }
            id: { _nin: $activeContractMemberIds, _in: $doneTaskMembers }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        managerId,
        activeContractMemberIds,
        doneTaskMembers: validManagerMemberIds.filter(validManagerMemberId =>
          memberTasks
            .filter(memberTask => memberTask.status === 'done')
            .some(memberTask => memberTask.memberId === validManagerMemberId),
        ),
      },
    },
  )
  const {
    loading: loadingInvitedSalesLeadMemberAggregate,
    data: invitedSalesLeadMemberAggregateData,
    refetch: refetchInvitedSalesLeadMemberAggregate,
  } = useQuery<hasura.GetInvitedSalesLeadMemberAggregate, hasura.GetInvitedSalesLeadMemberAggregateVariables>(
    gql`
      query GetInvitedSalesLeadMemberAggregate(
        $managerId: String!
        $activeContractMemberIds: [String!]
        $unDoneTaskMembers: [String!]
      ) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: true }
            completed_at: { _is_null: true }
            id: { _nin: $activeContractMemberIds, _in: $unDoneTaskMembers }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        managerId,
        activeContractMemberIds,
        unDoneTaskMembers: validManagerMemberIds.filter(validManagerMemberId =>
          memberTasks
            .filter(memberTask => memberTask.status !== 'done')
            .some(memberTask => memberTask.memberId === validManagerMemberId),
        ),
      },
    },
  )
  const {
    loading: loadingAnsweredSalesLeadMemberAggregate,
    data: answeredSalesLeadMemberAggregateData,
    refetch: refetchAnsweredSalesLeadMemberAggregate,
  } = useQuery<hasura.GetAnsweredSalesLeadMemberAggregate, hasura.GetAnsweredSalesLeadMemberAggregateVariables>(
    gql`
      query GetAnsweredSalesLeadMemberAggregate(
        $managerId: String!
        $activeContractMemberIds: [String!]
        $filterMemberIds: [String!]
      ) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: true }
            completed_at: { _is_null: true }
            id: { _nin: $filterMemberIds }
            last_member_note_answered: { _is_null: false }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        managerId,
        activeContractMemberIds,
        filterMemberIds: validManagerMemberIds?.filter(
          validManagerMemberId =>
            memberTasks.some(memberTask => memberTask.memberId === validManagerMemberId) ||
            activeContractMemberIds?.some(activeContractMemberId => activeContractMemberId === validManagerMemberId),
        ),
      },
    },
  )
  const {
    loading: loadingContactedSalesLeadMemberAggregate,
    data: contactedSalesLeadMemberAggregateData,
    refetch: refetchContactedSalesLeadMemberAggregate,
  } = useQuery<hasura.GetContactedSalesLeadMemberAggregate, hasura.GetContactedSalesLeadMemberAggregateVariables>(
    gql`
      query GetContactedSalesLeadMemberAggregate(
        $managerId: String!
        $activeContractMemberIds: [String!]
        $filterMemberIds: [String!]
      ) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: true }
            completed_at: { _is_null: true }
            id: { _nin: $filterMemberIds }
            last_member_note_answered: { _is_null: true }
            last_member_note_called: { _is_null: false }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        managerId,
        activeContractMemberIds,
        filterMemberIds: validManagerMemberIds?.filter(
          validManagerMemberId =>
            memberTasks.some(memberTask => memberTask.memberId === validManagerMemberId) ||
            activeContractMemberIds?.some(activeContractMemberId => activeContractMemberId === validManagerMemberId),
        ),
      },
    },
  )
  const {
    loading: loadingIdledSalesLeadMemberAggregate,
    data: idledSalesLeadMemberAggregateData,
    refetch: refetchIdledSalesLeadMemberAggregate,
  } = useQuery<hasura.GetIdledSalesLeadMemberAggregate, hasura.GetIdledSalesLeadMemberAggregateVariables>(
    gql`
      query GetIdledSalesLeadMemberAggregate(
        $managerId: String!
        $activeContractMemberIds: [String!]
        $filterMemberIds: [String!]
      ) {
        member_aggregate(
          where: {
            manager_id: { _eq: $managerId }
            member_phones: { phone: { _is_null: false } }
            followed_at: { _is_null: true }
            star: { _gte: -999 }
            closed_at: { _is_null: true }
            completed_at: { _is_null: true }
            id: { _nin: $filterMemberIds }
            last_member_note_answered: { _is_null: true }
            last_member_note_called: { _is_null: true }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        managerId,
        activeContractMemberIds,
        filterMemberIds: validManagerMemberIds?.filter(
          validManagerMemberId =>
            memberTasks.some(memberTask => memberTask.memberId === validManagerMemberId) ||
            activeContractMemberIds?.some(activeContractMemberId => activeContractMemberId === validManagerMemberId),
        ),
      },
    },
  )

  const totalSalesLeadMemberAggregate = totalSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const followedSalesLeadMemberAggregate = followedSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const closedSalesLeadMemberAggregate = closedSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const completedSalesLeadMemberAggregate =
    completedSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const signedSalesLeadMemberAggregate = signedSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const presentedSalesLeadMemberAggregate =
    presentedSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const invitedSalesLeadMemberAggregate = invitedSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const answeredSalesLeadMemberAggregate = answeredSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const contactedSalesLeadMemberAggregate =
    contactedSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0
  const idledSalesLeadMemberAggregate = idledSalesLeadMemberAggregateData?.member_aggregate.aggregate?.count || 0

  return {
    loadingTotalSalesLeadMemberAggregate,
    loadingFollowedSalesLeadMemberAggregate,
    loadingClosedSalesLeadMemberAggregate,
    loadingCompletedSalesLeadMemberAggregate,
    loadingSignedSalesLeadMemberAggregate,
    loadingPresentedSalesLeadMemberAggregate,
    loadingInvitedSalesLeadMemberAggregate,
    loadingAnsweredSalesLeadMemberAggregate,
    loadingContactedSalesLeadMemberAggregate,
    loadingIdledSalesLeadMemberAggregate,
    totalSalesLeadMemberAggregate,
    followedSalesLeadMemberAggregate,
    closedSalesLeadMemberAggregate,
    completedSalesLeadMemberAggregate,
    signedSalesLeadMemberAggregate,
    presentedSalesLeadMemberAggregate,
    invitedSalesLeadMemberAggregate,
    answeredSalesLeadMemberAggregate,
    contactedSalesLeadMemberAggregate,
    idledSalesLeadMemberAggregate,
    refetchTotalSalesLeadMembersAggregate,
    refetchFollowedSalesLeadMemberAggregate,
    refetchClosedSalesLeadMemberAggregate,
    refetchCompletedSalesLeadMemberAggregate,
    refetchSignedSalesLeadMemberAggregate,
    refetchPresentedSalesLeadMemberAggregate,
    refetchInvitedSalesLeadMemberAggregate,
    refetchAnsweredSalesLeadMemberAggregate,
    refetchContactedSalesLeadMemberAggregate,
    refetchIdledSalesLeadMemberAggregate,
  }
}
