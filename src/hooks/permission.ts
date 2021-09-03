import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { groupBy } from 'ramda'
import { useIntl } from 'react-intl'
import { useApp } from '../contexts/AppContext'
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
    data?.role_permission.reduce<
      {
        [roleId in string]?: string[]
      }
    >(
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

export const usePermissionGroupsCollection = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PERMISSION_GROUPS_Collection,
    hasura.GET_PERMISSION_GROUPS_CollectionVariables
  >(
    gql`
      query GET_PERMISSION_GROUPS_Collection($appId: String) {
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

  const permissionGroups: {
    id: string
    name: string
    permissionGroupPermissions: string[]
  }[] =
    data?.permission_group.map(v => ({
      id: v.id,
      name: v.name,
      permissionGroupPermissions: v.permission_group_permissions.map(w => w.permission_id) || [],
    })) || []

  return {
    loadingPermissionGroups: loading,
    errorPermissionGroups: error,
    permissionGroups,
    refetchPermissionGroups: refetch,
  }
}

export const usePermissionGroup = () => {
  const { id: appId } = useApp()
  const { loading, data, error, refetch } = useQuery<
    hasura.GET_PERMISSION_GROUPS,
    hasura.GET_PERMISSION_GROUPSVariables
  >(
    gql`
      query GET_PERMISSION_GROUPS($appId: String!) {
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
    {
      variables: { appId },
    },
  )

  const permissionGroups: PermissionGroupProps[] =
    data?.permission_group.map(v => ({
      id: v.id,
      name: v.name,
      permissionGroupPermission: v.permission_group_permissions.map(permissionGroupsPermissions => ({
        id: permissionGroupsPermissions.id,
        permissionId: permissionGroupsPermissions.permission_id,
      })),
    })) || []

  return {
    loading,
    permissionGroups,
    error,
    refetch,
  }
}

export const usePermissionGroupsDropdownMenu = (
  appId: string,
  filter?: { name?: string; email?: string; role?: string },
) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PERMISSION_GROUPS_DROPDOWN_MENU,
    hasura.GET_PERMISSION_GROUPS_DROPDOWN_MENUVariables
  >(
    gql`
      query GET_PERMISSION_GROUPS_DROPDOWN_MENU($appId: String!, $name: String, $email: String, $role: String) {
        member_permission_group(
          where: {
            member: {
              app_id: { _eq: $appId }
              name: { _like: $name }
              email: { _like: $email }
              role: { _like: $role }
            }
          }
        ) {
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
        appId,
        name: filter?.name && `%${filter.name}%`,
        email: filter?.email && `%${filter.email}%`,
        role: filter?.role && `%${filter.role}%`,
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
