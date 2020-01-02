import { useQuery } from '@apollo/react-hooks'
import { Button, Dropdown, Icon, Input, Menu, Table, Tag, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { sum } from 'ramda'
import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import AdminCard from '../../../components/admin/AdminCard'
import { AvatarImage } from '../../../components/common/Image'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import MemberAdminModal, { MemberInfo } from '../../../containers/common/MemberAdminModal'
import { currencyFormatter } from '../../../helpers'
import { UserRole } from '../../../schemas/general'
import types from '../../../types'

const StyledDropdown = styled(Dropdown)`
  margin-bottom: 32px;
  width: 240px;
  color: #585858;
`
const StyledMenuItem = styled(Menu.Item)`
  && {
    padding: 12px 16px;
  }
`
const StyledWrapper = styled.div`
  width: 100%;
  overflow: auto;
  background: white;
  td {
    color: #585858;
  }
`
const StyledMemberName = styled.span`
  color: #585858;
  font-size: 16px;
`
const StyledTag = styled(Tag)`
  && {
    border-radius: 11px;
  }
`

const getColumnSearchProps = ({
  theme,
  onSearch,
}: {
  theme: any
  onSearch: (selectedKeys?: string[], confirm?: () => void) => void
}): ColumnProps<any> => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div className="p-2">
      <Input
        autoFocus
        value={selectedKeys && selectedKeys[0]}
        onChange={e => {
          setSelectedKeys && setSelectedKeys([e.target.value || ''])
          onSearch([e.target.value || ''], confirm)
        }}
        style={{ width: 188, marginBottom: 8, display: 'block' }}
      />
    </div>
  ),
  filterIcon: filtered => <Icon type="search" style={{ color: filtered ? theme['@primary-color'] : undefined }} />,
})

const MemberCollectionAdminPage = () => {
  const theme = useContext(ThemeContext)
  const { loading, error, data } = useQuery<types.GET_MEMBER_COLLECTION>(GET_MEMBER_COLLECTION)

  const [roleFilter, setRoleFilter] = useState<UserRole>('general-member')
  const [nameSearch, setNameSearch] = useState('')
  const [emailSearch, setEmailSearch] = useState('')
  const [visible, setVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null)

  const columns: ColumnProps<MemberInfo>[] = [
    {
      title: '姓名',
      dataIndex: 'id',
      key: 'id',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <AvatarImage src={record.avatarUrl} />
          <StyledMemberName className="ml-3 mr-2">{record.name}</StyledMemberName>
          {record.roles.includes('app-owner') && (
            <StyledTag color="#585858" className="ml-2 mr-0">
              管理者
            </StyledTag>
          )}
          {record.roles.includes('content-creator') && (
            <StyledTag color={theme['@primary-color']} className="ml-2 mr-0">
              創作者
            </StyledTag>
          )}
        </div>
      ),
      ...getColumnSearchProps({
        theme,
        onSearch: (selectedkeys, confirm) => {
          selectedkeys && setNameSearch(selectedkeys[0] || '')
          setEmailSearch('')
        },
      }),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps({
        theme,
        onSearch: (selectedkeys, confirm) => {
          selectedkeys && setEmailSearch(selectedkeys[0] || '')
          setNameSearch('')
        },
      }),
    },
    {
      title: '上次登入',
      dataIndex: 'loginedAt',
      key: 'logined-at',
      render: (text, record, index) => (record.loginedAt ? moment(record.loginedAt).fromNow() : ''),
      sorter: (a, b) => (b.loginedAt ? b.loginedAt.getTime() : 0) - (a.loginedAt ? a.loginedAt.getTime() : 0),
    },
    {
      title: '持有點數',
      dataIndex: 'points',
      key: 'points',
      render: points => `${points} 點`,
    },
    {
      title: '消費金額',
      dataIndex: 'consumption',
      key: 'consumption',
      align: 'right',
      render: currencyFormatter,
      sorter: (a, b) => b.consumption - a.consumption,
    },
  ]

  const dataSource: MemberInfo[] =
    loading || error || !data
      ? []
      : data.member
          .filter(member => nameSearch.length === 0 || (member.name || member.username).includes(nameSearch))
          .filter(member => emailSearch.length === 0 || (member.email || member.username).includes(emailSearch))
          .map(member => ({
            id: member.id,
            avatarUrl: member.picture_url,
            name: member.name || member.username,
            email: member.email,
            loginedAt: member.logined_at ? new Date(member.logined_at) : null,
            roles: member.roles,
            points: member.point_status ? member.point_status.points : 0,
            consumption: sum(
              member.order_logs.map((orderLog: any) => orderLog.order_products_aggregate.aggregate.sum.price || 0),
            ),
          }))
          .sort((a, b) => (b.loginedAt ? b.loginedAt.getTime() : 0) - (a.loginedAt ? a.loginedAt.getTime() : 0))

  const roles: {
    [id in UserRole]: {
      name: string
      count: number
    }
  } = {
    'general-member': {
      name: '全部會員',
      count: dataSource.length,
    },
    'content-creator': {
      name: '創作者',
      count: dataSource.filter((row: any) => row && row.roles.includes('content-creator')).length,
    },
    'app-owner': {
      name: '管理員',
      count: dataSource.filter((row: any) => row && row.roles.includes('app-owner')).length,
    },
  }

  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="user" className="mr-3" />
        <span>會員管理</span>
      </Typography.Title>

      <StyledDropdown
        overlay={
          <Menu>
            {Object.keys(roles).map(roleId => (
              <StyledMenuItem key={roleId} onClick={() => setRoleFilter(roleId as UserRole)}>
                {roles[roleId as UserRole].name} ({roles[roleId as UserRole].count})
              </StyledMenuItem>
            ))}
          </Menu>
        }
      >
        <Button className="d-flex justify-content-between align-items-center">
          {`${roles[roleFilter].name} (${roles[roleFilter].count})`}
          <Icon type="caret-down" />
        </Button>
      </StyledDropdown>

      <AdminCard>
        <StyledWrapper>
          <Table
            columns={columns}
            rowKey="id"
            loading={loading}
            dataSource={dataSource.filter(member => member.roles.includes(roleFilter))}
            pagination={{ position: 'bottom' }}
            rowClassName={() => 'cursor-pointer'}
            onRow={record => ({
              onClick: () => {
                setSelectedMember(record)
                setVisible(true)
              },
            })}
          />
        </StyledWrapper>
      </AdminCard>

      <MemberAdminModal width="24rem" member={selectedMember} visible={visible} onCancel={() => setVisible(false)} />
    </OwnerAdminLayout>
  )
}

const GET_MEMBER_COLLECTION = gql`
  query GET_MEMBER_COLLECTION {
    member {
      id
      picture_url
      name
      username
      email
      logined_at
      roles
      point_status {
        points
      }
      order_logs(where: { status: { _eq: "SUCCESS" } }) {
        order_products_aggregate {
          aggregate {
            sum {
              price
            }
          }
        }
      }
    }
  }
`

export default MemberCollectionAdminPage
