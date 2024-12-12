// organize-imports-ignore
import { gql, useApolloClient, useQuery } from '@apollo/client'
import { FileAddOutlined, SearchOutlined, LoadingOutlined } from '@ant-design/icons'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Button, Checkbox, DatePicker, Input, message, Select, Skeleton, Spin, Table, Tooltip } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult } from 'antd/lib/table/interface'
import moment from 'moment'
import dayjs from 'dayjs'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useCategory } from '../../hooks/data'
import { commonMessages, memberMessages } from '../../helpers/translation'
import hasura from '../../hasura'
import { MemberTaskProps } from '../../types/member'
import { AdminBlock, MemberTaskTag } from '../admin'
import { AvatarImage } from '../common/Image'
import { ReactComponent as MeetingIcon } from '../../images/icon/video-o.svg'
import MemberTaskAdminModal from './MemberTaskAdminModal'
import JitsiDemoModal from '../sale/JitsiDemoModal'
import { useMutateMemberNote } from '../../hooks/member'
import { useMemberTaskCollection } from '../../hooks/task'
import { GetMeetById } from '../../hooks/meet'
import { handleError } from '../../helpers'
import { LockIcon } from '../../images/icon'
import PermissionGroupSelector from '../form/PermissionGroupSelector'
import { MeetingError, MeetingLinkStrategyFactory, MeetingServiceType } from './meetingLinkStrategy'
import taskMessages from './translation'

const messages = defineMessages({
  switchCalendar: { id: 'member.ui.switchCalendar', defaultMessage: '切換月曆模式' },
  switchTable: { id: 'member.ui.switchTable', defaultMessage: '切換列表模式' },
  executor: { id: 'member.label.executor', defaultMessage: '執行者' },
  author: { id: 'member.label.author', defaultMessage: '建立者' },
})

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
const StyledCategory = styled.span`
  display: flex;
  align-items: center;
`

export const StyledCategoryDot = styled.span<{ color?: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.color || 'transparent'};
  margin-right: 0.5rem;
`
const StyledFilterWrapper = styled.div`
  padding-top: 0.5rem;
  max-height: 20rem;
  overflow: auto;
`
const StyledFullCalendarWrapper = styled.div`
  && a {
    color: var(--gray-darker);
  }
`

export const StyledEventTime = styled.span`
  margin-right: 3px;
  font-weight: normal;
