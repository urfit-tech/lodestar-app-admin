import { gql, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { getDefaultResourceEventsFethcer } from '../helpers/eventHelper/eventFetchers'
import { getActiveEvents, getAvailableEvents } from '../components/event/eventAdaptor'
import { GeneralEventApi } from '../components/event/events.type'
import hasura from '../hasura'
import {
  ClassGroup,
  CourseRowData,
  Language,
  ScheduleEvent,
  ScheduleTemplateProps,
  ScheduleType,
} from '../types/schedule'

type ClassGroupRow = hasura.GetClassGroupsForSchedule['class_group'][number]
type ClassGroupRowLike = Omit<ClassGroupRow, 'class_group_orders'> & {
  class_group_orders?: ClassGroupRow['class_group_orders']
}

// =============================================================================
// Teacher Management from Members (Real Data)
// =============================================================================

interface TeacherFromMember {
  id: string
  name: string
  email: string
  pictureUrl: string | null
  campus: string // permission_group name（主要校區，向後相容）
  campusId: string // permission_group id（主要校區 ID）
  campusIds: string[] // 所有校區 ID（支援多校區）
  campusNames: string[] // 所有校區名稱（支援多校區）
  languages: string[] // from member_tags
  traits: string[] // from member_specialities
  note: string // from member_property (內部備註)
  yearsOfExperience: number // from member_property (年資)
  level: number // from member_rating
}

// GraphQL query to get permission groups (as campus options)
// Only get permission groups with names ending with "校"
export const GET_PERMISSION_GROUPS_FOR_SCHEDULE = gql`
  query GetPermissionGroupsForSchedule {
    permission_group(where: { name: { _like: "%校" } }, order_by: { name: asc }) {
      id
      name
    }
  }
`

// GraphQL query to get teachers by member_category (會員分類為「老師」)
// Campus info is retrieved from member_permission_groups
export const GET_TEACHERS_FROM_MEMBERS = gql`
  query GetTeachersFromMembers {
    member_category(
      where: { category: { name: { _eq: "老師" } } }
      order_by: { member: { name: asc } }
    ) {
      member {
        id
        name
        email
        picture_url
        star
        member_tags {
          tag_name
        }
        member_specialities {
          tag_name
        }
        member_properties {
          property {
            id
            name
          }
          value
        }
        member_permission_groups(where: { permission_group: { name: { _like: "%校" } } }) {
          permission_group {
            id
            name
          }
        }
      }
    }
  }
`

/**
 * Hook to get permission groups (as campus options)
 */
export const usePermissionGroupsAsCampuses = () => {
  const { data, loading, error, refetch } = useQuery<
    hasura.GetPermissionGroupsForSchedule,
    hasura.GetPermissionGroupsForScheduleVariables
  >(GET_PERMISSION_GROUPS_FOR_SCHEDULE)

  const campuses = useMemo(() => {
    return (
      data?.permission_group.map(pg => ({
        id: pg.id,
        name: pg.name,
      })) || []
    )
  }, [data])

  return { campuses, loading, error, refetch }
}

/**
 * Hook to get teachers from members by member_category (會員分類為「老師」)
 * Campus info is retrieved from member_permission_groups
 * @param permissionGroupIds - Array of permission group IDs to filter teachers by campus (optional)
 * @param languageFilters - Optional language filters array (from member tags, e.g. ['中文', '英文'])
 * @param traitFilter - Optional trait filter (from member specialities)
 * @param requireLanguage - If true, skip query when no language filters provided
 */
export const useTeachersFromMembers = (
  permissionGroupIds?: string[],
  languageFilters?: string[],
  traitFilter?: string,
  requireLanguage: boolean = false,
) => {
  const hasLanguageFilter = Boolean(languageFilters?.length)

  // 如果要求有語言才查詢，且沒有語言，則跳過查詢
  const shouldSkip = requireLanguage && !hasLanguageFilter

  const { data, loading, error, refetch } = useQuery<
    hasura.GetTeachersFromMembers,
    hasura.GetTeachersFromMembersVariables
  >(GET_TEACHERS_FROM_MEMBERS, {
    skip: shouldSkip,
  })

  const teachers = useMemo<TeacherFromMember[]>(() => {
    const memberCategories = data?.member_category

    if (!memberCategories) return []

    // Create a map to deduplicate members
    const memberMap = new Map<string, TeacherFromMember>()

    memberCategories.forEach(mc => {
      const member = mc.member
      const memberId = member.id

      // Skip if already processed (shouldn't happen, but just in case)
      if (memberMap.has(memberId)) return

      // Extract campus info from member_permission_groups
      const campusIds: string[] = []
      const campusNames: string[] = []
      member.member_permission_groups.forEach(mpg => {
        if (!campusIds.includes(mpg.permission_group.id)) {
          campusIds.push(mpg.permission_group.id)
          campusNames.push(mpg.permission_group.name)
        }
      })

      // Extract languages from tags
      const languages = member.member_tags.map(t => t.tag_name)

      // Extract traits from specialities
      const traits = member.member_specialities.map(s => s.tag_name)

      // Extract note and years of experience from properties
      let note = ''
      let yearsOfExperience = 0
      member.member_properties.forEach(prop => {
        if (prop.property.name === '內部備註') {
          note = prop.value
        } else if (prop.property.name === '年資') {
          yearsOfExperience = parseInt(prop.value, 10) || 0
        }
      })

      // Get star rating from member.star field
      const level = member.star || 0

      memberMap.set(memberId, {
        id: member.id,
        name: member.name || '',
        email: member.email,
        pictureUrl: member.picture_url ?? null,
        campus: campusNames[0] || '',
        campusId: campusIds[0] || '',
        campusIds,
        campusNames,
        languages,
        traits,
        note,
        yearsOfExperience,
        level,
      })
    })

    let result = Array.from(memberMap.values())

    // Apply permission group filter (filter by campus)
    if (permissionGroupIds && permissionGroupIds.length > 0) {
      result = result.filter(t => t.campusIds.some(id => permissionGroupIds.includes(id)))
    }

    // Apply language filters (支援多語言篩選)
    if (languageFilters && languageFilters.length > 0) {
      result = result.filter(t => languageFilters.some(lang => t.languages.includes(lang)))
    }

    // Apply trait filter
    if (traitFilter) {
      result = result.filter(t => t.traits.includes(traitFilter))
    }

    return result
  }, [data, permissionGroupIds, languageFilters, traitFilter])

  // Get unique languages from all teachers
  const availableLanguages = useMemo(() => {
    const langSet = new Set<string>()
    teachers.forEach(t => t.languages.forEach(l => langSet.add(l)))
    return Array.from(langSet).sort()
  }, [teachers])

  // Get unique traits from all teachers
  const availableTraits = useMemo(() => {
    const traitSet = new Set<string>()
    teachers.forEach(t => t.traits.forEach(tr => traitSet.add(tr)))
    return Array.from(traitSet).sort()
  }, [teachers])

  return {
    teachers,
    loading,
    error,
    refetch,
    availableLanguages,
    availableTraits,
  }
}

// =============================================================================
// Class Group GraphQL Queries & Mutations
// =============================================================================

// GraphQL query to get class groups
export const GET_CLASS_GROUPS_FOR_SCHEDULE = gql`
  query GetClassGroupsForSchedule($type: String, $appId: String!) {
    class_group(
      where: { app_id: { _eq: $appId }, type: { _eq: $type }, deleted_at: { _is_null: true } }
      order_by: { created_at: desc }
    ) {
      id
      app_id
      name
      type
      campus_id
      language
      min_students
      max_students
      materials
      status
      created_at
      updated_at
      class_group_orders {
        order_id
      }
    }
  }
`

// GraphQL query to get single class group by ID
export const GET_CLASS_GROUP_BY_ID = gql`
  query GetClassGroupById($id: uuid!) {
    class_group(where: { id: { _eq: $id }, deleted_at: { _is_null: true } }) {
      id
      app_id
      name
      type
      campus_id
      language
      min_students
      max_students
      materials
      status
      created_at
      updated_at
      class_group_orders {
        order_id
      }
    }
  }
`

// GraphQL mutation to insert class group
export const INSERT_CLASS_GROUP = gql`
  mutation InsertClassGroup($object: class_group_insert_input!) {
    insert_class_group_one(object: $object) {
      id
      app_id
      name
      type
      campus_id
      language
      min_students
      max_students
      materials
      status
      created_at
      updated_at
    }
  }
`

// GraphQL mutation to update class group
export const UPDATE_CLASS_GROUP = gql`
  mutation UpdateClassGroup($id: uuid!, $set: class_group_set_input!) {
    update_class_group_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      app_id
      name
      type
      campus_id
      language
      min_students
      max_students
      materials
      status
      created_at
      updated_at
    }
  }
`

// GraphQL mutation to soft delete class group
export const DELETE_CLASS_GROUP = gql`
  mutation DeleteClassGroup($id: uuid!) {
    update_class_group_by_pk(pk_columns: { id: $id }, _set: { deleted_at: "now()" }) {
      id
      deleted_at
    }
  }
`

// GraphQL mutation to add order to class group
export const INSERT_CLASS_GROUP_ORDER = gql`
  mutation InsertClassGroupOrder($object: class_group_order_insert_input!) {
    insert_class_group_order_one(object: $object) {
      id
      class_group_id
      order_id
      added_at
    }
  }
`

// GraphQL mutation to remove order from class group
export const DELETE_CLASS_GROUP_ORDER = gql`
  mutation DeleteClassGroupOrder($classGroupId: uuid!, $orderId: String!) {
    delete_class_group_order(where: { class_group_id: { _eq: $classGroupId }, order_id: { _eq: $orderId } }) {
      affected_rows
    }
  }
`

// GraphQL query to get orders by IDs (for orders already in a class group)
export const GET_ORDERS_BY_IDS = gql`
  query GetOrdersByIds($orderIds: [String!]!) {
    order_log(where: { id: { _in: $orderIds } }) {
      id
      member_id
      member {
        id
        name
        email
        picture_url
      }
      options
      expired_at
      order_products {
        id
        name
        options
        started_at
        ended_at
      }
      created_at
      status
    }
  }
`

// GraphQL query to get available orders for class group (not yet assigned)
// Filters by class_type and language in order_product.options.options
export const GET_AVAILABLE_ORDERS_FOR_CLASS = gql`
  query GetAvailableOrdersForClass(
    $appId: String!
    $classType: String!
    $language: String!
    $excludeOrderIds: [String!]!
  ) {
    order_log(
      where: {
        app_id: { _eq: $appId }
        id: { _nin: $excludeOrderIds }
        order_products: { options: { _contains: { options: { class_type: $classType, language: $language } } } }
      }
      order_by: { created_at: desc }
    ) {
      id
      member_id
      member {
        id
        name
        email
        picture_url
      }
      options
      expired_at
      order_products(where: { options: { _contains: { options: { class_type: $classType, language: $language } } } }) {
        id
        name
        options
      }
      created_at
      status
    }
  }
`

// GraphQL query to get all order IDs already assigned to any class group
export const GET_ASSIGNED_ORDER_IDS = gql`
  query GetAssignedOrderIds {
    class_group_order {
      order_id
    }
  }
`

// Helper function to transform GraphQL data to ClassGroup type
const transformClassGroupData = (data: ClassGroupRowLike): ClassGroup => ({
  id: data.id,
  appId: data.app_id,
  name: data.name,
  type: data.type as 'semester' | 'group',
  campusId: data.campus_id,
  language: data.language as Language,
  minStudents: data.min_students,
  maxStudents: data.max_students,
  materials: (data.materials as string[] | null) || [],
  status: data.status as ClassGroup['status'],
  createdAt: new Date(data.created_at || 0),
  updatedAt: new Date(data.updated_at || 0),
  orderIds: data.class_group_orders?.map(o => o.order_id) || [],
})

/**
 * Hook to get class groups
 */
export const useClassGroups = (type?: 'semester' | 'group') => {
  const { id: appId } = useApp()

  const { data, loading, error, refetch } = useQuery<
    hasura.GetClassGroupsForSchedule,
    hasura.GetClassGroupsForScheduleVariables
  >(GET_CLASS_GROUPS_FOR_SCHEDULE, {
    variables: {
      type: type || undefined,
      appId,
    },
    skip: !appId,
    fetchPolicy: 'cache-and-network',
  })

  const classGroups = useMemo(() => {
    if (!data?.class_group) return []
    return data.class_group.map(transformClassGroupData)
  }, [data])

  return { classGroups, loading, error, refetch }
}

/**
 * Hook to get class group by ID
 */
export const useClassGroup = (classGroupId: string | undefined) => {
  const { data, loading, error, refetch } = useQuery<hasura.GetClassGroupById, hasura.GetClassGroupByIdVariables>(
    GET_CLASS_GROUP_BY_ID,
    {
      variables: { id: classGroupId },
      skip: !classGroupId,
      fetchPolicy: 'cache-and-network',
    },
  )

  const classGroup = useMemo(() => {
    if (!data?.class_group?.length) return undefined
    return transformClassGroupData(data.class_group[0])
  }, [data])

  return { classGroup, loading, error, refetch }
}


/**
 * Hook to get holidays
 */
export const useHolidays = () => {
  const { settings } = useApp()

  const holidays = useMemo(() => {
    const excludeDatesStr = settings['appointment.default_exclude_dates'] || ''
    if (!excludeDatesStr.trim()) {
      return []
    }

    // Parse dates from string like "2025-12-31, 2026-01-01"
    return excludeDatesStr
      .split(',')
      .map((dateStr: string) => dateStr.trim())
      .filter((dateStr: string) => dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr))
      .map((dateStr: string, index: number) => ({
        id: `holiday-${index + 1}`,
        date: new Date(dateStr),
        name: dateStr,
        isFixed: true,
      }))
  }, [settings])

  return { holidays, loading: false }
}

