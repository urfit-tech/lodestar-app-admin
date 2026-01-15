/**
 * Schedule Management GraphQL Hooks
 *
 * This file contains GraphQL queries and mutations for the schedule management feature.
 * Currently using in-memory mock data from scheduleManagementStore.
 * Uncomment the GraphQL sections when backend is ready.
 */

import { gql, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { getDefaultResourceEventsFethcer } from '../helpers/eventHelper/eventFetchers'
import { getActiveEvents, getAvailableEvents } from '../components/event/eventAdaptor'
import { GeneralEventApi } from '../components/event/events.type'
import { scheduleStore, mockCampuses } from '../types/schedule'
import {
  Campus,
  ClassGroup,
  Classroom,
  Holiday,
  Language,
  Order,
  ScheduleCondition,
  ScheduleEvent,
  ScheduleTemplate,
  ScheduleType,
  Student,
  Teacher,
} from '../types/schedule'

// Local type definitions for GraphQL queries (until typegen is run)
interface GetMembersForScheduleData {
  member: Array<{
    id: string
    name: string | null
    email: string
  }>
}

interface GetMembersForScheduleVariables {
  searchTerm?: string
}

// Type definitions for order_log / order_products GraphQL queries
interface OrderProductOptions {
  id: string
  price: number
  title: string
  amount: number
  options: {
    product: string
    language: string
    class_mode: string
    class_type: string
    program_type: string
    location_type: string
    total_sessions: {
      max: number
      min: number
    }
    weekly_frequency: {
      max: number
      min: number
    }
  }
  quantity: number
  productId: string
  currencyId: string
  isContract: boolean
  totalPrice: number
  currencyPrice: number
}

interface OrderProductData {
  id: string
  name: string
  price: number
  options: OrderProductOptions
  started_at: string | null
  ended_at: string | null
}

interface OrderLogData {
  id: string
  status: string
  member_id: string
  created_at: string
  updated_at: string | null
  expired_at?: string | null
  options?: any
  order_products: OrderProductData[]
  member?: {
    id: string
    name: string
    email: string
    picture_url?: string | null
  }
}

interface MemberPublicData {
  id: string
  name: string
  username: string
  email: string
}

interface GetMemberOrdersData {
  member_public: MemberPublicData[]
  order_log: OrderLogData[]
}

interface GetMemberOrdersVariables {
  memberId: string
}

// =============================================================================
// GraphQL Queries (Commented - to be enabled when backend is ready)
// =============================================================================

/*
// Get schedule events with filters
export const GET_SCHEDULE_EVENTS = gql`
  query GetScheduleEvents(
    $scheduleType: String
    $status: String
    $startDate: date
    $endDate: date
    $campusId: uuid
    $teacherId: String
  ) {
    schedule_event(
      where: {
        schedule_type: { _eq: $scheduleType }
        status: { _eq: $status }
        scheduled_date: { _gte: $startDate, _lte: $endDate }
        campus_id: { _eq: $campusId }
        teacher_id: { _eq: $teacherId }
      }
      order_by: { scheduled_date: asc, start_time: asc }
    ) {
      id
      schedule_type
      status
      class_group_id
      student_id
      teacher_id
      classroom_id
      campus_id
      language
      scheduled_date
      start_time
      end_time
      duration
      material
      needs_online_room
      online_room_url
      is_external
      created_by
      created_by_email
      created_at
      updated_at
      schedule_event_students {
        student_id
        member {
          id
          name
          email
        }
      }
      schedule_event_orders {
        order_id
        deducted_minutes
      }
      teacher: member {
        id
        name
        email
      }
      classroom {
        id
        name
        capacity
      }
      campus {
        id
        name
      }
      class_group {
        id
        name
        type
      }
    }
  }
`

// Get teachers with filters
export const GET_TEACHERS = gql`
  query GetTeachers($language: String, $campusId: uuid) {
    teacher_profile(
      where: {
        teacher_languages: { language: { _eq: $language } }
        campus_id: { _eq: $campusId }
      }
      order_by: [{ campus_id: asc }, { level: desc }, { years_of_experience: desc }]
    ) {
      id
      member_id
      campus_id
      level
      years_of_experience
      note
      member {
        id
        name
        email
      }
      teacher_languages {
        language
      }
      teacher_traits {
        trait
      }
      teacher_availabilities {
        weekday
        start_time
        end_time
        is_recurring
        specific_date
      }
      campus {
        id
        name
      }
    }
  }
`

// Get students with filters
export const GET_STUDENTS = gql`
  query GetStudents($campusId: uuid, $searchTerm: String) {
    member(
      where: {
        _and: [
          { campus_id: { _eq: $campusId } }
          {
            _or: [
              { name: { _ilike: $searchTerm } }
              { email: { _ilike: $searchTerm } }
            ]
          }
        ]
      }
      order_by: { name: asc }
    ) {
      id
      name
      email
      campus_id
      internal_note
      student_teacher_preferences {
        teacher_id
        preference_type
      }
    }
  }
`

// Get orders by student
export const GET_ORDERS_BY_STUDENT = gql`
  query GetOrdersByStudent($studentId: String!, $scheduleType: String) {
    order_log(
      where: {
        member_id: { _eq: $studentId }
        schedule_type: { _eq: $scheduleType }
        available_minutes: { _gt: 0 }
        expires_at: { _gt: "now()" }
        status: { _eq: "completed" }
      }
      order_by: { created_at: desc }
    ) {
      id
      member_id
      product_name
      language
      schedule_type
      total_minutes
      used_minutes
      available_minutes
      created_at
      expires_at
      last_class_date
      status
      campus_id
    }
  }
`

// Get class groups
export const GET_CLASS_GROUPS = gql`
  query GetClassGroups($type: String, $campusId: uuid) {
    class_group(
      where: {
        type: { _eq: $type }
        campus_id: { _eq: $campusId }
        status: { _eq: "active" }
      }
      order_by: { name: asc }
    ) {
      id
      name
      type
      campus_id
      language
      min_students
      max_students
      status
      class_group_students {
        student_id
        member {
          id
          name
          email
        }
      }
      class_group_materials {
        id
        material_name
        sort_order
      }
      campus {
        id
        name
      }
    }
  }
`

// Get classrooms
export const GET_CLASSROOMS = gql`
  query GetClassrooms($campusId: uuid) {
    classroom(
      where: {
        campus_id: { _eq: $campusId }
        is_active: { _eq: true }
      }
      order_by: { name: asc }
    ) {
      id
      name
      campus_id
      capacity
    }
  }
`

// Get campuses
export const GET_CAMPUSES = gql`
  query GetCampuses {
    campus(where: { is_active: { _eq: true } }, order_by: { name: asc }) {
      id
      name
      address
    }
  }
`

// Get holidays
export const GET_HOLIDAYS = gql`
  query GetHolidays($startDate: date, $endDate: date) {
    holiday(
      where: {
        date: { _gte: $startDate, _lte: $endDate }
      }
      order_by: { date: asc }
    ) {
      id
      date
      name
      is_fixed
    }
  }
`

// Get schedule templates for a student
export const GET_SCHEDULE_TEMPLATES = gql`
  query GetScheduleTemplates($studentId: String!, $language: String) {
    schedule_template(
      where: {
        student_id: { _eq: $studentId }
        language: { _eq: $language }
      }
      order_by: { weekday: asc, start_time: asc }
    ) {
      id
      student_id
      language
      weekday
      start_time
      duration
      teacher_id
      classroom_id
      material
      needs_online_room
    }
  }
`
*/

// =============================================================================
// GraphQL Mutations (Commented - to be enabled when backend is ready)
// =============================================================================

/*
// Create schedule event
export const CREATE_SCHEDULE_EVENT = gql`
  mutation CreateScheduleEvent($input: schedule_event_insert_input!) {
    insert_schedule_event_one(object: $input) {
      id
      schedule_type
      status
      scheduled_date
      start_time
      end_time
    }
  }
`

// Update schedule event
export const UPDATE_SCHEDULE_EVENT = gql`
  mutation UpdateScheduleEvent($id: uuid!, $updates: schedule_event_set_input!) {
    update_schedule_event_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
      schedule_type
      status
      scheduled_date
      start_time
      end_time
      updated_at
    }
  }
`

// Delete schedule event
export const DELETE_SCHEDULE_EVENT = gql`
  mutation DeleteScheduleEvent($id: uuid!) {
    delete_schedule_event_by_pk(id: $id) {
      id
    }
  }
`

// Batch create schedule events
export const BATCH_CREATE_SCHEDULE_EVENTS = gql`
  mutation BatchCreateScheduleEvents($events: [schedule_event_insert_input!]!) {
    insert_schedule_event(objects: $events) {
      affected_rows
      returning {
        id
        schedule_type
        status
        scheduled_date
      }
    }
  }
`

// Update schedule event status
export const UPDATE_SCHEDULE_EVENT_STATUS = gql`
  mutation UpdateScheduleEventStatus($id: uuid!, $status: String!) {
    update_schedule_event_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status, updated_at: "now()" }
    ) {
      id
      status
      updated_at
    }
  }
`

// Batch update schedule event status
export const BATCH_UPDATE_SCHEDULE_EVENT_STATUS = gql`
  mutation BatchUpdateScheduleEventStatus($ids: [uuid!]!, $status: String!) {
    update_schedule_event(
      where: { id: { _in: $ids } }
      _set: { status: $status, updated_at: "now()" }
    ) {
      affected_rows
      returning {
        id
        status
      }
    }
  }
`

// Create class group
export const CREATE_CLASS_GROUP = gql`
  mutation CreateClassGroup($input: class_group_insert_input!) {
    insert_class_group_one(object: $input) {
      id
      name
      type
      campus_id
      language
      min_students
      max_students
    }
  }
`

// Update class group
export const UPDATE_CLASS_GROUP = gql`
  mutation UpdateClassGroup($id: uuid!, $updates: class_group_set_input!) {
    update_class_group_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
      name
      type
      min_students
      max_students
      updated_at
    }
  }
`

// Add student to class group
export const ADD_STUDENT_TO_CLASS_GROUP = gql`
  mutation AddStudentToClassGroup($classGroupId: uuid!, $studentId: String!) {
    insert_class_group_student_one(
      object: { class_group_id: $classGroupId, student_id: $studentId }
      on_conflict: { constraint: class_group_student_pkey, update_columns: [] }
    ) {
      id
      class_group_id
      student_id
    }
  }
`

// Remove student from class group
export const REMOVE_STUDENT_FROM_CLASS_GROUP = gql`
  mutation RemoveStudentFromClassGroup($classGroupId: uuid!, $studentId: String!) {
    delete_class_group_student(
      where: {
        class_group_id: { _eq: $classGroupId }
        student_id: { _eq: $studentId }
      }
    ) {
      affected_rows
    }
  }
`

// Save schedule template
export const SAVE_SCHEDULE_TEMPLATE = gql`
  mutation SaveScheduleTemplate($input: schedule_template_insert_input!) {
    insert_schedule_template_one(
      object: $input
      on_conflict: {
        constraint: schedule_template_student_id_language_weekday_key
        update_columns: [start_time, duration, teacher_id, classroom_id, material, needs_online_room]
      }
    ) {
      id
      student_id
      language
      weekday
      start_time
      duration
    }
  }
`

// Delete schedule template
export const DELETE_SCHEDULE_TEMPLATE = gql`
  mutation DeleteScheduleTemplate($id: uuid!) {
    delete_schedule_template_by_pk(id: $id) {
      id
    }
  }
`

// Check for conflicts
export const CHECK_SCHEDULE_CONFLICTS = gql`
  query CheckScheduleConflicts(
    $date: date!
    $startTime: time!
    $endTime: time!
    $teacherId: String
    $classroomId: uuid
    $excludeEventId: uuid
  ) {
    teacher_conflict: schedule_event(
      where: {
        scheduled_date: { _eq: $date }
        teacher_id: { _eq: $teacherId }
        id: { _neq: $excludeEventId }
        _or: [
          { start_time: { _lt: $endTime }, end_time: { _gt: $startTime } }
        ]
      }
    ) {
      id
      start_time
      end_time
    }
    classroom_conflict: schedule_event(
      where: {
        scheduled_date: { _eq: $date }
        classroom_id: { _eq: $classroomId }
        id: { _neq: $excludeEventId }
        _or: [
          { start_time: { _lt: $endTime }, end_time: { _gt: $startTime } }
        ]
      }
    ) {
      id
      start_time
      end_time
    }
  }
`
*/

// =============================================================================
// Custom Hooks (Using in-memory mock data)
// =============================================================================

/**
 * Hook to get schedule events
 */
export const useScheduleEvents = (type?: ScheduleType, status?: string) => {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => scheduleStore.getEvents(type, status))
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(() => {
    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setEvents(scheduleStore.getEvents(type, status))
      setLoading(false)
    }, 100)
  }, [type, status])

  return { events, loading, refetch }
}

