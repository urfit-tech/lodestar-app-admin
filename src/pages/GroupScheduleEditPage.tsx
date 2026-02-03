import { Button, message, Space, Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageBlock, AdminPageTitle } from '../components/admin'
import { GeneralEventApi } from '../components/event/events.type'
import AdminLayout from '../components/layout/AdminLayout'
import {
  ArrangeCourseModal,
  ClassSettingsPanel,
  ScheduleCalendar,
  ScheduleConditionPanel,
  scheduleMessages,
  StudentListPanel,
  TeacherListPanel,
} from '../components/schedule'
import {
  createEventFetcher,
  createInvitationFetcher,
  getResourceByTypeTargetFetcher,
  updateEvent,
} from '../helpers/eventHelper/eventFetchers'
import { useClassrooms } from '../hooks/classroom'
import {
  useClassGroup,
  useClassGroupEvents,
  useHolidays,
  useOrdersByIds,
  usePublishEvent,
  useScheduleExpirySettings,
  useTeacherOpenTimeEvents,
  useTeachersFromMembers,
  useUpdateClassGroup,
} from '../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../images/icon'
import { ClassGroup, Language, Order, ScheduleCondition, ScheduleEvent, Teacher } from '../types/schedule'

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
  flex-wrap: wrap;
  gap: 8px;
`

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`

