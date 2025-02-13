import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { groupBy } from 'ramda'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import hasura from '../hasura'
import { PermissionGroup } from '../types/general'

export const useDefaultPermissions = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_ROLE_PERMISSION>(gql`
    query GET_ROLE_PERMISSION {
      role_permission {
        id
        role_id
        permission_id
      }
    }
  `)

  const defaultRolePermissions =
    data?.role_permission.reduce<{
      [roleId in string]?: string[]
    }>(
      (accumulator, currentValue) => ({
        ...accumulator,
        [currentValue.role_id]: [...(accumulator[currentValue.role_id] || []), currentValue.permission_id],
      }),
      {},
    ) || {}

  return {
    loadingPermissions: loading,
    errorPermissions: error,
    defaultRolePermissions,
    refetchPermissions: refetch,
  }
}

export const usePermissionGroupCollection = () => {
  const { id: appId } = useApp()
  const { loading, error, data, refetch } = useQuery<
    hasura.GetPermissionGroupCollection,
    hasura.GetPermissionGroupCollectionVariables
  >(
    gql`
      query GetPermissionGroupCollection($appId: String) {
        permission_group(where: { app_id: { _eq: $appId } }) {
          id
          name
        }
      }
    `,
    { variables: { appId } },
  )

  const permissionGroups: Pick<PermissionGroup, 'id' | 'name'>[] =
    data?.permission_group.map(v => ({
      id: v.id,
      name: v.name,
    })) || []

  return {
    loadingPermissionGroups: loading,
    errorPermissionGroups: error,
    permissionGroups,
    refetchPermissionGroups: refetch,
  }
}

export const usePermissionGroupAndPermissionGroupPermissionCollection = () => {
  const { id: appId } = useApp()
  const { loading, error, data, refetch } = useQuery<
    hasura.GetPermissionGroupAndPermissionGroupPermissionCollection,
    hasura.GetPermissionGroupAndPermissionGroupPermissionCollectionVariables
  >(
    gql`
      query GetPermissionGroupAndPermissionGroupPermissionCollection($appId: String) {
        permission_group(where: { app_id: { _eq: $appId } }) {
          id
          name
          permission_group_permissions {
            id
            permission_id
          }
        }
      }
    `,
    { variables: { appId } },
  )

  const permissionGroups: PermissionGroup[] =
    data?.permission_group.map(v => ({
      id: v.id,
      name: v.name,
      permissionGroupPermissions:
        v.permission_group_permissions.map(w => ({
          id: w.id,
          permissionId: w.permission_id,
        })) || [],
    })) || []

  return {
    loadingPermissionGroups: loading,
    errorPermissionGroups: error,
    permissionGroups,
    refetchPermissionGroups: refetch,
  }
}

export const usePermissionGroupsDropdownMenu = (
  appId: string,
  filter?: {
    name?: string
    email?: string
    role?: string
    phone?: string
    category?: string
    managerName?: string
    managerId?: string
    tag?: string
    properties?: {
      id: string
      value?: string
    }[]
  },
) => {
  const condition: hasura.GET_PERMISSION_GROUPS_DROPDOWN_MENUVariables['condition'] = {
    member: {
      app_id: { _eq: appId },
      role: filter?.role ? { _eq: filter.role } : undefined,
      name: filter?.name ? { _ilike: `%${filter.name}%` } : undefined,
      email: filter?.email ? { _ilike: `%${filter.email}%` } : undefined,
      manager: filter?.managerName
        ? {
            name: { _ilike: `%${filter.managerName}%` },
          }
        : undefined,
      manager_id: filter?.managerId ? { _eq: filter.managerId } : undefined,
      member_phones: filter?.phone
        ? {
            phone: { _ilike: `%${filter.phone}%` },
          }
        : undefined,
      member_categories: filter?.category
        ? {
            category: {
              name: {
                _ilike: `%${filter.category}%`,
              },
            },
          }
        : undefined,
      member_tags: filter?.tag
        ? {
            tag_name: {
              _ilike: filter.tag,
            },
          }
        : undefined,
      member_properties: filter?.properties?.length
        ? {
            _and: filter.properties
              .filter(property => property.value)
              .map(property => ({
                property_id: { _eq: property.id },
                value: { _ilike: `%${property.value}%` },
              })),
          }
        : undefined,
    },
  }

  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PERMISSION_GROUPS_DROPDOWN_MENU,
    hasura.GET_PERMISSION_GROUPS_DROPDOWN_MENUVariables
  >(
    gql`
      query GET_PERMISSION_GROUPS_DROPDOWN_MENU($condition: member_permission_group_bool_exp) {
        member_permission_group(where: $condition) {
          member {
            id
          }
          permission_group {
            name
          }
        }
      }
    `,
    {
      variables: {
        condition,
      },
    },
  )

  const permissionGroups = groupBy(
    v => v.permissionGroup,
    data?.member_permission_group.map(v => ({
      memberId: v.member.id,
      permissionGroup: v.permission_group.name,
    })) || [],
  )

  const permissionGroupDropdownMenu: {
    permissionGroup: string
    count: number
  }[] = Object.keys(permissionGroups).map(key => ({
    permissionGroup: key,
    count: permissionGroups?.[key]?.length || 0,
  }))

  return {
    loading,
    error,
    permissionGroupDropdownMenu,
    refetch,
  }
}