/**
 * Hook to get teachers with filters
 */
export const useTeachers = (language?: Language, campus?: string) => {
  const teachers = useMemo(() => {
    return scheduleStore.getTeachers(language, campus)
  }, [language, campus])

  return { teachers, loading: false }
}

// =============================================================================
// Teacher Management from Members (Real Data)
// =============================================================================

// Type definitions for teacher queries
interface PermissionGroupData {
  permission_group: Array<{
    id: string
    name: string
  }>
}

interface MemberPermissionGroupItem {
  permission_group: {
    id: string
    name: string
  }
  member: {
    id: string
    name: string | null
    email: string
    picture_url: string | null
    star: number
    member_tags: Array<{ tag_name: string }>
    member_specialities: Array<{ tag_name: string }>
    member_properties: Array<{
      property: { id: string; name: string }
      value: string
    }>
  }
}

interface TeacherMemberData {
  member_permission_group?: MemberPermissionGroupItem[]
  filtered_member_permission_group?: MemberPermissionGroupItem[]
}

interface TeacherFromMember {
  id: string
  name: string
  email: string
  pictureUrl: string | null
  campus: string // permission_group name
  campusId: string // permission_group id
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

// GraphQL query to get teachers from members by permission group
// If permissionGroupIds is provided, filter by those IDs
// Otherwise, get all members from permission groups ending with "校"
export const GET_TEACHERS_FROM_MEMBERS = gql`
  query GetTeachersFromMembers($permissionGroupIds: [uuid!], $filterByIds: Boolean!) {
    member_permission_group(
      where: {
        _or: [
          { _and: [{ permission_group_id: { _in: $permissionGroupIds } }] }
          { _and: [{ permission_group: { name: { _like: "%校" } } }] }
        ]
      }
      order_by: { member: { name: asc } }
    ) @skip(if: $filterByIds) {
      permission_group {
        id
        name
      }
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
      }
    }
    filtered_member_permission_group: member_permission_group(
      where: { permission_group_id: { _in: $permissionGroupIds } }
      order_by: { member: { name: asc } }
    ) @include(if: $filterByIds) {
      permission_group {
        id
        name
      }
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
      }
    }
  }
`

/**
 * Hook to get permission groups (as campus options)
 */
export const usePermissionGroupsAsCampuses = () => {
  const { data, loading, error, refetch } = useQuery<PermissionGroupData>(GET_PERMISSION_GROUPS_FOR_SCHEDULE)

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
 * Hook to get teachers from members by permission groups
 * If permissionGroupIds is provided, filter by those IDs
 * Otherwise, get all members from permission groups ending with "校"
 * @param permissionGroupIds - Array of permission group IDs to filter teachers (optional)
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
  const hasFilter = Boolean(permissionGroupIds?.length)
  const hasLanguageFilter = Boolean(languageFilters?.length)

  // 如果要求有語言才查詢，且沒有語言，則跳過查詢
  const shouldSkip = requireLanguage && !hasLanguageFilter

  const { data, loading, error, refetch } = useQuery<TeacherMemberData>(GET_TEACHERS_FROM_MEMBERS, {
    variables: {
      permissionGroupIds: permissionGroupIds?.length ? permissionGroupIds : [],
      filterByIds: hasFilter,
    },
    skip: shouldSkip,
  })

  const teachers = useMemo<TeacherFromMember[]>(() => {
    // Get data from the appropriate field based on filterByIds
    const memberPermissionGroups = hasFilter ? data?.filtered_member_permission_group : data?.member_permission_group

    if (!memberPermissionGroups) return []

    // Create a map to deduplicate members (a member might be in multiple permission groups)
    const memberMap = new Map<string, TeacherFromMember>()

    memberPermissionGroups.forEach(mpg => {
      const member = mpg.member
      const memberId = member.id

      // If member already exists, merge the campus
      if (memberMap.has(memberId)) {
        const existing = memberMap.get(memberId)!
        // Optionally append campus if different
        if (!existing.campus.includes(mpg.permission_group.name)) {
          existing.campus += `, ${mpg.permission_group.name}`
        }
        return
      }

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
        pictureUrl: member.picture_url,
        campus: mpg.permission_group.name,
        campusId: mpg.permission_group.id,
        languages,
        traits,
        note,
        yearsOfExperience,
        level,
      })
    })

    let result = Array.from(memberMap.values())

    // Apply language filters (支援多語言篩選)
    if (languageFilters && languageFilters.length > 0) {
      result = result.filter(t => languageFilters.some(lang => t.languages.includes(lang)))
    }

    // Apply trait filter
    if (traitFilter) {
      result = result.filter(t => t.traits.includes(traitFilter))
    }

    return result
  }, [data, hasFilter, languageFilters, traitFilter])

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

