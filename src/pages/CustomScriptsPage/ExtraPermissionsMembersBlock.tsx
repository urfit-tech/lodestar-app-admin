import { ExportOutlined, LinkOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Skeleton, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import gql from 'graphql-tag'
import { AdminBlock, AdminBlockTitle } from 'lodestar-app-admin/src/components/admin'
import { downloadCSV, toCSV } from 'lodestar-app-admin/src/helpers'
import { permissionMessages } from 'lodestar-app-admin/src/helpers/translation'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'

type MemberProps = {
  id: string
  email: string
  name: string
  permissionIds: string[]
}

const ExtraPermissionsMembersBlock: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { loadingMembers, errorMembers, members } = useExtraPermissionsMembers()

  if (loadingMembers) {
    return <Skeleton active />
  }

  if (errorMembers) {
    return <div>讀取錯誤</div>
  }

  const columns: ColumnsType<MemberProps> = [
    {
      key: 'name',
      title: '姓名',
      render: (_, record) => (
        <>
          <span>{record.name}</span>
          <a href={`/admin/members/${record.id}/permission`} target="_blank" rel="noreferrer" className="ml-2">
            <LinkOutlined />
          </a>
        </>
      ),
    },
    {
      dataIndex: 'email',
      title: 'Email',
    },
    {
      key: 'permissions',
      title: '權限',
      render: (_, record) =>
        record.permissionIds
          .map(permissionId => formatMessage(permissionMessages[permissionId as keyof typeof permissionMessages]))
          .join(', '),
    },
  ]

  const handleExport = () => {
    const data: string[][] = [
      columns.map(column => column.title?.toString() || ''),
      ...members.map(member => [
        member.name,
        member.email,
        member.permissionIds
          .map(permissionId => formatMessage(permissionMessages[permissionId as keyof typeof permissionMessages]))
          .join(', '),
      ]),
    ]
    downloadCSV('extra-permissions-members.csv', toCSV(data))
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>擁有其他權限的會員</AdminBlockTitle>

      <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
        匯出
      </Button>
      <Table<MemberProps>
        rowKey="id"
        rowClassName="no-wrap"
        columns={columns}
        dataSource={members}
        pagination={false}
        scroll={{ x: true }}
      />
    </AdminBlock>
  )
}

const useExtraPermissionsMembers = () => {
  const { loading, error, data, refetch } =
    useQuery<hasura.GET_EXTRA_PERMISSIONS_MEMBERS>(GET_EXTRA_PERMISSIONS_MEMBERS)

  const members: MemberProps[] = data
    ? [...data.generalMember, ...data.contentCreator].map(v => ({
        id: v.id,
        email: v.email,
        name: v.name || v.username,
        permissionIds: v.member_permission_extras.map(v => v.permission_id),
      }))
    : []

  return {
    loadingMembers: loading,
    errorMembers: error,
    members,
    refetchMembers: refetch,
  }
}

const GET_EXTRA_PERMISSIONS_MEMBERS = gql`
  query GET_EXTRA_PERMISSIONS_MEMBERS {
    generalMember: member(
      where: { app_id: { _eq: "xuemi" }, role: { _eq: "general-member" }, member_permission_extras: {} }
      order_by: [{ email: asc }]
    ) {
      id
      email
      name
      username
      member_permission_extras {
        permission_id
      }
    }
    contentCreator: member(
      where: {
        app_id: { _eq: "xuemi" }
        role: { _eq: "content-creator" }
        member_permission_extras: {
          permission_id: {
            _nin: [
              "BACKSTAGE_ENTER"
              "SALES_ADMIN"
              "PROGRAM_ADMIN"
              "PROGRAM_ISSUE_ADMIN"
              "APPOINTMENT_PLAN_ADMIN"
              "APPOINTMENT_PERIOD_ADMIN"
              "ACTIVITY_ADMIN"
              "PRACTICE_ADMIN"
            ]
          }
        }
      }
      order_by: [{ email: asc }]
    ) {
      id
      email
      name
      username
      member_permission_extras(
        where: {
          permission_id: {
            _nin: [
              "BACKSTAGE_ENTER"
              "SALES_ADMIN"
              "PROGRAM_ADMIN"
              "PROGRAM_ISSUE_ADMIN"
              "APPOINTMENT_PLAN_ADMIN"
              "APPOINTMENT_PERIOD_ADMIN"
              "ACTIVITY_ADMIN"
              "PRACTICE_ADMIN"
            ]
          }
        }
      ) {
        permission_id
      }
    }
  }
`

export default ExtraPermissionsMembersBlock
