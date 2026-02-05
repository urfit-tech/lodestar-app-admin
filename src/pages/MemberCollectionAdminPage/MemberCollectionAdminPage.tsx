import Icon, { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Input, Popover, Spin, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult, SortOrder } from 'antd/lib/table/interface'
import { isEmpty, negate, pickBy } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import { AvatarImage } from '../../components/common/Image'
import AdminLayout from '../../components/layout/AdminLayout'
import MemberCreationModal from '../../components/member/MemberCreationModal'
import MemberExportModal from '../../components/member/MemberExportModal'
import MemberImportModal from '../../components/member/MemberImportModal'
import OldMemberExportModal from '../../components/member/OldMemberExportModal'
import OldMemberImportModal from '../../components/member/OldMemberImportModal'
import { currencyFormatter, handleError } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useMemberCollection, useMembers, useProperty } from '../../hooks/member'
import { TableIcon } from '../../images/icon'
import { MemberCollectionProps, MemberInfoProps, ResponseMembers, UserRole } from '../../types/member'
import ForbiddenPage from '../ForbiddenPage'
import DuplicatePhoneBlock from './DuplicatePhoneBlock'
import PermissionGroupsDropDownSelector from './PermissionGroupsDropDownSelector'
import RoleSelector from './RoleSelector'

export type FieldFilter = {
  role?: UserRole
  name?: string
  email?: string
  phone?: string
  username?: string
  category?: string
  managerName?: string
  tag?: string
  permissionGroup?: string
  properties?: {
    [propertyId: string]: string | undefined
  }
}

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
  const { isAuthenticating, permissions, authToken } = useAuth()
  const { loading } = useApp()
  const [fieldFilter, setFieldFilter] = useState<FieldFilter>({})
  const limit = 10
  const { loading: loadingMembers, members, fetchMembers, nextToken } = useMembers(authToken || '', limit, fieldFilter)

  if (!isAuthenticating && !permissions.MEMBER_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.members)}</span>
      </AdminPageTitle>
      {loading || isAuthenticating || !authToken ? (
        <Spin />
      ) : (
        <MemberCollectionBlock
          members={members}
          fieldFilter={fieldFilter}
          setFieldFilter={setFieldFilter}
          nextToken={nextToken}
          loadingMembers={loadingMembers}
          limit={limit}
          fetchMembers={fetchMembers}
        />
      )}
    </AdminLayout>
  )
}

const MemberSelectControlPanel: React.FC<{
  permissions: { [key: string]: boolean }
  enabledModules: { [key: string]: boolean | undefined }
  fieldFilter: FieldFilter
  setFieldFilter: (filter: FieldFilter) => void
}> = ({ permissions, enabledModules, fieldFilter, setFieldFilter }) => {
  return (
    <div className="d-flex">
      {permissions.MEMBER_ROLE_SELECT && (
        <div className="mr-3">
          <RoleSelector fieldFilter={fieldFilter} onFiledFilterChange={setFieldFilter} />
        </div>
      )}

      {enabledModules.permission_group && permissions.MEMBER_PERMISSION_GROUP_SELECT ? (
        <PermissionGroupsDropDownSelector fieldFilter={fieldFilter} onFiledFilterChange={setFieldFilter} />
      ) : null}
    </div>
  )
}

const MemberImportExportControlPanel: React.FC<{
  permissions: { [key: string]: boolean }
  enabledModules: { [key: string]: boolean | undefined }
  fieldFilter: FieldFilter
  exportImportVersionTag: boolean
  appId: string
  sortOrder: {
    createdAt: SortOrder
    loginedAt: SortOrder
    consumption: SortOrder
  }
  visibleColumnIds: string[]
  columns: { key: string; title: string }[]
}> = ({
  permissions,
  enabledModules,
  fieldFilter,
  exportImportVersionTag,
  appId,
  sortOrder,
  visibleColumnIds,
  columns,
}) => {
  return (
    <>
      <div className="mr-2">{permissions.MEMBER_CREATE && <MemberCreationModal />}</div>
      <div className="mr-2">
        {exportImportVersionTag ? (
          <MemberImportModal />
        ) : (
          <OldMemberImportModal /> // TODO: remove this after new export import completed
        )}
      </div>
      {enabledModules.member_info_export ? (
        exportImportVersionTag ? (
          <MemberExportModal appId={appId} filter={fieldFilter} sortOrder={sortOrder} />
        ) : (
          <OldMemberExportModal // TODO: remove this after new export import completed
            appId={appId}
            visibleFields={visibleColumnIds}
            columns={columns}
            filter={fieldFilter}
            sortOrder={sortOrder}
          />
        )
      ) : null}
    </>
  )
}

