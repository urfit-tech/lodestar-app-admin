import { FileAddOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { Button, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, memberMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberTaskProps } from '../../types/member'
import { AdminBlock, MemberTaskTag } from '../admin'
import { AvatarImage } from '../common/Image'
import MemberTaskAdminModal from './MemberTaskAdminModal'

const StyledTitle = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
`
const StyledSubTitle = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
`
const StyledName = styled.span`
  color: var(--gray-darker);
  font-size: 14px;
`

const priorityLevel: { [key in MemberTaskProps['priority']]: number } = {
  high: 1,
  medium: 2,
  low: 3,
}
const statusLevel: { [key in MemberTaskProps['status']]: number } = {
  pending: 1,
  'in-progress': 2,
  done: 3,
}

const MemberTaskAdminBlock: React.FC<{
  memberId?: string
}> = ({ memberId }) => {
  const [display, setDisplay] = useState('table')
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const searchInputRef = useRef<Input | null>(null)
  const [filter, setFilter] = useState<{
    title?: string
    category?: string
    executor?: string
  }>({})
  const { loadingMemberTasks, memberTasks, loadMoreMemberTasks, refetchMemberTasks } = useMemberTaskCollection({
    ...filter,
    memberId,
  })
  const [selectedMemberTask, setSelectedMemberTask] = useState<MemberTaskProps | null>(null)
  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getColumnSearchProps: (dataIndex: keyof MemberTaskProps) => ColumnProps<MemberTaskProps> = dataIndex => ({
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

  const columns: ColumnProps<MemberTaskProps>[] = [
    {
      dataIndex: 'title',
      title: formatMessage(memberMessages.label.taskTitle),
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2">{record.title}</StyledTitle>
          <StyledSubTitle>/ {record.member.name}</StyledSubTitle>
        </div>
      ),
      ...getColumnSearchProps('title'),
    },
    {
      dataIndex: 'priority',
      title: formatMessage(memberMessages.label.priority),
      render: (text, record, index) =>
        record.priority === 'high' ? (
          <MemberTaskTag variant="high">{formatMessage(memberMessages.status.priorityHigh)}</MemberTaskTag>
        ) : record.priority === 'medium' ? (
          <MemberTaskTag variant="medium">{formatMessage(memberMessages.status.priorityMedium)}</MemberTaskTag>
        ) : (
          <MemberTaskTag variant="low">{formatMessage(memberMessages.status.priorityLow)}</MemberTaskTag>
        ),
      sorter: (a, b) => priorityLevel[a.priority] - priorityLevel[b.priority],
    },
    {
      dataIndex: 'status',
      title: formatMessage(memberMessages.label.status),
      render: (text, record, index) =>
        record.status === 'pending' ? (
          <MemberTaskTag variant="pending">{formatMessage(memberMessages.status.statusPending)}</MemberTaskTag>
        ) : record.status === 'in-progress' ? (
          <MemberTaskTag variant="in-progress">{formatMessage(memberMessages.status.statusInProgress)}</MemberTaskTag>
        ) : (
          <MemberTaskTag variant="done">{formatMessage(memberMessages.status.statusDone)}</MemberTaskTag>
        ),
      sorter: (a, b) => statusLevel[a.status] - statusLevel[b.status],
    },
    {
      dataIndex: 'category',
      title: formatMessage(memberMessages.label.category),
      render: (text, record, index) => record.category?.name,
      ...getColumnSearchProps('category'),
    },
    {
      dataIndex: 'dueAt',
      title: formatMessage(memberMessages.label.dueDate),
      render: (text, record, index) => (record.dueAt ? moment(record.dueAt).format('YYYY-MM-DD HH:mm') : ''),
      sorter: (a, b) => (b.dueAt?.getTime() || 0) - (a.dueAt?.getTime() || 0),
    },
    {
      dataIndex: 'executor',
      title: formatMessage(memberMessages.label.assign),
      render: (text, record, index) =>
        record.executor ? (
          <div className="d-flex align-items-center justify-content-start">
            <AvatarImage src={record.executor.avatarUrl} size="28px" className="mr-2" />
            <StyledName>{record.executor.name}</StyledName>
          </div>
        ) : null,
      ...getColumnSearchProps('executor'),
    },
  ]

  return (
    <>
      <div className="d-flex align-item-center justify-content-between mb-4">
        <MemberTaskAdminModal
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
              {formatMessage(memberMessages.ui.newTask)}
            </Button>
          )}
          title={formatMessage(memberMessages.ui.newTask)}
          initialMemberId={memberId}
          initialExecutorId={memberId && currentMemberId ? currentMemberId : undefined}
          onRefetch={refetchMemberTasks}
        />
      </div>
      <Button className="mb-3" onClick={() => setDisplay(display === 'table' ? 'calendar' : 'table')}>
        切換檢視模式
      </Button>
      <AdminBlock>
        {display === 'calendar' ? (
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={memberTasks
              .filter(memberTask => memberTask.dueAt)
              .map(memberTask => {
                return {
                  title: memberTask.title,
                  start: moment(memberTask.dueAt).format(),
                }
              })}
          />
        ) : display === 'table' ? (
          <Table
            columns={columns}
            dataSource={memberTasks}
            rowKey="id"
            loading={loadingMemberTasks}
            showSorterTooltip={false}
            rowClassName="cursor-pointer"
            pagination={false}
            onRow={record => ({
              onClick: () => {
                setSelectedMemberTask(record)
                setVisible(true)
              },
            })}
          />
        ) : null}

        {loadMoreMemberTasks && (
          <div className="text-center mt-4">
            <Button
              loading={isLoading}
              onClick={() => {
                setIsLoading(true)
                loadMoreMemberTasks().then(() => setIsLoading(false))
              }}
            >
              {formatMessage(commonMessages.ui.showMore)}
            </Button>
          </div>
        )}
      </AdminBlock>

      {selectedMemberTask && (
        <MemberTaskAdminModal
          visible={visible}
          memberTask={selectedMemberTask || undefined}
          title={formatMessage(memberMessages.ui.editTask)}
          onRefetch={() => {
            refetchMemberTasks()
            setSelectedMemberTask(null)
          }}
          onCancel={() => setSelectedMemberTask(null)}
        />
      )}
    </>
  )
}