// GraphQL query to get member orders for schedule management
export const GET_MEMBER_ORDERS_FOR_SCHEDULE = gql`
  query GetMemberOrdersForSchedule($memberId: String!) {
    member_public(where: { id: { _eq: $memberId } }) {
      id
      name
      username
      email
    }
    order_log(where: { member_id: { _eq: $memberId } }, order_by: { created_at: desc }) {
      id
      status
      member_id
      created_at
      updated_at
      order_products {
        id
        name
        price
        options
        started_at
        ended_at
      }
    }
  }
`

/**
 * Map class_type from order_products options to ScheduleType
 */
const mapClassTypeToScheduleType = (classType: string | undefined): ScheduleType | undefined => {
  if (!classType) return undefined
  switch (classType) {
    case '個人班':
      return 'personal'
    case '學期班':
      return 'semester'
    case '小組班':
      return 'group'
    default:
      return undefined
  }
}

/**
 * Hook to get orders by member from GraphQL (real data from order_log)
 */
export const useMemberOrders = (memberId: string | undefined, scheduleType?: ScheduleType) => {
  const { data, loading, error, refetch } = useQuery<GetMemberOrdersData, GetMemberOrdersVariables>(
    GET_MEMBER_ORDERS_FOR_SCHEDULE,
    {
      variables: {
        memberId: memberId || '',
      },
      skip: !memberId,
    },
  )

  const orders: Order[] = useMemo(() => {
    if (!data?.order_log) return []

    const result: Order[] = []

    data.order_log.forEach(orderLog => {
      // Extract materials from order_products where options.options.product === '教材'
      const materials: string[] = orderLog.order_products
        .filter(p => p.options?.options?.product === '教材')
        .map(p => p.options?.title || p.name)
        .filter(Boolean)

      // Each order_product can be a separate "order" for scheduling purposes
      orderLog.order_products.forEach(product => {
        const options = product.options?.options
        // Skip if options is not available
        if (!options) return

        // Skip material products - they are not orders for scheduling
        if (options.product === '教材') return

        const productClassType = mapClassTypeToScheduleType(options.class_type)

        // Filter by scheduleType if provided (個人班/學期班/小組班)
        if (scheduleType && productClassType !== scheduleType) {
          return
        }

        // Calculate available minutes from total_sessions
        const totalSessions = options?.total_sessions?.max || 0
        const totalMinutes = totalSessions * 50 // Each session is 50 minutes

        // Parse dates
        const createdAt = new Date(orderLog.created_at)
        // 課時到期日：只在 ended_at 有值時才設定（開課日 + 有效天數，預排/發布後才有值）
        const expiresAt = product.ended_at ? new Date(product.ended_at) : undefined

        result.push({
          id: product.id,
          studentId: orderLog.member_id,
          productName: product.name,
          language: options?.language || '', // 保留原始語言值，如 '中文'、'英文'
          type: productClassType || 'personal',
          totalMinutes,
          usedMinutes: 0, // TODO: Calculate from scheduled events
          availableMinutes: totalMinutes, // TODO: Calculate remaining minutes
          createdAt,
          expiresAt,
          lastClassDate: undefined, // TODO: Get from schedule events
          status: orderLog.status, // Keep original status: 'SUCCESS', 'UNPAID', etc.
          campus: '', // TODO: Get from member or order data
          materials, // 同一訂單中的教材列表
        })
      })
    })

    return result
  }, [data, scheduleType])

  // Get member info from query result
  const memberInfo = useMemo(() => {
    if (!data?.member_public?.[0]) return null
    const member = data.member_public[0]
    return {
      id: member.id,
      name: member.name || member.username || '',
      email: member.email || '',
    }
  }, [data])

  return { orders, loading, error, refetch, memberInfo }
}