/**
 * Hook to update class group
 */
export const useUpdateClassGroup = () => {
  const [updateMutation, { loading }] = useMutation<hasura.UpdateClassGroup, hasura.UpdateClassGroupVariables>(
    UPDATE_CLASS_GROUP,
  )

  const updateClassGroup = useCallback(
    async (id: string, updates: Partial<ClassGroup>): Promise<ClassGroup | undefined> => {
      const setInput: Record<string, any> = {}

      if (updates.name !== undefined) setInput.name = updates.name
      if (updates.campusId !== undefined) setInput.campus_id = updates.campusId
      if (updates.language !== undefined) setInput.language = updates.language
      if (updates.minStudents !== undefined) setInput.min_students = updates.minStudents
      if (updates.maxStudents !== undefined) setInput.max_students = updates.maxStudents
      if (updates.materials !== undefined) setInput.materials = updates.materials
      if (updates.status !== undefined) setInput.status = updates.status
      setInput.updated_at = new Date().toISOString()

      const { data } = await updateMutation({
        variables: { id, set: setInput },
      })

      if (data?.update_class_group_by_pk) {
        return transformClassGroupData(data.update_class_group_by_pk)
      }
      return undefined
    },
    [updateMutation],
  )

  return { updateClassGroup, loading }
}

/**
 * Hook to create class group
 */
export const useCreateClassGroup = () => {
  const { id: appId } = useApp()

  const [insertMutation, { loading }] = useMutation<hasura.InsertClassGroup, hasura.InsertClassGroupVariables>(
    INSERT_CLASS_GROUP,
  )

  const createClassGroup = useCallback(
    async (group: Omit<ClassGroup, 'id' | 'createdAt' | 'updatedAt' | 'appId'>): Promise<ClassGroup> => {
      const { data } = await insertMutation({
        variables: {
          object: {
            app_id: appId,
            name: group.name,
            type: group.type,
            campus_id: group.campusId,
            language: group.language,
            min_students: group.minStudents,
            max_students: group.maxStudents,
            materials: group.materials || [],
            status: group.status || 'draft',
          },
        },
        refetchQueries: [GET_CLASS_GROUPS_FOR_SCHEDULE],
      })

      if (!data?.insert_class_group_one) {
        throw new Error('Failed to create class group')
      }

      return transformClassGroupData(data.insert_class_group_one)
    },
    [insertMutation, appId],
  )

  return { createClassGroup, loading }
}

