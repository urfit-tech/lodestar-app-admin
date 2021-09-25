import Icon, { CaretDownOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Dropdown, Input, Menu, Popover, Select, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import { AvatarImage } from '../../components/common/Image'
import { UserRoleName } from '../../components/common/UserRole'
import AdminLayout from '../../components/layout/AdminLayout'
import MemberCreationModal from '../../components/member/MemberCreationModal'
import MemberExportModal from '../../components/member/MemberExportModal'
import MemberImportModal from '../../components/member/MemberImportModal'
import { currencyFormatter } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useMemberCollection, useMemberRoleCount, useProperty } from '../../hooks/member'
import { usePermissionGroupsDropdownMenu } from '../../hooks/permission'
import { ReactComponent as TableIcon } from '../../images/icon/table.svg'
import { MemberInfoProps, UserRole } from '../../types/member'

const StyledDropdown = styled(Dropdown)`
  width: 100%;
  color: var(--gray-darker);
`
const StyledMenuItem = styled(Menu.Item)`
  && {
    padding: 12px 16px;
  }
`
const StyledButton = styled(Button)`
  && {
    color: var(--gray-darker);
  }
`
const StyledOverlay = styled.div`
  padding: 1rem;
  max-width: 20rem;
  max-height: 20rem;
  overflow: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 0 5px 10px 0 var(--black-10);
`
const OverlayTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-dark);
  font-size: 14px;
`
const FilterWrapper = styled.div`
  columns: 2;
  .ant-checkbox-wrapper.ant-checkbox-wrapper {
    display: block;
    margin-left: 0;
    margin-bottom: 1rem;
  }
`
const TableWrapper = styled.div`
  overflow-x: auto;
  th {
    white-space: nowrap;
  }
  td {
    color: var(--gray-darker);
  }
`
const StyledMemberName = styled.span`
  color: var(--gray-darker);
  font-size: 16px;
  white-space: nowrap;
`
const StyledTag = styled(Tag)`
  && {
    border-radius: 11px;
  }
