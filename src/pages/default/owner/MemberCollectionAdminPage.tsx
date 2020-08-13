import { CaretDownOutlined, DownloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Dropdown, Form, Input, Menu, Pagination, Table, Tag } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { ThemeContext } from 'styled-components'
import { AdminPageTitle } from '../../../components/admin'
import AdminCard from '../../../components/admin/AdminCard'
import AdminModal from '../../../components/admin/AdminModal'
import { AvatarImage } from '../../../components/common/Image'
import MemberAdminModal, { MemberInfoProps } from '../../../components/common/MemberAdminModal'
import { UserRoleName } from '../../../components/common/UserRole'
import AdminLayout from '../../../components/layout/AdminLayout'
import AppContext from '../../../contexts/AppContext'
import { currencyFormatter, downloadCSV, toCSV } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { useMemberCollection, useMemberRoleCount } from '../../../hooks/member'
import { UserRole } from '../../../types/general'

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
  filterIcon: filtered => <SearchOutlined style={{ color: filtered ? theme['@primary-color'] : undefined }} />,
})

const MemberCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const theme = useContext(ThemeContext)

  // pagination
  const [currentPage, setCurrentPage] = useState(1)

  // get member info
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null)
  const [offset, setOffset] = useState(0)
  const [nameSearch, setNameSearch] = useState<string | null>(null)
  const [emailSearch, setEmailSearch] = useState<string | null>(null)
  const { loading, dataSource, refetch } = useMemberCollection({
    role: roleFilter,
    offset,
    limit: 10,
    nameSearch,
    emailSearch,
  })

  // dropdown
  const { id: appId } = useContext(AppContext)
  const { menu } = useMemberRoleCount({ appId, nameSearch, emailSearch })
  const dropdownMenu = menu.map(menuItem => ({
    ...menuItem,
    text: formatMessage(menuItem.text),
  }))

  const roleSelectDropdown = (
    <StyledDropdown
      trigger={['click']}
      overlay={
        <Menu>
          {dropdownMenu.map(item => (
            <StyledMenuItem
              key={item.text}
              onClick={() => {
                setRoleFilter(item.role as UserRole)
                setOffset(0)
                setCurrentPage(1)
              }}
            >
              {item.text} ({item.count})
            </StyledMenuItem>
          ))}
        </Menu>
      }
    >
      <Button className="d-flex justify-content-between align-items-center">
        <span>
          {roleFilter ? <UserRoleName userRole={roleFilter} /> : formatMessage(commonMessages.label.allMembers)}
          {` (${menu.filter(item => item.role === roleFilter)[0].count})`}
        </span>
        <CaretDownOutlined />
      </Button>
    </StyledDropdown>
  )

  // table
  const columns: ColumnProps<MemberInfoProps>[] = [
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
          selectedKeys && setNameSearch(selectedKeys[0].length ? selectedKeys[0] : null)
          setOffset(0)
          setCurrentPage(1)
          setEmailSearch(null)
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
          selectedKeys && setEmailSearch(selectedKeys[0].length ? selectedKeys[0] : null)
          setOffset(0)
          setCurrentPage(1)
          setNameSearch(null)
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
    {
      title: formatMessage(commonMessages.label.consumption),
      dataIndex: 'consumption',
      key: 'consumption',
      align: 'right',
      render: currencyFormatter,
      sorter: (a, b) => b.consumption - a.consumption,
    },
  ]

  // MemberAdminModal
  const [isMemberAdminModalVisible, setMemberAdminModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberInfoProps | null>(null)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.members)}</span>
      </AdminPageTitle>

      <div className="d-flex align-items-center justify-content-between mb-4">
        {roleSelectDropdown}

        <MemberExportModal role={roleFilter} nameSearch={nameSearch} emailSearch={emailSearch}>
          {roleSelectDropdown}
        </MemberExportModal>
      </div>

      <AdminCard className="mb-5">
        <StyledWrapper>
          <Table
            columns={columns}
            rowKey="id"
            loading={loading}
            dataSource={dataSource}
            pagination={false}
            rowClassName={() => 'cursor-pointer'}
            onRow={record => ({
              onClick: () => {
                setSelectedMember(record)
                setMemberAdminModalVisible(true)
              },
            })}
          />
          <div className="mt-4 d-flex justify-content-end">
            <Pagination
              defaultCurrent={1}
              current={currentPage}
              total={menu.filter(item => item.role === roleFilter)[0].count}
              onChange={page => {
                setOffset((page - 1) * 10)
                setCurrentPage(page)
              }}
            />
          </div>
        </StyledWrapper>
      </AdminCard>

      {isMemberAdminModalVisible && (
        <MemberAdminModal
          visible
          width="24rem"
          member={selectedMember}
          onCancel={() => setMemberAdminModalVisible(false)}
          onSuccess={() => {
            refetch()
            setMemberAdminModalVisible(false)
          }}
        />
      )}
    </AdminLayout>
  )
}

const MemberExportModal: React.FC<{
  role: UserRole | null
  nameSearch: string | null
  emailSearch: string | null
}> = ({ role, nameSearch, emailSearch, children }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { loading, dataSource } = useMemberCollection({ role, nameSearch, emailSearch })
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
      ...dataSource.map(member => {
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
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.downloadMemberList)}
        </Button>
      )}
      confirmLoading={loading}
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
