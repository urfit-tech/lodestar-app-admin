import { useQuery } from '@apollo/react-hooks'
import { Button, Dropdown, Icon, Input, Menu, Table, Tag, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { sum } from 'ramda'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { ThemeContext } from 'styled-components'
import AdminCard from '../../../components/admin/AdminCard'
import { AvatarImage } from '../../../components/common/Image'
import { UserRoleName } from '../../../components/common/UserRole'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import MemberAdminModal, { MemberInfo } from '../../../containers/common/MemberAdminModal'
import { currencyFormatter } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
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

const MemberCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const theme = useContext(ThemeContext)
  const { loading, error, data, refetch } = useQuery<types.GET_MEMBER_COLLECTION>(GET_MEMBER_COLLECTION)

  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null)
  const [nameSearch, setNameSearch] = useState('')
  const [emailSearch, setEmailSearch] = useState('')
  const [visible, setVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null)

  const columns: ColumnProps<MemberInfo>[] = [
    {
      title: formatMessage(commonMessages.term.memberName),
      dataIndex: 'id',
      key: 'id',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <AvatarImage src={record.avatarUrl} />
          <StyledMemberName className="ml-3 mr-2">{record.name}</StyledMemberName>
          {record.role === 'app-owner' && (
            <StyledTag color="#585858" className="ml-2 mr-0">
              {formatMessage(commonMessages.term.appOwner)}
            </StyledTag>
          )}
          {record.role === 'content-creator' && (
            <StyledTag color={theme['@primary-color']} className="ml-2 mr-0">
              {formatMessage(commonMessages.term.contentCreator)}
            </StyledTag>
          )}
        </div>
      ),
      ...getColumnSearchProps({
        theme,
        onSearch: (selectedKeys, confirm) => {
          selectedKeys && setNameSearch(selectedKeys[0] || '')
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
        onSearch: (selectedKeys, confirm) => {
          selectedKeys && setEmailSearch(selectedKeys[0] || '')
          setNameSearch('')
        },
      }),
    },
    {
      title: formatMessage(commonMessages.label.lastLogin),
      dataIndex: 'loginedAt',
      key: 'logined-at',
      render: (text, record, index) => (record.loginedAt ? moment(record.loginedAt).fromNow() : ''),
      sorter: (a, b) => (b.loginedAt ? b.loginedAt.getTime() : 0) - (a.loginedAt ? a.loginedAt.getTime() : 0),
    },
    // {
    //   title: formatMessage(commonMessages.label.holdingPoints),
    //   dataIndex: 'points',
    //   key: 'points',
    // },
    {
      title: formatMessage(commonMessages.label.consumption),
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
            role: member.role as UserRole,
            points: member.point_status ? member.point_status.points : 0,
            consumption: sum(
              member.order_logs.map((orderLog: any) => orderLog.order_products_aggregate.aggregate.sum.price || 0),
            ),
          }))
          .sort((a, b) => (b.loginedAt ? b.loginedAt.getTime() : 0) - (a.loginedAt ? a.loginedAt.getTime() : 0))

  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="user" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.members)}</span>
      </Typography.Title>

      <StyledDropdown
        overlay={
          <Menu>
            <StyledMenuItem onClick={() => setRoleFilter(null)}>
              {formatMessage(commonMessages.label.allMembers)} ({dataSource.length})
            </StyledMenuItem>
            <StyledMenuItem onClick={() => setRoleFilter('app-owner')}>
              {formatMessage(commonMessages.term.appOwner)}
              {` (${dataSource.filter(row => row.role === 'app-owner').length})`}
            </StyledMenuItem>
            <StyledMenuItem onClick={() => setRoleFilter('content-creator')}>
              {formatMessage(commonMessages.term.contentCreator)}
              {` (${dataSource.filter(row => row.role === 'content-creator').length})`}
            </StyledMenuItem>
            <StyledMenuItem onClick={() => setRoleFilter('general-member')}>
              {formatMessage(commonMessages.term.generalMember)}
              {` (${dataSource.filter(row => row.role === 'general-member').length})`}
            </StyledMenuItem>
          </Menu>
        }
      >
        <Button className="d-flex justify-content-between align-items-center">
          {roleFilter ? <UserRoleName userRole={roleFilter} /> : formatMessage(commonMessages.label.allMembers)}
          {` (${dataSource.filter(row => (roleFilter ? row.role === roleFilter : true)).length})`}
          <Icon type="caret-down" />
        </Button>
      </StyledDropdown>

      <AdminCard>
        <StyledWrapper>
          <Table
            columns={columns}
            rowKey="id"
            loading={loading}
            dataSource={dataSource.filter(member => (roleFilter ? member.role === roleFilter : true))}
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

      {visible && (
        <MemberAdminModal
          visible
          width="24rem"
          member={selectedMember}
          onCancel={() => setVisible(false)}
          onSuccess={() => {
            refetch()
            setVisible(false)
          }}
        />
      )}
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
      role
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