`

const MemberCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const theme = useAppTheme()
  const { permissions, currentUserRole } = useAuth()
  const { id: appId, enabledModules } = useApp()

  // table column filter
  const { properties } = useProperty()
  const allColumns: ({
    id: string
    title: string
  } | null)[] = [
    { id: 'email', title: 'Email' },
    permissions['MEMBER_PHONE_ADMIN'] ? { id: 'phone', title: formatMessage(commonMessages.label.phone) } : null,
    { id: 'createdAt', title: formatMessage(commonMessages.label.createdDate) },
    { id: 'loginedAt', title: formatMessage(commonMessages.label.lastLogin) },
    { id: 'consumption', title: formatMessage(commonMessages.label.consumption) },
    { id: 'categories', title: formatMessage(commonMessages.label.category) },
    { id: 'tags', title: formatMessage(commonMessages.label.tags) },
    enabledModules.member_assignment && currentUserRole === 'app-owner'
      ? { id: 'managerName', title: formatMessage(memberMessages.label.manager) }
      : null,
    ...properties.map(property => ({
      id: property.id,
      title: property.name,
    })),
  ]
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(['email', 'createdAt', 'consumption'])

  // get member info
  const [fieldFilter, setFieldFilter] = useState<{
    role?: UserRole
    name?: string
    email?: string
    phone?: string
    category?: string
    managerName?: string
    tag?: string
    permissionGroup?: string | null
  }>({})
  const [propertyFilter, setPropertyFilter] = useState<{
    [propertyId: string]: string | undefined
  }>({})
  const { loadingMembers, members, loadMoreMembers, refetchMembers } = useMemberCollection({
    ...fieldFilter,
    properties: Object.keys(propertyFilter).map(propertyId => ({
      id: propertyId,
      value: propertyFilter[propertyId],
    })),
  })
  const [loading, setLoading] = useState(false)
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string | undefined>(undefined)

  // role selector
  const { menu } = useMemberRoleCount(appId, fieldFilter)
  const dropdownMenu = menu.map(menuItem => ({
    ...menuItem,
    text: formatMessage(menuItem.intlKey),
  }))

  const roleSelector = (
    <StyledDropdown
      trigger={['click']}
      overlay={
        <Menu>
          {dropdownMenu.map(item => (
            <StyledMenuItem
              key={item.text}
              onClick={() =>
                setFieldFilter(filter => ({
                  ...filter,
                  role: item.role as UserRole,
                }))
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
          {fieldFilter.role ? (
            <UserRoleName userRole={fieldFilter.role} />
          ) : (
            formatMessage(commonMessages.label.allMembers)
          )}
          {` (${menu.filter(item => item.role === (fieldFilter.role || null))[0].count})`}
        </span>
        <CaretDownOutlined />
      </Button>
    </StyledDropdown>
  )

  // permission group dropdown selector
  const { permissionGroupDropdownMenu } = usePermissionGroupsDropdownMenu(appId, fieldFilter)
  const permissionGroupsDropDownSelector = (
    <Select
      allowClear
      placeholder={formatMessage(commonMessages.label.permissionGroupsSelectorPlaceholder)}
      value={selectedPermissionGroup}
      onChange={value => {
        setSelectedPermissionGroup(value)
        setFieldFilter(filter => ({
          ...filter,
          permissionGroup: value,
        }))
      }}
    >
      {permissionGroupDropdownMenu.map(item => (
        <Select.Option key={item.permissionGroup} value={item.permissionGroup}>
          {item.permissionGroup} ({item.count})
        </Select.Option>
      ))}
    </Select>
  )

  // table
  const searchInputRef = useRef<Input | null>(null)
  const setFilter = (columnId: string, value: string | null, isProperty?: boolean) => {
    if (isProperty) {
      setPropertyFilter({
        ...propertyFilter,
        [columnId]: value ?? undefined,
      })
    } else {
      setFieldFilter({
        ...fieldFilter,
        [columnId]: value ?? undefined,
      })
    }
  }
  const getColumnSearchProps: (field: keyof typeof fieldFilter, isProperty?: boolean) => ColumnProps<MemberInfoProps> =
    (columnId, isProperty) => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2">
          <Input
            ref={searchInputRef}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm()
              setFilter(columnId, selectedKeys[0] as string, isProperty)
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <div>
            <Button
              type="primary"
              onClick={() => {
                confirm()
                setFilter(columnId, selectedKeys[0] as string, isProperty)
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
                setFilter(columnId, null, isProperty)
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
      title: formatMessage(commonMessages.label.memberName),
      key: 'name',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <AvatarImage size="32px" src={record.avatarUrl} className="flex-shrink-0 mr-3" />
          <StyledMemberName>{record.name}</StyledMemberName>
          {record.role === 'app-owner' && (
            <StyledTag color="#585858" className="ml-2 mr-0">
              {formatMessage(commonMessages.label.appOwner)}
            </StyledTag>
          )}
          {record.role === 'content-creator' && (
            <StyledTag color={theme['@primary-color']} className="ml-2 mr-0">
              {formatMessage(commonMessages.label.contentCreator)}
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
      key: 'phone',
      render: (text, record, index) => record.phones.join(', '),
      ...getColumnSearchProps('phone'),
    },
    {
      title: formatMessage(commonMessages.label.createdDate),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text, record, index) => (record.createdAt ? moment(record.createdAt).format('YYYY-MM-DD') : ''),
      sorter: (a, b) => (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0),
    },
    {
      title: formatMessage(commonMessages.label.lastLogin),
      dataIndex: 'loginedAt',
      key: 'loginedAt',
      render: (text, record, index) => (record.loginedAt ? moment(record.loginedAt).format('YYYY-MM-DD HH:mm:ss') : ''),
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
    {
      title: formatMessage(commonMessages.label.category),
      dataIndex: 'categories',
      key: 'categories',
      render: (text, record, index) => record.categories.map(category => category.name).join(', '),
      ...getColumnSearchProps('category'),
    },
    {
      title: formatMessage(commonMessages.label.tags),
      dataIndex: 'tags',
      key: 'tags',
      render: (text, record, index) => (
        <>
          {record.tags.map(tag => (
            <Tag key={tag} className="mr-1 mb-1">
              {tag}
            </Tag>
          ))}
        </>
      ),
      ...getColumnSearchProps('tag'),
    },
    {
      title: formatMessage(memberMessages.label.manager),
      key: 'managerName',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <StyledMemberName>{record.manager?.name}</StyledMemberName>
        </div>
      ),
      ...getColumnSearchProps('managerName'),
    },
    ...properties
      .filter(property => visibleColumnIds.includes(property.id))
      .map(property => {
        const column: ColumnProps<MemberInfoProps> = {
          title: property.name,
          key: property.id,
          render: (text, record, index) => record.properties[property.id],
          ...getColumnSearchProps(property.id, true),
        }
        return column
      }),
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.members)}</span>
      </AdminPageTitle>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex">
          <div className="mr-3">{roleSelector}</div>
          {enabledModules.permission_group && currentUserRole === 'app-owner' && (
            <div>{permissionGroupsDropDownSelector}</div>
          )}
        </div>

        <div className="d-flex">
          <Popover
            trigger="click"
            placement="bottomLeft"
            content={
              <StyledOverlay>
                <OverlayTitle>{formatMessage(memberMessages.label.fieldVisible)}</OverlayTitle>
                <Checkbox.Group value={visibleColumnIds} onChange={value => setVisibleColumnIds(value as string[])}>
                  <FilterWrapper>
                    {allColumns.map(column =>
                      column ? (
                        <Checkbox key={column.id} value={column.id}>
                          {column.title}
                        </Checkbox>
                      ) : null,
                    )}
                  </FilterWrapper>
                </Checkbox.Group>
              </StyledOverlay>
            }
          >
            <StyledButton type="link" icon={<Icon component={() => <TableIcon />} />} className="mr-2">
              {formatMessage(memberMessages.label.field)}
            </StyledButton>
          </Popover>
          <div className="mr-2">
            {permissions['MEMBER_CREATE'] && <MemberCreationModal onRefetch={refetchMembers} />}
          </div>
          <div className="mr-2">
            <MemberImportModal appId={appId} filter={fieldFilter} />
          </div>
          <MemberExportModal appId={appId} filter={fieldFilter} />
        </div>
      </div>

      <AdminCard className="mb-5">
        <TableWrapper>
          <Table
            columns={columns.filter(column => column.key === 'name' || visibleColumnIds.includes(column.key as string))}
            rowKey="id"
            loading={loadingMembers}
            dataSource={members}
            pagination={false}
            rowClassName={() => 'cursor-pointer'}
            onRow={record => ({
              onClick: () => window.open(`${process.env.PUBLIC_URL}/members/${record.id}`, '_blank'),
            })}
          />
        </TableWrapper>

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
      </AdminCard>
    </AdminLayout>
  )
}

export default MemberCollectionAdminPage