// GraphQL query to get members for schedule management
export const GET_MEMBERS_FOR_SCHEDULE = gql`
  query GetMembersForSchedule($searchTerm: String) {
    member(
      where: { _or: [{ name: { _ilike: $searchTerm } }, { email: { _ilike: $searchTerm } }] }
      order_by: { name: asc }
      limit: 100
    ) {
      id
      name
      email
    }
  }
`

/**
 * Hook to get members (students) from GraphQL
 */
export const useMembers = (searchTerm?: string) => {
  const { data, loading, error, refetch } = useQuery<GetMembersForScheduleData, GetMembersForScheduleVariables>(
    GET_MEMBERS_FOR_SCHEDULE,
    {
      variables: {
        searchTerm: searchTerm ? `%${searchTerm}%` : '',
      },
      skip: !searchTerm, // 沒有搜尋文字時不查詢
    },
  )

  const members = useMemo(() => {
    return (
      data?.member.map(m => ({
        id: m.id,
        name: m.name || '',
        email: m.email,
      })) || []
    )
  }, [data])

  return { members, loading, error, refetch }
}

// GraphQL query to get members by IDs (for student list with real data)
export const GET_MEMBERS_BY_IDS_FOR_SCHEDULE = gql`
  query GetMembersByIdsForSchedule($memberIds: [String!]!) {
    member(where: { id: { _in: $memberIds } }) {
      id
      name
      email
      picture_url
    }
  }
`

