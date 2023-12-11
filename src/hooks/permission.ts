import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { groupBy } from 'ramda'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import hasura from '../hasura'
import { PermissionGroupProps } from '../types/general'

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

  const permissionGroups: Pick<PermissionGroupProps, 'id' | 'name'>[] =
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

  const permissionGroups: PermissionGroupProps[] =
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
    count: permissionGroups[key].length,
  }))

  return {
    loading,
    error,
    permissionGroupDropdownMenu,
    refetch,
  }
}
