import { useQuery } from '@apollo/react-hooks'
import { Button, Checkbox, Dropdown, Form, Icon, Input, Menu, Table, Tag, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { sum } from 'ramda'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { ThemeContext } from 'styled-components'
import AdminCard from '../../../components/admin/AdminCard'
import AdminModal from '../../../components/admin/AdminModal'
import { AvatarImage } from '../../../components/common/Image'
import { UserRoleName } from '../../../components/common/UserRole'
import AdminLayout from '../../../components/layout/AdminLayout'
import MemberAdminModal, { MemberInfo } from '../../../containers/common/MemberAdminModal'
import { currencyFormatter, downloadCSV, toCSV } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { UserRole } from '../../../schemas/general'
import types from '../../../types'

const StyledDropdown = styled(Dropdown)`
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
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(['name', 'email'])

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

  const roleSelectDropdown = (
    <StyledDropdown
      trigger={['click']}
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
        <span>
          {roleFilter ? <UserRoleName userRole={roleFilter} /> : formatMessage(commonMessages.label.allMembers)}
          {` (${dataSource.filter(member => !roleFilter || member.role === roleFilter).length})`}
        </span>
        <Icon type="caret-down" />
      </Button>
    </StyledDropdown>
  )

  const options = [
    { label: formatMessage(commonMessages.term.memberName), value: 'name' },
    { label: 'Email', value: 'email' },
    { label: formatMessage(commonMessages.label.lastLogin), value: 'lastLogin' },
    { label: formatMessage(commonMessages.label.consumption), value: 'consumption' },
  ]

  const exportMemberList = () => {
    const data: string[][] = [
      options.filter(option => selectedExportFields.some(field => field === option.value)).map(option => option.label),
      ...dataSource
        .filter(member => !roleFilter || member.role === roleFilter)
        .map(member => {
          const row: string[] = []
          selectedExportFields.some(field => field === 'name') && row.push(member.name)
          selectedExportFields.some(field => field === 'email') && row.push(member.email)
          selectedExportFields.some(field => field === 'lastLogin') &&
            row.push(member.loginedAt ? moment(member.loginedAt).format('YYYYMMDD HH:mm') : '')
          selectedExportFields.some(field => field === 'consumption') && row.push(`${member.consumption}`)
          return row
        }),
    ]

    downloadCSV('members', toCSV(data))
  }

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="user" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.members)}</span>
      </Typography.Title>

      <div className="d-flex align-items-center justify-content-between mb-4">
        {roleSelectDropdown}

        <div>
          <AdminModal
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon="download" onClick={() => setVisible(true)}>
                {formatMessage(commonMessages.ui.downloadMemberList)}
              </Button>
            )}
            title={formatMessage(commonMessages.ui.downloadMemberList)}
            cancelText={formatMessage(commonMessages.ui.cancel)}
            okText={formatMessage(commonMessages.ui.export)}
            onOk={() => exportMemberList()}
          >
            <Form hideRequiredMark colon={false}>
              <Form.Item label={formatMessage(commonMessages.label.roleType)}>{roleSelectDropdown}</Form.Item>
              <Form.Item label={formatMessage(commonMessages.label.exportFields)}>
                <Checkbox.Group
                  options={options}
                  value={selectedExportFields}
                  onChange={checkedValues => setSelectedExportFields(checkedValues.map(v => v.toString()))}
                />
              </Form.Item>
            </Form>
          </AdminModal>
        </div>
      </div>

      <AdminCard>
        <StyledWrapper>
          <Table
            columns={columns}
            rowKey="id"
            loading={loading}
            dataSource={dataSource.filter(member => !roleFilter || member.role === roleFilter)}
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
    </AdminLayout>
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