interface MembersByIdsData {
  member: Array<{
    id: string
    name: string | null
    email: string
    picture_url: string | null
  }>
}

/**
 * Hook to get members by IDs (for student list with real data)
 * @param memberIds - Array of member IDs to fetch
 */
export const useMembersByIds = (memberIds: string[]) => {
  const { data, loading, error, refetch } = useQuery<MembersByIdsData>(GET_MEMBERS_BY_IDS_FOR_SCHEDULE, {
    variables: { memberIds },
    skip: memberIds.length === 0,
  })

  const members = useMemo(() => {
    return (
      data?.member.map(m => ({
        id: m.id,
        name: m.name || '',
        email: m.email,
        pictureUrl: m.picture_url,
      })) || []
    )
  }, [data])

  return { members, loading, error, refetch }
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

// Type definitions for class group GraphQL responses
interface ClassGroupData {
  id: string
  app_id: string
  name: string
  type: 'semester' | 'group'
  campus_id: string | null
  language: string
  min_students: number
  max_students: number
  materials: string[]
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  created_at: string
  updated_at: string
  class_group_orders?: Array<{ order_id: string }>
}

interface GetClassGroupsData {
  class_group: ClassGroupData[]
}

interface GetClassGroupByIdData {
  class_group: ClassGroupData[]
}

interface InsertClassGroupData {
  insert_class_group_one: ClassGroupData
}

interface UpdateClassGroupData {
  update_class_group_by_pk: ClassGroupData
}

interface DeleteClassGroupData {
  update_class_group_by_pk: { id: string; deleted_at: string }
}

// Helper function to transform GraphQL data to ClassGroup type
const transformClassGroupData = (data: ClassGroupData): ClassGroup => ({
  id: data.id,
  appId: data.app_id,
  name: data.name,
  type: data.type,
  campusId: data.campus_id,
  language: data.language as Language,
  minStudents: data.min_students,
  maxStudents: data.max_students,
  materials: data.materials || [],
  status: data.status,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  orderIds: data.class_group_orders?.map(o => o.order_id) || [],
})

/**
 * Hook to get students with filters (uses mock data for backward compatibility)
 * @deprecated Use useMembers instead for real data
 */
export const useStudents = (campus?: string) => {
  const students = useMemo(() => {
    return scheduleStore.getStudents(campus)
  }, [campus])

  return { students, loading: false }
}

/**
 * Hook to get student by ID
 */
export const useStudent = (studentId: string | undefined) => {
  const student = useMemo(() => {
    if (!studentId) return undefined
    return scheduleStore.getStudentById(studentId)
  }, [studentId])

  return { student, loading: false }
}

/**
 * Hook to get orders by student
 */
export const useOrdersByStudent = (studentId: string | undefined, type?: ScheduleType) => {
  const orders = useMemo(() => {
    if (!studentId) return []
    return scheduleStore.getOrdersByStudent(studentId, type)
  }, [studentId, type])

  return { orders, loading: false }
}

/**
 * Hook to get orders by type
 */
export const useOrdersByType = (type: ScheduleType, campus?: string, language?: Language) => {
  const orders = useMemo(() => {
    return scheduleStore.getOrdersByType(type, campus, language)
  }, [type, campus, language])

  return { orders, loading: false }
}

/**
 * Hook to get class groups
 */
export const useClassGroups = (type?: 'semester' | 'group') => {
  const { id: appId } = useApp()

  const { data, loading, error, refetch } = useQuery<GetClassGroupsData>(GET_CLASS_GROUPS_FOR_SCHEDULE, {
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
  const { data, loading, error, refetch } = useQuery<GetClassGroupByIdData>(GET_CLASS_GROUP_BY_ID, {
    variables: { id: classGroupId },
    skip: !classGroupId,
    fetchPolicy: 'cache-and-network',
  })

  const classGroup = useMemo(() => {
    if (!data?.class_group?.length) return undefined
    return transformClassGroupData(data.class_group[0])
  }, [data])

  return { classGroup, loading, error, refetch }
}

const GET_CLASSROOMS_FOR_SCHEDULE = gql`
  query GetClassroomsForSchedule($campusId: uuid) {
    classroom(where: { campus_id: { _eq: $campusId }, is_active: { _eq: true } }, order_by: { name: asc }) {
      id
      name
      campus_id
      capacity
    }
  }
`

/**
 * Hook to get classrooms
 */
export const useClassrooms = (campus?: string) => {
  const { data, loading, error } = useQuery<{ classroom: Classroom[] }>(GET_CLASSROOMS_FOR_SCHEDULE, {
    variables: { campusId: campus },
    skip: !campus,
    fetchPolicy: 'cache-and-network',
  })

  const classrooms = useMemo(() => {
    if (data?.classroom) {
      return data.classroom.map(c => ({
        id: c.id,
        name: c.name,
        campus: (c as any).campus_id || campus || '',
        capacity: c.capacity,
      }))
    }
    return scheduleStore.getClassrooms(campus)
  }, [data, campus])

  return { classrooms, loading, error }
}

/**
 * Hook to get campuses
 */
export const useCampuses = () => {
  const campuses = useMemo(() => {
    return scheduleStore.getCampuses()
  }, [])

  return { campuses, loading: false }
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
 * Hook to get schedule template
 */
export const useScheduleTemplate = (studentId: string | undefined, language: Language | undefined) => {
  const template = useMemo(() => {
    if (!studentId || !language) return undefined
    return scheduleStore.getTemplate(studentId, language)
  }, [studentId, language])

  return { template, loading: false }
}

/**
 * Hook to check for conflicts
 */
export const useConflictCheck = () => {
  const checkConflict = useCallback(
    (
      date: Date,
      startTime: string,
      endTime: string,
      teacherId?: string,
      classroomId?: string,
      excludeEventId?: string,
      classroomIds?: string[],
    ) => {
      return scheduleStore.hasConflict(
        date,
        startTime,
        endTime,
        teacherId,
        classroomId,
        excludeEventId,
        undefined,
        classroomIds,
      )
    },
    [],
  )

  return { checkConflict }
}

// =============================================================================
// Mutation Hooks (Using in-memory mock data)
// =============================================================================

/**
 * Hook to create schedule event
 */
export const useCreateScheduleEvent = () => {
  const [loading, setLoading] = useState(false)

  const createEvent = useCallback(async (event: Omit<ScheduleEvent, 'id'>): Promise<ScheduleEvent> => {
    setLoading(true)
    return new Promise(resolve => {
      setTimeout(() => {
        const newEvent = scheduleStore.addEvent(event)
        setLoading(false)
        resolve(newEvent)
      }, 200)
    })
  }, [])

  return { createEvent, loading }
}

/**
 * Hook to update schedule event
 */
export const useUpdateScheduleEvent = () => {
  const [loading, setLoading] = useState(false)

  const updateEvent = useCallback(
    async (id: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent | undefined> => {
      setLoading(true)
      return new Promise(resolve => {
        setTimeout(() => {
          const updatedEvent = scheduleStore.updateEvent(id, updates)
          setLoading(false)
          resolve(updatedEvent)
        }, 200)
      })
    },
    [],
  )

  return { updateEvent, loading }
}

/**
 * Hook to delete schedule event
 */
export const useDeleteScheduleEvent = () => {
  const [loading, setLoading] = useState(false)

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    return new Promise(resolve => {
      setTimeout(() => {
        const result = scheduleStore.deleteEvent(id)
        setLoading(false)
        resolve(result)
      }, 200)
    })
  }, [])

  return { deleteEvent, loading }
}

/**
 * Hook to update class group
 */
export const useUpdateClassGroup = () => {
  const [updateMutation, { loading }] = useMutation<UpdateClassGroupData>(UPDATE_CLASS_GROUP)

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

  const [insertMutation, { loading }] = useMutation<InsertClassGroupData>(INSERT_CLASS_GROUP)

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
  const [deleteMutation, { loading }] = useMutation<DeleteClassGroupData>(DELETE_CLASS_GROUP)

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

// Type definitions for order queries (uses OrderLogData defined above)
interface GetOrdersByIdsData {
  order_log: OrderLogData[]
}

interface GetAvailableOrdersData {
  order_log: OrderLogData[]
}

interface GetAssignedOrderIdsData {
  class_group_order: Array<{ order_id: string }>
}

/**
 * Hook to get orders by their IDs (for orders already in a class group)
 */
export const useOrdersByIds = (orderIds: string[]) => {
  const { data, loading, error, refetch } = useQuery<GetOrdersByIdsData>(GET_ORDERS_BY_IDS, {
    variables: { orderIds },
    skip: orderIds.length === 0,
    fetchPolicy: 'cache-and-network',
  })

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
  const { data: assignedData } = useQuery<GetAssignedOrderIdsData>(GET_ASSIGNED_ORDER_IDS, {
    fetchPolicy: 'cache-and-network',
  })

  // Combine excluded IDs with already assigned IDs
  const allExcludedIds = useMemo(() => {
    const assignedIds = assignedData?.class_group_order?.map(o => o.order_id) || []
    return [...new Set([...excludeOrderIds, ...assignedIds])]
  }, [assignedData, excludeOrderIds])

  const { data, loading, error, refetch } = useQuery<GetAvailableOrdersData>(GET_AVAILABLE_ORDERS_FOR_CLASS, {
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
  const [insertMutation, { loading }] = useMutation(INSERT_CLASS_GROUP_ORDER)

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
  const [deleteMutation, { loading }] = useMutation(DELETE_CLASS_GROUP_ORDER)

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

/**
 * Hook to manage class group orders (add/remove orders from class group)
 */
export const useClassGroupOrders = () => {
  const [insertOrderMutation, { loading: insertLoading }] = useMutation(INSERT_CLASS_GROUP_ORDER)
  const [deleteOrderMutation, { loading: deleteLoading }] = useMutation(DELETE_CLASS_GROUP_ORDER)

  const addOrderToClassGroup = useCallback(
    async (classGroupId: string, orderId: string): Promise<boolean> => {
      try {
        await insertOrderMutation({
          variables: {
            object: {
              class_group_id: classGroupId,
              order_id: orderId,
            },
          },
        })
        return true
      } catch (error) {
        console.error('Failed to add order to class group:', error)
        return false
      }
    },
    [insertOrderMutation],
  )

  const removeOrderFromClassGroup = useCallback(
    async (classGroupId: string, orderId: string): Promise<boolean> => {
      try {
        await deleteOrderMutation({
          variables: {
            classGroupId,
            orderId,
          },
        })
        return true
      } catch (error) {
        console.error('Failed to remove order from class group:', error)
        return false
      }
    },
    [deleteOrderMutation],
  )

  return {
    addOrderToClassGroup,
    removeOrderFromClassGroup,
    loading: insertLoading || deleteLoading,
  }
}

/**
 * Hook to save schedule template
 */
export const useSaveScheduleTemplate = () => {
  const [loading, setLoading] = useState(false)

  const saveTemplate = useCallback(async (template: Omit<ScheduleTemplate, 'id'>): Promise<ScheduleTemplate> => {
    setLoading(true)
    return new Promise(resolve => {
      setTimeout(() => {
        const saved = scheduleStore.saveTemplate(template)
        setLoading(false)
        resolve(saved)
      }, 200)
    })
  }, [])

  return { saveTemplate, loading }
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to calculate schedule based on conditions
 */
export const useScheduleCalculation = () => {
  const { holidays } = useHolidays()

  const calculateScheduleDates = useCallback(
    (condition: ScheduleCondition, template: ScheduleTemplate): Date[] => {
      const dates: Date[] = []
      const { startDate, endDate, totalMinutes, excludedDates, excludeHolidays } = condition
      const { weekday, duration } = template

      let currentDate = new Date(startDate)
      let accumulatedMinutes = 0

      // Find the first matching weekday
      while (currentDate.getDay() !== weekday) {
        currentDate.setDate(currentDate.getDate() + 1)
      }

      while (true) {
        // Check end conditions
        if (endDate && currentDate > endDate) break
        if (totalMinutes && accumulatedMinutes >= totalMinutes) break

        // Check if date should be excluded
        const dateStr = currentDate.toISOString().split('T')[0]
        const isExcluded = excludedDates.some(d => d.toISOString().split('T')[0] === dateStr)
        const isHoliday = excludeHolidays && holidays.some(h => h.date.toISOString().split('T')[0] === dateStr)

        if (!isExcluded && !isHoliday) {
          dates.push(new Date(currentDate))
          accumulatedMinutes += duration
        }

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7)

        // Safety limit
        if (dates.length > 100) break
      }

      return dates
    },
    [holidays],
  )

  return { calculateScheduleDates }
}

/**
 * Hook to get teacher color assignment
 */
export const useTeacherColors = () => {
  const getTeacherColor = useCallback((teacherId: string, teacherIndex: number) => {
    const colorSets = [
      { light: '#bfdbfe', medium: '#93c5fd', dark: '#3b82f6' }, // Blue
      { light: '#fbcfe8', medium: '#f9a8d4', dark: '#ec4899' }, // Pink
      { light: '#e9d5ff', medium: '#d8b4fe', dark: '#a855f7' }, // Purple
      { light: '#bbf7d0', medium: '#86efac', dark: '#22c55e' }, // Green
      { light: '#fed7aa', medium: '#fdba74', dark: '#f97316' }, // Orange
    ]
    return colorSets[teacherIndex % colorSets.length]
  }, [])

  return { getTeacherColor }
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

  // Filter out any undefined or empty teacher IDs
  const validTeacherIds = useMemo(() => {
    return teacherIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
  }, [teacherIds])

  // Default date range: 1 year before and after current date
  const defaultStartDate = useMemo(() => {
    return startDate || moment().subtract(1, 'year').startOf('day').toDate()
  }, [startDate])

  const defaultEndDate = useMemo(() => {
    return endDate || moment().add(1, 'year').startOf('day').toDate()
  }, [endDate])

  useEffect(() => {
    const fetchTeacherOpenTimeEvents = async () => {
      if (!authToken || validTeacherIds.length === 0) {
        setEvents([])
        setBusyEvents([])
        return
      }

      setLoading(true)
      setError(null)

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
                startedAt: defaultStartDate,
                until: defaultEndDate,
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
  }, [authToken, validTeacherIds, defaultStartDate, defaultEndDate])

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
  query GetPersonalScheduleEvents($startDate: timestamptz!, $endDate: timestamptz!, $scheduleTypeFilter: jsonb!) {
    event(
      where: {
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

interface PersonalScheduleEventsData {
  event: Array<{
    id: string
    title: string | null
    description: string | null
    started_at: string
    ended_at: string
    metadata: Record<string, any> | null
    published_at: string | null
    created_at: string
    updated_at: string
  }>
}

interface MembersData {
  member: Array<{
    id: string
    name: string
    email: string
  }>
}

/**
 * Hook to get all personal schedule events for list view
 * Fetches real events from GraphQL event table filtered by scheduleType === 'personal'
 */
export const usePersonalScheduleListEvents = (status?: 'published' | 'pre-scheduled' | 'all') => {
  // Default date range: 1 year before and after current date
  const startDate = useMemo(() => {
    return moment().subtract(1, 'year').startOf('day').toISOString()
  }, [])

  const endDate = useMemo(() => {
    return moment().add(1, 'year').endOf('day').toISOString()
  }, [])

  // Query events from GraphQL
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    refetch,
  } = useQuery<PersonalScheduleEventsData>(GET_PERSONAL_SCHEDULE_EVENTS, {
    variables: {
      startDate,
      endDate,
      scheduleTypeFilter: { scheduleType: 'personal' },
    },
    fetchPolicy: 'network-only',
  })

  // Extract unique member IDs from events
  const memberIds = useMemo(() => {
    if (!eventsData?.event) return []
    const ids = new Set<string>()
    eventsData.event.forEach(event => {
      const metadata = event.metadata
      if (metadata?.studentId) ids.add(metadata.studentId)
      if (metadata?.teacherId) ids.add(metadata.teacherId)
    })
    return Array.from(ids)
  }, [eventsData])

  // Query member names
  const { data: membersData } = useQuery<MembersData>(GET_MEMBERS_BY_IDS, {
    variables: { memberIds },
    skip: memberIds.length === 0,
  })

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
          createdBy: '',
          createdByEmail: '',
          updatedAt: new Date(event.updated_at),
          isExternal: metadata.classMode === '外課' || metadata.is_external === true,
        }

        return eventData
      })
  }, [eventsData, status, memberMap])

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

interface ScheduleExpirySetting {
  id: string
  type: string
  language: string
  class_count: number
  valid_days: number
  status: string
}

interface GetScheduleExpirySettingsData {
  schedule_expiry_setting: ScheduleExpirySetting[]
}

const GET_SCHEDULE_EXPIRY_SETTINGS_FOR_SCHEDULE = gql`
  query GET_SCHEDULE_EXPIRY_SETTINGS_FOR_SCHEDULE {
    schedule_expiry_setting(where: { status: { _eq: "active" } }, order_by: { class_count: asc }) {
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
  const { data, loading, error } = useQuery<GetScheduleExpirySettingsData>(GET_SCHEDULE_EXPIRY_SETTINGS_FOR_SCHEDULE)

  // Map type to DB value
  const dbType = scheduleType === 'personal' ? 'individual' : scheduleType === 'group' ? 'group' : 'individual'

  // Get settings filtered by type
  const settings = useMemo(() => {
    if (!data?.schedule_expiry_setting) return []
    return data.schedule_expiry_setting.filter(s => s.type === dbType)
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

interface ClassGroupEventsData {
  event: Array<{
    id: string
    title: string | null
    description: string | null
    started_at: string
    ended_at: string
    metadata: Record<string, any> | null
    published_at: string | null
    created_at: string
    updated_at: string
  }>
}

/**
 * Hook to get events for a specific class group (semester/group class)
 * Fetches events from GraphQL where metadata.classId matches the provided classId
 * @param classId - The class group ID to fetch events for
 */
export const useClassGroupEvents = (classId: string | undefined) => {
  const { data, loading, error, refetch } = useQuery<ClassGroupEventsData>(GET_CLASS_GROUP_EVENTS, {
    variables: { classId: classId || '' },
    skip: !classId,
    fetchPolicy: 'cache-and-network',
  })

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
  mutation PublishEvent($eventId: uuid!, $publishedAt: timestamptz!) {
    update_event_by_pk(pk_columns: { id: $eventId }, _set: { published_at: $publishedAt }) {
      id
      published_at
    }
  }
`

interface PublishEventData {
  update_event_by_pk: {
    id: string
    published_at: string
  } | null
}

export const usePublishEvent = () => {
  const [publishEventMutation, { loading }] = useMutation<PublishEventData>(PUBLISH_EVENT)

  const publishEvent = useCallback(
    async (eventId: string, publishedAt: Date = new Date()) => {
      const result = await publishEventMutation({
        variables: {
          eventId,
          publishedAt: publishedAt.toISOString(),
        },
      })
      return result.data?.update_event_by_pk
    },
    [publishEventMutation],
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
// Export types for convenience
// =============================================================================

export type {
  Campus,
  Classroom,
  ClassGroup,
  Holiday,
  Language,
  Order,
  ScheduleCondition,
  ScheduleEvent,
  ScheduleTemplate,
  ScheduleType,
  Student,
  Teacher,
}
