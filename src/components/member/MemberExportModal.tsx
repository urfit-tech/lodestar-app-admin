import { ExportOutlined } from '@ant-design/icons'
import { gql, useApolloClient } from '@apollo/client'
import { useToast } from '@chakra-ui/toast'
import { Button } from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { UserRole } from '../../types/member'

const MemberExportModal: React.FC<{
  appId: string
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
}> = ({ appId, filter, sortOrder = {} }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const client = useApolloClient()
  const toast = useToast()
  const [loadingMembers, setLoadingMembers] = useState(false)

  const exportMemberList = async () => {
    try {
      setLoadingMembers(true)
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

      const memberIds: string[] = data?.member_export.map(v => v.id || '') || []
      await axios.post(
        `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/members/export`,
        {
          appId,
          memberIds: memberIds,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      )
      toast({
        title: formatMessage(commonMessages.text.exportMember),
        status: 'success',
        duration: 1500,
        position: 'top',
      })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingMembers(false)
    }
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
    }
  }
`

export default MemberExportModal
