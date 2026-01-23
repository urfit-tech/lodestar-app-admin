import { Button, message, Space } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
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
  useHolidays,
  usePublishEvent,
  useScheduleExpirySettings,
  useTeacherOpenTimeEvents,
  useUpdateClassGroup,
} from '../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../images/icon'
import { ClassGroup, Language, ScheduleCondition, ScheduleEvent, scheduleStore, Teacher } from '../types/schedule'

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

const SemesterScheduleCreatePage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const { holidays: defaultExcludeDates } = useHolidays()
  const { classrooms } = useClassrooms()

  // GraphQL hooks
  const { updateClassGroup } = useUpdateClassGroup()
  const { publishEvents } = usePublishEvent()

  // Created class group (after user clicks create)
  const [classGroup, setClassGroup] = useState<ClassGroup | undefined>()
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

  // Get events for calendar
  const calendarEvents = useMemo(() => {
    if (!classGroup) return []
    return scheduleStore.getEvents('semester').filter(e => e.classId === classGroup.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classGroup, storeUpdateCounter])

  // Get materials from class group
  const classMaterials = useMemo(() => {
    return classGroup?.materials || []
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
          setClassGroup(prev => (prev ? { ...prev, ...updates } : prev))
          if (updates.language && updates.language !== classGroup.language) {
            setSelectedTeachers([])
          }
        } catch (error) {
          console.error('Failed to update class group:', error)
          message.error('更新班級失敗')
        }
      }
    },
    [classGroup, updateClassGroup],
  )

  const handleCampusChange = useCallback(
    async (newCampus: string, confirmed: boolean) => {
      if (confirmed && classGroup) {
        try {
          await updateClassGroup(classGroup.id, { campusId: newCampus })
          setClassGroup(prev => (prev ? { ...prev, campusId: newCampus } : prev))
          setSelectedTeachers([])
        } catch (error) {
          console.error('Failed to update campus:', error)
          message.error('更新校區失敗')
        }
      }
    },
    [classGroup, updateClassGroup],
  )

  const handleCreateClass = useCallback(
    (newClass: ClassGroup) => {
      message.success(formatMessage(scheduleMessages.SemesterClass.createClassSuccess))
      // Navigate to the edit page with the new class group ID
      history.push(`/class-schedule/semester/${newClass.id}`)
    },
    [formatMessage, history],
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
      events.forEach(event => {
        if (event.id && !event.id.startsWith('local-')) {
          scheduleStore.updateEvent(event.id, event)
        } else {
          scheduleStore.addEvent({
            ...event,
            id: `local-${Date.now()}-${Math.random()}`,
            scheduleType: 'semester',
            status: 'pending',
            classId: classGroup?.id,
            studentIds: [], // Students are invited per event via event_temporally_exclusive_resource
            orderIds: [],
            campus: classGroup?.campusId || '',
            language: classGroup?.language || 'zh-TW',
            createdBy: 'current-user',
            createdByEmail: 'user@example.com',
            updatedAt: new Date(),
          } as ScheduleEvent)
        }
      })
      setStoreUpdateCounter(prev => prev + 1)
      message.success(formatMessage(scheduleMessages.SemesterClass.courseArranged))
    },
    [classGroup, formatMessage],
  )

  const handlePreSchedule = useCallback(async () => {
    const pendingEvents = calendarEvents.filter(e => e.status === 'pending')
    if (pendingEvents.length === 0) {
      message.warning(formatMessage(scheduleMessages.SemesterClass.noPendingCourses))
      return
    }

    if (!authToken || !appId || !classGroup) {
      message.error('無法預排：缺少必要資訊')
      return
    }

    try {
      // Convert pending events to API format with clientEventId for tracking
      const apiEvents: GeneralEventApi[] = pendingEvents.map(event => {
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
            },
          },
        } as GeneralEventApi
      })

      // Create events via API
      const createdEvents = await createEventFetcher(authToken)(appId)({ events: apiEvents })
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

        // Invite each teacher to their respective events
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

      // Update local store status with API event IDs
      pendingEvents.forEach((event, index) => {
        const createdEvent = resolveCreatedEvent(event, index)
        const apiEventId = createdEvent?.id
        scheduleStore.updateEvent(event.id, {
          status: 'pre-scheduled',
          apiEventId,
        })
      })

      setStoreUpdateCounter(prev => prev + 1)
      message.success(formatMessage(scheduleMessages.SemesterClass.preScheduleSuccess, { count: pendingEvents.length }))
    } catch (error) {
      console.error('Failed to pre-schedule events:', error)
      message.error('預排失敗，請稍後再試')
    }
  }, [authToken, appId, classGroup, calendarEvents, formatMessage])

  const handlePublish = useCallback(async () => {
    if (!classGroup) {
      message.error('無法發布：缺少必要資訊')
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

      // Update local store status
      preScheduledEvents.forEach(event => {
        scheduleStore.updateEvent(event.id, { status: 'published' })
      })

      setStoreUpdateCounter(prev => prev + 1)
      message.success(
        formatMessage(scheduleMessages.SemesterClass.publishSuccess, { count: preScheduledEvents.length }),
      )
    } catch (error) {
      console.error('Failed to publish events:', error)
      message.error('發布失敗，請稍後再試')
    } finally {
      setPublishLoading(false)
    }
  }, [classGroup, calendarEvents, formatMessage, publishEvents])

  const canPublish = useMemo(() => {
    if (!classGroup) return false
    return calendarEvents.some(e => e.status === 'pre-scheduled' && e.apiEventId)
  }, [classGroup, calendarEvents])

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
            onCreateClass={handleCreateClass}
          />
          <StudentListPanel
            orderIds={classGroup?.orderIds || []}
            classGroupId={classGroup?.id}
            scheduleType="semester"
            language={classGroup?.language}
          />
          <ScheduleConditionPanel
            selectedOrders={[]}
            condition={scheduleCondition}
            onConditionChange={handleConditionChange}
            hideMinutesOption={true}
            expiryDateByLanguage={expiryDateByLanguage}
          />
        </ThreeColumnGrid>

        {/* Middle section: Teacher List */}
        <AdminPageBlock className="mb-4">
          <TeacherListPanel
            languages={classGroup?.language ? [classGroup.language] : []}
            campus={classGroup?.campusId}
            selectedTeachers={selectedTeachers}
            onTeacherSelect={handleTeachersChange}
            useRealData={true}
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
        onClose={() => {
          setArrangeModalVisible(false)
          setEditingEvent(undefined)
        }}
        onSave={handleSaveEvents}
      />
    </AdminLayout>
  )
}

export default SemesterScheduleCreatePage
