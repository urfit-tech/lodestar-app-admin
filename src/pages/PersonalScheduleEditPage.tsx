import { Button, Col, message, Row, Space, Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageBlock, AdminPageTitle } from '../components/admin'
import { GeneralEventApi } from '../components/event/events.type'
import AdminLayout from '../components/layout/AdminLayout'
import {
  ArrangeCourseModal,
  OrderSelectionPanel,
  ScheduleCalendar,
  ScheduleConditionPanel,
  scheduleMessages,
  StudentInfoPanel,
  TeacherListPanel,
} from '../components/schedule'
import {
  createEventFetcher,
  createInvitationFetcher,
  getResourceByTypeTargetFetcher,
  updateEvent,
} from '../helpers/eventHelper/eventFetchers'
import {
  useHolidays,
  useMemberOrders,
  useScheduleExpirySettings,
  useStudentOpenTimeEvents,
  useTeacherOpenTimeEvents,
} from '../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../images/icon'
import { Language, ScheduleCondition, ScheduleEvent, scheduleStore, Student, Teacher } from '../types/schedule'
import type { CourseRow } from '../components/schedule/ArrangeCourseModal'

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

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`

const PersonalScheduleEditPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { memberId } = useParams<{ memberId: string }>()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const { holidays: defaultExcludeDates } = useHolidays()

  // Selected student for arranging
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>()
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([])

  // Schedule condition
  const [scheduleCondition, setScheduleCondition] = useState<ScheduleCondition>({
    startDate: new Date(),
    excludedDates: [],
    excludeHolidays: true,
  })

  // Modal state
  const [arrangeModalVisible, setArrangeModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | undefined>()

  // State to trigger re-render when store changes
  const [storeUpdateCounter, setStoreUpdateCounter] = useState(0)

  // Draft rows for saving between modal sessions
  const [draftRows, setDraftRows] = useState<CourseRow[] | undefined>()

  // Load member data when memberId changes
  useEffect(() => {
    if (memberId) {
      setSelectedStudent({
        id: memberId,
        name: '', // Will be populated from API
        email: '',
        campus: '',
      })
      setSelectedOrderIds([])
      setSelectedTeachers([])
    }
  }, [memberId])

  // Get orders for selected student from GraphQL
  const { orders: studentOrders, loading: ordersLoading, memberInfo } = useMemberOrders(memberId, 'personal')

  // Get schedule expiry settings for calculating order expiry dates
  const { getMaxExpiryDateForLanguage } = useScheduleExpirySettings('personal')

  // Calculate expiry date by language (based on schedule condition start date)
  const expiryDateByLanguage = useMemo<Record<string, Date | null>>(() => {
    const result: Record<string, Date | null> = {}
    const languages = [...new Set(studentOrders.map(o => o.language).filter(Boolean))]

    languages.forEach(lang => {
      result[lang] = getMaxExpiryDateForLanguage(lang, scheduleCondition.startDate)
    })

    return result
  }, [studentOrders, getMaxExpiryDateForLanguage, scheduleCondition.startDate])

  // Get selected teacher IDs for fetching open time events
  const selectedTeacherIds = useMemo(() => {
    return selectedTeachers.filter(t => t && t.id).map(t => t.id)
  }, [selectedTeachers])

  // Get teacher open time events (background events for calendar)
  const { events: teacherOpenTimeEvents, busyEvents: teacherBusyEvents } = useTeacherOpenTimeEvents(selectedTeacherIds)

  // Get student open time events (background events for calendar)
  const { events: studentOpenTimeEvents, refetch: refetchStudentEvents } = useStudentOpenTimeEvents(memberId)

  // Publish loading state
  const [publishLoading, setPublishLoading] = useState(false)

  // Calculate used minutes per order from scheduled events
  const usedMinutesByOrder = useMemo<Record<string, number>>(() => {
    const usedMinutes: Record<string, number> = {}

    // Filter for scheduled/published events (not open time)
    const scheduledEvents = studentOpenTimeEvents.filter(
      event => event.extendedProps?.status !== 'open' && event.extendedProps?.role !== 'available',
    )

    scheduledEvents.forEach(event => {
      const originalEvent = event.extendedProps?.originalEvent
      const metadata = originalEvent?.extendedProps?.metadata || originalEvent?.extendedProps?.event_metadata
      const orderIds = metadata?.orderIds as string[] | undefined
      const duration = metadata?.duration as number | undefined

      // Calculate duration from event start/end if not in metadata
      const eventDuration =
        duration ||
        (event.end && event.start ? Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60)) : 0)

      if (orderIds && orderIds.length > 0 && eventDuration > 0) {
        // Distribute duration equally among orders if multiple
        const minutesPerOrder = eventDuration / orderIds.length
        orderIds.forEach(orderId => {
          usedMinutes[orderId] = (usedMinutes[orderId] || 0) + minutesPerOrder
        })
      }
    })

    return usedMinutes
  }, [studentOpenTimeEvents])

  // Merge memberInfo with selectedStudent for display
  const studentWithInfo = useMemo<Student | undefined>(() => {
    if (!selectedStudent) return undefined
    return {
      ...selectedStudent,
      name: memberInfo?.name || selectedStudent.name || '',
      email: memberInfo?.email || selectedStudent.email || '',
    }
  }, [selectedStudent, memberInfo])

  // Get selected orders
  const selectedOrders = useMemo(() => {
    return studentOrders.filter(o => selectedOrderIds.includes(o.id))
  }, [studentOrders, selectedOrderIds])

  const selectedOrdersForLimits = useMemo(() => {
    return selectedOrders.map(order => {
      const usedMinutes = usedMinutesByOrder[order.id] || 0
      return {
        ...order,
        usedMinutes,
        availableMinutes: Math.max(0, order.availableMinutes - usedMinutes),
      }
    })
  }, [selectedOrders, usedMinutesByOrder])

  // Get unique languages from selected orders
  const selectedLanguages = useMemo<string[]>(() => {
    if (selectedOrders.length === 0) return []
    const languageSet = new Set<string>()
    selectedOrders.forEach(order => {
      if (order.language) {
        languageSet.add(order.language)
      }
    })
    return Array.from(languageSet)
  }, [selectedOrders])

  // Get holidays for calendar
  const holidays = useMemo(() => {
    return defaultExcludeDates.map(h => h.date)
  }, [defaultExcludeDates])

  // Get events for calendar
  const calendarEvents = useMemo(() => {
    if (!selectedStudent) return []
    return scheduleStore.getEvents('personal').filter(e => e.studentId === selectedStudent.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent, storeUpdateCounter])

  // Get materials from selected orders
  const orderMaterials = useMemo(() => {
    // Collect unique materials from all selected orders
    const materialsSet = new Set<string>()
    selectedOrders.forEach(order => {
      order.materials?.forEach(material => {
        if (material) {
          materialsSet.add(material)
        }
      })
    })
    return Array.from(materialsSet)
  }, [selectedOrders])

  // Calculate available minutes from selected orders
  const availableMinutes = useMemo(() => {
    return selectedOrdersForLimits.reduce((sum, order) => sum + order.availableMinutes, 0)
  }, [selectedOrdersForLimits])

  const orderMap = useMemo(() => {
    const map = new Map<string, typeof studentOrders[number]>()
    studentOrders.forEach(order => map.set(order.id, order))
    return map
  }, [studentOrders])

  const handleSaveDraft = useCallback((rows: CourseRow[]) => {
    setDraftRows(rows)
  }, [])

  // Handlers
  const handleBack = useCallback(() => {
    history.push('/class-schedule/personal')
  }, [history])

  const handleOrdersChange = useCallback((orderIds: string[]) => {
    setSelectedOrderIds(orderIds)
  }, [])

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
      // Save to in-memory store only (pending status)
      events.forEach(event => {
        if (event.id && !event.id.startsWith('local-')) {
          // Update existing event
          scheduleStore.updateEvent(event.id, event)
        } else {
          // Add new event to local store
          scheduleStore.addEvent({
            ...event,
            id: `local-${Date.now()}-${Math.random()}`,
            scheduleType: 'personal',
            status: 'pending',
            studentId: selectedStudent?.id,
            orderIds: selectedOrderIds,
            campus: selectedStudent?.campus || '',
            language: (selectedLanguages[0] || 'zh-TW') as Language,
            createdBy: 'current-user',
            createdByEmail: 'user@example.com',
            updatedAt: new Date(),
          } as ScheduleEvent)
        }
      })
      // Trigger re-render to update calendar
      setStoreUpdateCounter(prev => prev + 1)
      message.success('課程已加入待處理')
    },
    [selectedStudent, selectedOrderIds, selectedLanguages],
  )

  const handlePreSchedule = useCallback(async () => {
    // Get all pending events for this student (in-memory only)
    const pendingEvents = calendarEvents.filter(e => e.status === 'pending')
    if (pendingEvents.length === 0) {
      message.warning('沒有待處理的課程')
      return
    }

    if (!authToken || !appId || !selectedStudent?.id) {
      message.error('無法預排：缺少必要資訊')
      return
    }

    try {
      // Get student's temporally_exclusive_resource_id
      const studentResources = await getResourceByTypeTargetFetcher(authToken)({
        type: 'member',
        targets: [selectedStudent.id],
      })
      const studentResource = studentResources?.[0]

      if (!studentResource) {
        message.error('無法找到學員資源')
        return
      }

      // Convert pending events to API format
      const apiEvents: GeneralEventApi[] = pendingEvents.map(event => {
        const startDateTime = moment(event.date)
          .hour(parseInt(event.startTime?.split(':')[0] || '0'))
          .minute(parseInt(event.startTime?.split(':')[1] || '0'))
          .toDate()
        const endDateTime = moment(event.date)
          .hour(parseInt(event.endTime?.split(':')[0] || '0'))
          .minute(parseInt(event.endTime?.split(':')[1] || '0'))
          .toDate()

        const orderProductNames =
          event.orderIds
            ?.map(orderId => orderMap.get(orderId)?.productName)
            .filter(Boolean)
            .join(', ') || ''

        return {
          start: startDateTime,
          end: endDateTime,
          title: event.material || '',
          extendedProps: {
            description: '',
            metadata: {
              title: orderProductNames,
              scheduleType: 'personal',
              studentId: selectedStudent.id,
              orderIds: event.orderIds,
              campus: event.campus,
              language: event.language,
              teacherId: event.teacherId,
              duration: event.duration,
              material: event.material,
              needsOnlineRoom: event.needsOnlineRoom,
              clientEventId: event.id,
            },
          },
        } as GeneralEventApi
      })

      // Create events via API (pre-scheduled, no published_at)
      const createdEvents = await createEventFetcher(authToken)(appId)({ events: apiEvents })

      const createdEventsArray = Array.isArray(createdEvents) ? createdEvents : []
      const getClientEventId = (createdEvent: any): string | undefined =>
        createdEvent?.metadata?.clientEventId ||
        createdEvent?.event_metadata?.clientEventId ||
        createdEvent?.extendedProps?.metadata?.clientEventId ||
        createdEvent?.extendedProps?.event_metadata?.clientEventId
      const createdEventByClientId = new Map<string, any>()
      createdEventsArray.forEach(createdEvent => {
        const clientEventId = getClientEventId(createdEvent)
        if (clientEventId) {
          createdEventByClientId.set(clientEventId, createdEvent)
        }
      })
      const resolveCreatedEvent = (pendingEvent: ScheduleEvent, index: number) =>
        createdEventByClientId.get(pendingEvent.id) || createdEventsArray[index]

      // Invite student resource
      if (createdEventsArray.length > 0) {
        const eventIds = createdEventsArray.map((e: any) => e.id)
        await createInvitationFetcher(authToken)([
          {
            temporally_exclusive_resource_id: studentResource.temporally_exclusive_resource_id,
            role: 'participant',
          },
        ])(eventIds)
      }

      // Invite teacher resources
      const teacherIds = [...new Set(pendingEvents.filter(e => e.teacherId).map(e => e.teacherId!))]
      if (teacherIds.length > 0 && createdEventsArray.length > 0) {
        const teacherResources = await getResourceByTypeTargetFetcher(authToken)({
          type: 'member',
          targets: teacherIds,
        })

        const teacherResourceMap = new Map<string, any>()
        teacherResources.forEach((r: any) => {
          if (r.target) {
            teacherResourceMap.set(r.target, r)
          }
        })

        await Promise.all(
          pendingEvents.map(async (event, index) => {
            const createdEvent = resolveCreatedEvent(event, index)
            if (event.teacherId && createdEvent) {
              const teacherResource = teacherResourceMap.get(event.teacherId)
              if (teacherResource) {
                await createInvitationFetcher(authToken)([
                  {
                    temporally_exclusive_resource_id: teacherResource.temporally_exclusive_resource_id,
                    role: 'host',
                  },
                ])([createdEvent.id])
              }
            }
          }),
        )
      }

      // Update local store status to pre-scheduled and save API event IDs
      pendingEvents.forEach((event, index) => {
        const createdEvent = resolveCreatedEvent(event, index)
        const apiEventId = createdEvent?.id
        scheduleStore.updateEvent(event.id, {
          status: 'pre-scheduled',
          apiEventId,
        })
      })

      // Trigger re-render to update calendar
      setStoreUpdateCounter(prev => prev + 1)

      // Refetch student events
      refetchStudentEvents()

      message.success(`已預排 ${pendingEvents.length} 堂課程`)
    } catch (error) {
      console.error('Failed to pre-schedule events:', error)
      message.error('預排失敗，請稍後再試')
    }
  }, [authToken, appId, selectedStudent, calendarEvents, orderMap, refetchStudentEvents])

  const handlePublish = useCallback(async () => {
    // Check if all orders are completed (status === 'SUCCESS')
    const hasIncompleteOrders = selectedOrders.some(o => o.status !== 'SUCCESS')
    if (hasIncompleteOrders) {
      message.error(formatMessage(scheduleMessages.Publish.disabled))
      return
    }

    if (!authToken) {
      message.error('無法發布：缺少認證資訊')
      return
    }

    // Find unpublished events from studentOpenTimeEvents
    const unpublishedEvents = studentOpenTimeEvents.filter(event => {
      const originalEvent = event.extendedProps?.originalEvent
      const publishedAt = originalEvent?.extendedProps?.published_at
      const eventId = originalEvent?.extendedProps?.event_id
      const role = event.extendedProps?.role

      return eventId && role !== 'available' && !publishedAt
    })

    if (unpublishedEvents.length === 0) {
      message.warning('沒有已預排的課程')
      return
    }

    setPublishLoading(true)

    try {
      const publishedAt = new Date().toISOString()

      await Promise.all(
        unpublishedEvents.map(event => {
          const eventId = event.extendedProps?.originalEvent?.extendedProps?.event_id
          return updateEvent(authToken)({ published_at: publishedAt } as any)(eventId)
        }),
      )

      // Update local store
      calendarEvents
        .filter(e => e.status === 'pre-scheduled')
        .forEach(event => {
          scheduleStore.updateEvent(event.id, { status: 'published' })
        })

      setStoreUpdateCounter(prev => prev + 1)
      refetchStudentEvents()

      message.success(`已發布 ${unpublishedEvents.length} 堂課程`)
    } catch (error) {
      console.error('Failed to publish events:', error)
      message.error('發布失敗，請稍後再試')
    } finally {
      setPublishLoading(false)
    }
  }, [authToken, selectedOrders, studentOpenTimeEvents, calendarEvents, formatMessage, refetchStudentEvents])

  const canPublish = useMemo(() => {
    const hasUnpublishedEvents = studentOpenTimeEvents.some(event => {
      const originalEvent = event.extendedProps?.originalEvent
      const publishedAt = originalEvent?.extendedProps?.published_at
      const eventId = originalEvent?.extendedProps?.event_id
      const role = event.extendedProps?.role

      return eventId && role !== 'available' && !publishedAt
    })

    const hasLocalPreScheduled = calendarEvents.some(e => e.status === 'pre-scheduled')

    return selectedOrders.every(o => o.status === 'SUCCESS') && (hasUnpublishedEvents || hasLocalPreScheduled)
  }, [selectedOrders, studentOpenTimeEvents, calendarEvents])

  if (ordersLoading && !memberInfo) {
    return (
      <AdminLayout>
        <LoadingWrapper>
          <Spin size="large" />
        </LoadingWrapper>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <CalendarCheckFillIcon className="mr-3" />
        <span>{formatMessage(scheduleMessages['*'].personal)}</span>
      </AdminPageTitle>

      <PageWrapper>
        <ActionBar>
          <Space>
            <Button onClick={handleBack}>{formatMessage(scheduleMessages['*'].back)}</Button>
          </Space>
          <Space>
            <Button
              onClick={handlePreSchedule}
              disabled={calendarEvents.filter(e => e.status === 'pending').length === 0}
            >
              預排
            </Button>
            <Button type="primary" onClick={handlePublish} disabled={!canPublish} loading={publishLoading}>
              發布
            </Button>
          </Space>
        </ActionBar>

        {/* Top Section with 3 columns using Grid for equal height */}
        <Row gutter={16} style={{ marginBottom: 16 }} align="stretch">
          <GridColumn xs={24} sm={24} md={6} lg={6}>
            <StudentInfoPanel student={studentWithInfo} />
          </GridColumn>
          <GridColumn xs={24} sm={24} md={10} lg={10}>
            <OrderSelectionPanel
              orders={studentOrders}
              selectedOrderIds={selectedOrderIds}
              onSelectOrders={handleOrdersChange}
              scheduleType="personal"
              usedMinutesByOrder={usedMinutesByOrder}
              expiryDateByLanguage={expiryDateByLanguage}
            />
          </GridColumn>
          <GridColumn xs={24} sm={24} md={8} lg={8}>
            <ScheduleConditionPanel
              selectedOrders={selectedOrdersForLimits}
              condition={scheduleCondition}
              onConditionChange={handleConditionChange}
              expiryDateByLanguage={expiryDateByLanguage}
            />
          </GridColumn>
        </Row>

        {/* Teacher List */}
        <AdminPageBlock className="mb-4">
          <TeacherListPanel
            languages={selectedLanguages}
            campus={selectedStudent?.campus}
            selectedTeachers={selectedTeachers}
            onTeacherSelect={handleTeachersChange}
            useRealData={true}
          />
        </AdminPageBlock>

        {/* Calendar */}
        <AdminPageBlock>
          <ScheduleCalendar
            scheduleType="personal"
            events={calendarEvents}
            selectedTeachers={selectedTeachers}
            teacherOpenTimeEvents={teacherOpenTimeEvents}
            studentOpenTimeEvents={studentOpenTimeEvents}
            studentName={memberInfo?.name || selectedStudent?.name}
            holidays={scheduleCondition.excludeHolidays ? holidays : []}
            excludedDates={scheduleCondition.excludedDates}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </AdminPageBlock>
      </PageWrapper>

      {/* Arrange Course Modal */}
      <ArrangeCourseModal
        visible={arrangeModalVisible}
        scheduleType="personal"
        selectedDate={selectedDate}
        selectedTeachers={selectedTeachers}
        campus={selectedStudent?.campus || ''}
        language={(selectedLanguages[0] || 'zh-TW') as Language}
        orderMaterials={orderMaterials}
        existingEvent={editingEvent}
        availableMinutes={availableMinutes}
        scheduleCondition={scheduleCondition}
        draftRows={draftRows}
        studentId={selectedStudent?.id}
        studentName={studentWithInfo?.name}
        studentOpenTimeEvents={studentOpenTimeEvents}
        teacherOpenTimeEvents={teacherOpenTimeEvents}
        teacherBusyEvents={teacherBusyEvents}
        onClose={() => {
          setArrangeModalVisible(false)
          setEditingEvent(undefined)
        }}
        onSave={handleSaveEvents}
        onSaveDraft={handleSaveDraft}
      />
    </AdminLayout>
  )
}

export default PersonalScheduleEditPage