export const useMutationPermissionGroup = () => {
  const [insertPermissionGroup] = useMutation<hasura.InsertPermissionGroup, hasura.InsertPermissionGroupVariables>(gql`
    mutation InsertPermissionGroup($appId: String, $name: String) {
      insert_permission_group(objects: { app_id: $appId, name: $name }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  const [updatePermissionGroup] = useMutation<hasura.UpdatePermissionGroup, hasura.UpdatePermissionGroupVariables>(gql`
    mutation UpdatePermissionGroup($id: uuid, $name: String) {
      update_permission_group(where: { id: { _eq: $id } }, _set: { name: $name }) {
        affected_rows
      }
    }
  `)

  const [deletePermissionGroup] = useMutation<hasura.DeletePermissionGroup, hasura.DeletePermissionGroupVariables>(
    gql`
      mutation DeletePermissionGroup($id: uuid!) {
        delete_member_permission_group(where: { permission_group_id: { _eq: $id } }) {
          affected_rows
        }
        delete_permission_group_permission(where: { permission_group_id: { _eq: $id } }) {
          affected_rows
        }
        delete_permission_group(where: { id: { _eq: $id } }) {
          affected_rows
        }
      }
    `,
  )

  return {
    insertPermissionGroup,
    updatePermissionGroup,
    deletePermissionGroup,
  }
}

export const useMutationPermissionGroupPermission = () => {
  const [insertPermissionGroupPermission] = useMutation<
    hasura.InsertPermissionGroupPermission,
    hasura.InsertPermissionGroupPermissionVariables
  >(gql`
    mutation InsertPermissionGroupPermission(
      $permissionsGroupPermissions: [permission_group_permission_insert_input!]!
    ) {
      insert_permission_group_permission(objects: $permissionsGroupPermissions) {
        affected_rows
      }
    }
  `)

  const [updatePermissionGroupPermission] = useMutation<
    hasura.UpdatePermissionGroupPermission,
    hasura.UpdatePermissionGroupPermissionVariables
  >(gql`
    mutation UpdatePermissionGroupPermission(
      $permissionGroupPermissionId: uuid!
      $permissionsGroupPermissions: [permission_group_permission_insert_input!]!
    ) {
      delete_permission_group_permission(where: { permission_group_id: { _eq: $permissionGroupPermissionId } }) {
        affected_rows
      }
      insert_permission_group_permission(objects: $permissionsGroupPermissions) {
        affected_rows
      }
    }
  `)
  return {
    insertPermissionGroupPermission,
    updatePermissionGroupPermission,
  }
}

export const useMutationPermissionGroupAuditLog = () => {
  const [insertPermissionGroupAuditLog] = useMutation<
    hasura.InsertPermissionGroupAuditLog,
    hasura.InsertPermissionGroupAuditLogVariables
  >(
    gql`
      mutation InsertPermissionGroupAuditLog($permissionGroupAuditLog: [permission_group_audit_log_insert_input!]!) {
        insert_permission_group_audit_log(objects: $permissionGroupAuditLog) {
          affected_rows
        }
      }
    `,
  )
  return {
    insertPermissionGroupAuditLog,
  }
}

export const GetPermissionGroupMembers = gql`
  query GetPermissionGroupMembers($permissionGroupId: uuid!) {
    member_permission_group(where: { permission_group_id: { _eq: $permissionGroupId } }) {
      member {
        id
      }
    }
  }
`
