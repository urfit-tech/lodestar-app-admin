import { Button, message, Space, Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageBlock, AdminPageTitle } from '../../admin'
import { GeneralEventApi } from '../../event/events.type'
import AdminLayout from '../../layout/AdminLayout'
import {
  ArrangeCourseModal,
  ClassSettingsPanel,
  ScheduleCalendar,
  ScheduleConditionPanel,
  scheduleMessages,
  StudentListPanel,
  TeacherListPanel,
} from '..'
import {
  createEventFetcher,
  createInvitationFetcher,
  getResourceByTypeTargetFetcher,
  updateEvent,
} from '../../../helpers/eventHelper/eventFetchers'
import { useClassrooms } from '../../../hooks/classroom'
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
} from '../../../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../../../images/icon'
import { ClassGroup, Language, Order, ScheduleCondition, ScheduleEvent, Teacher } from '../../../types/schedule'
import { ScheduleEditorProvider, useScheduleEditorStore, useScheduleEditorStoreApi } from './ScheduleEditorContext'

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

type ClassGroupScheduleEditorMode = 'create' | 'edit'

interface ClassGroupScheduleEditorProps {
  scheduleType: 'semester' | 'group'
  mode: ClassGroupScheduleEditorMode
}

interface ClassGroupScheduleEditorState {
  scheduleCondition: ScheduleCondition
  selectedTeachers: Teacher[]
  arrangeModalVisible: boolean
  selectedDate: Date
  editingEvent?: ScheduleEvent
  localPendingEvents: ScheduleEvent[]
  publishLoading: boolean
}

const buildInitialState = (): ClassGroupScheduleEditorState => ({
  scheduleCondition: {
    startDate: new Date(),
    excludedDates: [],
    excludeHolidays: true,
  },
  selectedTeachers: [],
  arrangeModalVisible: false,
  selectedDate: new Date(),
  editingEvent: undefined,
  localPendingEvents: [],
  publishLoading: false,
})

