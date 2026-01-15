import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Input, Menu, Modal, Popover, Table, Tabs, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import dayjs from 'dayjs'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { usePermissionGroupsAsCampuses, usePersonalScheduleListEvents } from '../../hooks/scheduleManagement'
import { mockStudents, ScheduleEvent, ScheduleStatus, scheduleStore, ScheduleType, Student } from '../../types/schedule'
import scheduleMessages from './translation'

const { TabPane } = Tabs
const { Search } = Input

const TableWrapper = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
`

const StudentListPopover = styled.div`
  max-height: 200px;
  overflow-y: auto;
`

interface ScheduleTableProps {
  scheduleType: ScheduleType
  onEdit: (event: ScheduleEvent) => void
  onDelete: (event: ScheduleEvent) => Promise<void>
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ scheduleType, onEdit, onDelete }) => {
  const { formatMessage } = useIntl()
  const [activeTab, setActiveTab] = useState<ScheduleStatus>('published')
  const [searchText, setSearchText] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null)

  // Use real API data for personal schedule type
  const apiStatus = useMemo(() => {
    if (activeTab === 'published') return 'published'
    if (activeTab === 'pre-scheduled') return 'pre-scheduled'
    return 'all'
  }, [activeTab])

  const {
    events: apiEvents,
    loading: apiLoading,
    refetch: refetchApiEvents,
  } = usePersonalScheduleListEvents(scheduleType === 'personal' ? apiStatus : undefined)

  const { campuses: permissionCampuses } = usePermissionGroupsAsCampuses()

  // Debug log
  console.log(
    '[ScheduleTable] scheduleType:',
    scheduleType,
    'apiStatus:',
    apiStatus,
    'apiEvents:',
    apiEvents?.length,
    'apiLoading:',
    apiLoading,
  )

  const campuses = scheduleType === 'personal' ? permissionCampuses : scheduleStore.getCampuses()
  const teachers = scheduleType === 'personal' ? [] : scheduleStore.getTeachers()

  const events = useMemo(() => {
    // Use API data for personal type, mock store for others
    let allEvents: ScheduleEvent[] =
      scheduleType === 'personal' ? apiEvents : scheduleStore.getEvents(scheduleType, activeTab)

    if (searchText) {
      const search = searchText.toLowerCase()
      allEvents = allEvents.filter(event => {
        // Search by student name/email
        if (scheduleType === 'personal') {
          const apiEvent = event as any
          if (
            apiEvent.studentName?.toLowerCase().includes(search) ||
            apiEvent.studentEmail?.toLowerCase().includes(search)
          ) {
            return true
          }
        } else if (event.studentId) {
          const student = scheduleStore.getStudentById(event.studentId)
          if (student?.name.toLowerCase().includes(search) || student?.email.toLowerCase().includes(search)) {
            return true
          }
        }

        // Search by teacher name/email
        if (scheduleType === 'personal') {
          const apiEvent = event as any
          if (
            apiEvent.teacherName?.toLowerCase().includes(search) ||
            apiEvent.teacherEmail?.toLowerCase().includes(search)
          ) {
            return true
          }
        } else if (event.teacherId) {
          const teacher = teachers.find(t => t.id === event.teacherId)
          if (teacher?.name.toLowerCase().includes(search) || teacher?.email.toLowerCase().includes(search)) {
            return true
          }
        }

        // Search by campus
        const campus = campuses.find(c => c.id === event.campus)
        if (campus?.name.toLowerCase().includes(search)) {
          return true
        }

        // Search by material
        if (event.material?.toLowerCase().includes(search)) {
          return true
        }

        return false
      })
    }

    // Sort by date (most recent first)
    return allEvents.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  }, [scheduleType, activeTab, searchText, apiEvents, campuses, teachers])

  const loading = scheduleType === 'personal' ? apiLoading : false

  const getStudentDisplay = useCallback(
    (event: ScheduleEvent): React.ReactNode => {
      if (scheduleType === 'personal') {
        const apiEvent = event as any
        if (!apiEvent.studentName && !apiEvent.studentEmail) return '-'
        return (
          <div>
            <div>{apiEvent.studentName || '-'}</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {apiEvent.studentEmail || '-'}
            </Typography.Text>
          </div>
        )
      }

      if ((scheduleType === 'semester' || scheduleType === 'group') && event.studentIds) {
        const students = event.studentIds.map(id => mockStudents.find(s => s.id === id)).filter(Boolean) as Student[]

        if (students.length === 0) return '-'

        const firstStudent = students[0]
        const othersCount = students.length - 1

        const content = (
          <StudentListPopover>
            {students.map(s => (
              <div key={s.id}>
                {s.name} / {s.email}
              </div>
            ))}
          </StudentListPopover>
        )

        return (
          <Popover content={content} trigger="hover">
            <div style={{ cursor: 'pointer' }}>
              <div>
                {firstStudent.name} / {firstStudent.email}
              </div>
              {othersCount > 0 && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatMessage(scheduleMessages.ScheduleTable.andOthers, { count: othersCount })}
                </Typography.Text>
              )}
            </div>
          </Popover>
        )
      }

      return '-'
    },
    [scheduleType, formatMessage],
  )

  const handleDeleteClick = useCallback((event: ScheduleEvent) => {
    setEventToDelete(event)
    setDeleteModalVisible(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (eventToDelete) {
      try {
        await onDelete(eventToDelete)
        setDeleteModalVisible(false)
        setEventToDelete(null)
        // Refetch events after successful deletion
        if (scheduleType === 'personal') {
          refetchApiEvents()
        }
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }, [eventToDelete, onDelete, scheduleType, refetchApiEvents])

  const baseColumns: ColumnsType<ScheduleEvent> = [
    {
      title: formatMessage(scheduleMessages.ScheduleTable.campus),
      dataIndex: 'campus',
      key: 'campus',
      render: campusId => campuses.find(c => c.id === campusId)?.name || campusId,
      filterSearch: true,
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.language),
      dataIndex: 'language',
      key: 'language',
      render: lang => {
        const labels: Record<string, string> = {
          'zh-TW': '中文(繁)',
          'zh-CN': '中文(簡)',
          'en-US': '英文',
          ja: '日文',
          ko: '韓文',
          de: '德文',
          fr: '法文',
          es: '西文',
        }
        return labels[lang] || lang
      },
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.courseDate),
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      defaultSortOrder: 'descend',
      render: date => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.courseTime),
      key: 'time',
      sorter: (a, b) => {
        const aTime = parseInt(a.startTime.replace(':', ''))
        const bTime = parseInt(b.startTime.replace(':', ''))
        return bTime - aTime
      },
      render: (_, record) => `${record.startTime}–${record.endTime}`,
    },
  ]

  const personalColumns: ColumnsType<ScheduleEvent> = [
    ...baseColumns,
    {
      title: formatMessage(scheduleMessages.ScheduleTable.studentName),
      key: 'student',
      render: (_, record) => getStudentDisplay(record),
    },
  ]

  const classColumns: ColumnsType<ScheduleEvent> = [
    ...baseColumns,
    {
      title: formatMessage(scheduleMessages.ScheduleTable.className),
      key: 'className',
      render: (_, record) => {
        if (record.classId) {
          const classGroup = scheduleStore.getClassGroupById(record.classId)
          return classGroup?.name || '-'
        }
        return '-'
      },
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.studentList),
      key: 'studentList',
      render: (_, record) => getStudentDisplay(record),
    },
  ]

  const commonEndColumns: ColumnsType<ScheduleEvent> = [
    {
      title: formatMessage(scheduleMessages.ScheduleTable.teacherName),
      key: 'teacher',
      render: (_, record) => {
        if (scheduleType === 'personal') {
          const apiEvent = record as any
          return apiEvent.teacherName ? (
            <div>
              <div>{apiEvent.teacherName}</div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {apiEvent.teacherEmail || '-'}
              </Typography.Text>
            </div>
          ) : (
            '-'
          )
        }

        const teacher = teachers.find(t => t.id === record.teacherId)
        return teacher ? (
          <div>
            <div>{teacher.name}</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {teacher.email}
            </Typography.Text>
          </div>
        ) : (
          '-'
        )
      },
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.settingPerson),
      key: 'settingPerson',
      render: (_, record) => (
        <div>
          <div>{record.createdBy}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.createdByEmail}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.lastUpdated),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      render: date => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(record)}>
                {formatMessage(scheduleMessages['*'].edit)}
              </Menu.Item>
              <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(record)}>
                {formatMessage(scheduleMessages['*'].delete)}
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const columns =
    scheduleType === 'personal' ? [...personalColumns, ...commonEndColumns] : [...classColumns, ...commonEndColumns]

  return (
    <TableWrapper>
      <Tabs activeKey={activeTab} onChange={key => setActiveTab(key as ScheduleStatus)}>
        <TabPane tab={formatMessage(scheduleMessages['*'].published)} key="published" />
        <TabPane tab={formatMessage(scheduleMessages['*'].preScheduled)} key="pre-scheduled" />
      </Tabs>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder={formatMessage(scheduleMessages['*'].search)}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 筆`,
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title={formatMessage(scheduleMessages.ScheduleTable.deleteTitle)}
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDeleteModalVisible(false)}>
            {formatMessage(scheduleMessages['*'].back)}
          </Button>,
          <Button key="delete" danger type="primary" onClick={handleDeleteConfirm}>
            {formatMessage(scheduleMessages['*'].delete)}
          </Button>,
        ]}
      >
        <Typography.Text>{formatMessage(scheduleMessages.ScheduleTable.deleteMessage)}</Typography.Text>
      </Modal>
    </TableWrapper>
  )
}

export default ScheduleTable
