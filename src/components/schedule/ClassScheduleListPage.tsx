import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Modal, Popover, Space, Table, Tabs, Tag, Typography } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import { FilterDropdownProps } from 'antd/lib/table/interface'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { scheduleMessages } from '.'
import { useClassGroups, useDeleteClassGroup, useMultipleClassGroupsEvents, usePermissionGroupsAsCampuses } from '../../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../../images/icon'
import { ClassGroup } from '../../types/schedule'
import { AdminPageTitle } from '../admin'
import AdminLayout from '../layout/AdminLayout'

const PageWrapper = styled.div`
  padding: 16px 0;
`

const TableWrapper = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
`

const StudentListPopover = styled.div`
  max-height: 200px;
  overflow-y: auto;
`

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  scheduled: 'processing',
  published: 'success',
  archived: 'warning',
}

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  scheduled: '已排課',
  published: '已發布',
  archived: '已封存',
}

export interface ClassScheduleListPageProps {
  scheduleType: 'semester' | 'group'
}

const ClassScheduleListPage: React.FC<ClassScheduleListPageProps> = ({ scheduleType }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [activeTab, setActiveTab] = useState<'published' | 'pre-scheduled'>('published')
  const searchInput = useRef<any>(null)

  // Filter states
  const [filters, setFilters] = useState<{
    campus: string | null
    language: string | null
    person: string | null
  }>({
    campus: null,
    language: null,
    person: null,
  })

  // Fetch class groups from GraphQL
  const { classGroups, loading, refetch } = useClassGroups(scheduleType)
  const { deleteClassGroup } = useDeleteClassGroup()
  const { campuses } = usePermissionGroupsAsCampuses()

  // Get class IDs for fetching events
  const classIds = useMemo(() => classGroups.map(cg => cg.id), [classGroups])

  // Fetch events for all class groups
  const { eventsByClassId, memberMap, loading: eventsLoading } = useMultipleClassGroupsEvents(scheduleType, classIds)

  // Create campus lookup map
  const campusMap = useMemo(() => {
    const map = new Map<string, string>()
    campuses.forEach(c => map.set(c.id, c.name))
    return map
  }, [campuses])

  // Helper function to render student list
  const renderStudentList = useCallback(
    (classGroupId: string) => {
      const summary = eventsByClassId.get(classGroupId)
      if (!summary || summary.studentIds.length === 0) return '-'

      const students = summary.studentIds.map(id => memberMap.get(id)).filter(Boolean) as Array<{
        name: string
        email: string
      }>

      if (students.length === 0) return '-'

      const firstStudent = students[0]
      const othersCount = students.length - 1

      // Popover content: show all other students (excluding the first one)
      const content = (
        <StudentListPopover>
          {students.slice(1).map((s, index) => (
            <div key={index}>
              {s.name} / {s.email}
            </div>
          ))}
        </StudentListPopover>
      )

      // Display format: "name/email and N others"
      const displayText = (
        <span>
          {firstStudent.name}/{firstStudent.email}
          {othersCount > 0 && <Typography.Text type="secondary"> and {othersCount} others</Typography.Text>}
        </span>
      )

      if (othersCount > 0) {
        return (
          <Popover content={content} trigger="hover" placement="bottom">
            <div style={{ cursor: 'pointer' }}>{displayText}</div>
          </Popover>
        )
      }

      return displayText
    },
    [eventsByClassId, memberMap],
  )

  // Helper function to render teacher info
  const renderTeacher = useCallback(
    (classGroupId: string) => {
      const summary = eventsByClassId.get(classGroupId)
      if (!summary?.latestEvent?.teacherId) return '-'

      const teacherInfo = memberMap.get(summary.latestEvent.teacherId)
      if (!teacherInfo) return '-'

      return (
        <div>
          <div>{teacherInfo.name}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {teacherInfo.email}
          </Typography.Text>
        </div>
      )
    },
    [eventsByClassId, memberMap],
  )

  // Helper function to render setting person info
  const renderSettingPerson = useCallback(
    (classGroupId: string) => {
      const summary = eventsByClassId.get(classGroupId)
      if (!summary?.latestEvent) return '-'

      const { createdBy, createdByEmail, updatedBy, updatedByEmail } = summary.latestEvent
      // Prefer updatedBy over createdBy
      const displayId = updatedBy || createdBy
      const displayEmail = updatedByEmail || createdByEmail

      if (!displayId && !displayEmail) return '-'

      // Try to get member info from memberMap
      const memberInfo = displayId ? memberMap.get(displayId) : undefined

      return (
        <div>
          <div>{memberInfo?.name || displayId || '-'}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {memberInfo?.email || displayEmail || '-'}
          </Typography.Text>
        </div>
      )
    },
    [eventsByClassId, memberMap],
  )

  // Helper function to render date range
  const renderDateRange = useCallback(
    (classGroupId: string) => {
      const summary = eventsByClassId.get(classGroupId)
      if (!summary?.dateRange.startDate || !summary?.dateRange.endDate) return '-'

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          timeZone: 'Asia/Taipei',
        })
      }

      const startStr = formatDate(summary.dateRange.startDate)
      const endStr = formatDate(summary.dateRange.endDate)

      // If same date, just show one date
      if (startStr === endStr) {
        return startStr
      }

      return `${startStr} - ${endStr}`
    },
    [eventsByClassId],
  )

  // Helper function to render time range
  const renderTimeRange = useCallback(
    (classGroupId: string) => {
      const summary = eventsByClassId.get(classGroupId)
      if (!summary?.timeRange.startTime || !summary?.timeRange.endTime) return '-'

      return `${summary.timeRange.startTime}-${summary.timeRange.endTime}`
    },
    [eventsByClassId],
  )

  // Helper function to get column search props
  const getColumnSearchProps = useCallback(
    (filterKey: 'campus' | 'language' | 'person'): Partial<ColumnType<ClassGroup>> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder="搜尋..."
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm()
              setFilters(prev => ({ ...prev, [filterKey]: (selectedKeys[0] as string) || null }))
            }}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                confirm()
                setFilters(prev => ({ ...prev, [filterKey]: (selectedKeys[0] as string) || null }))
              }}
              size="small"
              style={{ width: 90 }}
            >
              查詢
            </Button>
            <Button
              onClick={() => {
                clearFilters?.()
                setFilters(prev => ({ ...prev, [filterKey]: null }))
                confirm()
              }}
              size="small"
              style={{ width: 90 }}
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100)
        }
      },
    }),
    [],
  )

  const filteredClassGroups = useMemo(() => {
    let result = classGroups

    // Filter by tab status
    if (activeTab === 'published') {
      result = result.filter(group => group.status === 'published')
    } else if (activeTab === 'pre-scheduled') {
      result = result.filter(group => group.status === 'scheduled' || group.status === 'draft')
    }

    // Apply campus filter (fuzzy search)
    if (filters.campus) {
      const searchText = filters.campus.toLowerCase()
      result = result.filter(group => {
        const campusName = group.campusId ? campusMap.get(group.campusId) : ''
        return campusName?.toLowerCase().includes(searchText)
      })
    }

    // Apply language filter (fuzzy search)
    if (filters.language) {
      const searchText = filters.language.toLowerCase()
      result = result.filter(group => {
        return group.language?.toLowerCase().includes(searchText)
      })
    }

    // Apply person filter (fuzzy search on student/teacher/settingPerson name and email)
    if (filters.person) {
      const searchText = filters.person.toLowerCase()
      result = result.filter(group => {
        const summary = eventsByClassId.get(group.id)
        if (!summary) return false

        // Check students
        const studentMatch = summary.studentIds.some(id => {
          const student = memberMap.get(id)
          return student?.name?.toLowerCase().includes(searchText) || student?.email?.toLowerCase().includes(searchText)
        })
        if (studentMatch) return true

        // Check teacher
        if (summary.latestEvent?.teacherId) {
          const teacher = memberMap.get(summary.latestEvent.teacherId)
          if (teacher?.name?.toLowerCase().includes(searchText) || teacher?.email?.toLowerCase().includes(searchText)) {
            return true
          }
        }

        // Check setting person
        if (summary.latestEvent) {
          const { createdBy, createdByEmail } = summary.latestEvent
          if (createdBy?.toLowerCase().includes(searchText) || createdByEmail?.toLowerCase().includes(searchText)) {
            return true
          }
        }

        return false
      })
    }

    return result
  }, [classGroups, activeTab, filters, campusMap, eventsByClassId, memberMap])

  const handleCreate = useCallback(() => {
    history.push(`/class-schedule/${scheduleType}/create`)
  }, [history, scheduleType])

  const handleEdit = useCallback(
    (classGroup: ClassGroup) => {
      history.push(`/class-schedule/${scheduleType}/${classGroup.id}`)
    },
    [history, scheduleType],
  )

  const handleDelete = useCallback(
    (classGroup: ClassGroup) => {
      Modal.confirm({
        title: '確認刪除',
        content: `確定要刪除班級「${classGroup.name}」嗎？此操作無法復原。`,
        okText: '刪除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            await deleteClassGroup(classGroup.id)
            message.success('班級已刪除')
            refetch()
          } catch (error) {
            console.error('Failed to delete class group:', error)
            message.error('刪除失敗')
          }
        },
      })
    },
    [deleteClassGroup, refetch],
  )

  const columns: ColumnsType<ClassGroup> = [
    {
      title: '校區',
      dataIndex: 'campusId',
      key: 'campusId',
      render: (campusId: string | null) => (campusId ? campusMap.get(campusId) || campusId : '-'),
      ...getColumnSearchProps('campus'),
    },
    {
      title: '教授語言',
      dataIndex: 'language',
      key: 'language',
      ...getColumnSearchProps('language'),
    },
    {
      title: '課程日期',
      key: 'dateRange',
      sorter: (a: ClassGroup, b: ClassGroup) => {
        const aRange = eventsByClassId.get(a.id)?.dateRange
        const bRange = eventsByClassId.get(b.id)?.dateRange
        const aDate = aRange?.startDate?.getTime() || 0
        const bDate = bRange?.startDate?.getTime() || 0
        return aDate - bDate
      },
      render: (_: any, record: ClassGroup) => renderDateRange(record.id),
    },
    {
      title: '課程時間',
      key: 'timeRange',
      sorter: (a: ClassGroup, b: ClassGroup) => {
        const aRange = eventsByClassId.get(a.id)?.timeRange
        const bRange = eventsByClassId.get(b.id)?.timeRange
        const aTime = aRange?.startTime ? parseInt(aRange.startTime.replace(':', '')) : 0
        const bTime = bRange?.startTime ? parseInt(bRange.startTime.replace(':', '')) : 0
        return aTime - bTime
      },
      render: (_: any, record: ClassGroup) => renderTimeRange(record.id),
    },
    {
      title: '班級名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ClassGroup) => (
        <a onClick={() => handleEdit(record)} style={{ cursor: 'pointer' }}>
          {name}
        </a>
      ),
    },
    {
      title: '學生名單 / Email',
      key: 'studentList',
      render: (_: any, record: ClassGroup) => renderStudentList(record.id),
      ...getColumnSearchProps('person'),
    },
    {
      title: '老師姓名 / Email',
      key: 'teacher',
      render: (_: any, record: ClassGroup) => renderTeacher(record.id),
      ...getColumnSearchProps('person'),
    },
    {
      title: '設定人 / Email',
      key: 'settingPerson',
      render: (_: any, record: ClassGroup) => renderSettingPerson(record.id),
      ...getColumnSearchProps('person'),
    },
    {
      title: '人數限制',
      key: 'students',
      render: (_: any, record: ClassGroup) => `${record.minStudents} - ${record.maxStudents} 人`,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{STATUS_LABELS[status] || status}</Tag>
      ),
    },
    {
      title: '最新更新時間',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a: ClassGroup, b: ClassGroup) => {
        const aTime = new Date(a.updatedAt).getTime()
        const bTime = new Date(b.updatedAt).getTime()
        return aTime - bTime
      },
      render: (date: Date) => {
        const d = new Date(date)
        return d.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Taipei',
        })
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: ClassGroup) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ]

  // Get page title and button text based on schedule type
  const pageTitle =
    scheduleType === 'semester'
      ? formatMessage(scheduleMessages['*'].semester)
      : formatMessage(scheduleMessages['*'].group)

  const addButtonText =
    scheduleType === 'semester'
      ? formatMessage(scheduleMessages.SemesterClass.addSchedule)
      : formatMessage(scheduleMessages.GroupClass.addSchedule)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <CalendarCheckFillIcon className="mr-3" />
        <span>{pageTitle}</span>
      </AdminPageTitle>

      <PageWrapper>
        <div className="my-3 d-flex justify-content-end">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {addButtonText}
          </Button>
        </div>

        <TableWrapper>
          <Tabs activeKey={activeTab} onChange={key => setActiveTab(key as 'published' | 'pre-scheduled')}>
            <Tabs.TabPane tab={formatMessage(scheduleMessages['*'].published)} key="published" />
            <Tabs.TabPane tab={formatMessage(scheduleMessages['*'].preScheduled)} key="pre-scheduled" />
          </Tabs>
          <Table
            columns={columns}
            dataSource={filteredClassGroups}
            rowKey="id"
            loading={loading || eventsLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: total => `共 ${total} 個班級`,
            }}
          />
        </TableWrapper>
      </PageWrapper>
    </AdminLayout>
  )
}

export default ClassScheduleListPage
