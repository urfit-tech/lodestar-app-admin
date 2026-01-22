/**
 * Classroom Hook - 教室管理
 *
 * 提供從 Hasura 查詢教室資料的功能
 */

import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { Classroom } from '../types/schedule'

// GraphQL 回應型別
interface ClassroomData {
  classroom: Array<{
    id: string
    name: string
    campus_id: string | null
    capacity: number
    system_name: string | null
    is_active: boolean
    permission_group: {
      id: string
      name: string
    } | null
  }>
}

// GraphQL 查詢 - 取得所有教室
const GET_CLASSROOMS = gql`
  query GetClassrooms($appId: String!) {
    classroom(
      where: {
        app_id: { _eq: $appId }
        is_active: { _eq: true }
      }
      order_by: [{ permission_group: { name: asc } }, { name: asc }]
    ) {
      id
      name
      campus_id
      capacity
      system_name
      is_active
      permission_group {
        id
        name
      }
    }
  }
`

// GraphQL 查詢 - 依校區取得教室
const GET_CLASSROOMS_BY_CAMPUS = gql`
  query GetClassroomsByCampus($appId: String!, $campusIds: [uuid!]!) {
    classroom(
      where: {
        app_id: { _eq: $appId }
        is_active: { _eq: true }
        campus_id: { _in: $campusIds }
      }
      order_by: [{ permission_group: { name: asc } }, { name: asc }]
    ) {
      id
      name
      campus_id
      capacity
      system_name
      is_active
      permission_group {
        id
        name
      }
    }
  }
`

/**
 * Hook to get all classrooms for the current app
 * @returns Object containing classrooms array, loading state, error, and refetch function
 */
export const useClassrooms = () => {
  const { id: appId } = useApp()

  const { data, loading, error, refetch } = useQuery<ClassroomData>(GET_CLASSROOMS, {
    variables: { appId },
    skip: !appId,
    fetchPolicy: 'cache-and-network',
    // 忽略錯誤（例如表不存在時）
    errorPolicy: 'ignore',
  })

  const classrooms = useMemo<Classroom[]>(() => {
    // 如果查詢失敗或表不存在，回傳空陣列
    if (!data?.classroom) return []
    return data.classroom.map(c => ({
      id: c.id,
      name: c.name,
      campus: c.permission_group?.name || '', // 向後相容欄位
      campusId: c.campus_id || undefined,
      campusName: c.permission_group?.name || undefined,
      capacity: c.capacity,
      systemName: c.system_name || undefined,
    }))
  }, [data])

  return { classrooms, loading, error, refetch }
}

/**
 * Hook to get classrooms filtered by campus IDs
 * @param campusIds - Array of campus (permission_group) IDs to filter by
 * @returns Object containing filtered classrooms array, loading state, error, and refetch function
 */
export const useClassroomsByCampus = (campusIds?: string[]) => {
  const { id: appId } = useApp()
  const hasCampusFilter = campusIds && campusIds.length > 0

  const { data, loading, error, refetch } = useQuery<ClassroomData>(
    hasCampusFilter ? GET_CLASSROOMS_BY_CAMPUS : GET_CLASSROOMS,
    {
      variables: hasCampusFilter ? { appId, campusIds } : { appId },
      skip: !appId,
      fetchPolicy: 'cache-and-network',
      // 忽略錯誤（例如表不存在時）
      errorPolicy: 'ignore',
    },
  )

  const classrooms = useMemo<Classroom[]>(() => {
    if (!data?.classroom) return []
    return data.classroom.map(c => ({
      id: c.id,
      name: c.name,
      campus: c.permission_group?.name || '', // 向後相容欄位
      campusId: c.campus_id || undefined,
      campusName: c.permission_group?.name || undefined,
      capacity: c.capacity,
      systemName: c.system_name || undefined,
    }))
  }, [data])

  return { classrooms, loading, error, refetch }
}

/**
 * Helper function to filter classrooms by teacher's campus IDs
 * @param classrooms - All available classrooms
 * @param teacherCampusIds - Array of campus IDs the teacher belongs to
 * @returns Filtered classrooms that match the teacher's campuses
 */
export const filterClassroomsByTeacherCampuses = (
  classrooms: Classroom[],
  teacherCampusIds: string[],
): Classroom[] => {
  if (!teacherCampusIds || teacherCampusIds.length === 0) {
    return classrooms
  }
  return classrooms.filter(c => c.campusId && teacherCampusIds.includes(c.campusId))
}

/**
 * Helper function to determine if classroom options should show campus prefix
 * (When teacher belongs to multiple campuses)
 * @param teacherCampusIds - Array of campus IDs the teacher belongs to
 * @returns Boolean indicating whether to show campus prefix
 */
export const shouldShowClassroomCampusPrefix = (teacherCampusIds: string[]): boolean => {
  return teacherCampusIds && teacherCampusIds.length > 1
}
