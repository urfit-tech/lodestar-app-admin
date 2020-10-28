import { CaretDownOutlined, ExportOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Dropdown, Form, Input, Menu, Table, Tag } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React, { useContext, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { ThemeContext } from 'styled-components'
import { AdminPageTitle } from '../../../components/admin'
import AdminCard from '../../../components/admin/AdminCard'
import AdminModal from '../../../components/admin/AdminModal'
import { AvatarImage } from '../../../components/common/Image'
import { UserRoleName } from '../../../components/common/UserRole'
import AdminLayout from '../../../components/layout/AdminLayout'
import AppContext from '../../../contexts/AppContext'
import { currencyFormatter, downloadCSV, toCSV } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { useMemberCollection, useMemberRoleCount } from '../../../hooks/member'
import { MemberInfoProps, UserRole } from '../../../types/member'

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

const MemberCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const theme = useContext(ThemeContext)
  const { id: appId } = useContext(AppContext)

  // get member info
  const searchInputRef = useRef<Input | null>(null)
  const [filter, setFilter] = useState<{
    role?: UserRole
    name?: string
    email?: string
  }>({})
  const { loadingMembers, members, loadMoreMembers } = useMemberCollection(filter)
  const [loading, setLoading] = useState(false)

  // dropdown
  const { menu } = useMemberRoleCount(appId, filter)
  const dropdownMenu = menu.map(menuItem => ({
    ...menuItem,
    text: formatMessage(menuItem.intlKey),
  }))

  const roleSelectDropdown = (
    <StyledDropdown
      trigger={['click']}
      overlay={
        <Menu>
          {dropdownMenu.map(item => (
            <StyledMenuItem
              key={item.text}
              onClick={() =>
                setFilter({
                  ...filter,
                  role: item.role as UserRole,
                })
              }
            >
              {item.text} ({item.count})
            </StyledMenuItem>
          ))}
        </Menu>
      }
    >
      <Button className="d-flex justify-content-between align-items-center">
        <span>
          {filter.role ? <UserRoleName userRole={filter.role} /> : formatMessage(commonMessages.label.allMembers)}
          {` (${menu.filter(item => item.role === (filter.role || null))[0].count})`}
        </span>
        <CaretDownOutlined />
      </Button>
    </StyledDropdown>
  )

  // table
  const getColumnSearchProps: (dataIndex: keyof MemberInfoProps) => ColumnProps<MemberInfoProps> = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={searchInputRef}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm()
            setFilter(filter => ({
              ...filter,
              [dataIndex]: selectedKeys[0],
            }))
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div>
          <Button
            type="primary"
            onClick={() => {
              confirm()
              setFilter(filter => ({
                ...filter,
                [dataIndex]: selectedKeys[0],
              }))
            }}
            icon={<SearchOutlined />}
            size="small"
            className="mr-2"
            style={{ width: 90 }}
          >
            {formatMessage(commonMessages.ui.search)}
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters()
              setFilter(filter => ({
                ...filter,
                [dataIndex]: undefined,
              }))
            }}
            size="small"
            style={{ width: 90 }}
          >
            {formatMessage(commonMessages.ui.reset)}
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilterDropdownVisibleChange: visible => visible && setTimeout(() => searchInputRef.current?.select(), 100),
  })

  const columns: ColumnProps<MemberInfoProps>[] = [
    {
      title: formatMessage(commonMessages.term.memberName),
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <AvatarImage size="32px" src={record.avatarUrl} className="flex-shrink-0 mr-3" />
          <StyledMemberName>{record.name}</StyledMemberName>
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
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
    },
    {
      title: formatMessage(commonMessages.label.phone),
      dataIndex: 'phone',
      render: (text, record, index) => record.phones.join(','),
    },
    {
      title: formatMessage(commonMessages.label.createdDate),
      dataIndex: 'createdAt',
      render: (text, record, index) => (record.createdAt ? moment(record.createdAt).format('YYYY-MM-DD') : ''),
      sorter: (a, b) => (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0),
    },
    {
      title: formatMessage(commonMessages.label.consumption),
      dataIndex: 'consumption',
      key: 'consumption',
      align: 'right',
      render: currencyFormatter,
      sorter: (a, b) => b.consumption - a.consumption,
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.members)}</span>
      </AdminPageTitle>

      <div className="d-flex align-items-center justify-content-between mb-4">
        {roleSelectDropdown}

        <MemberExportModal filter={filter}>{roleSelectDropdown}</MemberExportModal>
      </div>

      <AdminCard className="mb-5">
        <StyledWrapper>
          <Table
            columns={columns}
            rowKey="id"
            loading={loadingMembers}
            dataSource={members}
            pagination={false}
            rowClassName={() => 'cursor-pointer'}
            onRow={record => ({
              onClick: () => window.open(`/admin/members/${record.id}`, '_blank'),
            })}
          />
          {!loadingMembers && loadMoreMembers && (
            <div className="text-center mt-4">
              <Button
                loading={loading}
                onClick={() => {
                  setLoading(true)
                  loadMoreMembers().finally(() => setLoading(false))
                }}
              >
                {formatMessage(commonMessages.ui.showMore)}
              </Button>
            </div>
          )}
        </StyledWrapper>
      </AdminCard>
    </AdminLayout>
  )
}

const MemberExportModal: React.FC<{
  filter?: {
    role?: UserRole
    name?: string
    email?: string
  }
}> = ({ filter, children }) => {
  const [form] = useForm()
  const { formatMessage } = useIntl()
  const { loadingMembers, members } = useMemberCollection(filter)
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(['name', 'email'])

  const options = [
    { label: formatMessage(commonMessages.term.memberName), value: 'name' },
    { label: 'Email', value: 'email' },
    { label: formatMessage(commonMessages.label.lastLogin), value: 'lastLogin' },
    { label: formatMessage(commonMessages.label.consumption), value: 'consumption' },
  ]

  const exportMemberList = () => {
    const data: string[][] = [
      options.filter(option => selectedExportFields.some(field => field === option.value)).map(option => option.label),
      ...members.map(member => {
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
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon={<ExportOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.export)}
        </Button>
      )}
      confirmLoading={loadingMembers}
      title={formatMessage(commonMessages.ui.downloadMemberList)}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okText={formatMessage(commonMessages.ui.export)}
      onOk={() => exportMemberList()}
    >
      <Form form={form} layout="vertical" colon={false} hideRequiredMark>
        <Form.Item label={formatMessage(commonMessages.label.roleType)}>{children}</Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.exportFields)}>
          <Checkbox.Group
            options={options}
            value={selectedExportFields}
            onChange={checkedValues => setSelectedExportFields(checkedValues.map(v => v.toString()))}
          />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberCollectionAdminPage
