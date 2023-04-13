import { ExportOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Button } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SortOrder } from 'antd/lib/table/interface'
import { gql } from '@apollo/client'
import moment from 'moment'
import { repeat } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { MemberInfoProps, UserRole } from '../../types/member'

type ExportMemberProps = {
  id: string
  name: string
  username: string
  email: string
  role: UserRole
  createdAt: Date | null
  loginedAt: Date | null
  phones: string[]
  categories: string[]
  consumption: number
  managerName: string
  tags: string[]
  properties: {
    [id: string]: string
  }
  permissionGroupNames: string[]
}
const MemberExportModal: React.FC<{
  appId: string
  columns: ColumnProps<MemberInfoProps>[]
  visibleFields?: string[]
  filter?: {
    role?: UserRole
    name?: string
    email?: string
    phone?: string
    username?: string
    category?: string
    managerName?: string
    managerId?: string
    tag?: string
    permissionGroup?: string
    properties?: {
      [propertyId: string]: string | undefined
    }
  }
  sortOrder?: {
    createdAt?: SortOrder
    loginedAt?: SortOrder
    consumption?: SortOrder
  }
}> = ({ appId, filter, visibleFields = [], columns, sortOrder = {} }) => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()
  const [loadingMembers, setLoadingMembers] = useState(false)

  const exportMemberList = async () => {
    try {
      setLoadingMembers(true)

      const visibleColumns = columns.filter(column => visibleFields.includes(column.key as string))

      const condition: hasura.GET_MEMBER_EXPORT_COLLECTIONVariables['condition'] = {
        role: filter?.role ? { _eq: filter?.role } : undefined,
        name: filter?.name ? { _ilike: `%${filter.name}%` } : undefined,
        username: filter?.username ? { _ilike: `%${filter.username}%` } : undefined,
        email: filter?.email ? { _ilike: `%${filter.email}%` } : undefined,
        phones: filter?.phone ? { _ilike: `%${filter.phone}%` } : undefined,
        categories: filter?.category ? { _ilike: `%${filter.category}%` } : undefined,
        tags: filter?.tag ? { _ilike: `%${filter.tag}%` } : undefined,
        manager_id: filter?.managerId ? { _eq: filter.managerId } : undefined,
        manager_name: filter?.managerName ? { _eq: filter.managerName } : undefined,
        properties:
          filter?.properties && Object.keys(filter.properties).length
            ? { _has_keys_all: Object.keys(filter.properties) }
            : undefined,
        permission_groups: filter?.permissionGroup
          ? {
              _like: `%${filter.permissionGroup}%`,
            }
          : undefined,
      }

      const orderBy: hasura.GET_MEMBER_EXPORT_COLLECTIONVariables['orderBy'] =
        sortOrder.consumption || sortOrder.createdAt || sortOrder.loginedAt
          ? [
              {
                created_at:
                  sortOrder.createdAt && ((sortOrder.createdAt === 'descend' ? 'desc' : 'asc') as hasura.order_by),
              },
              {
                logined_at:
                  sortOrder.loginedAt && ((sortOrder.loginedAt === 'descend' ? 'desc' : 'asc') as hasura.order_by),
              },
              {
                consumption:
                  sortOrder.consumption && ((sortOrder.consumption === 'descend' ? 'desc' : 'asc') as hasura.order_by),
              },
            ]
          : [
              {
                created_at: 'desc_nulls_last' as hasura.order_by,
              },
            ]

      const { data } = await client.query<
        hasura.GET_MEMBER_EXPORT_COLLECTION,
        hasura.GET_MEMBER_EXPORT_COLLECTIONVariables
      >({
        query: GET_MEMBER_EXPORT_COLLECTION,
        variables: {
          condition,
          orderBy,
        },
      })

      let maxPhoneAmounts = 1
      let members: ExportMemberProps[]

      members =
        data?.member_export.map(v => {
          const phones = v.phones?.split(',') || []
          if (phones.length > maxPhoneAmounts) {
            maxPhoneAmounts = phones.length
          }
          return {
            id: v.id || '',
            name: v.name || '',
            username: v.username || '',
            email: v.email || '',
            role: v.role as UserRole,
            createdAt: v.created_at ? new Date(v.created_at) : null,
            loginedAt: v.logined_at ? new Date(v.logined_at) : null,
            phones,
            categories: v.categories?.split(',') || [],
            managerName: v.manager_name || '',
            consumption: v.consumption || 0,
            tags: v.tags?.split(',') || [],
            properties: v.properties,
            permissionGroupNames: v.permission_groups?.split(',') || [],
          }
        }) || []

      if (filter?.properties && Object.keys(filter.properties).length) {
        const propertyFilter = Object.entries(filter.properties)
        members = members.filter(member => {
          return propertyFilter.every(
            ([propertyId, value]) => member.properties[propertyId]?.includes(value || '') || false,
          )
        })
      }

      const csvColumns = [
        formatMessage(commonMessages.label.memberName),
        formatMessage(commonMessages.label.memberIdentity),
        ...visibleColumns
          ?.map(column => {
            if (column.key === 'phone') {
              return repeat(column.title?.toString() || '', maxPhoneAmounts)
            }
            return column.title?.toString() || ''
          })
          ?.flat(),
      ]

      const csvRows: string[][] = members.map(member => [
        member.name,
        member.role === 'general-member'
          ? formatMessage(commonMessages.label.generalMember)
          : member.role === 'content-creator'
          ? formatMessage(commonMessages.label.contentCreator)
          : member.role === 'app-owner'
          ? formatMessage(commonMessages.label.appOwner)
          : formatMessage(commonMessages.label.anonymousUser),
        ...visibleColumns.flatMap(column => {
          switch (column.key) {
            case 'email':
              return member.email
            case 'username':
              return member.username
            case 'phone':
              return [...member.phones, ...repeat('', maxPhoneAmounts - member.phones.length)]
            case 'categories':
              return member.categories.join(',')
            case 'createdAt':
              return member.createdAt ? moment(member.createdAt).format('YYYY-MM-DD') : ''
            case 'loginedAt':
              return member.loginedAt ? moment(member.loginedAt).format('YYYY-MM-DD') : ''
            case 'consumption':
              return member.consumption.toString()
            case 'tags':
              return member.tags.join(',')
            case 'managerName':
              return member.managerName
            default:
              if (column.key && Object.keys(member.properties).includes(column.key.toString())) {
                return member.properties[column.key.toString()]
              }
              return ''
          }
        }),
      ])

      downloadCSV(`members-${appId}.csv`, toCSV([csvColumns, ...csvRows]))
    } catch (error) {
      handleError(error)
    }

    setLoadingMembers(false)
  }

  return (
    <Button icon={<ExportOutlined />} loading={loadingMembers} onClick={() => exportMemberList()}>
      {formatMessage(commonMessages.ui.export)}
    </Button>
  )
}

const GET_MEMBER_EXPORT_COLLECTION = gql`
  query GET_MEMBER_EXPORT_COLLECTION($condition: member_export_bool_exp!, $orderBy: [member_export_order_by!]) {
    member_export(where: $condition, order_by: $orderBy) {
      id
      name
      username
      email
      created_at
      logined_at
      role
      phones
      categories
      tags
      consumption
      manager_name
      properties
      permission_groups
    }
  }
`

export default MemberExportModal