/**
 * Hook to delete (soft delete) a class group
 */
export const useDeleteClassGroup = () => {
  const [deleteMutation, { loading }] = useMutation<hasura.DeleteClassGroup, hasura.DeleteClassGroupVariables>(
    DELETE_CLASS_GROUP,
  )

  const deleteClassGroup = useCallback(
    async (id: string): Promise<boolean> => {
      const { data } = await deleteMutation({
        variables: { id },
        refetchQueries: [GET_CLASS_GROUPS_FOR_SCHEDULE],
      })

      return !!data?.update_class_group_by_pk?.deleted_at
    },
    [deleteMutation],
  )

  return { deleteClassGroup, loading }
}

/**
 * Hook to get orders by their IDs (for orders already in a class group)
 */
export const useOrdersByIds = (orderIds: string[]) => {
  const { data, loading, error, refetch } = useQuery<hasura.GetOrdersByIds, hasura.GetOrdersByIdsVariables>(
    GET_ORDERS_BY_IDS,
    {
      variables: { orderIds },
      skip: orderIds.length === 0,
      fetchPolicy: 'cache-and-network',
    },
  )

  const orders = useMemo(() => {
    return data?.order_log || []
  }, [data])

  return { orders, loading, error, refetch }
}

/**
 * Hook to get available orders for a class group (not yet assigned)
 * @param classType - 'semester' maps to '學期班', 'group' maps to '團體班'
 * @param excludeOrderIds - Order IDs to exclude (already in this class group)
 */
export const useAvailableOrdersForClass = (
  classType: 'semester' | 'group',
  language: string,
  excludeOrderIds: string[] = [],
) => {
  const { id: appId } = useApp()

  // Map class type to Chinese label used in order_product.options
  // 學期班 searches for 團體班 orders, 小組班 searches for 小組班 orders
  const classTypeLabel = classType === 'semester' ? '團體班' : '小組班'

  // First get all assigned order IDs
  const { data: assignedData } = useQuery<
    hasura.GetAssignedOrderIds,
    hasura.GetAssignedOrderIdsVariables
  >(GET_ASSIGNED_ORDER_IDS, {
    fetchPolicy: 'cache-and-network',
  })

  // Combine excluded IDs with already assigned IDs
  const allExcludedIds = useMemo(() => {
    const assignedIds = assignedData?.class_group_order?.map(o => o.order_id) || []
    const combined = [...excludeOrderIds, ...assignedIds]
    return combined.filter((value, index, self) => self.indexOf(value) === index)
  }, [assignedData, excludeOrderIds])

  const { data, loading, error, refetch } = useQuery<
    hasura.GetAvailableOrdersForClass,
    hasura.GetAvailableOrdersForClassVariables
  >(GET_AVAILABLE_ORDERS_FOR_CLASS, {
    variables: {
      appId,
      classType: classTypeLabel,
      language: language || '',
      excludeOrderIds: allExcludedIds.length > 0 ? allExcludedIds : [''],
    },
    skip: !appId || !language,
    fetchPolicy: 'cache-and-network',
  })

  const orders = useMemo(() => {
    return data?.order_log || []
  }, [data])

  return { orders, loading, error, refetch }
}

/**
 * Hook to add an order to a class group
 */
export const useAddOrderToClassGroup = () => {
  const [insertMutation, { loading }] = useMutation<
    hasura.InsertClassGroupOrder,
    hasura.InsertClassGroupOrderVariables
  >(INSERT_CLASS_GROUP_ORDER)

  const addOrderToClassGroup = useCallback(
    async (classGroupId: string, orderId: string): Promise<boolean> => {
      try {
        const { data } = await insertMutation({
          variables: {
            object: {
              class_group_id: classGroupId,
              order_id: orderId,
            },
          },
          refetchQueries: [GET_CLASS_GROUPS_FOR_SCHEDULE, GET_ASSIGNED_ORDER_IDS],
        })
        return !!data?.insert_class_group_order_one
      } catch (error) {
        console.error('Failed to add order to class group:', error)
        return false
      }
    },
    [insertMutation],
  )

  return { addOrderToClassGroup, loading }
}

/**
 * Hook to remove an order from a class group
 */
export const useRemoveOrderFromClassGroup = () => {
  const [deleteMutation, { loading }] = useMutation<
    hasura.DeleteClassGroupOrder,
    hasura.DeleteClassGroupOrderVariables
  >(DELETE_CLASS_GROUP_ORDER)

  const removeOrderFromClassGroup = useCallback(
    async (classGroupId: string, orderId: string): Promise<boolean> => {
      try {
        const { data } = await deleteMutation({
          variables: {
            classGroupId,
            orderId,
          },
          refetchQueries: [GET_CLASS_GROUPS_FOR_SCHEDULE, GET_ASSIGNED_ORDER_IDS],
        })
        return (data?.delete_class_group_order?.affected_rows || 0) > 0
      } catch (error) {
        console.error('Failed to remove order from class group:', error)
        return false
      }
    },
    [deleteMutation],
  )

  return { removeOrderFromClassGroup, loading }
}

// =============================================================================
// Teacher Open Time Events Hook
// =============================================================================

/**
 * Teacher open time event for calendar display
 */
export interface TeacherOpenTimeEvent {
  id: string
  teacherId: string
  start: Date
  end: Date
  title: string
  backgroundColor: string
  borderColor: string
  display: 'background'
  rrule?: string
  duration?: number
  extendedProps: {
    role: string
    teacherIndex: number
    originalEvent: GeneralEventApi
  }
}

/**
 * Teacher busy event for conflict checks (non-available time)
 */
export interface TeacherBusyEvent {
  id: string
  teacherId: string
  start: Date
  end: Date
  rrule?: string
  duration?: number
  extendedProps: {
    role: string
    originalEvent: GeneralEventApi
  }
}

/**
 * Hook to get teacher open time events for calendar display
 * Uses the same data source as MemberOpenTimeScheduleBlock
 * @param teacherIds - Array of teacher member IDs
 * @param startDate - Start date for fetching events
 * @param endDate - End date for fetching events
 */