`

const priorityLevel: { [key in MemberTaskProps['priority']]: number } = {
  high: 1,
  medium: 2,
  low: 3,
}

export const categoryColors: string[] = [
  '#ff8dcf',
  '#8191be',
  '#81bea4',
  '#ffbe1e',
  '#b882cd',
  '#77ccd6',
  '#be9a81',
  '#b1db71',
  '#ff7d62',
  '#a0a0a7',
]

export type FieldFilter = {
  title?: string
  categoryIds?: string[]
  executor?: string
  author?: string
  dueAt?: Date[]
  createdAt?: Date[]
  status?: MemberTaskProps['status']
  permissionGroupId?: string
}

const MemberTaskAdminBlock: React.FC<{
  memberId?: string
  localStorageMemberTaskDisplay?: string
  localStorageMemberTaskFilter?: {}
  activeMemberTask?: MemberTaskProps | null
}> = ({ memberId, localStorageMemberTaskDisplay, localStorageMemberTaskFilter, activeMemberTask }) => {
  const apolloClient = useApolloClient()
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules, settings } = useApp()
  const { authToken, currentMember, currentMemberId } = useAuth()
  const searchInputRef = useRef<Input | null>(null)
  const [filter, setFilter] = useState<FieldFilter>(localStorageMemberTaskFilter || {})
  const [display, setDisplay] = useState(localStorageMemberTaskDisplay || 'table')
  const [selectedMemberTask, setSelectedMemberTask] = useState<MemberTaskProps | null>(null)

  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [jitsiModalVisible, setJitsiModalVisible] = useState(false)
  const [meetingLoading, setMeetingLoading] = useState<{ index: number; loading: boolean } | null>()
  const [meetingMember, setMeetingMember] = useState<{
    id: string
    name: string
  }>({ id: '', name: '' })
  const [orderBy, setOrderBy] = useState<hasura.member_task_order_by>({
    created_at: 'desc' as hasura.order_by,
  })
  const { loading: categoriesLoading, categories } = useCategory('task')
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const { loadingMemberTasks, executors, authors, memberTasks, loadMoreMemberTasks, refetchMemberTasks } =
    useMemberTaskCollection({
      memberId,
      excludedIds,
      setExcludedIds,
      ...filter,
      orderBy,
      limit: display === 'table' ? 10 : undefined,
    })
  const { insertMemberNote } = useMutateMemberNote()

  useEffect(() => {
    setExcludedIds([])
  }, [orderBy])

  useEffect(() => {
    if (activeMemberTask) {
      setVisible(true)
      setSelectedMemberTask(activeMemberTask)
    }
  }, [activeMemberTask])

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

  if (categoriesLoading || !categories || !currentMember) {
    return <Skeleton active />
  }

  const categoryColorPairs = Object.fromEntries(
    categories.map((category, index) => [category.id, categoryColors[index % categoryColors.length]]),
  )

  const onCellClick = (record: MemberTaskProps) => {
    return {
      onClick: () => {
        setSelectedMemberTask(() => record)
        setVisible(() => true)
        const newUrl = `${window.location.pathname}?id=${record.id}`
        window.history.pushState({ path: newUrl }, '', newUrl)
      },
    }
  }

  const getMeetingLink = async (
    memberTaskId: string,
    meetId: string,
    startedAt: Date,
    endedAt: Date,
    nbfAt: Date | null,
    expAt: Date | null,
    memberId: string,
    hostMemberName: string,
  ) => {
    const { data } = await apolloClient.query<hasura.GetMeetById, hasura.GetMeetByIdVariables>({
      query: GetMeetById,
      variables: { meetId },
    })
    const service: MeetingServiceType = (data.meet_by_pk?.gateway as MeetingServiceType) || MeetingServiceType.JITSI

    const strategy = new MeetingLinkStrategyFactory(
      service,
      {
        memberId,
        startedAt,
        endedAt,
        nbfAt,
        expAt,
        hostMemberId: currentMemberId || '',
        memberTaskId,
        meetType: data.meet_by_pk?.type || '',
        hostMemberName,
      },
      appId,
      authToken,
      !!enabledModules.meet_service,
    ).create()

    if (!strategy) {
      return message.error(formatMessage(taskMessages.MeetingLinkStrategy.notSupportMeetingSystem))
    }

    const { meetingUrl, error } = await strategy.getMeetingUrl()

    const errorMessages = {
      [MeetingError.NOT_IN_MEETING_PERIOD]: taskMessages.MeetingLinkStrategy.notInMeetingPeriod,
      [MeetingError.CREATE_MEET_ERROR]: taskMessages.MeetingLinkStrategy.createMeetError,
      [MeetingError.MEET_SERVICE_MODULE_NOT_ENABLED]: taskMessages.MeetingLinkStrategy.meetServiceModuleNotEnabled,
    }

    if (error) {
      const errorMessage = errorMessages[error] || error
      return message.error(formatMessage(errorMessage))
    }

    if (!meetingUrl) {
      return message.error(formatMessage(taskMessages.MeetingLinkStrategy.cannotGetMeetingUrl))
    }

    window.open(meetingUrl, '_blank', 'noopener,noreferrer')
  }

  const columns: ColumnProps<MemberTaskProps>[] = [
    {
      dataIndex: 'isPrivate',
      width: '1%',
      render: (text, record, index) => (record.isPrivate ? <LockIcon /> : null),
      onCell: onCellClick,
    },
    {
      dataIndex: 'title',
      width: '19%',
      title: formatMessage(memberMessages.label.taskTitle),
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2">{record.title}</StyledTitle>
          <StyledSubTitle>/ {record.member.name}</StyledSubTitle>
        </div>
      ),
      onCell: onCellClick,
      ...getColumnSearchProps('title'),
    },
    {
      dataIndex: 'meeting',
      title: formatMessage(memberMessages.label.meeting),
      render: (text, record, index) => (
        <Box minWidth="40px">
          {(record.hasMeeting || record.meetingGateway) && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                if (meetingLoading?.loading) return
                setMeetingLoading(() => {
                  return {
                    index,
                    loading: true,
                  }
                })
                setMeetingMember(() => record.member)
                if (record.meet.options?.startUrl) {
                  window.open(record.meet.options.startUrl, '_blank')
                  setMeetingLoading(null)
                } else {
                  getMeetingLink(
                    record.id,
                    record.meet.id,
                    record.meet.startedAt,
                    record.meet.endedAt,
                    record.meet.nbfAt,
                    record.meet.expAt,
                    record.member.id,
                    currentMember.id,
                  ).finally(() => {
                    setMeetingLoading(null)
                    refetchMemberTasks()
                  })
                }
              }}
              style={{ width: 30, height: 30, alignItems: 'center' }}
            >
              {meetingLoading?.index === index && meetingLoading.loading ? (
                <div>
                  <Spin size="small" className="mb-2" indicator={<LoadingOutlined style={{ color: 'white' }} />} />
                </div>
              ) : (
                <MeetingIcon />
              )}
            </Button>
          )}
        </Box>
      ),
    },
    {
      dataIndex: 'priority',
      title: formatMessage(memberMessages.label.priority),
      render: (text, record, index) =>
        record.priority === 'high' ? (
          <Box minWidth="70px">
            <MemberTaskTag variant="high">{formatMessage(memberMessages.status.priorityHigh)}</MemberTaskTag>
          </Box>
        ) : record.priority === 'medium' ? (
          <Box minWidth="70px">
            <MemberTaskTag variant="medium">{formatMessage(memberMessages.status.priorityMedium)}</MemberTaskTag>
          </Box>
        ) : (
          <Box minWidth="70px">
            <MemberTaskTag variant="low">{formatMessage(memberMessages.status.priorityLow)}</MemberTaskTag>
          </Box>
        ),
      onCell: onCellClick,
      sorter: (a, b) => priorityLevel[a.priority] - priorityLevel[b.priority],
    },
    {
      dataIndex: 'status',
      title: formatMessage(memberMessages.label.status),
      render: (text, record, index) =>
        record.status === 'pending' ? (
          <Box minWidth="60px">
            <MemberTaskTag variant="pending">{formatMessage(memberMessages.status.statusPending)}</MemberTaskTag>
          </Box>
        ) : record.status === 'in-progress' ? (
          <Box minWidth="60px">
            <MemberTaskTag variant="in-progress">{formatMessage(memberMessages.status.statusInProgress)}</MemberTaskTag>
          </Box>
        ) : (
          <Box minWidth="60px">
            <MemberTaskTag variant="done">{formatMessage(memberMessages.status.statusDone)}</MemberTaskTag>
          </Box>
        ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'category',
      title: formatMessage(memberMessages.label.category),
      render: (text, record, index) => (
        <StyledCategory>
          {record.category && (
            <Box>
              <StyledCategoryDot color={categoryColorPairs[record.category?.id]} />
            </Box>
          )}
          {record.category?.name}
        </StyledCategory>
      ),
      onCell: onCellClick,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2">
          <StyledFilterWrapper>
            <Checkbox.Group
              value={selectedKeys}
              onChange={values => {
                values.length ? setSelectedKeys(values.map(value => value.toString())) : setSelectedKeys([])
              }}
            >
              {categories.map(category => (
                <Checkbox key={category.id} value={category.id} className="d-block mx-2 mb-2">
                  {category.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </StyledFilterWrapper>
          <div className="d-flex justify-content-center">
            <Button
              type="primary"
              onClick={() => {
                confirm()
                setFilter(filter => ({
                  ...filter,
                  categoryIds: selectedKeys.length ? selectedKeys.map(v => v.toString()) : undefined,
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
                  categoryIds: undefined,
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
    },
    {
      dataIndex: 'dueAt',
      title: formatMessage(memberMessages.label.executeDate),
      render: (text, record, index) => (
        <Box minWidth="100px">{record.dueAt ? moment(record.dueAt).format('YYYY-MM-DD HH:mm') : ''}</Box>
      ),
      sorter: (a, b) => {
        // In descending order:
        // - If 'a.dueAt' is null, return 1 to prioritize 'a' before 'b'.
        // - If 'b.dueAt' is null, return -1 to prioritize non-null 'b' before 'a'.
        // - Otherwise, compare the time values of 'dueAt'.
        if (a.dueAt === null) return 1
        if (b.dueAt === null) return -1
        return a.dueAt.getTime() - b.dueAt.getTime()
      },
      onCell: onCellClick,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2">
          <DatePicker.RangePicker
            className="mb-2"
            value={selectedKeys.length ? [moment(selectedKeys[0]), moment(selectedKeys[1])] : null}
            onChange={(date, dateString: [string, string]) => {
              setSelectedKeys(date ? dateString : [])
            }}
          />
          <div className="d-flex justify-content-center">
            <Button
              type="primary"
              onClick={() => {
                confirm()
                setFilter(filter => ({
                  ...filter,
                  dueAt: selectedKeys.length
                    ? [moment(selectedKeys[0]).startOf('day').toDate(), moment(selectedKeys[1]).endOf('day').toDate()]
                    : undefined,
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
                  dueAt: undefined,
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
    },
    {
      dataIndex: 'createdAt',
      title: formatMessage(memberMessages.label.createdDate),
      render: (text, record, index) => (
        <Box minWidth="100px">{record.createdAt ? moment(record.createdAt).format('YYYY-MM-DD HH:mm') : ''}</Box>
      ),
      sorter: (a, b) => {
        if (a.createdAt === null) return 1
        if (b.createdAt === null) return -1
        return a.createdAt.getTime() - b.createdAt.getTime()
      },
      onCell: onCellClick,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2">
          <DatePicker.RangePicker
            className="mb-2"
            value={selectedKeys.length ? [moment(selectedKeys[0]), moment(selectedKeys[1])] : null}
            onChange={(date, dateString: [string, string]) => {
              setSelectedKeys(date ? dateString : [])
            }}
          />
          <div className="d-flex justify-content-center">
            <Button
              type="primary"
              onClick={() => {
                confirm()
                setFilter(filter => ({
                  ...filter,
                  createdAt: selectedKeys.length
                    ? [moment(selectedKeys[0]).startOf('day').toDate(), moment(selectedKeys[1]).endOf('day').toDate()]
                    : undefined,
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
                  createdAt: undefined,
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
    },
    {
      dataIndex: 'executor',
      title: formatMessage(messages.executor),
      onCell: onCellClick,
      render: (text, record, index) =>
        record.executor ? (
          <div className="d-flex align-items-center justify-content-start">
            <Box>
              <AvatarImage src={record.executor.avatarUrl} size="28px" className="mr-2" />
            </Box>
            <StyledName>{record.executor.name}</StyledName>
          </div>
        ) : null,
    },
    {
      dataIndex: 'author',
      title: formatMessage(messages.author),
      onCell: onCellClick,
      render: (text, record, index) =>
        record.author ? (
          <div className="d-flex align-items-center justify-content-start">
            <Box>
              <AvatarImage src={record.author?.avatarUrl} size="28px" className="mr-2" />
            </Box>
            <StyledName>{record.author.name}</StyledName>
          </div>
        ) : null,
    },
  ]

  return (
    <>
      <div className="d-flex align-item-center justify-content-between mb-4">
        <div className="d-flex align-item-center flex-wrap">
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
          {settings['member_task.permission_group.selector.enabled'] === '1' && (
            <div style={{ width: '180px', marginLeft: 8 }}>
              <PermissionGroupSelector
                single
                value={filter.permissionGroupId}
                onChange={value => {
                  setFilter(filter => ({
                    ...filter,
                    permissionGroupId: value,
                  }))
                  localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, permissionGroupId: value }))
                }}
                onClear={() => {
                  setFilter(filter => ({
                    ...filter,
                    permissionGroupId: undefined,
                  }))
                  localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, permissionGroupId: undefined }))
                }}
              />
            </div>
          )}
        </div>
        {currentMember && jitsiModalVisible && (
          <JitsiDemoModal
            member={meetingMember}
            salesMember={{
              id: currentMember.id,
              name: currentMember.name,
              email: currentMember.email,
            }}
            visible
            onCancel={() => setJitsiModalVisible(false)}
            onFinishCall={(duration: number) => {
              insertMemberNote({
                variables: {
                  memberId: meetingMember.id,
                  authorId: currentMember.id,
                  type: 'demo',
                  status: 'answered',
                  duration: duration,
                  description: '',
                  note: 'jitsi demo',
                },
              })
                .then(() => {
                  message.success(formatMessage(commonMessages.event.successfullySaved))
                  setJitsiModalVisible(false)
                })
                .catch(handleError)
            }}
          />
        )}

        <div>
          <Select
            allowClear
            placeholder={formatMessage(memberMessages.label.status)}
            filterOption={(input, option: any) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            className="mr-3"
            style={{ width: '150px' }}
            value={filter.status}
            onSelect={value => {
              setFilter(filter => ({
                ...filter,
                status: value,
              }))
              localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, status: value }))
              refetchMemberTasks()
            }}
            onClear={() => {
              setFilter(filter => ({
                ...filter,
                status: undefined,
              }))
              localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, status: undefined }))
            }}
          >
            <Select.Option value="pending">{formatMessage(memberMessages.status.statusPending)}</Select.Option>
            <Select.Option value="in-progress">{formatMessage(memberMessages.status.statusInProgress)}</Select.Option>
            <Select.Option value="done">{formatMessage(memberMessages.status.statusDone)}</Select.Option>
          </Select>
          <Select
            allowClear
            showSearch
            placeholder={formatMessage(messages.executor)}
            filterOption={(input, option: any) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            className="mr-3"
            style={{ width: '150px' }}
            value={filter.executor}
            onSelect={value => {
              setFilter(filter => ({
                ...filter,
                executor: `${value}` || undefined,
              }))
              localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, executor: `${value}` || undefined }))
            }}
            onClear={() => {
              setFilter(filter => ({
                ...filter,
                executor: undefined,
              }))
              localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, executor: undefined }))
            }}
          >
            {executors.map(executor => (
              <Select.Option key={executor.id} value={executor.name}>
                {executor.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            allowClear
            showSearch
            placeholder={formatMessage(messages.author)}
            filterOption={(input, option: any) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            className="mr-3"
            style={{ width: '150px' }}
            value={filter.author}
            onSelect={value => {
              setFilter(filter => ({
                ...filter,
                author: `${value}` || undefined,
              }))
              localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, author: `${value}` || undefined }))
            }}
            onClear={() => {
              setFilter(filter => ({
                ...filter,
                author: undefined,
              }))
              localStorage.setItem('memberTaskFilter', JSON.stringify({ ...filter, author: undefined }))
            }}
          >
            {authors.map(author => (
              <Select.Option key={author.id} value={author.name}>
                {author.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            className="mb-3"
            onClick={() => {
              const currentDisplay = display === 'table' ? 'calendar' : 'table'
              setFilter(filter => ({ executor: filter.executor, status: filter.status }))
              setDisplay(currentDisplay)
              localStorage.setItem('memberTaskDisplay', currentDisplay)
            }}
          >
            {display === 'table' ? formatMessage(messages.switchCalendar) : formatMessage(messages.switchTable)}
          </Button>
        </div>
      </div>

      <AdminBlock>
        {display === 'calendar' ? (
          <Spin spinning={loadingMemberTasks}>
            <StyledFullCalendarWrapper>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                eventContent={arg => (
                  <Tooltip title={arg.event.extendedProps.description}>
                    <div className="fc-event-title">
                      <StyledCategoryDot color={arg.event.extendedProps.dotColor} className="mx-1" />
                      <StyledEventTime>{arg.timeText}</StyledEventTime>
                      {arg.event.title}
                    </div>
                  </Tooltip>
                )}
                events={memberTasks
                  .filter(memberTask => memberTask.dueAt)
                  .map(memberTask => {
                    return {
                      id: memberTask.id,
                      title: `${memberTask.title}(${memberTask.member.name})`,
                      description: memberTask.description || '',
                      start: moment(memberTask.dueAt).format(),
                      dotColor: memberTask.category ? categoryColorPairs[memberTask.category?.id] : 'transparent',
                    }
                  })}
                eventClick={e => {
                  setSelectedMemberTask(memberTasks.find(memberTask => memberTask.id === e.event.id) || null)
                  setVisible(true)
                }}
                eventOrder={['start']}
                eventOrderStrict={true}
                datesSet={dateInfo => setFilter(filter => ({ ...filter, dueAt: [dateInfo.start, dateInfo.end] }))}
              />
            </StyledFullCalendarWrapper>
          </Spin>
        ) : display === 'table' ? (
          <Table
            columns={columns}
            dataSource={memberTasks}
            rowKey="id"
            loading={loadingMemberTasks}
            showSorterTooltip={false}
            rowClassName="cursor-pointer"
            pagination={false}
            onChange={sorter => {
              const newSorter = sorter as SorterResult<MemberTaskProps>
              setOrderBy({
                [newSorter.field === 'dueAt' ? 'due_at' : newSorter.field === 'priority' ? 'priority' : 'created_at']:
                  newSorter.order === 'ascend' ? 'asc' : 'desc',
              })
            }}
          />
        ) : null}

        {loadMoreMemberTasks && display === 'table' && (
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
          onCancel={() => {
            setSelectedMemberTask(null)
            setVisible(false)
            const newUrl = `${window.location.pathname}`
            window.history.pushState({ path: newUrl }, '', newUrl)
          }}
        />
      )}
    </>
  )
}

export default MemberTaskAdminBlock