const useMemberTaskCollection = ({
  memberId,
  title,
  category,
  executor,
  limit = 10,
}: {
  memberId?: string
  title?: string
  category?: string
  executor?: string
  limit?: number
}) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_MEMBER_TASK_COLLECTION,
    types.GET_MEMBER_TASK_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_TASK_COLLECTION(
        $memberId: String
        $titleSearch: String
        $categorySearch: String
        $executorSearch: String
        $cursor: timestamptz
        $limit: Int
      ) {
        member_task_aggregate(
          where: {
            member_id: { _eq: $memberId }
            title: { _ilike: $titleSearch }
            _and: [
              { _or: [{ category_id: { _is_null: true } }, { category: { name: { _ilike: $categorySearch } } }] }
              {
                _or: [
                  { executor_id: { _is_null: true } }
                  { executor: { name: { _ilike: $executorSearch } } }
                  { executor: { username: { _ilike: $executorSearch } } }
                ]
              }
            ]
          }
        ) {
          aggregate {
            count
          }
        }
        member_task(
          where: {
            member_id: { _eq: $memberId }
            title: { _ilike: $titleSearch }
            _and: [
              { _or: [{ category_id: { _is_null: true } }, { category: { name: { _ilike: $categorySearch } } }] }
              {
                _or: [
                  { executor_id: { _is_null: true } }
                  { executor: { name: { _ilike: $executorSearch } } }
                  { executor: { username: { _ilike: $executorSearch } } }
                ]
              }
            ]
            created_at: { _lt: $cursor }
          }
          limit: $limit
          order_by: { created_at: desc }
        ) {
          id
          title
          description
          priority
          status
          due_at
          created_at
          category {
            id
            name
          }
          member {
            id
            name
            username
          }
          executor {
            id
            name
            username
            picture_url
          }
        }
      }
    `,
    {
      variables: {
        memberId,
        titleSearch: title && `%${title}%`,
        categorySearch: category && `%${category}%`,
        executorSearch: executor && `%${executor}%`,
        cursor: null,
        limit,
      },
    },
  )

  const memberTasks: MemberTaskProps[] =
    loading || error || !data
      ? []
      : data.member_task
          .map(v => ({
            id: v.id,
            title: v.title,
            priority: v.priority as MemberTaskProps['priority'],
            status: v.status as MemberTaskProps['status'],
            category: v.category
              ? {
                  id: v.category.id,
                  name: v.category.name,
                }
              : null,
            dueAt: v.due_at && new Date(v.due_at),
            createdAt: v.created_at && new Date(v.created_at),
            description: v.description,
            member: {
              id: v.member.id,
              name: v.member.name || v.member.username,
            },
            executor: v.executor
              ? {
                  id: v.executor.id,
                  name: v.executor.name || v.executor.username,
                  avatarUrl: v.executor.picture_url,
                }
              : null,
          }))
          .filter(
            memberTask =>
              (!category || memberTask.category?.name.toLowerCase().includes(category)) &&
              (!executor || memberTask.executor?.name.toLowerCase().includes(executor)),
          )

  const [hasMore, setHasMore] = useState<boolean>(false)
  const totalCount = data?.member_task_aggregate.aggregate?.count || 0
  useEffect(() => {
    hasMore
      ? totalCount < limit && setHasMore(false)
      : totalCount > limit && totalCount > memberTasks.length && setHasMore(true)
  }, [totalCount, hasMore, limit, memberTasks.length])

  const loadMoreMemberTasks = () =>
    fetchMore({
      variables: {
        memberId,
        titleSearch: title && `%${title}%`,
        categorySearch: category && `%${category}%`,
        executorSearch: executor && `%${executor}%`,
        cursor: memberTasks.slice(-1).pop()?.createdAt,
        limit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        if (limit > fetchMoreResult.member_task.length) {
          setHasMore(false)
        }
        return Object.assign({}, prev, {
          member_task: [...prev.member_task, ...fetchMoreResult.member_task],
        })
      },
    })

  return {
    loadingMemberTasks: loading,
    errorMemberTasks: error,
    memberTasks,
    loadMoreMemberTasks: hasMore && loadMoreMemberTasks,
    refetchMemberTasks: refetch,
  }
}

export default MemberTaskAdminBlock