export const useTeacherOpenTimeEvents = (teacherIds: string[], startDate?: Date, endDate?: Date) => {
  const { authToken } = useAuth()
  const [events, setEvents] = useState<TeacherOpenTimeEvent[]>([])
  const [busyEvents, setBusyEvents] = useState<TeacherBusyEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Stabilize teacherIds using JSON serialization to prevent unnecessary re-renders
  const teacherIdsKey = useMemo(() => {
    const filtered = teacherIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
    return JSON.stringify(filtered.sort())
  }, [teacherIds])

  // Parse back the stable teacher IDs
  const validTeacherIds = useMemo(() => {
    try {
      return JSON.parse(teacherIdsKey) as string[]
    } catch {
      return []
    }
  }, [teacherIdsKey])

  // Stabilize date values using timestamps - use stable default timestamps
  const startTimestamp = useMemo(() => {
    if (startDate) {
      return startDate.getTime()
    }
    // Use a stable default: start of today minus 1 year
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.getTime() - 365 * 24 * 60 * 60 * 1000
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate?.getTime()])

  const endTimestamp = useMemo(() => {
    if (endDate) {
      return endDate.getTime()
    }
    // Use a stable default: start of today plus 1 year
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.getTime() + 365 * 24 * 60 * 60 * 1000
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate?.getTime()])

  useEffect(() => {
    const fetchTeacherOpenTimeEvents = async () => {
      if (!authToken || validTeacherIds.length === 0) {
        setEvents(prev => (prev.length === 0 ? prev : []))
        setBusyEvents(prev => (prev.length === 0 ? prev : []))
        return
      }

      setLoading(true)
      setError(null)

      // Create Date objects from stable timestamps inside the effect
      const fetchStartDate = new Date(startTimestamp)
      const fetchEndDate = new Date(endTimestamp)

      try {
        const allEvents: TeacherOpenTimeEvent[] = []
        const allBusyEvents: TeacherBusyEvent[] = []
        const colorSets = [
          { light: '#bfdbfe', medium: '#93c5fd', dark: '#3b82f6' }, // Blue - teacher1
          { light: '#fbcfe8', medium: '#f9a8d4', dark: '#ec4899' }, // Pink - teacher2
          { light: '#e9d5ff', medium: '#d8b4fe', dark: '#a855f7' }, // Purple - teacher3
        ]

        // Fetch events for each teacher
        for (let i = 0; i < validTeacherIds.length; i++) {
          const teacherId = validTeacherIds[i]
          const colorSet = colorSets[i % colorSets.length]

          try {
            const fetchedData = await getDefaultResourceEventsFethcer(authToken)(
              { type: 'member', targets: [teacherId] },
              {
                startedAt: fetchStartDate,
                until: fetchEndDate,
              },
            )

            if (fetchedData?.resourceEvents) {
              // Filter for active events
              const activeEvents = getActiveEvents(fetchedData.resourceEvents as GeneralEventApi[])
              const availableEvents = getAvailableEvents(activeEvents)
              const nonAvailableEvents = activeEvents.filter(event => event.extendedProps?.role !== 'available')

              // Convert to TeacherOpenTimeEvent format
              availableEvents.forEach(event => {
                const eventData: TeacherOpenTimeEvent = {
                  id: `${teacherId}-${event.extendedProps?.event_id || event.id || Math.random()}`,
                  teacherId,
                  start: new Date(event.start),
                  end: new Date(event.end),
                  title: '',
                  backgroundColor: colorSet.light, // Use light color for open time
                  borderColor: colorSet.light,
                  display: 'background',
                  extendedProps: {
                    role: 'available',
                    teacherIndex: i,
                    originalEvent: event,
                  },
                }

                // Add rrule and duration if present (for recurring events)
                if ((event as any).rrule) {
                  eventData.rrule = (event as any).rrule
                }
                if ((event as any).duration) {
                  eventData.duration = (event as any).duration
                }

                allEvents.push(eventData)
              })

              // Convert non-available events for conflict checks
              nonAvailableEvents.forEach(event => {
                const busyEvent: TeacherBusyEvent = {
                  id: `${teacherId}-busy-${event.extendedProps?.event_id || event.id || Math.random()}`,
                  teacherId,
                  start: new Date(event.start),
                  end: new Date(event.end),
                  extendedProps: {
                    role: event.extendedProps?.role || '',
                    originalEvent: event,
                  },
                }

                if ((event as any).rrule) {
                  busyEvent.rrule = (event as any).rrule
                }
                if ((event as any).duration) {
                  busyEvent.duration = (event as any).duration
                }

                allBusyEvents.push(busyEvent)
              })
            }
          } catch (err) {
            console.error(`Failed to fetch open time events for teacher ${teacherId}:`, err)
          }
        }

        setEvents(allEvents)
        setBusyEvents(allBusyEvents)
      } catch (err) {
        console.error('Error fetching teacher open time events:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherOpenTimeEvents()
  }, [authToken, validTeacherIds, startTimestamp, endTimestamp])

  const refetch = useCallback(() => {
    // Trigger re-fetch by updating teacherIds dependency
    setEvents([])
    setBusyEvents([])
    setLoading(true)
  }, [])

  return { events, busyEvents, loading, error, refetch }
}

// =============================================================================
// Student Open Time Events Hook
// =============================================================================

/**
 * Student event status colors - 根據 PRD 規格
 * 開放時間 (Open): #fed7aa
 * 固定課表 (Template): #a8a29e
 * 已預排 (Scheduled): #fdba74
 * 已發布 (Published): #f97316
 * 待處理 (Pending): #64748B
 * 外課：色塊顯示「外」標記
 */
export const STUDENT_EVENT_COLORS = {
  open: '#fed7aa', // 開放時間
  template: '#a8a29e', // 固定課表
  scheduled: '#fdba74', // 已預排
  published: '#f97316', // 已發布
  pending: '#64748B', // 待處理
}

/**
 * Student open time event type for calendar display
 */
export type StudentEventStatus = 'open' | 'template' | 'scheduled' | 'published' | 'pending'

export interface StudentOpenTimeEvent {
  id: string
  studentId: string
  start: Date
  end: Date
  title: string
  backgroundColor: string
  borderColor: string
  display: 'background'
  rrule?: string
  duration?: number
  extendedProps: {
    role: string
    status: StudentEventStatus
    isExternal?: boolean
    originalEvent: GeneralEventApi
  }
}

/**
 * Hook to get student open time events for calendar display
 * Uses the same data source as MemberOpenTimeScheduleBlock
 * @param studentId - Student member ID
 * @param startDate - Start date for fetching events
 * @param endDate - End date for fetching events
 */
export const useStudentOpenTimeEvents = (studentId: string | undefined, startDate?: Date, endDate?: Date) => {
  const { authToken } = useAuth()
  const [events, setEvents] = useState<StudentOpenTimeEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refetchCounter, setRefetchCounter] = useState(0)

  // Default date range: 1 year before and after current date
  const defaultStartDate = useMemo(() => {
    return startDate || moment().subtract(1, 'year').startOf('day').toDate()
  }, [startDate])

  const defaultEndDate = useMemo(() => {
    return endDate || moment().add(1, 'year').startOf('day').toDate()
  }, [endDate])

  useEffect(() => {
    const fetchStudentOpenTimeEvents = async () => {
      if (!authToken || !studentId) {
        setEvents([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const fetchedData = await getDefaultResourceEventsFethcer(authToken)(
          { type: 'member', targets: [studentId] },
          {
            startedAt: defaultStartDate,
            until: defaultEndDate,
          },
        )

        if (fetchedData?.resourceEvents) {
          // Filter for active events (not deleted)
          const activeEvents = getActiveEvents(fetchedData.resourceEvents as GeneralEventApi[])

          // Convert to StudentOpenTimeEvent format
          const studentEvents: StudentOpenTimeEvent[] = activeEvents.map(event => {
            const role = event.extendedProps?.role as string
            const publishedAt = event.extendedProps?.published_at as string | null
            const eventMetadata = event.extendedProps?.event_metadata as Record<string, any> | undefined

            // 外課判斷：從 metadata 中的 classMode 或 is_external 欄位判斷
            const isExternal =
              eventMetadata?.classMode === '外課' ||
              eventMetadata?.is_external === true ||
              event.extendedProps?.is_external === true

            // Determine status based on role and published_at
            // 狀態判斷邏輯：
            // 1. role === 'available' → 開放時間 (Open)
            // 2. metadata 中有 template 標記 → 固定課表 (Template)
            // 3. published_at 有值 → 已發布 (Published)
            // 4. published_at 為空但事件存在於 API → 已預排 (Scheduled)
            // 5. 其他情況 → 待處理 (Pending)
            let status: StudentEventStatus = 'open'
            let backgroundColor = STUDENT_EVENT_COLORS.open

            if (role === 'available') {
              // 開放時間：role 為 available
              status = 'open'
              backgroundColor = STUDENT_EVENT_COLORS.open
            } else if (eventMetadata?.isTemplate === true || eventMetadata?.scheduleType === 'template') {
              // 固定課表：metadata 中標記為 template
              status = 'template'
              backgroundColor = STUDENT_EVENT_COLORS.template
            } else if (publishedAt) {
              // 已發布：有 published_at 時間
              status = 'published'
              backgroundColor = STUDENT_EVENT_COLORS.published
            } else if (event.extendedProps?.event_id) {
              // 已預排：有 event_id（在 API 中）但沒有 published_at
              status = 'scheduled'
              backgroundColor = STUDENT_EVENT_COLORS.scheduled
            } else {
              // 待處理：其他情況
              status = 'pending'
              backgroundColor = STUDENT_EVENT_COLORS.pending
            }

            const eventData: StudentOpenTimeEvent = {
              id: `student-${event.extendedProps?.event_id || event.id || Math.random()}`,
              studentId,
              start: new Date(event.start),
              end: new Date(event.end),
              title: isExternal ? '外' : '',
              backgroundColor,
              borderColor: backgroundColor,
              display: 'background' as const,
              extendedProps: {
                role,
                status,
                isExternal,
                originalEvent: event,
              },
            }

            // Add rrule and duration if present (for recurring events)
            if ((event as any).rrule) {
              eventData.rrule = (event as any).rrule
            }
            if ((event as any).duration) {
              eventData.duration = (event as any).duration
            }

            return eventData
          })

          setEvents(studentEvents)
        } else {
          setEvents([])
        }
      } catch (err) {
        console.error('Error fetching student open time events:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudentOpenTimeEvents()
  }, [authToken, studentId, defaultStartDate, defaultEndDate, refetchCounter])

  const refetch = useCallback(() => {
    setRefetchCounter(prev => prev + 1)
  }, [])

  return { events, loading, error, refetch }
}

// =============================================================================
// Personal Schedule List Events Hook (for list view with real API data)
// =============================================================================

export interface PersonalScheduleListEvent extends ScheduleEvent {
  studentName?: string
  studentEmail?: string
  teacherName?: string
  teacherEmail?: string
}

// GraphQL query to get personal schedule events directly from event table
const GET_PERSONAL_SCHEDULE_EVENTS = gql`
  query GetPersonalScheduleEvents(
    $appId: String!
    $startDate: timestamptz!
    $endDate: timestamptz!
    $scheduleTypeFilter: jsonb!
  ) {
    event(
      where: {
        app_id: { _eq: $appId }
        deleted_at: { _is_null: true }
        started_at: { _gte: $startDate, _lte: $endDate }
        metadata: { _contains: $scheduleTypeFilter }
      }
      order_by: { started_at: desc }
    ) {
      id
      title
      description
      started_at
      ended_at
      metadata
      published_at
      created_at
      updated_at
    }
  }
`

// Query to get member names for student/teacher IDs
const GET_MEMBERS_BY_IDS = gql`
  query GetMembersByIds($memberIds: [String!]!) {
    member(where: { id: { _in: $memberIds } }) {
      id
      name
      email
    }
  }
`

/**
 * Hook to get all personal schedule events for list view
 * Fetches real events from GraphQL event table filtered by scheduleType === 'personal'
 */
export const usePersonalScheduleListEvents = (status?: 'published' | 'pre-scheduled' | 'all') => {
  const { id: appId } = useApp()
  // Default date range: 1 year before and after current date
  const startDate = useMemo(() => {
    return moment().subtract(1, 'year').startOf('day').toISOString()
  }, [])

  const endDate = useMemo(() => {
    return moment().add(1, 'year').endOf('day').toISOString()
  }, [])

  const isUuid = useCallback((value?: string | null) => {
    if (!value) return false
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      value,
    )
  }, [])

  // Query events from GraphQL
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    refetch,
  } = useQuery<hasura.GetPersonalScheduleEvents, hasura.GetPersonalScheduleEventsVariables>(
    GET_PERSONAL_SCHEDULE_EVENTS,
    {
      variables: {
        appId,
        startDate,
        endDate,
        scheduleTypeFilter: { scheduleType: 'personal' },
      },
      skip: !appId,
      fetchPolicy: 'network-only',
    },
  )

  // Extract unique member IDs from events
  const memberIds = useMemo(() => {
    if (!eventsData?.event) return []
    const ids = new Set<string>()
    eventsData.event.forEach(event => {
      const metadata = event.metadata
      if (metadata?.studentId) ids.add(metadata.studentId)
      if (metadata?.teacherId) ids.add(metadata.teacherId)
      if (metadata?.createdBy) ids.add(metadata.createdBy)
      if (metadata?.updatedBy) ids.add(metadata.updatedBy)
    })
    return Array.from(ids)
  }, [eventsData])

  // Query member names
  const { data: membersData } = useQuery<hasura.GetMembersByIds, hasura.GetMembersByIdsVariables>(
    GET_MEMBERS_BY_IDS,
    {
      variables: { memberIds },
      skip: memberIds.length === 0,
    },
  )

  // Build member map for quick lookup
  const memberMap = useMemo(() => {
    const map = new Map<string, { name: string; email: string }>()
    membersData?.member?.forEach(member => {
      map.set(member.id, { name: member.name, email: member.email })
    })
    return map
  }, [membersData])

  // Transform events to PersonalScheduleListEvent format
  const events = useMemo<PersonalScheduleListEvent[]>(() => {
    if (!eventsData?.event) return []

    console.log('[usePersonalScheduleListEvents] Raw events from GraphQL:', eventsData.event.length)

    return eventsData.event
      .filter(event => {
        // Filter by status if specified
        if (status === 'all' || !status) return true
        if (status === 'published') return !!event.published_at
        if (status === 'pre-scheduled') return !event.published_at
        return true
      })
      .map(event => {
        const metadata = event.metadata || {}
        const publishedAt = event.published_at

        // Determine status
        let eventStatus: 'pending' | 'pre-scheduled' | 'published' = 'pending'
        if (publishedAt) {
          eventStatus = 'published'
        } else {
          eventStatus = 'pre-scheduled'
        }

        // Get member info
        const studentInfo = metadata.studentId ? memberMap.get(metadata.studentId) : undefined
        const teacherInfo = metadata.teacherId ? memberMap.get(metadata.teacherId) : undefined
        const createdByInfo = metadata.createdBy ? memberMap.get(metadata.createdBy) : undefined
        const updatedByInfo = metadata.updatedBy ? memberMap.get(metadata.updatedBy) : undefined
        const createdByRaw = metadata.createdBy as string | undefined
        const updatedByRaw = metadata.updatedBy as string | undefined
        const createdByRawName = createdByRaw && !isUuid(createdByRaw) ? createdByRaw : ''
        const updatedByRawName = updatedByRaw && !isUuid(updatedByRaw) ? updatedByRaw : ''

        const eventData: PersonalScheduleListEvent = {
          id: event.id,
          apiEventId: event.id,
          scheduleType: 'personal',
          status: eventStatus,
          studentId: metadata.studentId as string | undefined,
          studentName: studentInfo?.name,
          studentEmail: studentInfo?.email,
          orderIds: (metadata.orderIds as string[]) || [],
          teacherId: metadata.teacherId as string | undefined,
          teacherName: teacherInfo?.name,
          teacherEmail: teacherInfo?.email,
          campus: (metadata.campus as string) || '',
          language: (metadata.language as Language) || 'zh-TW',
          date: new Date(event.started_at),
          startTime: moment(event.started_at).format('HH:mm'),
          endTime: moment(event.ended_at).format('HH:mm'),
          duration:
            (metadata.duration as number) ||
            Math.round((new Date(event.ended_at).getTime() - new Date(event.started_at).getTime()) / (1000 * 60)),
          material: (metadata.material as string) || event.title || '',
          needsOnlineRoom: (metadata.needsOnlineRoom as boolean) || false,
          createdBy:
            createdByInfo?.name ||
            updatedByInfo?.name ||
            (metadata.createdByName as string) ||
            (metadata.updatedByName as string) ||
            createdByRawName ||
            updatedByRawName ||
            '',
          createdByEmail:
            createdByInfo?.email ||
            updatedByInfo?.email ||
            (metadata.createdByEmail as string) ||
            (metadata.updatedByEmail as string) ||
            '',
          updatedAt: new Date(event.updated_at),
          isExternal: metadata.classMode === '外課' || metadata.is_external === true,
        }

        return eventData
      })
  }, [eventsData, status, memberMap, isUuid])

  console.log('[usePersonalScheduleListEvents] Final events count:', events.length)

  return {
    events,
    loading: eventsLoading,
    error: eventsError ? new Error(eventsError.message) : null,
    refetch,
  }
}

// =============================================================================
// Schedule Expiry Settings Hook
// =============================================================================

const GET_SCHEDULE_VALIDITY_RULES_FOR_SCHEDULE = gql`
  query GET_SCHEDULE_VALIDITY_RULES_FOR_SCHEDULE {
    schedule_validity_rule(where: { status: { _eq: "active" }, deleted_at: { _is_null: true } }, order_by: { class_count: asc }) {
      id
      type
      language
      class_count
      valid_days
      status
    }
  }
`

/**
 * Hook to get schedule expiry settings and calculate expiry dates for orders
 */
export const useScheduleExpirySettings = (scheduleType: ScheduleType = 'personal') => {
  const { data, loading, error } = useQuery<
    hasura.GET_SCHEDULE_VALIDITY_RULES_FOR_SCHEDULE,
    hasura.GET_SCHEDULE_VALIDITY_RULES_FOR_SCHEDULEVariables
  >(GET_SCHEDULE_VALIDITY_RULES_FOR_SCHEDULE)

  // Map type to DB value
  const dbType = scheduleType === 'personal' ? 'individual' : scheduleType === 'group' ? 'group' : 'individual'

  // Get settings filtered by type
  const settings = useMemo(() => {
    if (!data?.schedule_validity_rule) return []
    return data.schedule_validity_rule.filter(s => s.type === dbType)
  }, [data, dbType])

  // Function to calculate expiry date for an order based on language and class count
  const calculateExpiryDate = useCallback(
    (language: string, classCount: number, startDate: Date): Date | null => {
      // Find matching setting: same language and class_count >= order's class count
      const matchingSetting = settings
        .filter(s => s.language === language && s.class_count <= classCount)
        .sort((a, b) => b.class_count - a.class_count)[0] // Get the highest matching class_count

      if (!matchingSetting) return null

      // valid_days is in days
      const expiryDate = moment(startDate).add(matchingSetting.valid_days, 'days').toDate()
      return expiryDate
    },
    [settings],
  )

  // Function to get the max expiry date for a language (using the highest class_count rule)
  const getMaxExpiryDateForLanguage = useCallback(
    (language: string, startDate: Date): Date | null => {
      const languageSettings = settings.filter(s => s.language === language)
      if (languageSettings.length === 0) return null

      // Get the setting with the highest valid_days for this language
      const maxSetting = languageSettings.reduce(
        (max, s) => (s.valid_days > max.valid_days ? s : max),
        languageSettings[0],
      )

      return moment(startDate).add(maxSetting.valid_days, 'days').toDate()
    },
    [settings],
  )

  return {
    settings,
    loading,
    error,
    calculateExpiryDate,
    getMaxExpiryDateForLanguage,
  }
}

// =============================================================================
// Publish Events Mutation
// =============================================================================

// =============================================================================
// Class Group Events Hook (for semester/group class schedules)
// =============================================================================

// GraphQL query to get events for a class group by classId in metadata
const GET_CLASS_GROUP_EVENTS = gql`
  query GetClassGroupEvents($classId: String!) {
    event(
      where: { deleted_at: { _is_null: true }, metadata: { _contains: { classId: $classId } } }
      order_by: { started_at: asc }
    ) {
      id
      title
      description
      started_at
      ended_at
      metadata
      published_at
      created_at
      updated_at
    }
  }
`

/**
 * Hook to get events for a specific class group (semester/group class)
 * Fetches events from GraphQL where metadata.classId matches the provided classId
 * @param classId - The class group ID to fetch events for
 */
export const useClassGroupEvents = (classId: string | undefined) => {
  const { data, loading, error, refetch } = useQuery<hasura.GetClassGroupEvents, hasura.GetClassGroupEventsVariables>(
    GET_CLASS_GROUP_EVENTS,
    {
      variables: { classId: classId || '' },
      skip: !classId,
      fetchPolicy: 'cache-and-network',
    },
  )

  const events = useMemo<ScheduleEvent[]>(() => {
    if (!data?.event || !classId) return []

    return data.event.map(event => {
      const metadata = event.metadata || {}
      const publishedAt = event.published_at

      // Determine status based on published_at
      let status: 'pending' | 'pre-scheduled' | 'published' = 'pre-scheduled'
      if (publishedAt) {
        status = 'published'
      }

      const startDate = new Date(event.started_at)
      const endDate = new Date(event.ended_at)

      return {
        id: event.id,
        apiEventId: event.id,
        scheduleType: (metadata.scheduleType as 'personal' | 'semester' | 'group') || 'semester',
        status,
        classId,
        studentIds: (metadata.studentIds as string[]) || [],
        orderIds: (metadata.orderIds as string[]) || [],
        teacherId: metadata.teacherId as string | undefined,
        campus: (metadata.campus as string) || '',
        language: (metadata.language as Language) || 'zh-TW',
        date: startDate,
        startTime: moment(startDate).format('HH:mm'),
        endTime: moment(endDate).format('HH:mm'),
        duration: (metadata.duration as number) || Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
        material: (metadata.material as string) || event.title || '',
        needsOnlineRoom: (metadata.needsOnlineRoom as boolean) || false,
        createdBy: '',
        createdByEmail: '',
        updatedAt: new Date(event.updated_at),
        isExternal: metadata.classMode === '外課' || metadata.is_external === true,
      } as ScheduleEvent
    })
  }, [data, classId])

  return { events, loading, error, refetch }
}

const PUBLISH_EVENT = gql`
  mutation PublishEvent(
    $eventId: uuid!
    $publishedAt: timestamptz!
    $updatedAt: timestamptz!
    $metadata: jsonb
  ) {
    update_event_by_pk(
      pk_columns: { id: $eventId }
      _set: { published_at: $publishedAt, updated_at: $updatedAt }
      _append: { metadata: $metadata }
    ) {
      id
      published_at
      updated_at
      metadata
    }
  }
`

export const usePublishEvent = () => {
  const { currentMemberId, currentMember } = useAuth()
  const [publishEventMutation, { loading }] = useMutation<hasura.PublishEvent, hasura.PublishEventVariables>(
    PUBLISH_EVENT,
  )

  const publishEvent = useCallback(
    async (eventId: string, publishedAt: Date = new Date()) => {
      const now = new Date()
      const result = await publishEventMutation({
        variables: {
          eventId,
          publishedAt: publishedAt.toISOString(),
          updatedAt: now.toISOString(),
          metadata: {
            updatedBy: currentMemberId || '',
            updatedByEmail: currentMember?.email || '',
          },
        },
      })
      return result.data?.update_event_by_pk
    },
    [publishEventMutation, currentMemberId, currentMember],
  )

  const publishEvents = useCallback(
    async (eventIds: string[], publishedAt: Date = new Date()) => {
      const results = await Promise.all(eventIds.map(eventId => publishEvent(eventId, publishedAt)))
      return results
    },
    [publishEvent],
  )

  return { publishEvent, publishEvents, loading }
}

// =============================================================================
// Multiple Class Groups Events Hook (for semester/group list pages)
// =============================================================================

// GraphQL query to get all events for a schedule type (semester or group)
const GET_EVENTS_BY_SCHEDULE_TYPE = gql`
  query GetEventsByScheduleType($scheduleType: String!) {
    event(
      where: {
        deleted_at: { _is_null: true }
        metadata: { _contains: { scheduleType: $scheduleType } }
      }
      order_by: { updated_at: desc }
    ) {
      id
      title
      started_at
      ended_at
      metadata
      published_at
      created_at
      updated_at
    }
  }
`

export interface ClassGroupEventsSummary {
  classId: string
  latestEvent: {
    id: string
    teacherId?: string
    teacherName?: string
    teacherEmail?: string
    studentIds?: string[]
    createdBy?: string
    createdByEmail?: string
    updatedBy?: string
    updatedByEmail?: string
    updatedAt: Date
  } | null
  studentIds: string[]
  memberMap: Map<string, { name: string; email: string }>
  // Date range (earliest to latest)
  dateRange: {
    startDate: Date | null
    endDate: Date | null
  }
  // Time range (from events)
  timeRange: {
    startTime: string | null // HH:mm format in Taiwan timezone
    endTime: string | null // HH:mm format in Taiwan timezone
  }
  // Unique time slots across events (HH:mm format in Taiwan timezone)
  timeSlots: Array<{
    startTime: string
    endTime: string
  }>
}

/**
 * Hook to get events for multiple class groups by schedule type
 * Returns events grouped by classId with the latest teacher/student/creator info
 * @param scheduleType - 'semester' or 'group'
 * @param classIds - Array of class group IDs to filter (optional)
 */
export const useMultipleClassGroupsEvents = (
  scheduleType: 'semester' | 'group',
  classIds?: string[],
) => {
  const { data: eventsData, loading: eventsLoading, error: eventsError, refetch } = useQuery<
    hasura.GetEventsByScheduleType,
    hasura.GetEventsByScheduleTypeVariables
  >(GET_EVENTS_BY_SCHEDULE_TYPE, {
    variables: { scheduleType },
    fetchPolicy: 'cache-and-network',
  })

  // Collect all unique member IDs from events
  const memberIds = useMemo(() => {
    if (!eventsData?.event) return []
    const ids = new Set<string>()
    eventsData.event.forEach(event => {
      const metadata = event.metadata
      if (metadata?.teacherId) ids.add(metadata.teacherId)
      if (metadata?.studentIds) {
        (metadata.studentIds as string[]).forEach(id => ids.add(id))
      }
      if (metadata?.createdBy) ids.add(metadata.createdBy)
      if (metadata?.updatedBy) ids.add(metadata.updatedBy)
    })
    return Array.from(ids)
  }, [eventsData])

  // Query member names
  const { data: membersData, loading: membersLoading } = useQuery<hasura.GetMembersByIds, hasura.GetMembersByIdsVariables>(
    GET_MEMBERS_BY_IDS,
    {
      variables: { memberIds },
      skip: memberIds.length === 0,
    },
  )

  // Build member map for quick lookup
  const memberMap = useMemo(() => {
    const map = new Map<string, { name: string; email: string }>()
    membersData?.member?.forEach(member => {
      map.set(member.id, { name: member.name, email: member.email })
    })
    return map
  }, [membersData])

  // Group events by classId and get summary info
  const eventsByClassId = useMemo(() => {
    const map = new Map<string, ClassGroupEventsSummary>()

    if (!eventsData?.event) return map

    // Filter by classIds if provided
    const filteredEvents = classIds
      ? eventsData.event.filter(e => e.metadata?.classId && classIds.includes(e.metadata.classId))
      : eventsData.event

    // Group events by classId
    filteredEvents.forEach(event => {
      const classId = event.metadata?.classId as string
      if (!classId) return

      if (!map.has(classId)) {
        map.set(classId, {
          classId,
          latestEvent: null,
          studentIds: [],
          memberMap,
          dateRange: { startDate: null, endDate: null },
          timeRange: { startTime: null, endTime: null },
          timeSlots: [],
        })
      }

      const summary = map.get(classId)!

      // Collect all student IDs
      const eventStudentIds = (event.metadata?.studentIds as string[]) || []
      eventStudentIds.forEach(id => {
        if (!summary.studentIds.includes(id)) {
          summary.studentIds.push(id)
        }
      })

      // Update date range
      const eventDate = new Date(event.started_at)
      if (!summary.dateRange.startDate || eventDate < summary.dateRange.startDate) {
        summary.dateRange.startDate = eventDate
      }
      if (!summary.dateRange.endDate || eventDate > summary.dateRange.endDate) {
        summary.dateRange.endDate = eventDate
      }

      // Update time range (convert to Taiwan timezone HH:mm format)
      const startedAt = new Date(event.started_at)
      const endedAt = new Date(event.ended_at)
      const startTimeStr = startedAt.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei'
      })
      const endTimeStr = endedAt.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei'
      })

      // Collect unique time slots
      const hasSlot = summary.timeSlots.some(
        slot => slot.startTime === startTimeStr && slot.endTime === endTimeStr,
      )
      if (!hasSlot) {
        summary.timeSlots.push({ startTime: startTimeStr, endTime: endTimeStr })
      }

      // Set latest event info (events are already sorted by updated_at desc)
      if (!summary.latestEvent) {
        const teacherInfo = event.metadata?.teacherId ? memberMap.get(event.metadata.teacherId) : undefined
        summary.latestEvent = {
          id: event.id,
          teacherId: event.metadata?.teacherId,
          teacherName: teacherInfo?.name,
          teacherEmail: teacherInfo?.email,
          studentIds: eventStudentIds,
          createdBy: event.metadata?.createdBy,
          createdByEmail: event.metadata?.createdByEmail,
          updatedBy: event.metadata?.updatedBy,
          updatedByEmail: event.metadata?.updatedByEmail,
          updatedAt: new Date(event.updated_at),
        }
      }
    })

    // Finalize time slots (sort and derive timeRange)
    map.forEach(summary => {
      summary.timeSlots.sort((a, b) => {
        const aStart = parseInt(a.startTime.replace(':', ''), 10)
        const bStart = parseInt(b.startTime.replace(':', ''), 10)
        if (aStart !== bStart) return aStart - bStart
        const aEnd = parseInt(a.endTime.replace(':', ''), 10)
        const bEnd = parseInt(b.endTime.replace(':', ''), 10)
        return aEnd - bEnd
      })

      const firstSlot = summary.timeSlots[0]
      summary.timeRange.startTime = firstSlot?.startTime || null
      summary.timeRange.endTime = firstSlot?.endTime || null
    })

    return map
  }, [eventsData, classIds, memberMap])

  return {
    eventsByClassId,
    memberMap,
    loading: eventsLoading || membersLoading,
    error: eventsError,
    refetch,
  }
}

const GET_SCHEDULE_TEMPLATES = gql`
  query GetScheduleTemplates($appId: String!, $memberId: String!, $language: String) {
    schedule_template(
      where: {
        app_id: { _eq: $appId }
        member_id: { _eq: $memberId }
        language: { _eq: $language }
      }
      order_by: { updated_at: desc }
    ) {
      id
      app_id
      member_id
      name
      language
      rrule
      course_rows
      created_at
      updated_at
    }
  }
`

const INSERT_SCHEDULE_TEMPLATE = gql`
  mutation InsertScheduleTemplate(
    $memberId: String!
    $name: String!
    $language: String!
    $rrule: String
    $courseRows: jsonb!
  ) {
    insert_schedule_template_one(
      object: {
        member_id: $memberId
        name: $name
        language: $language
        rrule: $rrule
        course_rows: $courseRows
      }
    ) {
      id
      app_id
      member_id
      name
      language
      rrule
      course_rows
      created_at
      updated_at
    }
  }
`

const DELETE_SCHEDULE_TEMPLATE = gql`
  mutation DeleteScheduleTemplate($id: uuid!) {
    update_schedule_template_by_pk(
      pk_columns: { id: $id }
      _set: { deleted_at: "now()" }
    ) {
      id
    }
  }
`

/**
 * Hook to get schedule templates for the current user
 * @param language - Filter by language
 */
export const useScheduleTemplates = (language?: string) => {
  const { id: appId } = useApp()
  const { currentMemberId } = useAuth()

  const { data, loading, error, refetch } = useQuery<
    hasura.GetScheduleTemplates,
    hasura.GetScheduleTemplatesVariables
  >(GET_SCHEDULE_TEMPLATES, {
    variables: {
      appId,
      memberId: currentMemberId || '',
      language: language || undefined,
    },
    skip: !appId || !currentMemberId,
    fetchPolicy: 'cache-and-network',
  })

  const templates: ScheduleTemplateProps[] = useMemo(() => {
    if (!data?.schedule_template) return []
    return data.schedule_template.map(t => ({
      id: t.id,
      appId: t.app_id,
      memberId: t.member_id,
      name: t.name,
      language: t.language as Language,
      rrule: t.rrule || undefined,
      courseRows: (t.course_rows as CourseRowData[]) || [],
      createdAt: new Date(t.created_at),
      updatedAt: new Date(t.updated_at),
    }))
  }, [data])

  return {
    templates,
    loading,
    error,
    refetch,
  }
}

/**
 * Generate rrule from course rows based on weekdays
 */
const generateRruleFromRows = (rows: CourseRowData[]): string => {
  const weekdayToRruleByday: Record<number, string> = {
    0: 'SU',
    1: 'MO',
    2: 'TU',
    3: 'WE',
    4: 'TH',
    5: 'FR',
    6: 'SA',
    7: 'SU', // ISO weekday 7 = Sunday
  }

  const uniqueWeekdays = rows
    .map(r => r.weekday)
    .filter((value, index, self) => self.indexOf(value) === index)
  const bydayValues = uniqueWeekdays
    .map(w => weekdayToRruleByday[w % 7] || weekdayToRruleByday[w])
    .filter(Boolean)
    .join(',')

  return bydayValues ? `FREQ=WEEKLY;BYDAY=${bydayValues}` : ''
}

/**
 * Hook to save a new schedule template
 * Note: app_id is automatically set by Hasura via session variable (X-Hasura-App-Id)
 */
export const useSaveScheduleTemplate = () => {
  const { currentMemberId } = useAuth()
  const [insertTemplate, { loading, error }] = useMutation<
    hasura.InsertScheduleTemplate,
    hasura.InsertScheduleTemplateVariables
  >(INSERT_SCHEDULE_TEMPLATE)

  const saveTemplate = useCallback(
    async (name: string, language: string, courseRows: CourseRowData[], rrule?: string) => {
      if (!currentMemberId) {
        throw new Error('Missing member ID')
      }

      // Auto-generate rrule if not provided
      const finalRrule = rrule || generateRruleFromRows(courseRows)

      const result = await insertTemplate({
        variables: {
          memberId: currentMemberId,
          name,
          language,
          rrule: finalRrule || null,
          courseRows,
        },
      })

      return result.data?.insert_schedule_template_one
    },
    [currentMemberId, insertTemplate],
  )

  return {
    saveTemplate,
    loading,
    error,
  }
}

/**
 * Hook to delete a schedule template (soft delete)
 */
export const useDeleteScheduleTemplate = () => {
  const [deleteTemplate, { loading, error }] = useMutation<
    hasura.DeleteScheduleTemplate,
    hasura.DeleteScheduleTemplateVariables
  >(DELETE_SCHEDULE_TEMPLATE)

  const remove = useCallback(
    async (id: string) => {
      const result = await deleteTemplate({
        variables: { id },
      })

      return result.data?.update_schedule_template_by_pk
    },
    [deleteTemplate],
  )

  return {
    deleteTemplate: remove,
    loading,
    error,
  }
}

// =============================================================================
// Schedule Conflict Detection Utility
// =============================================================================

export interface ConflictCheckParams {
  date: Date
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  teacherId?: string
  classroomId?: string
  classroomIds?: string[]
  studentId?: string
  excludeEventId?: string
  excludeApiEventId?: string
}

export interface ConflictCheckResult {
  hasTeacherConflict: boolean
  hasRoomConflict: boolean
  hasStudentConflict: boolean
  conflictDetails: {
    teacherConflicts: Array<{ startTime: string; endTime: string; teacherName?: string }>
    roomConflicts: Array<{ startTime: string; endTime: string; roomName?: string }>
    studentConflicts: Array<{ startTime: string; endTime: string }>
  }
}

/**
 * 判斷事件是否與目標 ID 匹配
 * 同時比對 id 和 apiEventId，因為事件在不同階段可能用不同 ID 識別
 */
const isEventMatch = (event: ScheduleEvent, targetId?: string, targetApiEventId?: string): boolean => {
  if (!targetId && !targetApiEventId) return false

  const idsToExclude = [targetId, targetApiEventId].filter(Boolean)
  const eventIds = [event.id, event.apiEventId].filter(Boolean)

  return eventIds.some(id => idsToExclude.includes(id))
}

/**
 * Check for schedule conflicts with existing events
 *
 * @param params - The conflict check parameters
 * @param existingEvents - List of existing schedule events to check against
 * @param teachers - Optional list of teachers for name lookup
 * @param classrooms - Optional list of classrooms for name lookup
 * @returns ConflictCheckResult with conflict status and details
 */
export const checkScheduleConflict = (
  params: ConflictCheckParams,
  existingEvents: ScheduleEvent[],
  teachers?: Array<{ id: string; name: string }>,
  classrooms?: Array<{ id: string; name: string }>,
): ConflictCheckResult => {
  const { date, startTime, endTime, teacherId, classroomId, classroomIds, studentId, excludeEventId, excludeApiEventId } =
    params

  const dateStr = date.toISOString().split('T')[0]
  const relevantEvents = existingEvents.filter(e => {
    const eventDateStr = e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date).split('T')[0]
    return eventDateStr === dateStr && !isEventMatch(e, excludeEventId, excludeApiEventId)
  })

  const hasTimeOverlap = (event: ScheduleEvent): boolean => {
    const eventStart = parseInt(event.startTime.replace(':', ''))
    const eventEnd = parseInt(event.endTime.replace(':', ''))
    const newStart = parseInt(startTime.replace(':', ''))
    const newEnd = parseInt(endTime.replace(':', ''))
    return newStart < eventEnd && newEnd > eventStart
  }

  // Teacher conflicts
  const teacherConflictEvents = teacherId
    ? relevantEvents.filter(e => e.teacherId === teacherId && hasTimeOverlap(e))
    : []
  const hasTeacherConflict = teacherConflictEvents.length > 0

  // Room conflicts
  const targetClassroomIds = [...(classroomId ? [classroomId] : []), ...(classroomIds || [])].filter(Boolean)
  const roomConflictEvents =
    targetClassroomIds.length > 0
      ? relevantEvents.filter(e => {
          const eventClassroomIds = e.classroomIds || (e.classroomId ? [e.classroomId] : [])
          return eventClassroomIds.some(id => targetClassroomIds.includes(id)) && hasTimeOverlap(e)
        })
      : []
  const hasRoomConflict = roomConflictEvents.length > 0

  // Student conflicts
  const studentConflictEvents = studentId
    ? relevantEvents.filter(e => e.studentId === studentId && hasTimeOverlap(e))
    : []
  const hasStudentConflict = studentConflictEvents.length > 0

  // Build conflict details
  const conflictDetails = {
    teacherConflicts: teacherConflictEvents.map(e => ({
      startTime: e.startTime,
      endTime: e.endTime,
      teacherName: teachers?.find(t => t.id === e.teacherId)?.name,
    })),
    roomConflicts: roomConflictEvents.map(e => {
      const eventClassroomIds = e.classroomIds || (e.classroomId ? [e.classroomId] : [])
      const firstRoomId = eventClassroomIds[0]
      return {
        startTime: e.startTime,
        endTime: e.endTime,
        roomName: firstRoomId ? classrooms?.find(c => c.id === firstRoomId)?.name : undefined,
      }
    }),
    studentConflicts: studentConflictEvents.map(e => ({
      startTime: e.startTime,
      endTime: e.endTime,
    })),
  }

  return { hasTeacherConflict, hasRoomConflict, hasStudentConflict, conflictDetails }
}

// =============================================================================
// Export types for convenience
// =============================================================================

export type {
  ClassGroup,
  CourseRowData,
  Language,
  ScheduleEvent,
  ScheduleTemplateProps,
  ScheduleType,
}