const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`

const GroupScheduleEditPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { groupId } = useParams<{ groupId: string }>()
  const { authToken, currentMemberId, currentMember } = useAuth()
  const { id: appId } = useApp()
  const { holidays: defaultExcludeDates } = useHolidays()
  const { classrooms } = useClassrooms()

  // Class group loaded from GraphQL
  const { classGroup, loading, error, refetch: refetchClassGroup } = useClassGroup(groupId)
  const { events: apiEvents, loading: eventsLoading, refetch: refetchEvents } = useClassGroupEvents(groupId)
  const { updateClassGroup } = useUpdateClassGroup()
  const { publishEvents } = usePublishEvent()
  const { orders: orderLogs } = useOrdersByIds(classGroup?.orderIds || [])
  const { calculateExpiryDate } = useScheduleExpirySettings('group')
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([])
  const { teachers: allTeachers } = useTeachersFromMembers()

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

  // Local pending events (events that haven't been submitted to API yet)
  const [localPendingEvents, setLocalPendingEvents] = useState<ScheduleEvent[]>([])

  // Publish loading state
  const [publishLoading, setPublishLoading] = useState(false)
  const hasInitializedScheduleCondition = useRef(false)
  const hasInitializedTeachers = useRef(false)

  // Handle class group not found
  useEffect(() => {
    if (!loading && !classGroup && !error) {
      message.error('找不到該班級')
      history.push('/class-schedule/group')
    }
  }, [classGroup, loading, error, history])

  // Initialize schedule condition from existing events
  useEffect(() => {
    if (hasInitializedScheduleCondition.current) return
    if (!apiEvents || apiEvents.length === 0) return

    const eventDates = apiEvents.map(event => event.date).filter(Boolean)
    if (eventDates.length === 0) return

    const startDate = new Date(Math.min(...eventDates.map(date => date.getTime())))
    const endDate = new Date(Math.max(...eventDates.map(date => date.getTime())))

    setScheduleCondition(prev => ({
      ...prev,
      startDate,
      endDate,
    }))
    hasInitializedScheduleCondition.current = true
  }, [apiEvents])

  // Initialize selected teachers from existing events
  useEffect(() => {
    if (hasInitializedTeachers.current) return
    if (selectedTeachers.length > 0) {
      hasInitializedTeachers.current = true
      return
    }
    if (!apiEvents || apiEvents.length === 0 || allTeachers.length === 0) return

    const sortedEvents = [...apiEvents].sort((a, b) => b.date.getTime() - a.date.getTime())
    const teacherIds: string[] = []
    sortedEvents.forEach(event => {
      if (event.teacherId && !teacherIds.includes(event.teacherId)) {
        teacherIds.push(event.teacherId)
      }
    })

    if (teacherIds.length === 0) return

    const selected = teacherIds
      .map(id => allTeachers.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, 3)
      .map(teacherFromMember => ({
        id: teacherFromMember!.id,
        name: teacherFromMember!.name,
        email: teacherFromMember!.email,
        campus: teacherFromMember!.campus,
        campusId: teacherFromMember!.campusId,
        campusIds: teacherFromMember!.campusIds,
        campusNames: teacherFromMember!.campusNames,
        languages: teacherFromMember!.languages as Language[],
        traits: teacherFromMember!.traits,
        level: String(teacherFromMember!.level),
        yearsOfExperience: teacherFromMember!.yearsOfExperience,
        note: teacherFromMember!.note,
      }))

    if (selected.length > 0) {
      setSelectedTeachers(selected)
      hasInitializedTeachers.current = true
    }
  }, [apiEvents, allTeachers, selectedTeachers])

  // Get selected teacher IDs for fetching open time events
  const selectedTeacherIds = useMemo(() => {
    return selectedTeachers.filter(t => t && t.id).map(t => t.id)
  }, [selectedTeachers])

  // Calculate teacher open time range
  const teacherOpenTimeRange = useMemo(() => {
    const start = scheduleCondition.startDate
    const end = scheduleCondition.endDate
      ? scheduleCondition.endDate
      : new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000)
    return { start, end }
  }, [scheduleCondition.startDate, scheduleCondition.endDate])

  // Get teacher open time events (background events for calendar)
  const { events: teacherOpenTimeEvents, busyEvents: teacherBusyEvents } = useTeacherOpenTimeEvents(
    selectedTeacherIds,
    teacherOpenTimeRange.start,
    teacherOpenTimeRange.end,
  )

  // Get holidays for calendar
  const holidays = useMemo(() => {
    return defaultExcludeDates.map(h => h.date)
  }, [defaultExcludeDates])

  // Get events for calendar - merge API events with local pending events
  const calendarEvents = useMemo(() => {
    if (!classGroup) return []

    // Filter local pending events for this class group
    const filteredLocalEvents = localPendingEvents.filter(
      e => e.classId === classGroup.id && e.status === 'pending' && !e.apiEventId,
    )

    // Combine API events with local pending events
    const combinedEvents = [...apiEvents, ...filteredLocalEvents]

    return combinedEvents
  }, [classGroup, apiEvents, localPendingEvents])

  const apiEventIdSet = useMemo(() => new Set(apiEvents.map(e => e.id)), [apiEvents])
  const localPendingEventIdSet = useMemo(() => new Set(localPendingEvents.map(e => e.id)), [localPendingEvents])

  const buildGroupEventPayload = useCallback(
    (event: Partial<ScheduleEvent>): GeneralEventApi => {
      const date = event.date || selectedDate
      const startDateTime = moment(date)
        .hour(parseInt(event.startTime?.split(':')[0] || '0'))
        .minute(parseInt(event.startTime?.split(':')[1] || '0'))
        .toDate()
      const endDateTime = moment(date)
        .hour(parseInt(event.endTime?.split(':')[0] || '0'))
        .minute(parseInt(event.endTime?.split(':')[1] || '0'))
        .toDate()

      const studentIds = Array.from(new Set(studentOrders.map(order => order.studentId)))

      return {
        start: startDateTime,
        end: endDateTime,
        title: event.material || classGroup?.name || '',
        extendedProps: {
          description: '',
          metadata: {
            title: classGroup?.name || '',
            scheduleType: 'group',
            classId: classGroup?.id,
            studentIds,
            orderIds: studentOrders.map(o => o.id),
            campus: event.campus || classGroup?.campusId || '',
            language: (event.language || classGroup?.language || 'zh-TW') as Language,
            teacherId: event.teacherId,
            duration: event.duration,
            material: event.material,
            needsOnlineRoom: event.needsOnlineRoom,
            updatedBy: currentMemberId || '',
            updatedByEmail: currentMember?.email || '',
          },
        },
      } as GeneralEventApi
    },
    [classGroup, selectedDate, studentOrders, currentMemberId, currentMember],
  )

  // Get materials from class group
  const classMaterials = useMemo(() => {
    return classGroup?.materials || []
  }, [classGroup])

  // Calculate student orders from orderLogs
  const studentOrders = useMemo((): Order[] => {
    if (!classGroup) return []
    const now = new Date()

    return orderLogs
      .map(orderLog => {
        const classProduct = orderLog.order_products?.find((product: any) => {
          const options = product.options?.options
          if (!options) return false
          if (options.product === '教材') return false
          if (options.class_type !== '小組班') return false
          if (classGroup.language && options.language && options.language !== classGroup.language) {
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
          productMeta?.language || classGroup.language,
          totalSessions,
          scheduleCondition.startDate,
        )
        const expiresAt = expiryBySetting || (classProduct.ended_at ? new Date(classProduct.ended_at) : undefined)

        if ((orderLog.status || '').includes('EXPIRED')) return null
        if (expiredAt && expiredAt < now) return null
        if (expiresAt && expiresAt < now) return null
        if (classGroup.campusId && campusFromOptions && campusFromOptions !== classGroup.campusId) {
          return null
        }

        return {
          id: orderLog.id,
          studentId: orderLog.member_id,
          productName: productMeta?.title || classProduct.name || '',
          language: productMeta?.language || classGroup.language || '',
          type: 'group',
          totalMinutes,
          usedMinutes: 0,
          availableMinutes: totalMinutes,
          createdAt,
          expiresAt,
          lastClassDate: undefined,
          status: orderLog.status,
          campus: campusFromOptions || classGroup.campusId || '',
          materials: [],
        } as Order
      })
      .filter(Boolean) as Order[]
  }, [classGroup, orderLogs, calculateExpiryDate, scheduleCondition.startDate])

  // Get paid student count for publish check
  const paidStudentCount = useMemo(() => {
    const paidStudents = new Set(studentOrders.filter(o => o.status === 'SUCCESS').map(o => o.studentId))
    return paidStudents.size
  }, [studentOrders])

  // Get expiry date by order ID
  const expiryDateByOrderId = useMemo(() => {
    const map: Record<string, Date | null> = {}
    studentOrders.forEach(order => {
      map[order.id] = order.expiresAt || null
    })
    return map
  }, [studentOrders])

  // Calculate status summary
  const statusSummary = useMemo(() => {
    const pending = calendarEvents.filter(e => e.status === 'pending').length
    const preScheduled = calendarEvents.filter(e => e.status === 'pre-scheduled').length
    const published = calendarEvents.filter(e => e.status === 'published').length
    return { pending, preScheduled, published }
  }, [calendarEvents])

  // Handlers
  const handleBack = useCallback(() => {
    history.push('/class-schedule/group')
  }, [history])

  const handleClassGroupUpdate = useCallback(
    async (updates: Partial<ClassGroup>) => {
      if (classGroup) {
        try {
          await updateClassGroup(classGroup.id, updates)
          refetchClassGroup()
          if (updates.language && updates.language !== classGroup.language) {
            setSelectedTeachers([])
          }
        } catch (error) {
          console.error('Failed to update class group:', error)
          message.error('更新班級失敗')
        }
      }
    },
    [classGroup, updateClassGroup, refetchClassGroup],
  )

  const handleCampusChange = useCallback(
    async (newCampus: string, confirmed: boolean) => {
      if (confirmed && classGroup) {
        try {
          await updateClassGroup(classGroup.id, { campusId: newCampus })
          refetchClassGroup()
          setSelectedTeachers([])
        } catch (error) {
          console.error('Failed to update campus:', error)
          message.error('更新校區失敗')
        }
      }
    },
    [classGroup, updateClassGroup, refetchClassGroup],
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
    async (events: Partial<ScheduleEvent>[]) => {
      const apiUpdates: Array<{ event: Partial<ScheduleEvent>; eventId: string }> = []
      const localExistingEvents: Partial<ScheduleEvent>[] = []
      const localNewEvents: Partial<ScheduleEvent>[] = []

      events.forEach(event => {
        const apiEventId = event.apiEventId || (event.id && apiEventIdSet.has(event.id) ? event.id : undefined)
        const hasLocalId = Boolean(event.id && localPendingEventIdSet.has(event.id))

        if (apiEventId) {
          apiUpdates.push({ event, eventId: apiEventId })
        }

        if (hasLocalId) {
          localExistingEvents.push(event)
        } else if (!apiEventId) {
          localNewEvents.push(event)
        }
      })
      let hasError = false

      if (apiUpdates.length > 0) {
        if (!authToken) {
          message.error('無法更新課程：缺少認證資訊')
          hasError = true
        } else {
          try {
            await Promise.all(
              apiUpdates.map(({ event, eventId }) => updateEvent(authToken)(buildGroupEventPayload(event))(eventId)),
            )
            refetchEvents()
          } catch (error) {
            console.error('Failed to update events:', error)
            message.error('課程更新失敗')
            hasError = true
          }
        }
      }

      if (localExistingEvents.length > 0 || localNewEvents.length > 0) {
        const studentIds = Array.from(new Set(studentOrders.map(order => order.studentId)))
        setLocalPendingEvents(prev => {
          const newEvents = [...prev]
          localExistingEvents.forEach(event => {
            if (event.id) {
              const index = newEvents.findIndex(e => e.id === event.id)
              if (index >= 0) {
                newEvents[index] = { ...newEvents[index], ...event }
                return
              }
            }
          })
          localNewEvents.forEach(event => {
            // Add new event to local pending events
            newEvents.push({
              ...event,
              id: `local-${Date.now()}-${Math.random()}`,
              scheduleType: 'group',
              status: 'pending',
              classId: classGroup?.id,
              studentIds,
              orderIds: studentOrders.map(o => o.id),
              campus: classGroup?.campusId || '',
              language: (classGroup?.language || 'zh-TW') as Language,
              createdBy: currentMemberId || '',
              createdByEmail: currentMember?.email || '',
              updatedAt: new Date(),
            } as ScheduleEvent)
          })
          return newEvents
        })
      }

      if (!hasError) {
        message.success(formatMessage(scheduleMessages.GroupClass.courseArranged))
      }
    },
    [
      apiEventIdSet,
      localPendingEventIdSet,
      authToken,
      buildGroupEventPayload,
      refetchEvents,
      classGroup,
      studentOrders,
      formatMessage,
      currentMemberId,
      currentMember,
    ],
  )

  const handlePreSchedule = useCallback(async () => {
    const eventsToPreSchedule = calendarEvents.filter(e => e.status === 'pending')
    if (eventsToPreSchedule.length === 0) {
      message.warning(formatMessage(scheduleMessages.GroupClass.noPendingCourses))
      return
    }

    if (!authToken || !appId || !classGroup) {
      message.error('無法預排：缺少必要資訊')
      return
    }

    try {
      // Convert pending events to API format with clientEventId for tracking
      const apiEventsData: GeneralEventApi[] = eventsToPreSchedule.map(event => {
        const startDateTime = moment(event.date)
          .hour(parseInt(event.startTime?.split(':')[0] || '0'))
          .minute(parseInt(event.startTime?.split(':')[1] || '0'))
          .toDate()
        const endDateTime = moment(event.date)
          .hour(parseInt(event.endTime?.split(':')[0] || '0'))
          .minute(parseInt(event.endTime?.split(':')[1] || '0'))
          .toDate()

        return {
          start: startDateTime,
          end: endDateTime,
          title: event.material || classGroup.name,
          extendedProps: {
            description: '',
            metadata: {
              title: classGroup.name,
              scheduleType: 'group',
              classId: classGroup.id,
              studentIds: [],
              campus: event.campus,
              language: event.language,
              teacherId: event.teacherId,
              duration: event.duration,
              material: event.material,
              needsOnlineRoom: event.needsOnlineRoom,
              clientEventId: event.id,
              createdBy: currentMemberId || '',
              createdByEmail: currentMember?.email || '',
              updatedBy: currentMemberId || '',
              updatedByEmail: currentMember?.email || '',
            },
          },
        } as GeneralEventApi
      })

      // Create events via API
      const createdEvents = await createEventFetcher(authToken)(appId)({ events: apiEventsData })
      const createdEventsArray = Array.isArray(createdEvents) ? createdEvents : []

      // Build mapping from clientEventId to created event
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
      const resolveCreatedEvent = (eventToResolve: ScheduleEvent, index: number) =>
        createdEventByClientId.get(eventToResolve.id) || createdEventsArray[index]

      // Invite teacher resources
      const teacherIds = Array.from(new Set(eventsToPreSchedule.filter(e => e.teacherId).map(e => e.teacherId!)))
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

        // Invite each teacher to their respective events
        await Promise.all(
          eventsToPreSchedule.map(async (event, index) => {
            const createdEvent = resolveCreatedEvent(event, index)
            if (event.teacherId && createdEvent) {
              const teacherResource = teacherResourceMap.get(event.teacherId)
              if (teacherResource) {
                await createInvitationFetcher(authToken)([
                  {
                    temporally_exclusive_resource_id: teacherResource.temporally_exclusive_resource_id,
                    role: 'host',
                  } as any,
                ])([createdEvent.id])
              }
            }
          }),
        )
      }

      // Collect the IDs of events that were submitted to the API
      const submittedEventIds = new Set(eventsToPreSchedule.map(e => e.id))

      // Remove local pending events that were submitted
      setLocalPendingEvents(prev => prev.filter(e => !submittedEventIds.has(e.id)))

      // Refetch events from API to get the latest state
      await refetchEvents()
      message.success(
        formatMessage(scheduleMessages.GroupClass.preScheduleSuccess, { count: eventsToPreSchedule.length }),
      )
    } catch (error) {
      console.error('Failed to pre-schedule events:', error)
      message.error('預排失敗，請稍後再試')
    }
  }, [authToken, appId, classGroup, calendarEvents, formatMessage, refetchEvents, currentMemberId, currentMember])

  const handlePublish = useCallback(async () => {
    if (!classGroup) {
      message.error('無法發布：缺少必要資訊')
      return
    }

    if (paidStudentCount < classGroup.minStudents) {
      message.error(formatMessage(scheduleMessages.Publish.minStudentsRequired, { count: classGroup.minStudents }))
      return
    }

    const preScheduledEvents = calendarEvents.filter(e => e.status === 'pre-scheduled' && e.apiEventId)
    if (preScheduledEvents.length === 0) {
      message.warning(formatMessage(scheduleMessages.GroupClass.noPreScheduledCourses))
      return
    }

    setPublishLoading(true)

    try {
      // Use GraphQL mutation to publish events
      const eventIds = preScheduledEvents.map(e => e.apiEventId!)
      await publishEvents(eventIds)

      // Refetch events from API to get the latest state
      await refetchEvents()
      message.success(formatMessage(scheduleMessages.GroupClass.publishSuccess, { count: preScheduledEvents.length }))
    } catch (error) {
      console.error('Failed to publish events:', error)
      message.error('發布失敗，請稍後再試')
    } finally {
      setPublishLoading(false)
    }
  }, [classGroup, paidStudentCount, calendarEvents, formatMessage, publishEvents, refetchEvents])

  const canPublish = useMemo(() => {
    if (!classGroup) return false
    return (
      paidStudentCount >= classGroup.minStudents &&
      calendarEvents.some(e => e.status === 'pre-scheduled' && e.apiEventId)
    )
  }, [classGroup, paidStudentCount, calendarEvents])

  if (loading || eventsLoading) {
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
        <span>{formatMessage(scheduleMessages['*'].group)}</span>
      </AdminPageTitle>

      <PageWrapper>
        <ActionBar>
          <Space>
            <Button onClick={handleBack}>{formatMessage(scheduleMessages['*'].back)}</Button>
          </Space>
          <Space>
            <Button onClick={handlePreSchedule} disabled={statusSummary.pending === 0}>
              {formatMessage(scheduleMessages.GroupClass.preScheduleAction)}
            </Button>
            <Button type="primary" onClick={handlePublish} disabled={!canPublish} loading={publishLoading}>
              {formatMessage(scheduleMessages.GroupClass.publishAction)}
            </Button>
          </Space>
        </ActionBar>

        {/* Top Section: Three-column grid */}
        <ThreeColumnGrid>
          <ClassSettingsPanel
            classGroup={classGroup}
            classType="group"
            onChange={handleClassGroupUpdate}
            onCampusChange={handleCampusChange}
          />
          <StudentListPanel
            orderIds={classGroup?.orderIds || []}
            classGroupId={classGroup?.id}
            scheduleType="group"
            language={classGroup?.language}
            campusId={classGroup?.campusId}
            maxStudents={classGroup?.maxStudents}
            events={calendarEvents}
            expiryDateByOrderId={expiryDateByOrderId}
            onOrdersChanged={refetchClassGroup}
          />
          <ScheduleConditionPanel
            selectedOrders={[]}
            condition={scheduleCondition}
            onConditionChange={handleConditionChange}
            hideMinutesOption={true}
            disabled={false}
          />
        </ThreeColumnGrid>

        {/* Teacher List */}
        <AdminPageBlock className="mb-4">
          <TeacherListPanel
            languages={classGroup?.language ? [classGroup.language] : []}
            campus={classGroup?.campusId || undefined}
            selectedTeachers={selectedTeachers}
            onTeacherSelect={handleTeachersChange}
          />
        </AdminPageBlock>

        {/* Calendar */}
        <AdminPageBlock>
          <ScheduleCalendar
            scheduleType="group"
            events={calendarEvents}
            selectedTeachers={selectedTeachers}
            teacherOpenTimeEvents={teacherOpenTimeEvents}
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
        scheduleType="group"
        selectedDate={selectedDate}
        selectedTeachers={selectedTeachers}
        campus={classGroup?.campusId || ''}
        language={(classGroup?.language || 'zh-TW') as Language}
        orderMaterials={classMaterials}
        existingEvent={editingEvent}
        scheduleCondition={scheduleCondition}
        teacherOpenTimeEvents={teacherOpenTimeEvents}
        teacherBusyEvents={teacherBusyEvents}
        classrooms={classrooms}
        existingScheduleEvents={calendarEvents}
        onClose={() => {
          setArrangeModalVisible(false)
          setEditingEvent(undefined)
        }}
        onSave={handleSaveEvents}
      />
    </AdminLayout>
  )
}

export default GroupScheduleEditPage