export const MemberFieldFilter: React.FC<{
  allColumns: ({
    id: string
    title: string
  } | null)[]
  visibleColumnIds: string[]
  setVisibleColumnIds: (value: string[]) => void
}> = ({ allColumns, visibleColumnIds, setVisibleColumnIds }) => {
  const { formatMessage } = useIntl()
  return (
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
      <StyledButton type="link" icon={<Icon component={() => <TableIcon />} />}>
        {formatMessage(memberMessages.label.field)}
      </StyledButton>
    </Popover>
  )
}

export const MemberCollectionBlock: React.VFC<{
  members: MemberCollectionProps[]
  loadingMembers: boolean
  fieldFilter: FieldFilter
  setFieldFilter: (filter: FieldFilter) => void
  nextToken: string | null
  limit: number
  fetchMembers: (
    filter: FieldFilter | undefined,
    option: { limit?: number | undefined; nextToken?: string | null | undefined },
  ) => Promise<ResponseMembers>
}> = ({ members, nextToken, limit, loadingMembers, fieldFilter, setFieldFilter, fetchMembers }) => {
  const { formatMessage } = useIntl()
  const { permissions, currentUserRole } = useAuth()
  const { id: appId, enabledModules, settings } = useApp()
  const exportImportVersionTag = settings['feature.member.import_export'] === '1' // TODO: remove this after new export import completed
  const MEMBER_VISIBLE_COLUMNS_STORAGE_KEY = 'lodestar.member.visibleColumnIds'
  const DEFAULT_VISIBLE_COLUMN_IDS = ['#', 'email', 'createdAt', 'consumption']
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(MEMBER_VISIBLE_COLUMNS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_VISIBLE_COLUMN_IDS
    } catch {
      return DEFAULT_VISIBLE_COLUMN_IDS
    }
  })
  const handleVisibleColumnIdsChange = (ids: string[]) => {
    setVisibleColumnIds(ids)
    localStorage.setItem(MEMBER_VISIBLE_COLUMNS_STORAGE_KEY, JSON.stringify(ids))
  }

  const [sortOrder, setSortOrder] = useState<{
    createdAt: SortOrder
    loginedAt: SortOrder
    consumption: SortOrder
  }>({
    createdAt: null,
    loginedAt: null,
    consumption: null,
  })

  const { properties } = useProperty()

  const [currentMembers, setCurrentMembers] = useState<
    {
      id: string
      pictureUrl: string | null
      name: string
      email: string
      role: 'general-member' | 'content-creator' | 'app-owner'
      createdAt: Date
      username: string
      loginedAt: Date | null
      managerId: string | null
    }[]
  >(members)

  useEffect(() => {
    if (!loadingMembers && members) {
      setCurrentMembers(members)
    }
  }, [loadingMembers, members])

  const allColumns: ({
    id: string
    title: string
  } | null)[] = [
    { id: 'email', title: 'Email' },
    permissions['MEMBER_PHONE_ADMIN'] ? { id: 'phone', title: formatMessage(commonMessages.label.phone) } : null,
    { id: 'username', title: formatMessage(commonMessages.label.account) },
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

  // for OldMemberExportModal
  const columns: { key: string; title: string }[] = [
    { key: '#', title: '#' },
    { key: 'name', title: formatMessage(commonMessages.label.memberName) },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: formatMessage(commonMessages.label.phone) },
    { key: 'username', title: formatMessage(commonMessages.label.account) },
    { key: 'createdAt', title: formatMessage(commonMessages.label.createdDate) },
    { key: 'loginedAt', title: formatMessage(commonMessages.label.lastLogin) },
    { key: 'consumption', title: formatMessage(commonMessages.label.consumption) },
    { key: 'categories', title: formatMessage(commonMessages.label.category) },
    { key: 'tags', title: formatMessage(commonMessages.label.tags) },
    { key: 'managerName', title: formatMessage(memberMessages.label.manager) },
    ...properties
      .filter(property => visibleColumnIds.includes(property.id))
      .map(property => ({ key: property.id, title: property.name })),
  ]

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <MemberSelectControlPanel
          enabledModules={enabledModules}
          permissions={permissions}
          fieldFilter={fieldFilter}
          setFieldFilter={setFieldFilter}
        />

        <div className="d-flex">
          <MemberFieldFilter
            allColumns={allColumns}
            visibleColumnIds={visibleColumnIds}
            setVisibleColumnIds={handleVisibleColumnIdsChange}
          />
          <MemberImportExportControlPanel
            permissions={permissions}
            enabledModules={enabledModules}
            fieldFilter={fieldFilter}
            exportImportVersionTag={exportImportVersionTag}
            appId={appId}
            sortOrder={sortOrder}
            visibleColumnIds={visibleColumnIds}
            columns={columns}
          />
        </div>
      </div>

      <DuplicatePhoneBlock />

      <AdminCard className="mb-5">
        <MemberCollectionTableBlock
          visibleColumnIds={visibleColumnIds}
          loadingMembers={loadingMembers || !members}
          currentMembers={currentMembers}
          limit={limit}
          nextToken={nextToken}
          fieldFilter={fieldFilter}
          properties={properties}
          visibleShowMoreButton={true}
          visibleColumnSearchProps={true}
          fetchMembers={fetchMembers}
          onFieldFilterChange={(filter: FieldFilter) => setFieldFilter(filter)}
          onSortOrderChange={(createdAt: SortOrder, loginedAt: SortOrder, consumption: SortOrder) =>
            setSortOrder({ createdAt, loginedAt, consumption })
          }
          onCurrentMembersChange={(
            value: {
              id: string
              pictureUrl: string | null
              name: string
              email: string
              role: 'general-member' | 'content-creator' | 'app-owner'
              createdAt: Date
              username: string
              loginedAt: Date | null
              managerId: string | null
            }[],
          ) => setCurrentMembers(value)}
        />
      </AdminCard>
    </>
  )
}

