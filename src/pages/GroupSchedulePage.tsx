import { PlusOutlined } from '@ant-design/icons'
import { Button, Col, message, Modal, Row, Select, Space, Typography } from 'antd'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageBlock, AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import {
  ArrangeCourseModal,
  ClassSettingsPanel,
  ScheduleCalendar,
  ScheduleConditionPanel,
  scheduleMessages,
  ScheduleTable,
  StudentListPanel,
  TeacherListPanel,
} from '../components/schedule'
import {
  useClassGroups,
  useCreateClassGroup,
  useHolidays,
  useOrdersByIds,
  useScheduleExpirySettings,
  useTeacherOpenTimeEvents,
  useUpdateClassGroup,
} from '../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../images/icon'
import { ClassGroup, Order, ScheduleCondition, ScheduleEvent, scheduleStore, Teacher } from '../types/schedule'

const PageWrapper = styled.div`
  padding: 16px 0;
`

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
`

// Grid column with equal height support
const GridColumn = styled(Col)`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }

  > * {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .ant-card {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .ant-card-body {
    flex: 1;
    overflow: auto;
  }
`

// Stacked panels container for left column
const StackedPanels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  > * {
    flex: 1;
  }
`

const GroupSchedulePage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { holidays: defaultExcludeDates } = useHolidays()

  // View mode: list or arrange
  const [viewMode, setViewMode] = useState<'list' | 'arrange'>('list')

  // Selected class group
  const [selectedClassGroup, setSelectedClassGroup] = useState<ClassGroup | undefined>()
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([])

  // Schedule condition
  const [scheduleCondition, setScheduleCondition] = useState<ScheduleCondition>({
    startDate: new Date(),
    excludedDates: [],
    excludeHolidays: true,
  })

  // State to trigger re-render when store changes
  const [storeUpdateCounter, setStoreUpdateCounter] = useState(0)

  // Modal state
  const [arrangeModalVisible, setArrangeModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | undefined>()
  const [createClassModalVisible, setCreateClassModalVisible] = useState(false)

  // GraphQL hooks
  const { classGroups, refetch: refetchClassGroups } = useClassGroups('group')
  const { createClassGroup } = useCreateClassGroup()
  const { updateClassGroup } = useUpdateClassGroup()
  const { orders: orderLogs } = useOrdersByIds(selectedClassGroup?.orderIds || [])
  const { calculateExpiryDate } = useScheduleExpirySettings('group')

  // Get holidays for calendar
  const holidays = useMemo(() => {
    return defaultExcludeDates.map(h => h.date)
  }, [defaultExcludeDates])

  // Get events for calendar
  const calendarEvents = useMemo(() => {
    if (!selectedClassGroup) return []
    return scheduleStore.getEvents('group').filter(e => e.classId === selectedClassGroup.id)
  }, [selectedClassGroup, storeUpdateCounter])

  const visibleCalendarEvents = useMemo(() => {
    if (selectedTeachers.length === 0) return calendarEvents
    const selectedTeacherIds = new Set(selectedTeachers.map(t => t.id))
    return calendarEvents.filter(event => !event.teacherId || selectedTeacherIds.has(event.teacherId))
  }, [calendarEvents, selectedTeachers])

  // Get materials from class group
  const classMaterials = useMemo(() => {
    return selectedClassGroup?.materials || []
  }, [selectedClassGroup])

  const selectedTeacherIds = useMemo(() => {
    return selectedTeachers.filter(t => t && t.id).map(t => t.id)
  }, [selectedTeachers])

  const teacherOpenTimeRange = useMemo(() => {
    const start = scheduleCondition.startDate
    const end = scheduleCondition.endDate
      ? scheduleCondition.endDate
      : new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000)
    return { start, end }
  }, [scheduleCondition.startDate, scheduleCondition.endDate])

  const { events: teacherOpenTimeEvents, busyEvents: teacherBusyEvents } = useTeacherOpenTimeEvents(
    selectedTeacherIds,
    teacherOpenTimeRange.start,
    teacherOpenTimeRange.end,
  )

  const studentOrders = useMemo((): Order[] => {
    if (!selectedClassGroup) return []
    const now = new Date()

    return orderLogs
      .map(orderLog => {
        const classProduct = orderLog.order_products?.find((product: any) => {
          const options = product.options?.options
          if (!options) return false
          if (options.product === '教材') return false
          if (options.class_type !== '小組班') return false
          if (selectedClassGroup.language && options.language && options.language !== selectedClassGroup.language) {
            return false
          }
          return true
        })

        if (!classProduct) return null

        const productOptions = classProduct.options as any
        const productMeta = productOptions?.options || {}
        const orderOptions = orderLog.options as any
        const totalSessions =
          productMeta?.total_sessions?.max || productOptions?.total_sessions?.max || productOptions?.quantity || 0
        const totalMinutes = totalSessions * 50
        const createdAt = new Date(orderLog.created_at)
        const expiredAt = orderLog.expired_at ? new Date(orderLog.expired_at) : null
        const campusFromOptions =
          orderOptions?.campus_id || orderOptions?.campusId || productMeta?.campus_id || productMeta?.campusId || null
        const expiryBySetting = calculateExpiryDate(
          productMeta?.language || selectedClassGroup.language,
          totalSessions,
          scheduleCondition.startDate,
        )
        const expiresAt = expiryBySetting || (classProduct.ended_at ? new Date(classProduct.ended_at) : undefined)

        if ((orderLog.status || '').includes('EXPIRED')) return null
        if (expiredAt && expiredAt < now) return null
        if (expiresAt && expiresAt < now) return null
        if (selectedClassGroup.campusId && campusFromOptions && campusFromOptions !== selectedClassGroup.campusId) {
          return null
        }

        return {
          id: orderLog.id,
          studentId: orderLog.member_id,
          productName: productMeta?.title || classProduct.name || '',
          language: productMeta?.language || selectedClassGroup.language || '',
          type: 'group',
          totalMinutes,
          usedMinutes: 0,
          availableMinutes: totalMinutes,
          createdAt,
          expiresAt,
          lastClassDate: undefined,
          status: orderLog.status,
          campus: campusFromOptions || selectedClassGroup.campusId || '',
          materials: [],
        } as Order
      })
      .filter(Boolean) as Order[]
  }, [selectedClassGroup, orderLogs, calculateExpiryDate, scheduleCondition.startDate])

  // Calculate min available minutes across all students (for group class constraint)
  const minAvailableMinutes = useMemo(() => {
    if (studentOrders.length === 0) return 0

    // Group orders by student and get their total available minutes
    const studentMinutes = new Map<string, number>()
    studentOrders.forEach(order => {
      const current = studentMinutes.get(order.studentId) || 0
      studentMinutes.set(order.studentId, current + order.availableMinutes)
    })

    // Return the minimum across all students
    return Math.min(...Array.from(studentMinutes.values()))
  }, [studentOrders])

  // Get earliest expiry date for end date constraint
  const earliestExpiryDate = useMemo(() => {
    if (studentOrders.length === 0) return null
    const expiryDates = studentOrders.map(order => order.expiresAt).filter((date): date is Date => Boolean(date))
    if (expiryDates.length === 0) return null
    return expiryDates.reduce((earliest, date) => (date < earliest ? date : earliest), expiryDates[0])
  }, [studentOrders])

  // Get paid student count for publish check
  const paidStudentCount = useMemo(() => {
    const paidStudents = new Set(studentOrders.filter(o => o.status === 'SUCCESS').map(o => o.studentId))
    return paidStudents.size
  }, [studentOrders])

  const expiryDateByOrderId = useMemo(() => {
    const map: Record<string, Date | null> = {}
    studentOrders.forEach(order => {
      map[order.id] = order.expiresAt || null
    })
    return map
  }, [studentOrders])

  const expiryDateByLanguage = useMemo<Record<string, Date | null>>(() => {
    if (!selectedClassGroup?.language || !earliestExpiryDate) return {}
    return {
      [selectedClassGroup.language]: earliestExpiryDate,
    }
  }, [selectedClassGroup?.language, earliestExpiryDate])

  const orderInfoById = useMemo(() => {
    const map: Record<string, { studentId: string; name: string; email: string; status: string }> = {}
    orderLogs.forEach(orderLog => {
      map[orderLog.id] = {
        studentId: orderLog.member_id,
        name: orderLog.member?.name || '',
        email: orderLog.member?.email || '',
        status: orderLog.status,
      }
    })
    return map
  }, [orderLogs])

  const unpaidStudentsByEventId = useMemo(() => {
    const map: Record<string, Array<{ name: string; email: string }>> = {}

    calendarEvents.forEach(event => {
      if (event.status !== 'published') return
      const unpaidStudents = (event.orderIds || [])
        .map(orderId => orderInfoById[orderId])
        .filter(info => info && info.status !== 'SUCCESS')

      if (unpaidStudents.length === 0) return

      const deduped: Array<{ name: string; email: string }> = []
      const seen = new Set<string>()
      unpaidStudents.forEach(info => {
        if (seen.has(info.studentId)) return
        seen.add(info.studentId)
        deduped.push({ name: info.name || '-', email: info.email || '-' })
      })

      if (deduped.length > 0) {
        map[event.id] = deduped
      }
    })

    return map
  }, [calendarEvents, orderInfoById])

  // Handlers
  const handleClassGroupChange = useCallback(
    (classId: string) => {
      const classGroup = classGroups.find(c => c.id === classId)
      setSelectedClassGroup(classGroup)
      setSelectedTeachers([])
    },
    [classGroups],
  )

  const handleClassGroupUpdate = useCallback(
    async (updates: Partial<ClassGroup>) => {
      if (selectedClassGroup) {
        try {
          await updateClassGroup(selectedClassGroup.id, updates)
          setSelectedClassGroup(prev => (prev ? { ...prev, ...updates } : prev))
          if (updates.language && updates.language !== selectedClassGroup.language) {
            setSelectedTeachers([])
          }
          refetchClassGroups()
        } catch (error) {
          console.error('Failed to update class group:', error)
          message.error('更新班級失敗')
        }
      }
    },
    [selectedClassGroup, updateClassGroup, refetchClassGroups],
  )

  const handleCampusChange = useCallback(
    async (newCampus: string, confirmed: boolean) => {
      if (confirmed && selectedClassGroup) {
        try {
          await updateClassGroup(selectedClassGroup.id, { campusId: newCampus })
          setSelectedClassGroup(prev => (prev ? { ...prev, campusId: newCampus } : prev))
          setSelectedTeachers([])
          refetchClassGroups()
        } catch (error) {
          console.error('Failed to update campus:', error)
          message.error('更新校區失敗')
        }
      }
    },
    [selectedClassGroup, updateClassGroup, refetchClassGroups],
  )

  const handleTeachersChange = useCallback((teachers: Teacher[]) => {
    setSelectedTeachers(teachers)
  }, [])

  const handleConditionChange = useCallback((updates: Partial<ScheduleCondition>) => {
    setScheduleCondition(prev => ({ ...prev, ...updates }))
  }, [])

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date)
    setEditingEvent(undefined)
    setArrangeModalVisible(true)
  }, [])

  const handleEventClick = useCallback((event: ScheduleEvent) => {
    setSelectedDate(event.date)
    setEditingEvent(event)
    setArrangeModalVisible(true)
  }, [])

  const handleSaveEvents = useCallback(
    (events: Partial<ScheduleEvent>[]) => {
      const studentIds = Array.from(new Set(studentOrders.map(order => order.studentId)))
      events.forEach(event => {
        if (event.id) {
          scheduleStore.updateEvent(event.id, event)
        } else {
          scheduleStore.addEvent({
            ...event,
            scheduleType: 'group',
            status: 'pending',
            classId: selectedClassGroup?.id,
            studentIds,
            orderIds: studentOrders.map(o => o.id),
            campus: selectedClassGroup?.campusId || '',
            language: selectedClassGroup?.language || 'zh-TW',
            createdBy: 'current-user',
            createdByEmail: 'user@example.com',
            updatedAt: new Date(),
          } as ScheduleEvent)
        }
      })
      setStoreUpdateCounter(prev => prev + 1)
      message.success('課程已安排')
    },
    [selectedClassGroup, studentOrders],
  )

  const handleDeleteEvent = useCallback((event: ScheduleEvent) => {
    scheduleStore.deleteEvent(event.id)
    setStoreUpdateCounter(prev => prev + 1)
    message.success('課程已刪除')
  }, [])

  const handleEditFromTable = useCallback(
    (event: ScheduleEvent) => {
      // Switch to arrange mode and load the event
      setViewMode('arrange')
      const classGroup = classGroups.find(c => c.id === event.classId)
      setSelectedClassGroup(classGroup)
      setEditingEvent(event)
      setArrangeModalVisible(true)
    },
    [classGroups],
  )

  const handlePreSchedule = useCallback(() => {
    const pendingEvents = calendarEvents.filter(e => e.status === 'pending')
    if (pendingEvents.length === 0) {
      message.warning('沒有待處理的課程')
      return
    }

    pendingEvents.forEach(event => {
      scheduleStore.updateEvent(event.id, { status: 'pre-scheduled' })
    })
    setStoreUpdateCounter(prev => prev + 1)
    message.success(`已預排 ${pendingEvents.length} 堂課程`)
  }, [calendarEvents])

  const handlePublish = useCallback(() => {
    // Check if enough students have paid
    if (selectedClassGroup && paidStudentCount < selectedClassGroup.minStudents) {
      message.error(
        formatMessage(scheduleMessages.Publish.minStudentsRequired, { count: selectedClassGroup.minStudents }),
      )
      return
    }

    const preScheduledEvents = calendarEvents.filter(e => e.status === 'pre-scheduled')
    if (preScheduledEvents.length === 0) {
      message.warning('沒有已預排的課程')
      return
    }

    preScheduledEvents.forEach(event => {
      scheduleStore.updateEvent(event.id, { status: 'published' })
    })
    setStoreUpdateCounter(prev => prev + 1)
    message.success(`已發布 ${preScheduledEvents.length} 堂課程`)
  }, [selectedClassGroup, paidStudentCount, calendarEvents, formatMessage])

  const canPublish = useMemo(() => {
    if (!selectedClassGroup) return false
    return paidStudentCount >= selectedClassGroup.minStudents && calendarEvents.some(e => e.status === 'pre-scheduled')
  }, [selectedClassGroup, paidStudentCount, calendarEvents])

  const handleCreateClass = useCallback(async () => {
    try {
      const newClassId = await createClassGroup({
        name: '新小組班',
        type: 'group',
        campusId: null,
        language: '中文',
        minStudents: 2,
        maxStudents: 8,
        materials: [],
        status: 'draft',
      })
      if (newClassId) {
        await refetchClassGroups()
        // Find the new class group from refetched data
        const newClass = classGroups.find(c => c.id === newClassId)
        if (newClass) {
          setSelectedClassGroup(newClass)
        }
      }
      setCreateClassModalVisible(false)
      message.success('已建立新班級')
    } catch (error) {
      console.error('Failed to create class group:', error)
      message.error('建立班級失敗')
    }
  }, [createClassGroup, refetchClassGroups, classGroups])

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <CalendarCheckFillIcon className="mr-3" />
        <span>{formatMessage(scheduleMessages['*'].group)}</span>
      </AdminPageTitle>

      <PageWrapper>
        {viewMode === 'list' ? (
          <>
            {/* List View */}
            <ActionBar>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {formatMessage(scheduleMessages['*'].group)}
              </Typography.Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setViewMode('arrange')}>
                新增排課
              </Button>
            </ActionBar>

            <ScheduleTable scheduleType="group" onEdit={handleEditFromTable} onDelete={handleDeleteEvent} />
          </>
        ) : (
          <>
            {/* Arrange View */}
            <ActionBar>
              <Space>
                <Button onClick={() => setViewMode('list')}>{formatMessage(scheduleMessages['*'].back)}</Button>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  新增小組班排課
                </Typography.Title>
              </Space>
              <Space>
                <Select
                  placeholder="選擇班級"
                  value={selectedClassGroup?.id}
                  onChange={handleClassGroupChange}
                  style={{ width: 200 }}
                  showSearch
                  optionFilterProp="children"
                >
                  {classGroups.map(classGroup => (
                    <Select.Option key={classGroup.id} value={classGroup.id}>
                      {classGroup.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button onClick={() => setCreateClassModalVisible(true)}>建立新班級</Button>
                <Button
                  onClick={handlePreSchedule}
                  disabled={calendarEvents.filter(e => e.status === 'pending').length === 0}
                >
                  預排
                </Button>
                <Button type="primary" onClick={handlePublish} disabled={!canPublish}>
                  發布
                </Button>
              </Space>
            </ActionBar>

            {/* Top Section using Grid for equal height */}
            <Row gutter={16} style={{ marginBottom: 16 }} align="stretch">
              <GridColumn xs={24} sm={24} md={10} lg={10}>
                <StackedPanels>
                  <ClassSettingsPanel
                    classGroup={selectedClassGroup}
                    classType="group"
                    onChange={handleClassGroupUpdate}
                    onCampusChange={handleCampusChange}
                  />
                  <StudentListPanel
                    orderIds={selectedClassGroup?.orderIds || []}
                    classGroupId={selectedClassGroup?.id}
                    scheduleType="group"
                    language={selectedClassGroup?.language}
                    campusId={selectedClassGroup?.campusId}
                    maxStudents={selectedClassGroup?.maxStudents}
                    events={calendarEvents}
                    expiryDateByOrderId={expiryDateByOrderId}
                    onOrdersChanged={refetchClassGroups}
                  />
                </StackedPanels>
              </GridColumn>
              <GridColumn xs={24} sm={24} md={14} lg={14}>
                <ScheduleConditionPanel
                  selectedOrders={studentOrders}
                  condition={scheduleCondition}
                  onConditionChange={handleConditionChange}
                  minutesLimitMode="minPerStudent"
                  endDateLimitMode="earliest"
                  expiryDateByLanguage={expiryDateByLanguage}
                />
              </GridColumn>
            </Row>

            {/* Teacher List */}
            <AdminPageBlock className="mb-4">
              <TeacherListPanel
                languages={selectedClassGroup?.language ? [selectedClassGroup.language] : []}
                campus={selectedClassGroup?.campusId}
                selectedTeachers={selectedTeachers}
                onTeacherSelect={handleTeachersChange}
                useRealData={true}
                scheduleCondition={scheduleCondition}
                enableAvailabilitySort={true}
              />
            </AdminPageBlock>

            {/* Calendar */}
            <AdminPageBlock>
              <ScheduleCalendar
                scheduleType="group"
                events={visibleCalendarEvents}
                selectedTeachers={selectedTeachers}
                teacherOpenTimeEvents={teacherOpenTimeEvents}
                holidays={scheduleCondition.excludeHolidays ? holidays : []}
                excludedDates={scheduleCondition.excludedDates}
                viewDate={scheduleCondition.startDate}
                unpaidStudentsByEventId={unpaidStudentsByEventId}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            </AdminPageBlock>
          </>
        )}
      </PageWrapper>

      {/* Arrange Course Modal */}
      <ArrangeCourseModal
        visible={arrangeModalVisible}
        scheduleType="group"
        selectedDate={selectedDate}
        selectedTeachers={selectedTeachers}
        campus={selectedClassGroup?.campusId || ''}
        language={selectedClassGroup?.language || 'zh-TW'}
        orderMaterials={classMaterials}
        existingEvent={editingEvent}
        availableMinutes={minAvailableMinutes}
        scheduleCondition={scheduleCondition}
        teacherOpenTimeEvents={teacherOpenTimeEvents}
        teacherBusyEvents={teacherBusyEvents}
        onClose={() => {
          setArrangeModalVisible(false)
          setEditingEvent(undefined)
        }}
        onSave={handleSaveEvents}
      />

      {/* Create Class Modal */}
      <Modal
        title="建立新班級"
        open={createClassModalVisible}
        onOk={handleCreateClass}
        onCancel={() => setCreateClassModalVisible(false)}
        okText="建立"
        cancelText="取消"
      >
        <Typography.Text>確定要建立新的小組班嗎？建立後可在班級設定中修改詳細資訊。</Typography.Text>
      </Modal>
    </AdminLayout>
  )
}

export default GroupSchedulePage
