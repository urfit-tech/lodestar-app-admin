import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import moment from 'moment'
import { sum } from 'ramda'
import hasura from '../hasura'
import { SalesProps, LeadStatus, Manager, SalesLeadMember } from '../types/sales'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import axios from 'axios'
import { SorterResult } from 'antd/lib/table/interface'
import { ManagerSelectorStatus } from '../types/sales'

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

export const useManagers = (status?: ManagerSelectorStatus) => {
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

  const { loading: loadingCurrentMemberPermissionGroups, data: currentMemberPermissionGroupsData } = useQuery<
    hasura.GetCurrentMemberPermissionGroups,
    hasura.GetCurrentMemberPermissionGroupsVariables
  >(
    gql`
      query GetCurrentMemberPermissionGroups($memberId: String!) {
        member_permission_group(where: { member_id: { _eq: $memberId } }) {
          permission_group_id
        }
      }
    `,
    {
      variables: { memberId: currentMemberId || '' },
      skip: !currentMemberId,
    },
  )

  const { loading: loadingSamePermissionGroupMembers, data: samePermissionGroupMembersData } = useQuery<
    hasura.GetSamePermissionGroupMembers,
    hasura.GetSamePermissionGroupMembersVariables
  >(
    gql`
      query GetSamePermissionGroupMembers($permissionGroupIds: [uuid!]!) {
        member_permission_group(where: { permission_group_id: { _in: $permissionGroupIds } }) {
          member_id
        }
      }
    `,
    {
      variables: {
        permissionGroupIds:
          currentMemberPermissionGroupsData?.member_permission_group.map(g => g.permission_group_id) || [],
      },
      skip: !currentMemberPermissionGroupsData?.member_permission_group.length,
    },
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

  const isManagerInFilteredGroup = useCallback(
    (member: any) => {
      const memberId = member?.id
      if (!memberId) return false

      switch (status) {
        case 'onlySameDivision':
          return sameDivisionMembersData?.member_property?.some(prop => prop.member_id === memberId)

        case 'onlySamePermissionGroup':
          return samePermissionGroupMembersData?.member_permission_group?.some(group => group.member_id === memberId)

        case 'bothPermissionGroupAndDivision':
          return (
            sameDivisionMembersData?.member_property?.some(prop => prop.member_id === memberId) ||
            samePermissionGroupMembersData?.member_permission_group?.some(group => group.member_id === memberId)
          )

        default:
          return true
      }
    },
    [status, sameDivisionMembersData?.member_property, samePermissionGroupMembersData?.member_permission_group],
  )

  const managers: Manager[] = useMemo(() => {
    return (
      data?.member_permission
        .filter(v => isManagerInFilteredGroup(v.member))
        .map(v => ({
          id: v.member?.id || '',
          name: v.member?.name || '',
          username: v.member?.username || '',
          avatarUrl: v.member?.picture_url || null,
          email: v.member?.email || '',
          telephone: managerTelephoneExtData?.member_property.find(d => d.member_id === v.member?.id)?.value || '',
        })) || []
    )
  }, [data?.member_permission, isManagerInFilteredGroup, managerTelephoneExtData?.member_property])

  if (error) {
    return {
      loading: false,
      error,
      managers: [],
      refetch,
    }
  }

  const loadingStates = [
    loadingCurrentMemberDivision,
    loadingManagerCollection,
    loadingSamDivisionMembers,
    loadingCurrentMemberPermissionGroups,
    loadingSamePermissionGroupMembers,
  ]

  return {
    loading: loadingStates.some(Boolean),
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
export type Filter = {
  nameAndEmail?: string
  fullName?: string
  phone?: string
  lastTaskCategoryName?: string
  leadLevel?: (boolean | React.Key)[] | null
  categoryName?: (boolean | React.Key)[] | null
  materialName?: string
  memberNote?: string
  status?: string
}

export type ManagerLead = {
  totalPages: number
  totalCount: number
  filterCount: number
  followedLeads: { memberId: string; status: string; leadStatusCategoryId: string | null }[]
  followedLeadsCount: number
  signedLeadsCount: number
  resubmissionCount: number
  completedLeadsCount: number
  deadLeadsCount: number
  closedLeadsCount: number
  presentedLeadsCount: number
  invitedLeadsCount: number
  answeredLeadsCount: number
  contactedLeadsCount: number
  idLedLeadsCount: number
  callbackedLeadsCount: number
  salesLeadMembers: SalesLeadMember[]
}

export const useManagerLeads = (
  manager: Manager,
  currentPage: number,
  currentPageSize: number,
  status: string,
  leadStatusCategoryId: string | null,
  sorter?: SorterResult<SalesLeadMember> | SorterResult<SalesLeadMember>[],
  filter?: Filter,
) => {
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  const lastFetchedStatus = useRef(status)

  const [salesLeadMembersData, setSalesLeadMembersData] = useState<ManagerLead>()
  const [defaultSalesLeadMembers, setDefaultSalesLeadMembers] = useState<SalesLeadMember[]>([])
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const condition = {
      nameAndEmail: filter?.nameAndEmail ? `%${filter?.nameAndEmail}%` : undefined,
      phone: filter?.phone ? `%${filter?.phone}%` : undefined,
      memberNote: filter?.memberNote ? filter?.memberNote : undefined,
      materialName: filter?.materialName ? `%${filter?.materialName}%` : undefined,
      categoryName: filter?.categoryName ? filter?.categoryName : undefined,
      leadLevel: filter?.leadLevel ? filter?.leadLevel : undefined,
    }

    if (authToken && manager && manager.id && appId) {
      try {
        await axios
          .post(
            `${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/sales-lead/${manager.id}`,
            {
              currentPageSize,
              currentPage,
              status,
              leadStatusCategoryId,
              sorter: sorter
                ? Array.isArray(sorter)
                  ? sorter.map(sorter => ({
                      columnKey: sorter?.columnKey,
                      order: sorter?.order === 'ascend' ? 'ASC' : 'DESC',
                    }))
                  : {
                      columnKey: sorter?.columnKey,
                      order: sorter?.order === 'ascend' ? 'ASC' : 'DESC',
                    }
                : { columnKey: 'member.assignedAt', order: 'DESC' },
              condition,
            },
            {
              headers: { authorization: `Bearer ${authToken}` },
            },
          )
          .then(({ data }) => {
            const result: ManagerLead = {
              totalPages: data.totalPages || 0,
              totalCount: data.totalCount || 0,
              filterCount: data.filterCount || 0,
              followedLeads: data.followedLeads || 0,
              followedLeadsCount: data.followedLeadsCount || 0,
              signedLeadsCount: data.signedLeadsCount || 0,
              resubmissionCount: data.resubmissionCount || 0,
              completedLeadsCount: data.completedLeadsCount || 0,
              deadLeadsCount: data.deadLeadsCount || 0,
              closedLeadsCount: data.closedLeadsCount || 0,
              presentedLeadsCount: data.presentedLeadsCount || 0,
              invitedLeadsCount: data.invitedLeadsCount || 0,
              answeredLeadsCount: data.answeredLeadsCount || 0,
              contactedLeadsCount: data.contactedLeadsCount || 0,
              idLedLeadsCount: data.idLedLeadsCount || 0,
              callbackedLeadsCount: data.callbackedLeadsCount,
              salesLeadMembers: data.salesLeadMembers.map((salesLeadMember: SalesLeadMember) => ({
                id: salesLeadMember.id,
                appId: salesLeadMember.appId,
                name: salesLeadMember.name,
                email: salesLeadMember.email,
                pictureUrl: salesLeadMember.pictureUrl,
                star: Number(salesLeadMember.star),
                notified: Boolean(salesLeadMember.notified),
                leadStatusCategoryId: salesLeadMember.leadStatusCategoryId,
                properties: salesLeadMember.properties.map(property => ({
                  id: property.id,
                  name: property.name,
                  value: property.value,
                })),
                phones: salesLeadMember.phones.map(phone => ({
                  phoneNumber: phone.phoneNumber,
                  isValid: phone.isValid,
                })),
                categoryNames: salesLeadMember.categoryNames,
                latestNoteDescription: salesLeadMember.latestNoteDescription,
                memberNoteOutboundCount: salesLeadMember.memberNoteOutboundCount,
                status: salesLeadMember.status as LeadStatus,
                createdAt: dayjs(salesLeadMember.createdAt).toDate(),
                assignedAt: salesLeadMember.assignedAt ? dayjs(salesLeadMember.assignedAt).toDate() : null,
                followedAt: salesLeadMember.followedAt ? dayjs(salesLeadMember.followedAt).toDate() : null,
                closedAt: salesLeadMember.closedAt ? dayjs(salesLeadMember.closedAt).toDate() : null,
                completedAt: salesLeadMember.completedAt ? dayjs(salesLeadMember.completedAt).toDate() : null,
                excludedAt: salesLeadMember.excludedAt ? dayjs(salesLeadMember.excludedAt).toDate() : null,
                recycledAt: salesLeadMember.recycledAt ? dayjs(salesLeadMember.recycledAt).toDate() : null,
                recentContactedAt: salesLeadMember.recentContactedAt
                  ? dayjs(salesLeadMember.recentContactedAt).toDate()
                  : null,
                recentAnsweredAt: salesLeadMember.recentAnsweredAt
                  ? dayjs(salesLeadMember.recentAnsweredAt).toDate()
                  : null,
                callbackedAt: salesLeadMember.callbackedAt ? dayjs(salesLeadMember.callbackedAt).toDate() : null,
                rating: salesLeadMember.rating,
              })),
            }
            setDefaultSalesLeadMembers(result.salesLeadMembers)
            setSalesLeadMembersData(result)
          })
          .catch(error => setError(error))
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [
    appId,
    authToken,
    currentPage,
    currentPageSize,
    filter?.categoryName,
    filter?.leadLevel,
    filter?.materialName,
    filter?.memberNote,
    filter?.nameAndEmail,
    filter?.phone,
    leadStatusCategoryId,
    manager,
    sorter,
    status,
  ])

  useEffect(() => {
    lastFetchedStatus.current = status
    fetchData()
  }, [fetchData, status])

  const refetch = async () => {
    if (lastFetchedStatus.current !== status) {
      return // Ignore if refetch after status change
    }
    await fetchData()
  }

  return {
    loading,
    error,
    refetch,
    salesLeadMembersData,
    setSalesLeadMembersData,
    defaultSalesLeadMembers,
    setDefaultSalesLeadMembers,
  }
}

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

export const useUpdatePhonesIsValid = () => {
  const [updatePhonesIsValidMutation, { loading, error }] = useMutation<
    hasura.UPDATE_MEMBER_PHONES_IS_VALID,
    hasura.UPDATE_MEMBER_PHONES_IS_VALIDVariables
  >(gql`
    mutation UPDATE_MEMBER_PHONES_IS_VALID($phones: [member_phone_insert_input!]!) {
      insert_member_phone(
        objects: $phones
        on_conflict: {
          constraint: member_phone_member_id_phone_key
          update_columns: [is_valid]
        }
      ) {
        affected_rows
      }
    }
  `)

  return {
    updatePhonesIsValid: updatePhonesIsValidMutation,
    loading,
    error,
  }
}