export const MemberCollectionTableBlock: React.VFC<{
  visibleColumnIds: string[]
  loadingMembers: boolean
  currentMembers: MemberCollectionProps[]
  limit: number
  nextToken?: string | null
  fieldFilter?: FieldFilter
  properties: {
    id: any
    name: string
    placeholder: string | undefined
    isEditable: boolean
    isRequired: boolean
  }[]
  visibleShowMoreButton: boolean
  visibleColumnSearchProps: boolean
  extraColumns?: {
    title: string
    key: string
    dataIndex: string
  }[]
  fetchMembers?: (
    filter: FieldFilter | undefined,
    option: {
      limit?: number
      nextToken?: string | null
    },
  ) => Promise<ResponseMembers>
  onFieldFilterChange?: (filter: FieldFilter) => void
  onSortOrderChange?: (createdAt: SortOrder, loginedAt: SortOrder, consumption: SortOrder) => void
  onCurrentMembersChange?: (
    value: {
      id: string
      pictureUrl: string | null
      name: string
      email: string
      role: 'general-member' | 'content-creator' | 'app-owner'
      createdAt: Date
      username: string
      loginedAt: Date | null
      managerId: string | null
    }[],
  ) => void
}> = ({
  visibleColumnIds,
  loadingMembers,
  currentMembers = [],
  limit,
  nextToken,
  fieldFilter = {},
  properties,
  visibleShowMoreButton,
  visibleColumnSearchProps,
  extraColumns = [],
  fetchMembers,
  onFieldFilterChange,
  onSortOrderChange,
  onCurrentMembersChange,
}) => {
  const theme = useAppTheme()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const searchInputRef = useRef<Input | null>(null)
  const [currentNextToken, setCurrentNextToken] = useState(nextToken)

  const {
    loadingMemberPhones,
    loadingManagerInfo,
    loadingMemberOrderProductPrice,
    loadingMemberOrderDiscountPrice,
    loadingMemberTags,
    loadingMemberProperties,
    memberCollection,
  } = useMemberCollection(currentMembers)

  const setFilter = (columnId: string, value: string | null, isProperty?: boolean) => {
    if (isProperty) {
      const newProperties = pickBy({ ...fieldFilter?.properties, [columnId]: value ? `${value}` : undefined })
      onFieldFilterChange?.({
        ...fieldFilter,
        properties: negate(isEmpty)(newProperties) ? newProperties : undefined,
      })
    } else {
      onFieldFilterChange?.({
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
      title: '#',
      key: '#',
      render: (text, record, index) => <div>{index + 1}</div>,
    },
    {
      title: formatMessage(commonMessages.label.memberName),
      key: 'name',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <AvatarImage size="32px" src={record.avatarUrl} className="flex-shrink-0 mr-3" />
          <StyledMemberName>{record.name}</StyledMemberName>
          {record.role === 'app-owner' ? (
            <StyledTag color="#585858" className="ml-2 mr-0">
              {formatMessage(commonMessages.label.appOwner)}
            </StyledTag>
          ) : null}
          {record.role === 'content-creator' ? (
            <StyledTag color={theme.colors.primary[500]} className="ml-2 mr-0">
              {formatMessage(commonMessages.label.contentCreator)}
            </StyledTag>
          ) : null}
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
      render: (text, record, index) => (loadingMemberPhones ? <Spin /> : record.phones.join(', ')),
      ...getColumnSearchProps('phone'),
    },
    {
      title: formatMessage(commonMessages.label.account),
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps('username'),
    },
    {
      title: formatMessage(commonMessages.label.createdDate),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text, record, index) => (record.createdAt ? moment(record.createdAt).format('YYYY-MM-DD') : ''),
      sorter: (a, b) => (a.createdAt ? a.createdAt.getTime() : 0) - (b.createdAt ? b.createdAt.getTime() : 0),
    },
    {
      title: formatMessage(commonMessages.label.lastLogin),
      dataIndex: 'loginedAt',
      key: 'loginedAt',
      render: (text, record, index) => (record.loginedAt ? moment(record.loginedAt).format('YYYY-MM-DD HH:mm:ss') : ''),
      sorter: (a, b) => (a.loginedAt ? a.loginedAt.getTime() : 0) - (b.loginedAt ? b.loginedAt.getTime() : 0),
    },
    {
      title: formatMessage(commonMessages.label.consumption),
      dataIndex: 'consumption',
      key: 'consumption',
      align: 'right',
      render: (_, record) =>
        loadingMemberOrderProductPrice && loadingMemberOrderDiscountPrice ? (
          <Spin />
        ) : (
          currencyFormatter(record.consumption)
        ),
      sorter: (a, b) => a.consumption - b.consumption,
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
      render: (text, record, index) =>
        loadingMemberTags ? (
          <Spin />
        ) : (
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
          <StyledMemberName>{loadingManagerInfo ? <Spin /> : record.manager?.name}</StyledMemberName>
        </div>
      ),
      ...getColumnSearchProps('managerName'),
    },
    ...extraColumns.map(extraColumn => {
      const columnKey = extraColumn.key as keyof MemberInfoProps
      const column: ColumnProps<MemberInfoProps> = {
        title: extraColumn.title,
        key: extraColumn.key,
        render: (text, record, index) => record?.[columnKey],
      }
      return column
    }),
    ...properties
      .filter(property => visibleColumnIds.includes(property.id))
      .map(property => {
        const column: ColumnProps<MemberInfoProps> = {
          title: property.name,
          key: property.id,
          render: (text, record, index) => (loadingMemberProperties ? <Spin /> : record?.properties?.[property.id]),
          ...getColumnSearchProps(property.id, true),
        }
        return column
      }),
  ]

  const visibleColumnSearchPropsColumns = columns.map(column => {
    const { onFilterDropdownVisibleChange, filterIcon, filterDropdown, ...noSearchPropsColumn } = column
    return visibleColumnSearchProps ? column : noSearchPropsColumn
  })

  useEffect(() => {
    setCurrentNextToken(nextToken)
  }, [nextToken])

  return (
    <>
      <TableWrapper>
        <Table<MemberInfoProps>
          columns={visibleColumnSearchPropsColumns.filter(
            column => column.key === 'name' || visibleColumnIds.includes(column.key as string),
          )}
          rowKey="id"
          loading={loadingMembers}
          dataSource={memberCollection}
          pagination={false}
          rowClassName={() => 'cursor-pointer'}
          onRow={record => ({
            onClick: () => window.open(`${process.env.PUBLIC_URL}/members/${record.id}`, '_blank'),
          })}
          onChange={(pagination, filters, sorter) => {
            const newSorter = sorter as SorterResult<MemberInfoProps>
            onSortOrderChange?.(
              newSorter.field === 'createdAt' ? newSorter?.order || null : null,
              newSorter.field === 'loginedAt' ? newSorter?.order || null : null,
              newSorter.field === 'consumption' ? newSorter?.order || null : null,
            )
          }}
        />
      </TableWrapper>
      {visibleShowMoreButton && (
        <div className="text-center mt-4">
          <Button
            disabled={
              loadingMemberPhones ||
              loadingManagerInfo ||
              loadingMemberOrderProductPrice ||
              loadingMemberTags ||
              loadingMemberProperties ||
              !currentNextToken
            }
            loading={loading}
            onClick={async () => {
              setLoading(true)
              await fetchMembers?.(fieldFilter, { limit, nextToken: currentNextToken })
                .then(res => {
                  setCurrentNextToken(() => res.cursor.afterCursor)
                  onCurrentMembersChange?.([
                    ...currentMembers,
                    ...res.data.map(v => ({
                      id: v.id,
                      pictureUrl: v.picture_url,
                      name: v.name,
                      email: v.email,
                      role: v.role,
                      createdAt: new Date(v.created_at),
                      username: v.username,
                      loginedAt: v.logined_at ? new Date(v.logined_at) : null,
                      managerId: v.manager_id,
                    })),
                  ])
                })
                .catch(error => handleError(error))
                .finally(() => setLoading(false))
            }}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        </div>
      )}
    </>
  )
}

export default MemberCollectionAdminPage
