import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, memberMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberTaskProps } from '../../types/member'
import { AvatarImage } from '../common/Image'

const StyledTitle = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
`
const StyledSubTitle = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
`
const StyledTag = styled.span<{ variant: MemberTaskProps['priority'] | MemberTaskProps['status'] }>`
  padding: 2px 6px;
  color: var(--gray-darker);
  font-size: 14px;
  background: ${props =>
    props.variant === 'high'
      ? '#ffcfd4'
      : props.variant === 'medium'
      ? '#fedfd1'
      : props.variant === 'low'
      ? 'rgba(255, 190, 30, 0.2)'
      : props.variant === 'pending'
      ? '#e6e6e4'
      : props.variant === 'in-progress'
      ? '#e1d5f9'
      : props.variant === 'done'
      ? '#cee7e1'
      : ''};
  border-radius: 2px;
  line-height: 2rem;
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

const MemberTaskTable: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const searchInputRef = useRef<Input | null>(null)
  const [filter, setFilter] = useState<{
    title?: string
    classification?: string
    executor?: string
  }>({})
  const { loadingMemberTasks, memberTasks } = useMemberTaskCollection(memberId, filter)

  const getColumnSearchProps: (dataIndex: keyof MemberTaskProps) => ColumnProps<MemberTaskProps> = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={searchInputRef}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() =>
            setFilter(filter => ({
              ...filter,
              [dataIndex]: selectedKeys[0],
            }))
          }
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div className="d-flex align-items-center justify-content-between">
          <Button
            type="primary"
            onClick={() =>
              setFilter(filter => ({
                ...filter,
                [dataIndex]: selectedKeys[0],
              }))
            }
            icon={<SearchOutlined />}
            size="small"
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
          <StyledTag variant="high">{formatMessage(memberMessages.status.priorityHigh)}</StyledTag>
        ) : record.priority === 'medium' ? (
          <StyledTag variant="medium">{formatMessage(memberMessages.status.priorityMedium)}</StyledTag>
        ) : (
          <StyledTag variant="low">{formatMessage(memberMessages.status.priorityLow)}</StyledTag>
        ),
      sorter: (a, b) => priorityLevel[a.priority] - priorityLevel[b.priority],
    },
    {
      dataIndex: 'status',
      title: formatMessage(memberMessages.label.status),
      render: (text, record, index) =>
        record.status === 'pending' ? (
          <StyledTag variant="pending">{formatMessage(memberMessages.status.statusPending)}</StyledTag>
        ) : record.status === 'in-progress' ? (
          <StyledTag variant="in-progress">{formatMessage(memberMessages.status.statusInProgress)}</StyledTag>
        ) : (
          <StyledTag variant="done">{formatMessage(memberMessages.status.statusDone)}</StyledTag>
        ),
      sorter: (a, b) => statusLevel[a.status] - statusLevel[b.status],
    },
    {
      dataIndex: 'classification',
      title: formatMessage(memberMessages.label.classification),
      ...getColumnSearchProps('classification'),
    },
    {
      dataIndex: 'dueAt',
      title: formatMessage(memberMessages.label.dueDate),
      render: (text, record, index) => moment(record.dueAt).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => (a.dueAt?.getTime() || 0) - (b.dueAt?.getTime() || 0),
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
    <Table
      columns={columns}
      dataSource={memberTasks}
      rowKey="id"
      loading={loadingMemberTasks}
      showSorterTooltip={false}
    />
  )
}

const useMemberTaskCollection = (
  memberId: string,
  filter?: {
    title?: string
    classification?: string
    executor?: string
  },
) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_MEMBER_TASK_COLLECTION,
    types.GET_MEMBER_TASK_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_TASK_COLLECTION(
        $memberId: String!
        $titleSearch: String
        $classificationSearch: String
        $executorSearch: String
      ) {
        member_task(
          where: {
            member_id: { _eq: $memberId }
            title: { _like: $titleSearch }
            classification: { _like: $classificationSearch }
            _or: [
              { executor_id: { _is_null: true } }
              { executor: { name: { _like: $executorSearch } } }
              { executor: { username: { _like: $executorSearch } } }
            ]
          }
        ) {
          id
          title
          description
          priority
          status
          classification
          due_at
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
        titleSearch: filter?.title ? `%${filter.title}%` : undefined,
        classificationSearch: filter?.classification ? `%${filter.classification}%` : undefined,
        executorSearch: filter?.executor ? `%${filter.executor}%` : undefined,
      },
    },
  )

  const memberTasks: MemberTaskProps[] =
    loading || error || !data
      ? []
      : data.member_task.map(v => ({
          id: v.id,
          title: v.title,
          priority: v.priority as MemberTaskProps['priority'],
          status: v.status as MemberTaskProps['status'],
          classification: v.classification,
          dueAt: v.due_at && new Date(v.due_at),
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

  return {
    loadingMemberTasks: loading,
    errorMemberTasks: error,
    memberTasks,
    refetchMemberTasks: refetch,
  }
}

export default MemberTaskTable
