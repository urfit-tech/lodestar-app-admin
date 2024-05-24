import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Spin, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult, SortOrder } from 'antd/lib/table/interface'
import { isEmpty, negate, pickBy } from 'lodash'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter, handleError } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useMemberCollection } from '../../hooks/member'
import {
  MemberCollectionAdminFieldFilter,
  MemberCollectionProps,
  MemberInfoProps,
  ResponseMembers,
} from '../../types/member'
import { AvatarImage } from '../common/Image'

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

const MemberCollectionTableBlock: React.VFC<{
  visibleColumnIds: string[]
  loadingMembers: boolean
  currentMembers: MemberCollectionProps[]
  limit: number
  nextToken?: string | null
  fieldFilter?: MemberCollectionAdminFieldFilter
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
    filter: MemberCollectionAdminFieldFilter | undefined,
    option: {
      limit?: number
      nextToken?: string | null
    },
  ) => Promise<ResponseMembers>
  onFieldFilterChange?: (filter: MemberCollectionAdminFieldFilter) => void
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

export default MemberCollectionTableBlock
