import { useQuery } from '@apollo/react-hooks'
import { Button, Dropdown, Icon, Input, Menu, Table, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { sum } from 'ramda'
import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import AdminCard from '../../../components/common/AdminCard'
import MemberAvatar from '../../../components/common/MemberAvatar'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { currencyFormatter } from '../../../helpers'
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
`

const StyledTable = styled(Table)`
  td {
    color: #585858;
  }
`

const StyledMemberName = styled.span`
  color: #585858;
  font-size: 16px;
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
  const { loading, data } = useQuery<types.GET_MEMBER_COLLECTION>(GET_MEMBER_COLLECTION)
  const [roleFileter, setRoleFilter] = useState(0)
  const [nameSearch, setNameSearch] = useState('')
  const [emailSearch, setEmailSearch] = useState('')

  const columns: ColumnProps<any>[] = [
    {
      title: '姓名',
      dataIndex: 'id',
      key: 'id',
      render: id => (
        <MemberAvatar
          memberId={id}
          renderText={member => <StyledMemberName className="ml-3">{member.name}</StyledMemberName>}
        />
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
      dataIndex: 'logined_at',
      key: 'logined-at',
      render: logined_at => (logined_at ? moment(logined_at).fromNow() : ''),
      // defaultSortOrder: 'ascend',
      sorter: (a, b) => new Date(b.logined_at).getTime() - new Date(a.logined_at).getTime(),
    },
    {
      title: '持有點數',
      dataIndex: 'points',
      key: 'points',
      render: points => `${points}點`,
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

  const dataSource =
    data && data.member
      ? data.member
          .filter((value: any) => nameSearch.length === 0 || (value.name || '').includes(nameSearch))
          .filter((value: any) => emailSearch.length === 0 || (value.email || '').includes(emailSearch))
          .map((value: any) => ({
            ...value,
            points: value.point_status ? value.point_status.points : 0,
            consumption: sum(
              value.order_logs.map((orderLog: any) => orderLog.order_products_aggregate.aggregate.sum.price || 0),
            ),
          }))
          .sort((a: any, b: any) => new Date(b.logined_at).getTime() - new Date(a.logined_at).getTime())
      : []

  const roles = [
    {
      id: 'general-member',
      name: '全部會員',
      count: dataSource.length,
    },
    {
      id: 'content-creator',
      name: '創作者',
      count: dataSource.filter((row: any) => row && row.roles.includes('content-creator')).length,
    },
    {
      id: 'app-owner',
      name: '管理員',
      count: dataSource.filter((row: any) => row && row.roles.includes('app-owner')).length,
    },
  ]

  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="user" className="mr-3" />
        <span>會員管理</span>
      </Typography.Title>

      <StyledDropdown
        overlay={
          <Menu>
            {roles.map((role, index) => (
              <StyledMenuItem
                key={role.id}
                onClick={() => {
                  setRoleFilter(index)
                }}
              >{`${role.name} (${role.count})`}</StyledMenuItem>
            ))}
          </Menu>
        }
      >
        <Button className="d-flex justify-content-between align-items-center">
          {`${roles[roleFileter].name} (${roles[roleFileter].count})`}
          <Icon type="caret-down" />
        </Button>
      </StyledDropdown>

      <AdminCard>
        <StyledWrapper>
          <StyledTable
            columns={columns}
            rowKey="id"
            loading={loading}
            dataSource={dataSource.filter((row: any) => row.roles.includes(roles[roleFileter].id)) || []}
            pagination={{ position: 'bottom' }}
          />
        </StyledWrapper>
      </AdminCard>
    </OwnerAdminLayout>
  )
}

const GET_MEMBER_COLLECTION = gql`
  query GET_MEMBER_COLLECTION {
    member {
      id
      email
      logined_at
      name
      roles
      username
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
