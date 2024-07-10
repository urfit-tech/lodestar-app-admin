import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import moment from 'moment'
import { sum, prop, sortBy } from 'ramda'
import hasura from '../hasura'
import { SalesProps, LeadProps, LeadStatus, Manager, GetSalesLeadMemberDataInfo } from '../types/sales'
import { notEmpty } from '../helpers'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import axios from 'axios'

type ManagerWithMemberCountData = {
  manager: {
    email: string
    id: string
    name: string
  } | null
  memberCount: {
    aggregate: {
      count: number
    }
  } | null
}

export const useManagers = (status?: 'default' | 'onlySameDivision') => {
  const { currentMemberId } = useAuth()
  const { loading: loadingCurrentMemberDivision, data: currentMemberDivisionData } = useQuery<
    hasura.GetCurrentMemberDivision,
    hasura.GetCurrentMemberDivisionVariables
  >(
    gql`
      query GetCurrentMemberDivision($memberId: String!) {
        member_property(where: { member_id: { _eq: $memberId }, property: { name: { _eq: "組別" } } }) {
          id
          value
        }
      }
    `,
    {
      variables: { memberId: currentMemberId || '' },
    },
  )

  const { loading: loadingSamDivisionMembers, data: sameDivisionMembersData } = useQuery<
    hasura.GetSameDivisionMembers,
    hasura.GetSameDivisionMembersVariables
  >(
    gql`
      query GetSameDivisionMembers($division: String!) {
        member_property(where: { value: { _eq: $division } }) {
          member_id
        }
      }
    `,
    { variables: { division: currentMemberDivisionData?.member_property[0]?.value || '' } },
  )

  const {
    loading: loadingManagerCollection,
    error,
    data,
    refetch,
  } = useQuery<hasura.GET_MANAGER_COLLECTION>(
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
      data?.member_permission
        .filter(v =>
          status === 'onlySameDivision'
            ? sameDivisionMembersData?.member_property.map(v => v.member_id).some(memberId => memberId === v.member?.id)
            : true,
        )
        .map(v => ({
          id: v.member?.id || '',
          name: v.member?.name || '',
          username: v.member?.username || '',
          avatarUrl: v.member?.picture_url || null,
          email: v.member?.email || '',
          telephone: managerTelephoneExtData?.member_property.find(d => d.member_id === v.member?.id)?.value || '',
        })) || [],
    [
      data?.member_permission,
      managerTelephoneExtData?.member_property,
      sameDivisionMembersData?.member_property,
      status,
    ],
  )

  return {
    loading: loadingCurrentMemberDivision || loadingManagerCollection || loadingSamDivisionMembers,
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

const transformManagerData = (data: any): ManagerWithMemberCountData => {
  if (!data || !data.manager || !data.memberCount?.aggregate) {
    return { manager: null, memberCount: { aggregate: { count: 0 } } }
  }

  const {
    manager,
    memberCount: { aggregate },
  } = data

  return {
    manager: {
      email: manager.email,
      id: manager.id,
      name: manager.name,
    },
    memberCount: {
      aggregate: {
        count: aggregate.count,
      },
    },
  }
}

export const useGetManagerWithMemberCount = (managerId: string, appId: string) => {
  const isParamsValid = managerId && appId

  const { data, error, loading, refetch } = useQuery(GetManagerWithMemberCount, {
    variables: { managerId, appId },
    skip: !isParamsValid,
  })

  useEffect(() => {
    if (isParamsValid) {
      refetch()
    }
  }, [managerId, appId, refetch, isParamsValid])

  const transformedData = useMemo(() => transformManagerData(data), [data])

  if (!isParamsValid) {
    return {
      managerWithMemberCountData: { manager: null, memberCount: 0 },
      errorMembers: null,
      loadingMembers: false,
      refetchMembers: () => {},
    }
  }

  return {
    managerWithMemberCountData: transformedData,
    errorMembers: error,
    loadingMembers: loading,
    refetchMembers: refetch,
  }
}

export const useManagerLeads = (manager: Manager) => {
  const { id: appId } = useApp()
  const {
    data: salesLeadMemberData,
    error: errorMembers,
    loading: loadingMembers,
    refetch: refetchMembers,
  } = useQuery<hasura.GetSalesLeadMembers, hasura.GetSalesLeadMembersVariables>(GetSalesLeadMembers, {
    variables: { managerId: manager.id, appId },
  })
  const { authToken } = useAuth()

  const [salesLeadMemberInfo, setSalesLeadMemberInfo] = useState<GetSalesLeadMemberDataInfo>()
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (authToken && manager && manager.id && appId) {
      try {
        const payload = {
          managerId: manager.id,
          appId: appId,
        }

        const { data } = await axios.post(
          `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/members/saleLeadMemberData`,
          payload,
          { headers: { authorization: `Bearer ${authToken}` } },
        )

        setSalesLeadMemberInfo(data)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [appId, authToken, manager])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = () => {
    fetchData()
  }
  const convertToLead = (v: hasura.GetSalesLeadMembers['member'][number] | null): LeadProps | null => {
    if (!v || v.member_phones.length === 0) {
      return null
    }
    const signed = Number(salesLeadMemberInfo?.activeMemberContract?.filter(mc => mc.memberId === v.id).length) > 0
    const status: LeadStatus = v.followed_at
      ? 'FOLLOWED'
      : signed
      ? 'SIGNED'
      : v.excluded_at
      ? 'DEAD'
      : v.closed_at
      ? 'CLOSED'
      : v.completed_at
      ? 'COMPLETED'
      : salesLeadMemberInfo?.memberTask?.find(mt => mt.memberId === v.id)?.status === 'done'
      ? 'PRESENTED'
      : salesLeadMemberInfo?.memberTask?.find(mt => mt.memberId === v.id) //member has member_task => INVITED demo
      ? 'INVITED'
      : v.last_member_note_answered
      ? 'ANSWERED'
      : v.last_member_note_called
      ? 'CONTACTED'
      : 'IDLED'
    return {
      appId: v.app_id,
      id: v.id,
      star: v.star,
      name: v.name,
      email: v.email,
      pictureUrl: v.picture_url || '',
      createdAt: moment(v.created_at).toDate(),
      phones: v.member_phones?.map(_v => ({ phoneNumber: _v.phone, isValid: _v.is_valid })),
      notes: salesLeadMemberInfo?.memberNote?.filter(mn => mn.memberId === v.id)[0]?.description || '',
      categoryNames:
        salesLeadMemberInfo?.memberCategory.filter(mc => mc.memberId === v.id).map(_v => _v.name || '') || [],
      properties:
        salesLeadMemberInfo?.memberProperty
          ?.filter(mp => mp.memberId === v.id)
          .map(v => ({
            id: v.propertyId || '',
            name: v.name || '',
            value: v.value,
          })) || [],
      status,
      leadStatusCategoryId: v.lead_status_category_id,
      assignedAt: v.assigned_at ? dayjs(v.assigned_at).toDate() : null,
      notified: !v.last_member_note_created,
      recentContactedAt: v.last_member_note_called ? dayjs(v.last_member_note_called).toDate() : null,
      recentAnsweredAt: v.last_member_note_answered ? dayjs(v.last_member_note_answered).toDate() : null,
      completedAt: v.completed_at ? dayjs(v.completed_at).toDate() : null,
      closedAt: v.closed_at ? dayjs(v.closed_at).toDate() : null,
      followedAt: v.followed_at ? dayjs(v.followed_at).toDate() : null,
      excludedAt: v.excluded_at ? dayjs(v.excluded_at).toDate() : null,
      recycledAt: v.recycled_at ? dayjs(v.recycled_at).toDate() : null,
    }
  }

  const totalLeads: LeadProps[] = sortBy(prop('id'))(
    salesLeadMemberData?.member.map(convertToLead)?.filter(notEmpty) || [],
  )

  return {
    loading,
    error,
    refetch,
    loadingMembers,
    errorMembers,
    refetchMembers,
    totalLeads,
    followedLeads: totalLeads.filter(lead => lead.status === 'FOLLOWED'),
    idledLeads: totalLeads.filter(lead => lead.status === 'IDLED'),
    contactedLeads: totalLeads.filter(lead => lead.status === 'CONTACTED'),
    answeredLeads: totalLeads.filter(lead => lead.status === 'ANSWERED'),
    invitedLeads: totalLeads.filter(lead => lead?.status === 'INVITED'),
    presentedLeads: totalLeads.filter(lead => lead?.status === 'PRESENTED'),
    signedLeads: totalLeads.filter(lead => lead?.status === 'SIGNED'),
    closedLeads: totalLeads.filter(lead => lead?.status === 'CLOSED'),
    completedLeads: totalLeads.filter(lead => lead?.status === 'COMPLETED'),
  }
}

const GetSalesLeadMembers = gql`
  query GetSalesLeadMembers($appId: String!, $managerId: String!) {
    member(
      where: {
        app_id: { _eq: $appId }
        manager_id: { _eq: $managerId }
        member_phones: { phone: { _is_null: false } }
        excluded_at: { _is_null: true }
        _or: [{ star: { _gte: -9999 } }, { star: { _is_null: true } }]
      }
    ) {
      app_id
      id
      name
      email
      picture_url
      star
      created_at
      assigned_at
      followed_at
      closed_at
      completed_at
      excluded_at
      recycled_at
      last_member_note_created
      last_member_note_called
      last_member_note_answered
      lead_status_category_id
      member_phones {
        phone
        is_valid
      }
    }
  }
`

const GetManagerWithMemberCount = gql`
  query GetManagerMemberCount($appId: String!, $managerId: String!) {
    manager: member_by_pk(id: $managerId) {
      id
      name
      email
    }
    memberCount: member_aggregate(where: { app_id: { _eq: $appId }, manager_id: { _eq: $managerId } }) {
      aggregate {
        count
      }
    }
  }
`

export const useLeadStatusCategory = (memberId: string, categoryId?: string) => {
  const { id: appId } = useApp()

  const { data, error, loading, refetch } = useQuery<
    hasura.GetLeadStatusCategory,
    hasura.GetLeadStatusCategoryVariables
  >(GetLeadStatusCategory, { variables: { memberId, categoryId }, skip: !memberId })

  const leadStatusCategories = useMemo(() => {
    return (
      data?.lead_status_category.map(v => ({
        id: v.id as string,
        memberId: v.member_id,
        categoryId: v.category?.id || '',
        status: v.status,
        categoryName: v.category?.name || '',
      })) || []
    )
  }, [data])

  const [addLeadStatusCategory] = useMutation<hasura.AddLeadStatusCategory, hasura.AddLeadStatusCategoryVariables>(
    AddLeadStatusCategory,
  )
  const [upsertCategory] = useMutation<hasura.UpsertCategory, hasura.UpsertCategoryVariables>(UpsertCategory)

  const [renameLeadStatusCategory] = useMutation<
    hasura.RenameLeadStatusCategory,
    hasura.RenameLeadStatusCategoryVariables
  >(RenameLeadStatusCategory)

  const [deleteLeadStatusCategory] = useMutation<
    hasura.DeleteLeadStatusCategory,
    hasura.DeleteLeadStatusCategoryVariables
  >(DeleteLeadStatusCategory)

  const [updateMemberLeadStatusCategoryId] = useMutation<
    hasura.UpdateMemberLeadStatusCategoryId,
    hasura.UpdateMemberLeadStatusCategoryIdVariables
  >(UpdateMemberLeadStatusCategoryId)

  const handleAddLeadStatusCategory = async (
    listName: string,
    status: LeadStatus,
    onFinally?: () => void,
    onError?: (err: any) => void,
  ) => {
    try {
      const { data } = await upsertCategory({
        variables: {
          data: {
            name: listName,
            class: 'lead',
            position: 0,
            app_id: appId,
          },
        },
      })
      const categoryId = data?.insert_category_one?.id
      if (!categoryId) {
        throw new Error('category id is not found')
      }
      await addLeadStatusCategory({ variables: { categoryId, memberId, status } })
    } catch (error) {
      onError?.(error)
    } finally {
      onFinally?.()
    }
  }
  const handleManagerLeadStatusCategory = async (
    deleteLeadStatusCategoryIds: string[],
    memberIds: string[],
    onFinally?: () => void,
    onError?: (err: any) => void,
  ) => {
    try {
      await updateMemberLeadStatusCategoryId({ variables: { memberIds, leadStatusCategoryId: null } })
      await Promise.all(
        deleteLeadStatusCategoryIds.map(id => {
          deleteLeadStatusCategory({ variables: { id } })
          return id
        }),
      )
    } catch (error) {
      onError?.(error)
    } finally {
      onFinally?.()
    }
  }

  return {
    loadingLeadStatusCategory: loading,
    errorLeadStatusCategory: error,
    leadStatusCategories,
    refetchLeadStatusCategory: refetch,
    upsertCategory,
    addLeadStatusCategory,
    renameLeadStatusCategory,
    deleteLeadStatusCategory,
    updateMemberLeadStatusCategoryId,
    handleAddLeadStatusCategory,
    handleManagerLeadStatusCategory,
  }
}

const GetLeadStatusCategory = gql`
  query GetLeadStatusCategory($memberId: String!, $categoryId: String) {
    lead_status_category(
      where: { member_id: { _eq: $memberId }, category_id: { _eq: $categoryId }, status: { _eq: "FOLLOWED" } }
    ) {
      id
      member_id
      status
      category {
        id
        name
      }
    }
  }
`

const UpsertCategory = gql`
  mutation UpsertCategory($data: category_insert_input!) {
    insert_category_one(
      object: $data
      on_conflict: { constraint: category_app_id_class_name_key, update_columns: [name] }
    ) {
      id
    }
  }
`

const AddLeadStatusCategory = gql`
  mutation AddLeadStatusCategory($memberId: String!, $status: String!, $categoryId: String!) {
    insert_lead_status_category_one(
      object: { member_id: $memberId, status: $status, category_id: $categoryId }
      on_conflict: { constraint: lead_status_category_member_id_category_id_key }
    ) {
      id
    }
  }
`

const RenameLeadStatusCategory = gql`
  mutation RenameLeadStatusCategory($categoryId: String!, $newCategoryId: String!) {
    update_lead_status_category(where: { category_id: { _eq: $categoryId } }, _set: { category_id: $newCategoryId }) {
      affected_rows
    }
  }
`

const DeleteLeadStatusCategory = gql`
  mutation DeleteLeadStatusCategory($id: uuid!) {
    delete_lead_status_category(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`

const UpdateMemberLeadStatusCategoryId = gql`
  mutation UpdateMemberLeadStatusCategoryId($memberIds: [String!]!, $leadStatusCategoryId: uuid) {
    update_member(where: { id: { _in: $memberIds } }, _set: { lead_status_category_id: $leadStatusCategoryId }) {
      affected_rows
    }
  }
`
