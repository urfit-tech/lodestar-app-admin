import { Button, message, Space, Spin } from 'antd'
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
} from '../helpers/eventHelper/eventFetchers'
import { useClassrooms } from '../hooks/classroom'
import {
  useClassGroup,
  useClassGroupEvents,
  useHolidays,
  usePublishEvent,
  useScheduleExpirySettings,
  useTeacherOpenTimeEvents,
  useUpdateClassGroup,
} from '../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../images/icon'
import { ClassGroup, Language, ScheduleCondition, ScheduleEvent, Teacher } from '../types/schedule'

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

const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`

const SemesterScheduleEditPage: React.FC = () => {
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

  // Local pending events (events that haven't been submitted to API yet)
  const [localPendingEvents, setLocalPendingEvents] = useState<ScheduleEvent[]>([])

  // Publish loading state
  const [publishLoading, setPublishLoading] = useState(false)

  // Get schedule expiry settings
  const { getMaxExpiryDateForLanguage } = useScheduleExpirySettings('semester')

  // Calculate expiry date by language
  const expiryDateByLanguage = useMemo<Record<string, Date | null>>(() => {
    if (!classGroup?.language) return {}
    return {
      [classGroup.language]: getMaxExpiryDateForLanguage(classGroup.language, scheduleCondition.startDate),
    }
  }, [classGroup?.language, getMaxExpiryDateForLanguage, scheduleCondition.startDate])

  // Handle class group not found
  useEffect(() => {
    if (!loading && !classGroup && !error) {
      message.error('找不到該班級')
      history.push('/class-schedule/semester')
    }
  }, [classGroup, loading, error, history])

  // Get selected teacher IDs for fetching open time events
  const selectedTeacherIds = useMemo(() => {
    return selectedTeachers.filter(t => t && t.id).map(t => t.id)
  }, [selectedTeachers])

  // Get teacher open time events (background events for calendar)
  const { events: teacherOpenTimeEvents, busyEvents: teacherBusyEvents } = useTeacherOpenTimeEvents(selectedTeacherIds)

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
    // API events already have status (pre-scheduled or published)
    const combinedEvents = [...apiEvents, ...filteredLocalEvents]

    return combinedEvents
  }, [classGroup, apiEvents, localPendingEvents])

  // Get materials from class group
  const classMaterials = useMemo(() => {
    return classGroup?.materials || []
  }, [classGroup])

  // Get paid student count for publish check
  // TODO: Query paid students from class_group_order -> order_log
  const paidStudentCount = useMemo(() => {
    if (!classGroup) return 0
    // For now, return the count of orderIds as placeholder
    return classGroup.orderIds?.length || 0
  }, [classGroup])

  // Calculate status summary
  const statusSummary = useMemo(() => {
    const pending = calendarEvents.filter(e => e.status === 'pending').length
    const preScheduled = calendarEvents.filter(e => e.status === 'pre-scheduled').length
    const published = calendarEvents.filter(e => e.status === 'published').length
    return { pending, preScheduled, published }
  }, [calendarEvents])

  // Handlers
  const handleBack = useCallback(() => {
    history.push('/class-schedule/semester')
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
    (events: Partial<ScheduleEvent>[]) => {
      setLocalPendingEvents(prev => {
        const newEvents = [...prev]
        events.forEach(event => {
          if (event.id && !event.id.startsWith('local-')) {
            // Update existing local event
            const index = newEvents.findIndex(e => e.id === event.id)
            if (index >= 0) {
              newEvents[index] = { ...newEvents[index], ...event }
            }
          } else {
            // Add new event to local pending events
            newEvents.push({
              ...event,
              id: `local-${Date.now()}-${Math.random()}`,
              scheduleType: 'semester',
              status: 'pending',
              classId: classGroup?.id,
              studentIds: [], // Students are invited per event via event_temporally_exclusive_resource
              orderIds: [],
              campus: classGroup?.campusId || '',
              language: (classGroup?.language || 'zh-TW') as Language,
              createdBy: 'current-user',
              createdByEmail: 'user@example.com',
              updatedAt: new Date(),
            } as ScheduleEvent)
          }
        })
        return newEvents
      })
      message.success(formatMessage(scheduleMessages.SemesterClass.courseArranged))
    },
    [classGroup, formatMessage],
  )

  const handlePreSchedule = useCallback(async () => {
    const eventsToPreSchedule = calendarEvents.filter(e => e.status === 'pending')
    if (eventsToPreSchedule.length === 0) {
      message.warning(formatMessage(scheduleMessages.SemesterClass.noPendingCourses))
      return
    }

    if (!authToken || !appId || !classGroup) {
      message.error('無法預排：缺少必要資訊')
      return
    }

    try {
      // Convert pending events to API format with clientEventId for tracking
      const apiEventsToCreate: GeneralEventApi[] = eventsToPreSchedule.map(event => {
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
              scheduleType: 'semester',
              classId: classGroup.id,
              studentIds: [],
              campus: event.campus,
              language: event.language,
              teacherId: event.teacherId,
              duration: event.duration,
              material: event.material,
              needsOnlineRoom: event.needsOnlineRoom,
              clientEventId: event.id, // Track local event ID for mapping
              createdBy: currentMemberId || '',
              createdByEmail: currentMember?.email || '',
              updatedBy: currentMemberId || '',
              updatedByEmail: currentMember?.email || '',
            },
          },
        } as GeneralEventApi
      })

      // Create events via API
      const createdEvents = await createEventFetcher(authToken)(appId)({ events: apiEventsToCreate })
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
      const resolveCreatedEvent = (pendingEvent: ScheduleEvent, index: number) =>
        createdEventByClientId.get(pendingEvent.id) || createdEventsArray[index]

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
                  },
                ])([createdEvent.id])
              }
            }
          }),
        )
      }

      // Remove submitted events from local pending events (they are now in API)
      const submittedEventIds = new Set(eventsToPreSchedule.map(e => e.id))
      setLocalPendingEvents(prev => prev.filter(e => !submittedEventIds.has(e.id)))

      // Refetch events from API to get the latest state
      await refetchEvents()
      message.success(formatMessage(scheduleMessages.SemesterClass.preScheduleSuccess, { count: eventsToPreSchedule.length }))
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
      message.warning(formatMessage(scheduleMessages.SemesterClass.noPreScheduledCourses))
      return
    }

    setPublishLoading(true)

    try {
      // Use GraphQL mutation to publish events
      const eventIds = preScheduledEvents.map(e => e.apiEventId!)
      await publishEvents(eventIds)

      // Refetch events from API to get the latest state
      await refetchEvents()
      message.success(
        formatMessage(scheduleMessages.SemesterClass.publishSuccess, { count: preScheduledEvents.length }),
      )
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
        <span>{formatMessage(scheduleMessages['*'].semester)}</span>
      </AdminPageTitle>

      <PageWrapper>
        <ActionBar>
          <Space>
            <Button onClick={handleBack}>{formatMessage(scheduleMessages['*'].back)}</Button>
          </Space>
          <Space>
            <Button onClick={handlePreSchedule} disabled={statusSummary.pending === 0}>
              {formatMessage(scheduleMessages.SemesterClass.preScheduleAction)}
            </Button>
            <Button type="primary" onClick={handlePublish} disabled={!canPublish} loading={publishLoading}>
              {formatMessage(scheduleMessages.SemesterClass.publishAction)}
            </Button>
          </Space>
        </ActionBar>

        {/* Top Section: Three-column grid */}
        <ThreeColumnGrid>
          <ClassSettingsPanel
            classGroup={classGroup}
            classType="semester"
            onChange={handleClassGroupUpdate}
            onCampusChange={handleCampusChange}
          />
          <StudentListPanel
            orderIds={classGroup?.orderIds || []}
            classGroupId={classGroup?.id}
            scheduleType="semester"
            language={classGroup?.language}
            onOrdersChanged={refetchClassGroup}
          />
          <ScheduleConditionPanel
            selectedOrders={[]}
            condition={scheduleCondition}
            onConditionChange={handleConditionChange}
            hideMinutesOption={true}
            expiryDateByLanguage={expiryDateByLanguage}
            disabled={false}
          />
        </ThreeColumnGrid>

        {/* Middle section: Teacher List */}
        <AdminPageBlock className="mb-4">
          <TeacherListPanel
            languages={classGroup?.language ? [classGroup.language] : []}
            campus={classGroup?.campusId}
            selectedTeachers={selectedTeachers}
            onTeacherSelect={handleTeachersChange}
            
          />
        </AdminPageBlock>

        {/* Bottom section: Calendar Scheduling */}
        <AdminPageBlock>
          <ScheduleCalendar
            scheduleType="semester"
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
        scheduleType="semester"
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

export default SemesterScheduleEditPage
