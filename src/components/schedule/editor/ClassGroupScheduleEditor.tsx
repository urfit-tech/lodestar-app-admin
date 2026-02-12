import { Button, Checkbox, Form, Input, message, Modal, Select, Space, Spin, Table, Tooltip, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
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
  checkScheduleConflict,
  useClassGroup,
  useClassGroupEvents,
  useHolidays,
  useOrdersByIds,
  useScheduleExpirySettings,
  useTeacherOpenTimeEvents,
  useTeachersFromMembers,
  useUpdateClassGroup,
} from '../../../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../../../images/icon'
import { ClassGroup, Language, Order, ScheduleCondition, ScheduleEvent, Teacher } from '../../../types/schedule'
import { AdminPageBlock, AdminPageTitle } from '../../admin'
import { GeneralEventApi } from '../../event/events.type'
import AdminLayout from '../../layout/AdminLayout'
import { buildClassMetadata, getEventKey } from './classFlow/metadata'
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

const CalendarActionFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
`

const PublishActionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const PublishHintText = styled.span`
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
`

type ClassGroupScheduleEditorMode = 'create' | 'edit'

type PublishFlowStep = 'selectMode' | 'correctionPrompt' | 'correctionEdit' | 'finalConfirm'
type PublishMode = 'pending' | 'preScheduled'
type CorrectionField = 'teacherId' | 'classroomId' | 'material' | 'needsOnlineRoom' | 'teacherConflict' | 'roomConflict'
type PublishEventDraft = Omit<ScheduleEvent, 'needsOnlineRoom'> & { needsOnlineRoom?: boolean }

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

interface SchedulePreviewRow {
  key: string
  dateLabel: string
  weekLabel: string
  courseTimeLabel: string
  startTimeLabel: string
  duration: number
  classroomLabel: string
  teacherLabel: string
  materialLabel: string
  needsOnlineRoomLabel: string
}

interface PreScheduleResult {
  createdEventIds: string[]
  createdEventIdByKey: Map<string, string>
}

const CORRECTION_EXTERNAL_CLASSROOM = '__external__'
const WEEKDAY_LABELS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

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

const uniqueStrings = (values: Array<string | null | undefined>): string[] => {
  const filtered = values.filter((value): value is string => Boolean(value))
  return filtered.filter((value, index, self) => self.indexOf(value) === index)
}

const getResourceTarget = (resource: any): string | undefined => {
  return resource?.target || resource?.resource_target || resource?.member_id || resource?.physical_space_id
}

const ClassGroupScheduleEditorInner: React.FC<ClassGroupScheduleEditorProps> = ({ scheduleType, mode }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { groupId } = useParams<{ groupId: string }>()
  const { authToken, currentMemberId, currentMember } = useAuth()
  const { id: appId } = useApp()
  const { holidays: defaultExcludeDates } = useHolidays()
  const { classrooms } = useClassrooms()

  const [preScheduleModalVisible, setPreScheduleModalVisible] = useState(false)
  const [preScheduleLoading, setPreScheduleLoading] = useState(false)
  const [publishModalVisible, setPublishModalVisible] = useState(false)
  const [publishFlowStep, setPublishFlowStep] = useState<PublishFlowStep>('selectMode')
  const [selectedPublishModes, setSelectedPublishModes] = useState<PublishMode[]>([])
  const [publishEventDrafts, setPublishEventDrafts] = useState<PublishEventDraft[]>([])
  const [correctionEventKeys, setCorrectionEventKeys] = useState<string[]>([])
  const [correctionErrors, setCorrectionErrors] = useState<Record<string, CorrectionField[]>>({})

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
  const classTypeLabel = scheduleType === 'semester' ? '團體班' : '小組班'
  const isCreateMode = mode === 'create'
  const classGroupId = isCreateMode ? undefined : groupId

  const { classGroup, loading: classGroupLoading, error, refetch: refetchClassGroup } = useClassGroup(classGroupId)
  const { events: apiEvents, loading: eventsLoading, refetch: refetchEvents } = useClassGroupEvents(classGroupId)
  const { updateClassGroup } = useUpdateClassGroup()
  const { teachers: allTeachers } = useTeachersFromMembers()

  const { calculateExpiryDate, getMaxExpiryDateForLanguage } = useScheduleExpirySettings(scheduleType)

  const orderIds = classGroup?.orderIds || []
  const { orders: orderLogs } = useOrdersByIds(orderIds)

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

  const holidays = useMemo(() => {
    return defaultExcludeDates.map(h => h.date)
  }, [defaultExcludeDates])

  const classOrders = useMemo((): Order[] => {
    if (!classGroup) return []
    const now = new Date()

    return orderLogs
      .map(orderLog => {
        const classProduct = orderLog.order_products?.find((product: any) => {
          const options = product.options?.options
          if (!options) return false
          if (options.product === '教材') return false
          if (options.class_type !== classTypeLabel) return false
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
          type: scheduleType,
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
  }, [classGroup, orderLogs, classTypeLabel, calculateExpiryDate, scheduleCondition.startDate, scheduleType])

  const classStudentIds = useMemo(() => {
    return Array.from(new Set(classOrders.map(order => order.studentId)))
  }, [classOrders])

  const classOrderIds = useMemo(() => classOrders.map(o => o.id), [classOrders])

  const paidStudentIds = useMemo(() => {
    const paidStudents = new Set(classOrders.filter(o => o.status === 'SUCCESS').map(o => o.studentId))
    return Array.from(paidStudents)
  }, [classOrders])

  const paidStudentIdSet = useMemo(() => new Set(paidStudentIds), [paidStudentIds])

  const paidStudentCount = paidStudentIds.length

  const classMaterials = useMemo(() => {
    return classGroup?.materials || []
  }, [classGroup])

  const calendarEvents = useMemo(() => {
    if (!classGroup) return []

    const filteredLocalEvents = localPendingEvents.filter(
      e => e.classId === classGroup.id && e.status === 'pending' && !e.apiEventId,
    )

    return [...apiEvents, ...filteredLocalEvents]
  }, [classGroup, apiEvents, localPendingEvents])

  const pendingCalendarEvents = useMemo(
    () => calendarEvents.filter(event => event.status === 'pending'),
    [calendarEvents],
  )
  const preScheduledCalendarEvents = useMemo(
    () => calendarEvents.filter(event => event.status === 'pre-scheduled'),
    [calendarEvents],
  )

  const hasPublishableEvents = useMemo(
    () => calendarEvents.some(event => event.status === 'pending' || event.status === 'pre-scheduled'),
    [calendarEvents],
  )

  const canPublish = useMemo(() => {
    if (!classGroup) return false
    return paidStudentCount >= classGroup.minStudents && hasPublishableEvents
  }, [classGroup, paidStudentCount, hasPublishableEvents])

  const publishDisabledHint = useMemo(() => {
    if (!classGroup) return ''
    if (paidStudentCount < classGroup.minStudents) {
      return formatMessage(scheduleMessages.Publish.minStudentsRequired, { count: classGroup.minStudents })
    }
    return ''
  }, [classGroup, paidStudentCount, formatMessage])

  const apiEventIdSet = useMemo(() => new Set(apiEvents.map(e => e.id)), [apiEvents])
  const localPendingEventIdSet = useMemo(() => new Set(localPendingEvents.map(e => e.id)), [localPendingEvents])
  const orderMap = useMemo(() => new Map(classOrders.map(order => [order.id, order])), [classOrders])

  const studentInfoById = useMemo(() => {
    const map = new Map<string, { name: string; email: string }>()
    orderLogs.forEach(orderLog => {
      const current = map.get(orderLog.member_id)
      if (!current) {
        map.set(orderLog.member_id, {
          name: orderLog.member?.name || '',
          email: orderLog.member?.email || '',
        })
      }
    })
    return map
  }, [orderLogs])

  const resolveEventStudentIds = useCallback(
    (event: Partial<ScheduleEvent>) => {
      const eventStudentIds = uniqueStrings(event.studentIds)
      return eventStudentIds.length > 0 ? eventStudentIds : classStudentIds
    },
    [classStudentIds],
  )

  const resolveEventOrderIds = useCallback(
    (event: Partial<ScheduleEvent>) => {
      const eventOrderIds = uniqueStrings(event.orderIds)
      return eventOrderIds.length > 0 ? eventOrderIds : classOrderIds
    },
    [classOrderIds],
  )

  const getClassroomIds = useCallback((event: Partial<ScheduleEvent>) => {
    if (Array.isArray(event.classroomIds) && event.classroomIds.length > 0) {
      return event.classroomIds.filter(Boolean)
    }
    if (event.classroomId) {
      return [event.classroomId]
    }
    return []
  }, [])

  const getPaidStudentIdsForEvent = useCallback(
    (event: Partial<ScheduleEvent>) => {
      const eventOrderIds = resolveEventOrderIds(event)
      const paidStudentIdsForEvent = new Set<string>()

      if (eventOrderIds.length > 0) {
        eventOrderIds.forEach(orderId => {
          const order = orderMap.get(orderId)
          if (order?.status === 'SUCCESS') {
            paidStudentIdsForEvent.add(order.studentId)
          }
        })
      } else {
        resolveEventStudentIds(event).forEach(studentId => {
          if (paidStudentIdSet.has(studentId)) {
            paidStudentIdsForEvent.add(studentId)
          }
        })
      }

      return Array.from(paidStudentIdsForEvent)
    },
    [resolveEventOrderIds, orderMap, resolveEventStudentIds, paidStudentIdSet],
  )

  const getPreScheduledStudentIdsForEvent = useCallback(
    (event: Partial<ScheduleEvent>) => {
      const allStudentIds = resolveEventStudentIds(event)
      const paidSet = new Set(getPaidStudentIdsForEvent(event))
      return allStudentIds.filter(studentId => !paidSet.has(studentId))
    },
    [resolveEventStudentIds, getPaidStudentIdsForEvent],
  )

  const buildClassEventMetadata = useCallback(
    (
      event: Partial<ScheduleEvent>,
      options?: {
        includeCreator?: boolean
        clientEventId?: string
        publishedStudentIds?: string[]
        preScheduledStudentIds?: string[]
      },
    ) => {
      if (!classGroup) {
        throw new Error('CLASS_GROUP_REQUIRED')
      }

      const studentIds = resolveEventStudentIds(event)
      const orderIds = resolveEventOrderIds(event)
      const isPublishedEvent = event.status === 'published'

      const publishedStudentIds =
        options?.publishedStudentIds || (isPublishedEvent ? getPaidStudentIdsForEvent(event) : [])
      const preScheduledStudentIds =
        options?.preScheduledStudentIds || (isPublishedEvent ? getPreScheduledStudentIdsForEvent(event) : studentIds)

      const classroomIds = getClassroomIds(event)

      return buildClassMetadata({
        classTitle: classGroup.name,
        studentIds,
        orderIds,
        publishedStudentIds,
        preScheduledStudentIds,
        scheduleType,
        classId: classGroup.id,
        campus: event.campus || classGroup.campusId || '',
        language: (event.language || classGroup.language || 'zh-TW') as Language,
        teacherId: event.teacherId,
        classroomId: event.classroomId,
        classroomIds,
        isExternal: Boolean(event.isExternal),
        duration: event.duration,
        material: event.material,
        needsOnlineRoom: event.needsOnlineRoom,
        clientEventId: options?.clientEventId,
        ...(options?.includeCreator
          ? {
              createdBy: currentMemberId || '',
              createdByEmail: currentMember?.email || '',
              createdByName: currentMember?.name || '',
            }
          : {}),
        updatedBy: currentMemberId || '',
        updatedByEmail: currentMember?.email || '',
        updatedByName: currentMember?.name || '',
      })
    },
    [
      classGroup,
      resolveEventStudentIds,
      resolveEventOrderIds,
      getPaidStudentIdsForEvent,
      getPreScheduledStudentIdsForEvent,
      getClassroomIds,
      scheduleType,
      currentMemberId,
      currentMember,
    ],
  )

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
          metadata: buildClassEventMetadata(event),
        },
      } as GeneralEventApi
    },
    [selectedDate, classGroup, buildClassEventMetadata],
  )

  const resolveClassroomLabel = useCallback(
    (event: Partial<ScheduleEvent>) => {
      if (event.isExternal) {
        return formatMessage(scheduleMessages.ArrangeModal.classroomExternal)
      }
      const classroomIds = getClassroomIds(event)
      if (classroomIds.length === 0) {
        return formatMessage(scheduleMessages.ArrangeModal.classroomUndecided)
      }
      return classroomIds.map(id => classrooms.find(classroom => classroom.id === id)?.name || id).join(' / ')
    },
    [formatMessage, getClassroomIds, classrooms],
  )

  const resolveTeacherLabel = useCallback(
    (teacherId?: string) => {
      if (!teacherId) return '-'
      return (
        allTeachers.find(teacher => teacher.id === teacherId)?.name ||
        selectedTeachers.find(teacher => teacher.id === teacherId)?.name ||
        '-'
      )
    },
    [allTeachers, selectedTeachers],
  )

  const resolveWeekLabel = useCallback((date: Date) => WEEKDAY_LABELS[moment(date).day()] || '-', [])

  const resolveNeedsOnlineRoomLabel = useCallback(
    (event: PublishEventDraft | ScheduleEvent) => {
      if (typeof event.needsOnlineRoom !== 'boolean') return '-'
      return event.needsOnlineRoom
        ? formatMessage(scheduleMessages.ArrangeModal.yes)
        : formatMessage(scheduleMessages.ArrangeModal.no)
    },
    [formatMessage],
  )

  const toPublishDraft = useCallback(
    (event: ScheduleEvent): PublishEventDraft => ({
      ...event,
      needsOnlineRoom: typeof event.needsOnlineRoom === 'boolean' ? event.needsOnlineRoom : undefined,
    }),
    [],
  )

  const statusSummary = useMemo(() => {
    const pending = calendarEvents.filter(e => e.status === 'pending').length
    const preScheduled = calendarEvents.filter(e => e.status === 'pre-scheduled').length
    const published = calendarEvents.filter(e => e.status === 'published').length
    return { pending, preScheduled, published }
  }, [calendarEvents])

  const expiryDateByOrderId = useMemo(() => {
    if (scheduleType !== 'group') return {}
    const map: Record<string, Date | null> = {}
    classOrders.forEach(order => {
      map[order.id] = order.expiresAt || null
    })
    return map
  }, [scheduleType, classOrders])

  const expiryDateByLanguage = useMemo<Record<string, Date | null>>(() => {
    if (scheduleType !== 'semester' || !classGroup?.language) return {}
    return {
      [classGroup.language]: getMaxExpiryDateForLanguage(classGroup.language, scheduleCondition.startDate),
    }
  }, [scheduleType, classGroup?.language, getMaxExpiryDateForLanguage, scheduleCondition.startDate])

  const groupBaseAvailableMinutes = useMemo(() => {
    if (scheduleType !== 'group') return 0
    return classOrders.reduce((sum, order) => sum + order.availableMinutes, 0)
  }, [scheduleType, classOrders])

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
    async (events: Partial<ScheduleEvent>[]): Promise<boolean> => {
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
        if (!authToken || !classGroup) {
          message.error('無法更新課程：缺少必要資訊')
          hasError = true
        } else {
          try {
            await Promise.all(
              apiUpdates.map(({ event, eventId }) => updateEvent(authToken)(buildEventPayload(event))(eventId)),
            )
            await refetchEvents()
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
              studentIds: resolveEventStudentIds(event),
              orderIds: resolveEventOrderIds(event),
              campus: event.campus || classGroup?.campusId || '',
              language: (event.language || classGroup?.language || 'zh-TW') as Language,
              createdBy: currentMemberId || '',
              createdByEmail: currentMember?.email || '',
              updatedBy: currentMemberId || '',
              updatedByEmail: currentMember?.email || '',
              updatedAt: new Date(),
              classroomId: event.classroomId,
              classroomIds: getClassroomIds(event),
              isExternal: Boolean(event.isExternal),
            } as ScheduleEvent)
          })
          return { localPendingEvents: newEvents }
        })
      }

      if (!hasError) {
        message.success(formatMessage(classMessageSet.courseArranged))
      }

      return !hasError
    },
    [
      apiEventIdSet,
      localPendingEventIdSet,
      authToken,
      classGroup,
      buildEventPayload,
      refetchEvents,
      scheduleType,
      resolveEventStudentIds,
      resolveEventOrderIds,
      currentMemberId,
      currentMember,
      getClassroomIds,
      formatMessage,
      classMessageSet,
      store,
    ],
  )

  const preScheduleEvents = useCallback(
    async (
      eventsToPreSchedule: PublishEventDraft[],
      options?: {
        skipRefetch?: boolean
      },
    ): Promise<PreScheduleResult> => {
      if (eventsToPreSchedule.length === 0) {
        return { createdEventIds: [], createdEventIdByKey: new Map<string, string>() }
      }

      if (!authToken || !appId || !classGroup) {
        throw new Error('MISSING_REQUIRED_INFORMATION')
      }

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
            metadata: buildClassEventMetadata(event, {
              includeCreator: true,
              clientEventId: event.id,
              publishedStudentIds: [],
              preScheduledStudentIds: resolveEventStudentIds(event),
            }),
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

      const createdEventIdByKey = new Map<string, string>()
      eventsToPreSchedule.forEach((event, index) => {
        const createdEvent = createdEventByClientId.get(event.id) || createdEventsArray[index]
        if (createdEvent?.id) {
          createdEventIdByKey.set(getEventKey(event), createdEvent.id)
          createdEventIdByKey.set(event.id, createdEvent.id)
        }
      })

      const createdEventIds = Array.from(new Set(Array.from(createdEventIdByKey.values())))

      const teacherIds = uniqueStrings(eventsToPreSchedule.map(event => event.teacherId))
      const classroomIds = uniqueStrings(
        eventsToPreSchedule.flatMap(event => (event.isExternal ? [] : getClassroomIds(event))),
      )

      const [teacherResources, classroomResources] = await Promise.all([
        teacherIds.length > 0
          ? getResourceByTypeTargetFetcher(authToken)({
              type: 'member',
              targets: teacherIds,
            })
          : Promise.resolve([]),
        classroomIds.length > 0
          ? getResourceByTypeTargetFetcher(authToken)({
              type: 'physical_space',
              targets: classroomIds,
            })
          : Promise.resolve([]),
      ])

      const teacherResourceMap = new Map<string, any>()
      teacherResources.forEach((resource: any) => {
        const target = getResourceTarget(resource)
        if (target) teacherResourceMap.set(target, resource)
      })

      const classroomResourceMap = new Map<string, any>()
      classroomResources.forEach((resource: any) => {
        const target = getResourceTarget(resource)
        if (target) classroomResourceMap.set(target, resource)
      })

      await Promise.all(
        eventsToPreSchedule.map(async event => {
          const createdEventId = createdEventIdByKey.get(getEventKey(event)) || createdEventIdByKey.get(event.id)
          if (!createdEventId) return

          const eventResources: Array<{ temporally_exclusive_resource_id: string; role: string }> = []

          if (event.teacherId) {
            const teacherResource = teacherResourceMap.get(event.teacherId)
            if (teacherResource?.temporally_exclusive_resource_id) {
              eventResources.push({
                temporally_exclusive_resource_id: teacherResource.temporally_exclusive_resource_id,
                role: 'host',
              })
            }
          }

          if (!event.isExternal) {
            getClassroomIds(event).forEach(classroomId => {
              const classroomResource = classroomResourceMap.get(classroomId)
              if (classroomResource?.temporally_exclusive_resource_id) {
                eventResources.push({
                  temporally_exclusive_resource_id: classroomResource.temporally_exclusive_resource_id,
                  role: 'participant',
                })
              }
            })
          }

          const uniqueResources = eventResources.filter(
            (resource, index, self) =>
              self.findIndex(
                item =>
                  item.temporally_exclusive_resource_id === resource.temporally_exclusive_resource_id &&
                  item.role === resource.role,
              ) === index,
          )

          if (uniqueResources.length > 0) {
            await createInvitationFetcher(authToken)(uniqueResources as any)([{ id: createdEventId }] as any)
          }
        }),
      )

      const submittedEventIds = new Set(eventsToPreSchedule.map(event => event.id))
      store.setState(prev => ({
        localPendingEvents: prev.localPendingEvents.filter(event => !submittedEventIds.has(event.id)),
      }))

      if (!options?.skipRefetch) {
        await refetchEvents()
      }

      return { createdEventIds, createdEventIdByKey }
    },
    [
      authToken,
      appId,
      classGroup,
      buildClassEventMetadata,
      resolveEventStudentIds,
      getClassroomIds,
      store,
      refetchEvents,
    ],
  )

  const handleOpenPreScheduleModal = useCallback(() => {
    if (pendingCalendarEvents.length === 0) {
      message.warning(formatMessage(classMessageSet.noPendingCourses))
      return
    }
    setPreScheduleModalVisible(true)
  }, [pendingCalendarEvents.length, formatMessage, classMessageSet])

  const handleConfirmPreSchedule = useCallback(async () => {
    if (pendingCalendarEvents.length === 0) {
      message.warning(formatMessage(classMessageSet.noPendingCourses))
      return
    }

    setPreScheduleLoading(true)
    try {
      await preScheduleEvents(pendingCalendarEvents.map(event => toPublishDraft(event)))
      setPreScheduleModalVisible(false)
      message.success(formatMessage(classMessageSet.preScheduleSuccess, { count: pendingCalendarEvents.length }))
    } catch (error) {
      console.error('Failed to pre-schedule events:', error)
      message.error('預排失敗，請稍後再試')
    } finally {
      setPreScheduleLoading(false)
    }
  }, [pendingCalendarEvents, formatMessage, classMessageSet, preScheduleEvents, toPublishDraft])

  const resetPublishFlow = useCallback(() => {
    setPublishFlowStep('selectMode')
    setSelectedPublishModes([])
    setPublishEventDrafts([])
    setCorrectionEventKeys([])
    setCorrectionErrors({})
  }, [])

  const handleClosePublishModal = useCallback(() => {
    setPublishModalVisible(false)
    resetPublishFlow()
  }, [resetPublishFlow])

  const handleOpenPublishModal = useCallback(() => {
    setPublishModalVisible(true)
    resetPublishFlow()
  }, [resetPublishFlow])

  const getPublishModeEvents = useCallback(
    (modes: PublishMode[]) => {
      const map = new Map<string, PublishEventDraft>()
      if (modes.includes('pending')) {
        pendingCalendarEvents.forEach(event => map.set(getEventKey(event), toPublishDraft(event)))
      }
      if (modes.includes('preScheduled')) {
        preScheduledCalendarEvents.forEach(event => map.set(getEventKey(event), toPublishDraft(event)))
      }
      return Array.from(map.values()).sort((a, b) => {
        const dateDiff = moment(a.date).valueOf() - moment(b.date).valueOf()
        if (dateDiff !== 0) return dateDiff
        return a.startTime.localeCompare(b.startTime)
      })
    },
    [pendingCalendarEvents, preScheduledCalendarEvents, toPublishDraft],
  )

  const getIncompleteFields = useCallback(
    (event: PublishEventDraft): CorrectionField[] => {
      const errors: CorrectionField[] = []
      if (!event.teacherId) errors.push('teacherId')
      if (!event.isExternal && getClassroomIds(event).length === 0) errors.push('classroomId')
      if (!event.material || !event.material.trim()) errors.push('material')
      if (typeof event.needsOnlineRoom !== 'boolean') errors.push('needsOnlineRoom')
      return errors
    },
    [getClassroomIds],
  )

  const validateCorrectionDrafts = useCallback(
    (drafts: PublishEventDraft[], targetKeys: string[]) => {
      const errors: Record<string, CorrectionField[]> = {}
      let hasMissing = false
      let hasConflict = false

      const draftByKey = new Map(drafts.map(event => [getEventKey(event), event]))
      const mergedEventsMap = new Map<string, ScheduleEvent>()
      calendarEvents.forEach(event => mergedEventsMap.set(getEventKey(event), event))
      drafts.forEach(event => {
        mergedEventsMap.set(getEventKey(event), event as ScheduleEvent)
      })
      const mergedEvents = Array.from(mergedEventsMap.values())

      targetKeys.forEach(eventKey => {
        const event = draftByKey.get(eventKey)
        if (!event) return

        const rowErrors = [...getIncompleteFields(event)]
        if (rowErrors.length > 0) {
          hasMissing = true
        }

        const conflict = checkScheduleConflict(
          {
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            teacherId: event.teacherId,
            classroomId: event.classroomId,
            classroomIds: event.classroomIds,
            excludeEventId: event.id,
            excludeApiEventId: event.apiEventId,
          },
          mergedEvents,
          allTeachers,
          classrooms,
        )

        if (conflict.hasTeacherConflict) {
          rowErrors.push('teacherConflict')
          if (!rowErrors.includes('teacherId')) {
            rowErrors.push('teacherId')
          }
          hasConflict = true
        }
        if (conflict.hasRoomConflict) {
          rowErrors.push('roomConflict')
          if (!rowErrors.includes('classroomId')) {
            rowErrors.push('classroomId')
          }
          hasConflict = true
        }

        if (rowErrors.length > 0) {
          errors[eventKey] = Array.from(new Set(rowErrors))
        }
      })

      return { errors, hasMissing, hasConflict }
    },
    [calendarEvents, getIncompleteFields, allTeachers, classrooms],
  )

  const handlePublishModeNext = useCallback(() => {
    if (!classGroup) {
      message.error('無法發布：缺少必要資訊')
      return
    }

    if (classStudentIds.length === 0) {
      message.error('尚未選擇入班學生，請先加入學生後再發布')
      return
    }

    if (selectedPublishModes.length === 0) {
      message.warning(formatMessage(scheduleMessages.Publish.selectModeRequired))
      return
    }

    const targetEvents = getPublishModeEvents(selectedPublishModes)
    if (targetEvents.length === 0) {
      message.warning(formatMessage(scheduleMessages.Publish.noEventsForSelectedModes))
      return
    }

    setPublishEventDrafts(targetEvents)

    const incompleteKeys = targetEvents
      .filter(event => getIncompleteFields(event).length > 0)
      .map(event => getEventKey(event))

    if (incompleteKeys.length > 0) {
      setCorrectionEventKeys(incompleteKeys)
      const { errors } = validateCorrectionDrafts(targetEvents, incompleteKeys)
      setCorrectionErrors(errors)
      setPublishFlowStep('correctionPrompt')
      return
    }

    setCorrectionEventKeys([])
    setCorrectionErrors({})
    setPublishFlowStep('finalConfirm')
  }, [
    classGroup,
    classStudentIds,
    selectedPublishModes,
    getPublishModeEvents,
    getIncompleteFields,
    validateCorrectionDrafts,
    formatMessage,
  ])

  const handleEnterCorrectionMode = useCallback(() => {
    setPublishFlowStep('correctionEdit')
  }, [])

  const updateCorrectionEvent = useCallback(
    (eventKey: string, updates: Partial<PublishEventDraft>, checkConflict: boolean = false) => {
      let nextDrafts: PublishEventDraft[] = []
      setPublishEventDrafts(prev => {
        nextDrafts = prev.map(event => (getEventKey(event) === eventKey ? { ...event, ...updates } : event))
        return nextDrafts
      })

      if (checkConflict) {
        const { errors } = validateCorrectionDrafts(nextDrafts, [eventKey])
        const rowErrors = errors[eventKey] || []
        if (rowErrors.includes('teacherConflict') || rowErrors.includes('roomConflict')) {
          message.warning(formatMessage(scheduleMessages.Publish.teacherOrClassroomConflict))
        }
      }
    },
    [validateCorrectionDrafts, formatMessage],
  )

  useEffect(() => {
    if (!publishModalVisible || publishFlowStep !== 'correctionEdit') return
    const { errors } = validateCorrectionDrafts(publishEventDrafts, correctionEventKeys)
    setCorrectionErrors(errors)
  }, [publishModalVisible, publishFlowStep, publishEventDrafts, correctionEventKeys, validateCorrectionDrafts])

  const handleSaveCorrection = useCallback(async () => {
    const { errors, hasMissing, hasConflict } = validateCorrectionDrafts(publishEventDrafts, correctionEventKeys)
    setCorrectionErrors(errors)

    if (hasMissing) {
      message.error(formatMessage(scheduleMessages.Publish.correctionIncompleteSave))
      return
    }
    if (hasConflict) {
      message.error(formatMessage(scheduleMessages.Publish.teacherOrClassroomConflict))
      return
    }

    const correctionEvents = publishEventDrafts
      .filter(event => correctionEventKeys.includes(getEventKey(event)))
      .map(event => ({
        ...event,
        needsOnlineRoom: Boolean(event.needsOnlineRoom),
      }))

    const isSaved = await handleSaveEvents(correctionEvents)
    if (!isSaved) return

    setPublishFlowStep('finalConfirm')
  }, [validateCorrectionDrafts, publishEventDrafts, correctionEventKeys, formatMessage, handleSaveEvents])

  const handleConfirmPublish = useCallback(async () => {
    if (!authToken || !classGroup) {
      message.error('無法發布：缺少必要資訊')
      return
    }

    if (publishEventDrafts.length === 0) {
      message.warning(formatMessage(scheduleMessages.Publish.noEventsForSelectedModes))
      return
    }

    if (classStudentIds.length === 0) {
      message.error('尚未選擇入班學生，請先加入學生後再發布')
      return
    }

    store.setState({ publishLoading: true })

    try {
      const pendingEventsForPublish = publishEventDrafts.filter(event => event.status === 'pending')
      const preScheduledEventsForPublish = publishEventDrafts.filter(event => event.status === 'pre-scheduled')

      const preScheduleResult =
        pendingEventsForPublish.length > 0
          ? await preScheduleEvents(pendingEventsForPublish, { skipRefetch: true })
          : { createdEventIds: [], createdEventIdByKey: new Map<string, string>() }

      const publishTargets = [
        ...preScheduledEventsForPublish
          .map(event => {
            const eventId = event.apiEventId || (!event.id.startsWith('local-') ? event.id : undefined)
            if (!eventId) return null
            return { event, eventId }
          })
          .filter((target): target is { event: PublishEventDraft; eventId: string } => Boolean(target)),
        ...pendingEventsForPublish
          .map(event => {
            const eventId =
              preScheduleResult.createdEventIdByKey.get(getEventKey(event)) ||
              preScheduleResult.createdEventIdByKey.get(event.id)
            if (!eventId) return null
            return { event, eventId }
          })
          .filter((target): target is { event: PublishEventDraft; eventId: string } => Boolean(target)),
      ]

      if (publishTargets.length === 0) {
        message.warning(formatMessage(scheduleMessages.Publish.noEventsForSelectedModes))
        return
      }

      const allPublishStudentIds = uniqueStrings(
        publishTargets.flatMap(target => getPaidStudentIdsForEvent(target.event)),
      )

      const studentResources =
        allPublishStudentIds.length > 0
          ? await getResourceByTypeTargetFetcher(authToken)({
              type: 'member',
              targets: allPublishStudentIds,
            })
          : []

      const studentResourceMap = new Map<string, any>()
      studentResources.forEach((resource: any) => {
        const target = getResourceTarget(resource)
        if (target) studentResourceMap.set(target, resource)
      })

      const publishedAt = new Date().toISOString()

      await Promise.all(
        publishTargets.map(async ({ event, eventId }) => {
          const publishedStudentIds = getPaidStudentIdsForEvent(event)
          const preScheduledStudentIds = getPreScheduledStudentIdsForEvent(event)

          const metadata = buildClassEventMetadata(event, {
            publishedStudentIds,
            preScheduledStudentIds,
          })

          await updateEvent(authToken)({ published_at: publishedAt, metadata } as any)(eventId)

          const eventResources = publishedStudentIds
            .map(studentId => studentResourceMap.get(studentId))
            .filter(Boolean)
            .map((resource: any) => ({
              temporally_exclusive_resource_id: resource.temporally_exclusive_resource_id,
              role: 'participant',
            }))

          const uniqueResources = eventResources.filter(
            (
              resource: { temporally_exclusive_resource_id: string; role: string },
              index: number,
              self: { temporally_exclusive_resource_id: string; role: string }[],
            ) =>
              self.findIndex(
                item =>
                  item.temporally_exclusive_resource_id === resource.temporally_exclusive_resource_id &&
                  item.role === resource.role,
              ) === index,
          )

          if (uniqueResources.length > 0) {
            await createInvitationFetcher(authToken)(uniqueResources as any)([{ id: eventId }] as any)
          }
        }),
      )

      await refetchEvents()

      message.success(formatMessage(classMessageSet.publishSuccess, { count: publishTargets.length }))
      handleClosePublishModal()
    } catch (error) {
      console.error('Failed to publish events:', error)
      message.error('發布失敗，請稍後再試')
    } finally {
      store.setState({ publishLoading: false })
    }
  }, [
    authToken,
    classGroup,
    publishEventDrafts,
    formatMessage,
    classStudentIds,
    preScheduleEvents,
    getPaidStudentIdsForEvent,
    getPreScheduledStudentIdsForEvent,
    buildClassEventMetadata,
    classMessageSet,
    handleClosePublishModal,
    refetchEvents,
    store,
  ])

  const correctionRows = useMemo(() => {
    return publishEventDrafts
      .filter(event => correctionEventKeys.includes(getEventKey(event)))
      .sort((a, b) => {
        const dateDiff = moment(a.date).valueOf() - moment(b.date).valueOf()
        if (dateDiff !== 0) return dateDiff
        return a.startTime.localeCompare(b.startTime)
      })
  }, [publishEventDrafts, correctionEventKeys])

  const buildSchedulePreviewRows = useCallback(
    (events: Array<ScheduleEvent | PublishEventDraft>) => {
      return [...events]
        .sort((a, b) => {
          const dateDiff = moment(a.date).valueOf() - moment(b.date).valueOf()
          if (dateDiff !== 0) return dateDiff
          return a.startTime.localeCompare(b.startTime)
        })
        .map<SchedulePreviewRow>(event => ({
          key: getEventKey(event as ScheduleEvent),
          dateLabel: moment(event.date).format('YYYY-MM-DD'),
          weekLabel: resolveWeekLabel(event.date),
          courseTimeLabel: `${event.startTime}-${event.endTime}`,
          startTimeLabel: event.startTime,
          duration: event.duration,
          classroomLabel: resolveClassroomLabel(event),
          teacherLabel: resolveTeacherLabel(event.teacherId),
          materialLabel: event.material || '-',
          needsOnlineRoomLabel: resolveNeedsOnlineRoomLabel(event as PublishEventDraft),
        }))
    },
    [resolveWeekLabel, resolveClassroomLabel, resolveTeacherLabel, resolveNeedsOnlineRoomLabel],
  )

  const preSchedulePreviewRows = useMemo(
    () => buildSchedulePreviewRows(pendingCalendarEvents),
    [buildSchedulePreviewRows, pendingCalendarEvents],
  )

  const publishPreviewRows = useMemo(
    () => buildSchedulePreviewRows(publishEventDrafts),
    [buildSchedulePreviewRows, publishEventDrafts],
  )

  const preScheduleColumns = useMemo<ColumnsType<SchedulePreviewRow>>(
    () => [
      {
        title: formatMessage(scheduleMessages.ScheduleTable.courseDate),
        dataIndex: 'dateLabel',
        key: 'dateLabel',
        width: 120,
      },
      { title: formatMessage(scheduleMessages.ArrangeModal.week), dataIndex: 'weekLabel', key: 'weekLabel', width: 90 },
      {
        title: formatMessage(scheduleMessages.ScheduleTable.courseTime),
        dataIndex: 'courseTimeLabel',
        key: 'courseTimeLabel',
        width: 140,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.duration),
        dataIndex: 'duration',
        key: 'duration',
        width: 100,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.classroom),
        dataIndex: 'classroomLabel',
        key: 'classroomLabel',
        width: 160,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.teacher),
        dataIndex: 'teacherLabel',
        key: 'teacherLabel',
        width: 130,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.material),
        dataIndex: 'materialLabel',
        key: 'materialLabel',
        width: 140,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.needsOnlineRoom),
        dataIndex: 'needsOnlineRoomLabel',
        key: 'needsOnlineRoomLabel',
        width: 130,
      },
    ],
    [formatMessage],
  )

  const publishFinalColumns = useMemo<ColumnsType<SchedulePreviewRow>>(
    () => [
      {
        title: formatMessage(scheduleMessages.ScheduleTable.courseDate),
        dataIndex: 'dateLabel',
        key: 'dateLabel',
        width: 120,
      },
      { title: formatMessage(scheduleMessages.ArrangeModal.week), dataIndex: 'weekLabel', key: 'weekLabel', width: 90 },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.startTime),
        dataIndex: 'startTimeLabel',
        key: 'startTimeLabel',
        width: 110,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.duration),
        dataIndex: 'duration',
        key: 'duration',
        width: 100,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.classroom),
        dataIndex: 'classroomLabel',
        key: 'classroomLabel',
        width: 160,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.teacher),
        dataIndex: 'teacherLabel',
        key: 'teacherLabel',
        width: 130,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.material),
        dataIndex: 'materialLabel',
        key: 'materialLabel',
        width: 140,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.needsOnlineRoom),
        dataIndex: 'needsOnlineRoomLabel',
        key: 'needsOnlineRoomLabel',
        width: 130,
      },
    ],
    [formatMessage],
  )

  const correctionColumns = useMemo<ColumnsType<PublishEventDraft>>(
    () => [
      {
        title: formatMessage(scheduleMessages.ArrangeModal.week),
        key: 'week',
        width: 90,
        render: (_, event) => resolveWeekLabel(event.date),
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.startTime),
        dataIndex: 'startTime',
        key: 'startTime',
        width: 110,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.duration),
        key: 'duration',
        width: 100,
        render: (_, event) => event.duration,
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.classroom),
        key: 'classroom',
        width: 180,
        render: (_, event) => {
          const eventKey = getEventKey(event)
          const rowErrors = correctionErrors[eventKey] || []
          const hasError = rowErrors.includes('classroomId') || rowErrors.includes('roomConflict')
          const classroomValue = event.isExternal
            ? CORRECTION_EXTERNAL_CLASSROOM
            : getClassroomIds(event)[0] || undefined

          return (
            <Form.Item style={{ marginBottom: 0 }} validateStatus={hasError ? 'error' : ''}>
              <Select
                value={classroomValue}
                allowClear
                placeholder={formatMessage(scheduleMessages.ArrangeModal.selectClassroom)}
                onChange={value => {
                  if (value === CORRECTION_EXTERNAL_CLASSROOM) {
                    updateCorrectionEvent(
                      eventKey,
                      {
                        isExternal: true,
                        classroomId: undefined,
                        classroomIds: [],
                      },
                      true,
                    )
                    return
                  }

                  updateCorrectionEvent(
                    eventKey,
                    {
                      isExternal: false,
                      classroomId: value,
                      classroomIds: value ? [value] : [],
                    },
                    true,
                  )
                }}
              >
                <Select.Option value={CORRECTION_EXTERNAL_CLASSROOM}>
                  {formatMessage(scheduleMessages.ArrangeModal.classroomExternal)}
                </Select.Option>
                {classrooms.map(classroom => (
                  <Select.Option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )
        },
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.teacher),
        key: 'teacher',
        width: 160,
        render: (_, event) => {
          const eventKey = getEventKey(event)
          const rowErrors = correctionErrors[eventKey] || []
          const hasError = rowErrors.includes('teacherId') || rowErrors.includes('teacherConflict')

          return (
            <Form.Item style={{ marginBottom: 0 }} validateStatus={hasError ? 'error' : ''}>
              <Select
                value={event.teacherId}
                allowClear
                placeholder={formatMessage(scheduleMessages.ArrangeModal.selectTeacher)}
                onChange={value => {
                  updateCorrectionEvent(eventKey, { teacherId: value }, true)
                }}
              >
                {allTeachers.map(teacher => (
                  <Select.Option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )
        },
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.material),
        key: 'material',
        width: 180,
        render: (_, event) => {
          const eventKey = getEventKey(event)
          const rowErrors = correctionErrors[eventKey] || []
          const hasError = rowErrors.includes('material')
          return (
            <Form.Item style={{ marginBottom: 0 }} validateStatus={hasError ? 'error' : ''}>
              <Input
                value={event.material}
                placeholder={formatMessage(scheduleMessages.ArrangeModal.enterMaterialName)}
                onChange={targetEvent => {
                  updateCorrectionEvent(eventKey, { material: targetEvent.target.value })
                }}
              />
            </Form.Item>
          )
        },
      },
      {
        title: formatMessage(scheduleMessages.ArrangeModal.needsOnlineRoom),
        key: 'needsOnlineRoom',
        width: 150,
        render: (_, event) => {
          const eventKey = getEventKey(event)
          const rowErrors = correctionErrors[eventKey] || []
          const hasError = rowErrors.includes('needsOnlineRoom')
          const value = typeof event.needsOnlineRoom === 'boolean' ? (event.needsOnlineRoom ? 'yes' : 'no') : undefined

          return (
            <Form.Item style={{ marginBottom: 0 }} validateStatus={hasError ? 'error' : ''}>
              <Select
                value={value}
                allowClear
                onChange={nextValue => {
                  updateCorrectionEvent(eventKey, {
                    needsOnlineRoom: nextValue === 'yes' ? true : nextValue === 'no' ? false : undefined,
                  })
                }}
              >
                <Select.Option value="yes">{formatMessage(scheduleMessages.ArrangeModal.yes)}</Select.Option>
                <Select.Option value="no">{formatMessage(scheduleMessages.ArrangeModal.no)}</Select.Option>
              </Select>
            </Form.Item>
          )
        },
      },
    ],
    [
      formatMessage,
      resolveWeekLabel,
      correctionErrors,
      getClassroomIds,
      updateCorrectionEvent,
      classrooms,
      allTeachers,
    ],
  )

  const unpaidStudentsByEventId = useMemo(() => {
    const map: Record<string, Array<{ name: string; email: string }>> = {}

    calendarEvents.forEach(event => {
      if (event.status !== 'published') return

      const unpaidStudentSet = new Set<string>()
      const eventOrderIds = resolveEventOrderIds(event)
      if (eventOrderIds.length > 0) {
        eventOrderIds.forEach(orderId => {
          const order = orderMap.get(orderId)
          if (order && order.status !== 'SUCCESS') {
            unpaidStudentSet.add(order.studentId)
          }
        })
      } else {
        resolveEventStudentIds(event).forEach(studentId => {
          if (!paidStudentIdSet.has(studentId)) {
            unpaidStudentSet.add(studentId)
          }
        })
      }

      const unpaidStudents = Array.from(unpaidStudentSet)
        .map(studentId => studentInfoById.get(studentId))
        .filter((student): student is { name: string; email: string } => Boolean(student))

      if (unpaidStudents.length > 0) {
        map[event.id] = unpaidStudents
      }
    })

    return map
  }, [calendarEvents, resolveEventOrderIds, orderMap, resolveEventStudentIds, paidStudentIdSet, studentInfoById])

  const publishModalTitle = useMemo(() => {
    if (publishFlowStep === 'correctionPrompt' || publishFlowStep === 'correctionEdit') {
      return formatMessage(scheduleMessages.Publish.correctionModeTitle)
    }
    if (publishFlowStep === 'finalConfirm') {
      return formatMessage(scheduleMessages.Publish.finalConfirmTitle)
    }
    return formatMessage(scheduleMessages.Publish.title)
  }, [publishFlowStep, formatMessage])

  const handlePublishModeChange = useCallback((values: Array<string | number>) => {
    setSelectedPublishModes(values as PublishMode[])
  }, [])

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
            <Typography.Text type="secondary">
              {formatMessage(classMessageSet.pendingCount, { count: statusSummary.pending })} /{' '}
              {formatMessage(classMessageSet.preScheduledCount, { count: statusSummary.preScheduled })} /{' '}
              {formatMessage(classMessageSet.publishedCount, { count: statusSummary.published })}
            </Typography.Text>
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
            selectedOrders={scheduleType === 'group' ? classOrders : []}
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
            unpaidStudentsByEventId={unpaidStudentsByEventId}
            holidays={scheduleCondition.excludeHolidays ? holidays : []}
            excludedDates={scheduleCondition.excludedDates}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
          <CalendarActionFooter>
            <Space align="start">
              <Button onClick={handleOpenPreScheduleModal} disabled={pendingCalendarEvents.length === 0}>
                {formatMessage(classMessageSet.preScheduleAction)}
              </Button>
              <PublishActionWrapper>
                <Tooltip title={publishDisabledHint || ''}>
                  <span>
                    <Button
                      type="primary"
                      onClick={handleOpenPublishModal}
                      disabled={!canPublish}
                      loading={publishLoading}
                    >
                      {formatMessage(classMessageSet.publishAction)}
                    </Button>
                  </span>
                </Tooltip>
                {publishDisabledHint && !canPublish && <PublishHintText>{publishDisabledHint}</PublishHintText>}
              </PublishActionWrapper>
            </Space>
          </CalendarActionFooter>
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

      <Modal
        title={formatMessage(scheduleMessages.PreSchedule.confirmTitle)}
        visible={preScheduleModalVisible}
        onCancel={() => setPreScheduleModalVisible(false)}
        width={1100}
        footer={[
          <Button key="cancel" onClick={() => setPreScheduleModalVisible(false)} disabled={preScheduleLoading}>
            {formatMessage(scheduleMessages['*'].cancel)}
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmPreSchedule}
            loading={preScheduleLoading}
            disabled={pendingCalendarEvents.length === 0}
          >
            {formatMessage(scheduleMessages['*'].confirm)}
          </Button>,
        ]}
      >
        <Typography.Paragraph style={{ marginBottom: 16 }}>
          {formatMessage(scheduleMessages.PreSchedule.confirmDescription, { count: pendingCalendarEvents.length })}
        </Typography.Paragraph>
        <Table
          columns={preScheduleColumns}
          dataSource={preSchedulePreviewRows}
          rowKey="key"
          size="small"
          pagination={false}
          scroll={{ x: 1000, y: 360 }}
        />
      </Modal>

      <Modal
        title={publishModalTitle}
        visible={publishModalVisible}
        onCancel={handleClosePublishModal}
        width={1100}
        footer={
          publishFlowStep === 'selectMode'
            ? [
                <Button key="cancel" onClick={handleClosePublishModal}>
                  {formatMessage(scheduleMessages['*'].cancel)}
                </Button>,
                <Button key="next" type="primary" onClick={handlePublishModeNext}>
                  {formatMessage(scheduleMessages.Publish.nextStep)}
                </Button>,
              ]
            : publishFlowStep === 'correctionPrompt'
            ? [
                <Button key="cancel" onClick={handleClosePublishModal}>
                  {formatMessage(scheduleMessages['*'].cancel)}
                </Button>,
                <Button key="goto" type="primary" onClick={handleEnterCorrectionMode}>
                  {formatMessage(scheduleMessages.Publish.goToCorrection)}
                </Button>,
              ]
            : publishFlowStep === 'correctionEdit'
            ? [
                <Button key="cancel" onClick={handleClosePublishModal}>
                  {formatMessage(scheduleMessages['*'].cancel)}
                </Button>,
                <Button key="save" type="primary" onClick={handleSaveCorrection}>
                  {formatMessage(scheduleMessages['*'].save)}
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={handleClosePublishModal} disabled={publishLoading}>
                  {formatMessage(scheduleMessages['*'].cancel)}
                </Button>,
                <Button key="publish" type="primary" onClick={handleConfirmPublish} loading={publishLoading}>
                  {formatMessage(scheduleMessages.Publish.confirmPublish)}
                </Button>,
              ]
        }
      >
        {publishFlowStep === 'selectMode' && (
          <div>
            <Typography.Paragraph style={{ marginBottom: 16 }}>
              {formatMessage(scheduleMessages.Publish.modeSelectDescription)}
            </Typography.Paragraph>
            <Checkbox.Group value={selectedPublishModes} onChange={handlePublishModeChange} style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Checkbox value="pending" disabled={pendingCalendarEvents.length === 0}>
                    {formatMessage(scheduleMessages.Publish.pendingLessonsLabel)}
                    {` (${pendingCalendarEvents.length})`}
                  </Checkbox>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4, marginLeft: 24 }}>
                    {formatMessage(scheduleMessages.Publish.pendingLessonsDescription)}
                  </Typography.Paragraph>
                </div>
                <div>
                  <Checkbox value="preScheduled" disabled={preScheduledCalendarEvents.length === 0}>
                    {formatMessage(scheduleMessages.Publish.preScheduledLessonsLabel)}
                    {` (${preScheduledCalendarEvents.length})`}
                  </Checkbox>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4, marginLeft: 24 }}>
                    {formatMessage(scheduleMessages.Publish.preScheduledLessonsDescription)}
                  </Typography.Paragraph>
                </div>
              </Space>
            </Checkbox.Group>
          </div>
        )}

        {publishFlowStep === 'correctionPrompt' && (
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {formatMessage(scheduleMessages.Publish.correctionModeDescription)}
          </Typography.Paragraph>
        )}

        {publishFlowStep === 'correctionEdit' && (
          <>
            <Typography.Paragraph style={{ marginBottom: 16 }}>
              {formatMessage(scheduleMessages.Publish.correctionModeDescription)}
            </Typography.Paragraph>
            <Table
              columns={correctionColumns}
              dataSource={correctionRows}
              rowKey={record => getEventKey(record)}
              size="small"
              pagination={false}
              scroll={{ x: 900, y: 360 }}
            />
          </>
        )}

        {publishFlowStep === 'finalConfirm' && (
          <>
            <Typography.Paragraph style={{ marginBottom: 16 }}>
              {formatMessage(scheduleMessages.Publish.finalConfirmDescription, { count: publishEventDrafts.length })}
            </Typography.Paragraph>
            <Table
              columns={publishFinalColumns}
              dataSource={publishPreviewRows}
              rowKey="key"
              size="small"
              pagination={false}
              scroll={{ x: 1000, y: 360 }}
            />
          </>
        )}
      </Modal>
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
