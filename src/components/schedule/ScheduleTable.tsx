import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Space, Table, Tabs, Typography } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import { FilterDropdownProps } from 'antd/lib/table/interface'
import dayjs from 'dayjs'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { usePermissionGroupsAsCampuses, usePersonalScheduleListEvents } from '../../hooks/scheduleManagement'
import { ScheduleEvent, ScheduleStatus, ScheduleType } from '../../types/schedule'
import scheduleMessages from './translation'

const { TabPane } = Tabs

const TableWrapper = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
`

interface ScheduleTableProps {
  scheduleType: ScheduleType
  onEdit: (event: ScheduleEvent) => void
  onDelete: (event: ScheduleEvent) => Promise<void>
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ scheduleType, onEdit, onDelete }) => {
  const { formatMessage } = useIntl()
  const [activeTab, setActiveTab] = useState<ScheduleStatus>('published')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null)
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

  const campuses = useMemo(() => {
    return permissionCampuses
  }, [permissionCampuses])

  const campusMap = useMemo(() => {
    return new Map(campuses.map(campus => [campus.id, campus.name]))
  }, [campuses])

  const getCampusDisplay = useCallback(
    (campusValue?: string | null) => {
      if (!campusValue) return '-'
      return campusMap.get(campusValue) || campusValue
    },
    [campusMap],
  )

  const getCampusSearchText = useCallback(
    (campusValue?: string | null) => {
      if (!campusValue) return ''
      const campusName = campusMap.get(campusValue) || ''
      return `${campusName} ${campusValue}`.trim().toLowerCase()
    },
    [campusMap],
  )

  const events = useMemo(() => {
    // Use API data for personal type (semester/group types are not used in this component)
    let allEvents: ScheduleEvent[] = scheduleType === 'personal' ? apiEvents : []

    // Apply campus filter (fuzzy search)
    if (filters.campus) {
      const search = filters.campus.toLowerCase()
      allEvents = allEvents.filter(event => {
        return getCampusSearchText(event.campus).includes(search)
      })
    }

    // Apply language filter (fuzzy search)
    if (filters.language) {
      const search = filters.language.toLowerCase()
      allEvents = allEvents.filter(event => {
        return event.language?.toLowerCase().includes(search)
      })
    }

    // Apply person filter (fuzzy search on student/teacher/settingPerson name and email)
    if (filters.person) {
      const search = filters.person.toLowerCase()
      allEvents = allEvents.filter(event => {
        // Search by student name/email (personal schedule uses API event with studentName/Email)
        const apiEvent = event as any
        if (
          apiEvent.studentName?.toLowerCase().includes(search) ||
          apiEvent.studentEmail?.toLowerCase().includes(search)
        ) {
          return true
        }

        // Search by teacher name/email
        if (
          apiEvent.teacherName?.toLowerCase().includes(search) ||
          apiEvent.teacherEmail?.toLowerCase().includes(search)
        ) {
          return true
        }

        // Search by setting person
        if (event.createdBy?.toLowerCase().includes(search) || event.createdByEmail?.toLowerCase().includes(search)) {
          return true
        }

        return false
      })
    }

    // Sort by date (most recent first) without mutating source
    return [...allEvents].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  }, [scheduleType, filters, apiEvents, getCampusSearchText])

  const loading = scheduleType === 'personal' ? apiLoading : false

  const getStudentDisplay = useCallback((event: ScheduleEvent): React.ReactNode => {
    // Only personal schedule type is used in this component
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
  }, [])

  // Helper function to get column search props
  const getColumnSearchProps = useCallback(
    (filterKey: 'campus' | 'language' | 'person'): Partial<ColumnType<ScheduleEvent>> => ({
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
      render: campusId => getCampusDisplay(campusId),
      ...getColumnSearchProps('campus'),
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
      ...getColumnSearchProps('language'),
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
      ...getColumnSearchProps('person'),
    },
  ]

  const commonEndColumns: ColumnsType<ScheduleEvent> = [
    {
      title: formatMessage(scheduleMessages.ScheduleTable.teacherName),
      key: 'teacher',
      render: (_, record) => {
        // Only personal schedule type is used in this component
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
      },
      ...getColumnSearchProps('person'),
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.settingPerson),
      key: 'settingPerson',
      render: (_, record) => {
        const displayName = record.createdBy || record.createdByEmail || '-'
        const displayEmail = record.createdBy ? record.createdByEmail : ''
        return (
          <div>
            <div>{displayName}</div>
            {displayEmail ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {displayEmail}
              </Typography.Text>
            ) : null}
          </div>
        )
      },
      ...getColumnSearchProps('person'),
    },
    {
      title: formatMessage(scheduleMessages.ScheduleTable.lastUpdated),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      render: date => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: ScheduleEvent) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteClick(record)} />
        </Space>
      ),
    },
  ]

  // Only personal schedule type is used in this component
  const columns = [...personalColumns, ...commonEndColumns]

  return (
    <TableWrapper>
      <Tabs activeKey={activeTab} onChange={key => setActiveTab(key as ScheduleStatus)}>
        <TabPane tab={formatMessage(scheduleMessages['*'].published)} key="published" />
        <TabPane tab={formatMessage(scheduleMessages['*'].preScheduled)} key="pre-scheduled" />
      </Tabs>

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