const ClassGroupScheduleEditorInner: React.FC<ClassGroupScheduleEditorProps> = ({ scheduleType, mode }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { groupId } = useParams<{ groupId: string }>()
  const { authToken, currentMemberId, currentMember } = useAuth()
  const { id: appId } = useApp()
  const { holidays: defaultExcludeDates } = useHolidays()
  const { classrooms } = useClassrooms()

  const store = useScheduleEditorStoreApi<ClassGroupScheduleEditorState>()
  const {
    scheduleCondition,
    selectedTeachers,
    arrangeModalVisible,
    selectedDate,
    editingEvent,
    localPendingEvents,
    publishLoading,
  } = useScheduleEditorStore((state: ClassGroupScheduleEditorState) => ({
    scheduleCondition: state.scheduleCondition,
    selectedTeachers: state.selectedTeachers,
    arrangeModalVisible: state.arrangeModalVisible,
    selectedDate: state.selectedDate,
    editingEvent: state.editingEvent,
    localPendingEvents: state.localPendingEvents,
    publishLoading: state.publishLoading,
  }))

  const classMessageSet = scheduleType === 'group' ? scheduleMessages.GroupClass : scheduleMessages.SemesterClass
  const pageTitleMessage = scheduleType === 'group' ? scheduleMessages['*'].group : scheduleMessages['*'].semester
  const isCreateMode = mode === 'create'
  const classGroupId = isCreateMode ? undefined : groupId

  const { classGroup, loading: classGroupLoading, error, refetch: refetchClassGroup } = useClassGroup(classGroupId)
  const { events: apiEvents, loading: eventsLoading, refetch: refetchEvents } = useClassGroupEvents(classGroupId)
  const { updateClassGroup } = useUpdateClassGroup()
  const { publishEvents } = usePublishEvent()
  const { teachers: allTeachers } = useTeachersFromMembers()

  const { calculateExpiryDate, getMaxExpiryDateForLanguage } = useScheduleExpirySettings(scheduleType)

  const orderIds = classGroup?.orderIds || []
  const { orders: orderLogs } = useOrdersByIds(scheduleType === 'group' ? orderIds : [])

  const selectedTeacherIds = useMemo(() => {
    return selectedTeachers.filter(t => t && t.id).map(t => t.id)
  }, [selectedTeachers])

  const teacherOpenTimeRange = useMemo(() => {
    if (scheduleType !== 'group') return undefined
    const start = scheduleCondition.startDate
    const end = scheduleCondition.endDate
      ? scheduleCondition.endDate
      : new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000)
    return { start, end }
  }, [scheduleType, scheduleCondition.startDate, scheduleCondition.endDate])

  const { events: teacherOpenTimeEvents, busyEvents: teacherBusyEvents } = useTeacherOpenTimeEvents(
    selectedTeacherIds,
    teacherOpenTimeRange?.start,
    teacherOpenTimeRange?.end,
  )

  const holidays = useMemo(() => {
    return defaultExcludeDates.map(h => h.date)
  }, [defaultExcludeDates])

  const calendarEvents = useMemo(() => {
    if (!classGroup) return []

    const filteredLocalEvents = localPendingEvents.filter(
      e => e.classId === classGroup.id && e.status === 'pending' && !e.apiEventId,
    )

    return [...apiEvents, ...filteredLocalEvents]
  }, [classGroup, apiEvents, localPendingEvents])

  const apiEventIdSet = useMemo(() => new Set(apiEvents.map(e => e.id)), [apiEvents])
  const localPendingEventIdSet = useMemo(() => new Set(localPendingEvents.map(e => e.id)), [localPendingEvents])

  const studentOrders = useMemo((): Order[] => {
    if (scheduleType !== 'group' || !classGroup) return []
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
  }, [scheduleType, classGroup, orderLogs, calculateExpiryDate, scheduleCondition.startDate])

  const groupStudentIds = useMemo(() => {
    return Array.from(new Set(studentOrders.map(order => order.studentId)))
  }, [studentOrders])

  const groupOrderIds = useMemo(() => studentOrders.map(o => o.id), [studentOrders])

  const classMaterials = useMemo(() => {
    return classGroup?.materials || []
  }, [classGroup])

  const paidStudentCount = useMemo(() => {
    if (!classGroup) return 0
    if (scheduleType === 'group') {
      const paidStudents = new Set(studentOrders.filter(o => o.status === 'SUCCESS').map(o => o.studentId))
      return paidStudents.size
    }
    return classGroup.orderIds?.length || 0
  }, [classGroup, scheduleType, studentOrders])

  const expiryDateByOrderId = useMemo(() => {
    if (scheduleType !== 'group') return {}
    const map: Record<string, Date | null> = {}
    studentOrders.forEach(order => {
      map[order.id] = order.expiresAt || null
    })
    return map
  }, [scheduleType, studentOrders])

  const expiryDateByLanguage = useMemo<Record<string, Date | null>>(() => {
    if (scheduleType !== 'semester' || !classGroup?.language) return {}
    return {
      [classGroup.language]: getMaxExpiryDateForLanguage(classGroup.language, scheduleCondition.startDate),
    }
  }, [scheduleType, classGroup?.language, getMaxExpiryDateForLanguage, scheduleCondition.startDate])

  const groupBaseAvailableMinutes = useMemo(() => {
    if (scheduleType !== 'group') return 0
    return studentOrders.reduce((sum, order) => sum + order.availableMinutes, 0)
  }, [scheduleType, studentOrders])

  const groupUsedMinutes = useMemo(() => {
    if (scheduleType !== 'group') return 0
    return calendarEvents
      .filter(event => event.status === 'pending' || event.status === 'pre-scheduled' || event.status === 'published')
      .reduce((sum, event) => sum + (event.duration || 0), 0)
  }, [scheduleType, calendarEvents])

  const groupRemainingMinutes = useMemo(() => {
    if (scheduleType !== 'group') return 0
    return Math.max(0, groupBaseAvailableMinutes - groupUsedMinutes)
  }, [scheduleType, groupBaseAvailableMinutes, groupUsedMinutes])

  const statusSummary = useMemo(() => {
    const pending = calendarEvents.filter(e => e.status === 'pending').length
    const preScheduled = calendarEvents.filter(e => e.status === 'pre-scheduled').length
    const published = calendarEvents.filter(e => e.status === 'published').length
    return { pending, preScheduled, published }
  }, [calendarEvents])

  const buildEventPayload = useCallback(
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

      return {
        start: startDateTime,
        end: endDateTime,
        title: event.material || classGroup?.name || '',
        extendedProps: {
          description: '',
          metadata: {
            title: classGroup?.name || '',
            scheduleType,
            classId: classGroup?.id,
            studentIds: scheduleType === 'group' ? groupStudentIds : [],
            orderIds: scheduleType === 'group' ? groupOrderIds : [],
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
    [classGroup, selectedDate, scheduleType, groupStudentIds, groupOrderIds, currentMemberId, currentMember],
  )

  const hasInitializedScheduleCondition = useRef(false)
  const hasInitializedTeachers = useRef(false)

  useEffect(() => {
    if (isCreateMode) return
    if (hasInitializedScheduleCondition.current) return
    if (!apiEvents || apiEvents.length === 0) return

    const eventDates = apiEvents.map(event => event.date).filter(Boolean)
    if (eventDates.length === 0) return

    const startDate = new Date(Math.min(...eventDates.map(date => date.getTime())))
    const endDate = new Date(Math.max(...eventDates.map(date => date.getTime())))

    store.setState(prev => ({
      scheduleCondition: {
        ...prev.scheduleCondition,
        startDate,
        endDate,
      },
    }))

    hasInitializedScheduleCondition.current = true
  }, [apiEvents, isCreateMode, store])

  useEffect(() => {
    if (isCreateMode) return
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
      store.setState({ selectedTeachers: selected })
      hasInitializedTeachers.current = true
    }
  }, [apiEvents, allTeachers, selectedTeachers, store, isCreateMode])

  useEffect(() => {
    if (isCreateMode) return
    if (!classGroupLoading && !classGroup && !error) {
      message.error('找不到該班級')
      history.push(`/class-schedule/${scheduleType}`)
    }
  }, [classGroup, classGroupLoading, error, history, scheduleType, isCreateMode])

  const handleBack = useCallback(() => {
    history.push(`/class-schedule/${scheduleType}`)
  }, [history, scheduleType])

  const handleClassGroupUpdate = useCallback(
    async (updates: Partial<ClassGroup>) => {
      if (!classGroup) return
      try {
        await updateClassGroup(classGroup.id, updates)
        refetchClassGroup()
        if (updates.language && updates.language !== classGroup.language) {
          store.setState({ selectedTeachers: [] })
        }
      } catch (error) {
        console.error('Failed to update class group:', error)
        message.error('更新班級失敗')
      }
    },
    [classGroup, updateClassGroup, refetchClassGroup, store],
  )

  const handleCampusChange = useCallback(
    async (newCampus: string, confirmed: boolean) => {
      if (!classGroup || !confirmed) return
      try {
        await updateClassGroup(classGroup.id, { campusId: newCampus })
        refetchClassGroup()
        store.setState({ selectedTeachers: [] })
      } catch (error) {
        console.error('Failed to update campus:', error)
        message.error('更新校區失敗')
      }
    },
    [classGroup, updateClassGroup, refetchClassGroup, store],
  )

  const handleCreateClass = useCallback(
    (newClass: ClassGroup) => {
      message.success(formatMessage(classMessageSet.createClassSuccess))
      history.push(`/class-schedule/${scheduleType}/${newClass.id}`)
    },
    [formatMessage, classMessageSet, history, scheduleType],
  )

  const handleOrdersChanged = useCallback(() => {
    if (!isCreateMode) {
      refetchClassGroup()
    }
  }, [isCreateMode, refetchClassGroup])

  const handleTeachersChange = useCallback(
    (teachers: Teacher[]) => {
      store.setState({ selectedTeachers: teachers })
    },
    [store],
  )

  const handleConditionChange = useCallback(
    (updates: Partial<ScheduleCondition>) => {
      store.setState(prev => ({
        scheduleCondition: {
          ...prev.scheduleCondition,
          ...updates,
        },
      }))
    },
    [store],
  )

  const handleDateClick = useCallback(
    (date: Date) => {
      store.setState({ selectedDate: date, editingEvent: undefined, arrangeModalVisible: true })
    },
    [store],
  )

  const handleEventClick = useCallback(
    (event: ScheduleEvent) => {
      store.setState({ selectedDate: event.date, editingEvent: event, arrangeModalVisible: true })
    },
    [store],
  )

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
              apiUpdates.map(({ event, eventId }) => updateEvent(authToken)(buildEventPayload(event))(eventId)),
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
        store.setState(prev => {
          const newEvents = [...prev.localPendingEvents]
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
            newEvents.push({
              ...event,
              id: `local-${Date.now()}-${Math.random()}`,
              scheduleType,
              status: 'pending',
              classId: classGroup?.id,
              studentIds: scheduleType === 'group' ? groupStudentIds : [],
              orderIds: scheduleType === 'group' ? groupOrderIds : [],
              campus: classGroup?.campusId || '',
              language: (classGroup?.language || 'zh-TW') as Language,
              createdBy: currentMemberId || '',
              createdByEmail: currentMember?.email || '',
              updatedAt: new Date(),
            } as ScheduleEvent)
          })
          return { localPendingEvents: newEvents }
        })
      }

      if (!hasError) {
        message.success(formatMessage(classMessageSet.courseArranged))
      }
    },
    [
      apiEventIdSet,
      localPendingEventIdSet,
      authToken,
      buildEventPayload,
      refetchEvents,
      classGroup,
      scheduleType,
      groupStudentIds,
      groupOrderIds,
      currentMemberId,
      currentMember,
      formatMessage,
      classMessageSet,
      store,
    ],
  )

  const handlePreSchedule = useCallback(async () => {
    const eventsToPreSchedule = calendarEvents.filter(e => e.status === 'pending')
    if (eventsToPreSchedule.length === 0) {
      message.warning(formatMessage(classMessageSet.noPendingCourses))
      return
    }

    if (!authToken || !appId || !classGroup) {
      message.error('無法預排：缺少必要資訊')
      return
    }

    try {
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
              scheduleType,
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

      const createdEvents = await createEventFetcher(authToken)(appId)({ events: apiEventsData })
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
      const resolveCreatedEvent = (eventToResolve: ScheduleEvent, index: number) =>
        createdEventByClientId.get(eventToResolve.id) || createdEventsArray[index]

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

      const submittedEventIds = new Set(eventsToPreSchedule.map(e => e.id))
      store.setState(prev => ({
        localPendingEvents: prev.localPendingEvents.filter(e => !submittedEventIds.has(e.id)),
      }))

      await refetchEvents()
      message.success(formatMessage(classMessageSet.preScheduleSuccess, { count: eventsToPreSchedule.length }))
    } catch (error) {
      console.error('Failed to pre-schedule events:', error)
      message.error('預排失敗，請稍後再試')
    }
  }, [
    authToken,
    appId,
    classGroup,
    calendarEvents,
    formatMessage,
    classMessageSet,
    scheduleType,
    currentMemberId,
    currentMember,
    refetchEvents,
    store,
  ])

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
      message.warning(formatMessage(classMessageSet.noPreScheduledCourses))
      return
    }

    store.setState({ publishLoading: true })

    try {
      const eventIds = preScheduledEvents.map(e => e.apiEventId!)
      await publishEvents(eventIds)
      await refetchEvents()
      message.success(formatMessage(classMessageSet.publishSuccess, { count: preScheduledEvents.length }))
    } catch (error) {
      console.error('Failed to publish events:', error)
      message.error('發布失敗，請稍後再試')
    } finally {
      store.setState({ publishLoading: false })
    }
  }, [
    classGroup,
    paidStudentCount,
    calendarEvents,
    formatMessage,
    classMessageSet,
    publishEvents,
    refetchEvents,
    store,
  ])

  const canPublish = useMemo(() => {
    if (!classGroup) return false
    return paidStudentCount >= classGroup.minStudents && calendarEvents.some(e => e.status === 'pre-scheduled' && e.apiEventId)
  }, [classGroup, paidStudentCount, calendarEvents])

  if (!isCreateMode && (classGroupLoading || eventsLoading)) {
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
        <span>{formatMessage(pageTitleMessage)}</span>
      </AdminPageTitle>

      <PageWrapper>
        <ActionBar>
          <Space>
            <Button onClick={handleBack}>{formatMessage(scheduleMessages['*'].back)}</Button>
          </Space>
          <Space>
            <Button onClick={handlePreSchedule} disabled={statusSummary.pending === 0}>
              {formatMessage(classMessageSet.preScheduleAction)}
            </Button>
            <Button type="primary" onClick={handlePublish} disabled={!canPublish} loading={publishLoading}>
              {formatMessage(classMessageSet.publishAction)}
            </Button>
          </Space>
        </ActionBar>

        <ThreeColumnGrid>
          <ClassSettingsPanel
            classGroup={classGroup}
            classType={scheduleType}
            onChange={handleClassGroupUpdate}
            onCampusChange={handleCampusChange}
            onCreateClass={isCreateMode ? handleCreateClass : undefined}
          />
          <StudentListPanel
            orderIds={classGroup?.orderIds || []}
            classGroupId={classGroup?.id}
            scheduleType={scheduleType}
            language={classGroup?.language}
            campusId={scheduleType === 'group' ? classGroup?.campusId ?? undefined : undefined}
            maxStudents={scheduleType === 'group' ? classGroup?.maxStudents : undefined}
            events={scheduleType === 'group' ? calendarEvents : []}
            expiryDateByOrderId={scheduleType === 'group' ? expiryDateByOrderId : undefined}
            onOrdersChanged={handleOrdersChanged}
          />
          <ScheduleConditionPanel
            selectedOrders={scheduleType === 'group' ? studentOrders : []}
            condition={scheduleCondition}
            onConditionChange={handleConditionChange}
            hideMinutesOption={scheduleType !== 'group'}
            expiryDateByLanguage={expiryDateByLanguage}
            minutesLimitOverride={scheduleType === 'group' ? groupRemainingMinutes : undefined}
            disabled={false}
          />
        </ThreeColumnGrid>

        <AdminPageBlock className="mb-4">
          <TeacherListPanel
            languages={classGroup?.language ? [classGroup.language] : []}
            campus={classGroup?.campusId ?? undefined}
            selectedTeachers={selectedTeachers}
            onTeacherSelect={handleTeachersChange}
          />
        </AdminPageBlock>

        <AdminPageBlock>
          <ScheduleCalendar
            scheduleType={scheduleType}
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

      <ArrangeCourseModal
        visible={arrangeModalVisible}
        scheduleType={scheduleType}
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
          store.setState({ arrangeModalVisible: false, editingEvent: undefined })
        }}
        onSave={handleSaveEvents}
      />
    </AdminLayout>
  )
}

const ClassGroupScheduleEditor: React.FC<ClassGroupScheduleEditorProps> = ({ scheduleType, mode }) => {
  const initialState = useMemo(buildInitialState, [])

  return (
    <ScheduleEditorProvider initialState={initialState}>
      <ClassGroupScheduleEditorInner scheduleType={scheduleType} mode={mode} />
    </ScheduleEditorProvider>
  )
}

export default ClassGroupScheduleEditor
