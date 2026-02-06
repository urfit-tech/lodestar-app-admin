import { Button, Checkbox, Col, Collapse, Form, Input, message, Modal, Row, Select, Space, Spin, Table, Tooltip, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageTitle } from '../../admin'
import { GeneralEventApi } from '../../event/events.type'
import AdminLayout from '../../layout/AdminLayout'
import {
  ArrangeCourseModal,
  CollapsibleScheduleCard,
  OrderSelectionPanel,
  ScheduleCalendar,
  ScheduleCard,
  ScheduleConditionPanel,
  scheduleMessages,
  StudentInfoPanel,
  TeacherListPanel,
} from '..'
import {
  createEventFetcher,
  createInvitationFetcher,
  getResourceByTypeTargetFetcher,
  updateEvent,
} from '../../../helpers/eventHelper/eventFetchers'
import { useClassrooms } from '../../../hooks/classroom'
import { useMemberForSchedule } from '../../../hooks/schedule'
import {
  checkScheduleConflict,
  useDeleteScheduleTemplate,
  useHolidays,
  usePersonalScheduleListEvents,
  useSaveScheduleTemplate,
  useScheduleExpirySettings,
  useScheduleTemplates,
  useStudentOpenTimeEvents,
  useTeacherOpenTimeEvents,
  useTeachersFromMembers,
} from '../../../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../../../images/icon'
import {
  CourseRowData,
  Language,
  ScheduleCondition,
  ScheduleEvent,
  ScheduleTemplateProps,
  Student,
  Teacher,
} from '../../../types/schedule'
import type { CourseRow } from '../ArrangeCourseModal'
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

// Location state type for event data passed from list page
interface LocationState {
  eventToEdit?: {
    orderIds: string[]
    teacherId?: string
    language: string
    campus: string
    date?: Date
  }
}

interface PersonalScheduleEditorState {
  eventToEdit?: LocationState['eventToEdit']
  selectedStudent?: Student
  selectedOrderIds: string[]
  selectedTeachers: Teacher[]
  scheduleCondition: ScheduleCondition
  arrangeModalVisible: boolean
  selectedDate: Date
  editingEvent?: ScheduleEvent
  pendingEvents: ScheduleEvent[]
  draftRows?: CourseRow[]
  publishLoading: boolean
}

const buildInitialState = (): PersonalScheduleEditorState => ({
  eventToEdit: undefined,
  selectedStudent: undefined,
  selectedOrderIds: [],
  selectedTeachers: [],
  scheduleCondition: {
    startDate: new Date(),
    excludedDates: [],
    excludeHolidays: true,
  },
  arrangeModalVisible: false,
  selectedDate: new Date(),
  editingEvent: undefined,
  pendingEvents: [],
  draftRows: undefined,
  publishLoading: false,
})

const uniqueStrings = (values: Array<string | null | undefined>): string[] => {
  const filtered = values.filter((value): value is string => Boolean(value))
  return filtered.filter((value, index, self) => self.indexOf(value) === index)
}

type PublishFlowStep = 'selectMode' | 'correctionPrompt' | 'correctionEdit' | 'finalConfirm'
type PublishMode = 'pending' | 'preScheduled'
type CorrectionField = 'teacherId' | 'classroomId' | 'material' | 'needsOnlineRoom' | 'teacherConflict' | 'roomConflict'
type PublishEventDraft = Omit<ScheduleEvent, 'needsOnlineRoom'> & { needsOnlineRoom?: boolean }

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

const CORRECTION_EXTERNAL_CLASSROOM = '__external__'
const WEEKDAY_LABELS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

const PersonalScheduleEditorInner: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const location = useLocation<LocationState>()
  const { memberId } = useParams<{ memberId: string }>()
  const { authToken, currentMemberId, currentMember } = useAuth()
  const { id: appId } = useApp()
  const { holidays: defaultExcludeDates } = useHolidays()

  const store = useScheduleEditorStoreApi<PersonalScheduleEditorState>()

  const {
    eventToEdit,
    selectedStudent,
    selectedOrderIds,
    selectedTeachers,
    scheduleCondition,
    arrangeModalVisible,
    selectedDate,
    editingEvent,
    pendingEvents,
    draftRows,
    publishLoading,
  } = useScheduleEditorStore((state: PersonalScheduleEditorState) => ({
    eventToEdit: state.eventToEdit,
    selectedStudent: state.selectedStudent,
    selectedOrderIds: state.selectedOrderIds,
    selectedTeachers: state.selectedTeachers,
    scheduleCondition: state.scheduleCondition,
    arrangeModalVisible: state.arrangeModalVisible,
    selectedDate: state.selectedDate,
    editingEvent: state.editingEvent,
    pendingEvents: state.pendingEvents,
    draftRows: state.draftRows,
    publishLoading: state.publishLoading,
  }))

  const [preScheduleModalVisible, setPreScheduleModalVisible] = useState(false)
  const [preScheduleLoading, setPreScheduleLoading] = useState(false)
  const [publishModalVisible, setPublishModalVisible] = useState(false)
  const [publishFlowStep, setPublishFlowStep] = useState<PublishFlowStep>('selectMode')
  const [selectedPublishModes, setSelectedPublishModes] = useState<PublishMode[]>([])
  const [publishEventDrafts, setPublishEventDrafts] = useState<PublishEventDraft[]>([])
  const [correctionEventKeys, setCorrectionEventKeys] = useState<string[]>([])
  const [correctionErrors, setCorrectionErrors] = useState<Record<string, CorrectionField[]>>({})

  // Load member data when memberId changes
  useEffect(() => {
    if (memberId) {
      store.setState({
        selectedStudent: {
          id: memberId,
          name: '',
          email: '',
        },
        selectedOrderIds: [],
        selectedTeachers: [],
      })
    }
  }, [memberId, store])

  // Get orders for selected student from GraphQL
  const { member, orders: studentOrders, loading: ordersLoading } = useMemberForSchedule(memberId)

  // Get schedule expiry settings for calculating order expiry dates
  const { settings } = useScheduleExpirySettings('personal')

  // Calculate expiry date by language (based on schedule condition start date)
  const expiryDateByLanguage = useMemo<Record<string, Date | null>>(() => {
    const result: Record<string, Date | null> = {}
    const languages = uniqueStrings(studentOrders.map(o => o.language))

    languages.forEach(lang => {
      const languageSettings = settings.filter(s => s.language === lang)
      if (languageSettings.length === 0) {
        result[lang] = null
        return
      }

      const maxValidMonths = languageSettings.reduce(
        (max, current) => (current.valid_days > max ? current.valid_days : max),
        languageSettings[0].valid_days,
      )
      result[lang] = moment(scheduleCondition.startDate).add(maxValidMonths, 'month').toDate()
    })

    return result
  }, [studentOrders, settings, scheduleCondition.startDate])

  // Get selected teacher IDs for fetching open time events
  const selectedTeacherIds = useMemo(() => {
    return selectedTeachers.filter(t => t && t.id).map(t => t.id)
  }, [selectedTeachers])

  // Get teacher open time events (background events for calendar)
  const { events: teacherOpenTimeEvents, busyEvents: teacherBusyEvents } = useTeacherOpenTimeEvents(selectedTeacherIds)

  // Get student open time events (background events for calendar)
  const { events: studentOpenTimeEvents, refetch: refetchStudentEvents } = useStudentOpenTimeEvents(memberId)
  const { events: apiPersonalEvents, refetch: refetchPersonalEvents } = usePersonalScheduleListEvents('all')

  const scheduledOrPublishedOpenTimeEvents = useMemo(() => {
    return studentOpenTimeEvents.filter(event => {
      const status = event.extendedProps?.status
      return status === 'scheduled' || status === 'published'
    })
  }, [studentOpenTimeEvents])

  // Get classrooms for selection
  const { classrooms } = useClassrooms()

  // Get all teachers for pre-selecting from event data
  const { teachers: allTeachers } = useTeachersFromMembers()

  // Store event data from navigation state and clear location state
  useEffect(() => {
    if (location.state?.eventToEdit) {
      store.setState({ eventToEdit: location.state.eventToEdit })
      history.replace(location.pathname, {})
    }
  }, [location.state, history, location.pathname, store])

  const hasInitializedScheduleCondition = useRef(false)

  // Pre-fill schedule condition when navigating from list
  useEffect(() => {
    if (!eventToEdit || hasInitializedScheduleCondition.current) return
    if (eventToEdit.date) {
      const startDate = eventToEdit.date
      store.setState(prev => ({
        scheduleCondition: {
          ...prev.scheduleCondition,
          startDate,
        },
      }))
    }
    hasInitializedScheduleCondition.current = true
  }, [eventToEdit, store])

  const hasInitializedOrderSelection = useRef(false)
  const hasInitializedTeacherSelection = useRef(false)

  // Pre-select orders when navigating from list page with event data
  useEffect(() => {
    if (!eventToEdit || hasInitializedOrderSelection.current) return
    if (studentOrders.length === 0) return

    if (eventToEdit.orderIds && eventToEdit.orderIds.length > 0) {
      const validOrderIds = eventToEdit.orderIds.filter(id => studentOrders.some(o => o.id === id))
      if (validOrderIds.length > 0) {
        store.setState({ selectedOrderIds: validOrderIds })
      }
    }

    hasInitializedOrderSelection.current = true
  }, [eventToEdit, studentOrders, store])

  // Pre-select teacher when navigating from list page with event data
  useEffect(() => {
    if (!eventToEdit || hasInitializedTeacherSelection.current) return
    if (!eventToEdit.teacherId) {
      hasInitializedTeacherSelection.current = true
      return
    }
    if (allTeachers.length === 0) return

    const teacherFromMember = allTeachers.find(t => t.id === eventToEdit.teacherId)
    if (teacherFromMember) {
      const teacher: Teacher = {
        id: teacherFromMember.id,
        name: teacherFromMember.name,
        email: teacherFromMember.email,
        campus: teacherFromMember.campus,
        campusId: teacherFromMember.campusId,
        campusIds: teacherFromMember.campusIds,
        campusNames: teacherFromMember.campusNames,
        languages: teacherFromMember.languages as Language[],
        traits: teacherFromMember.traits,
        level: String(teacherFromMember.level),
        yearsOfExperience: teacherFromMember.yearsOfExperience,
        note: teacherFromMember.note,
      }
      store.setState({ selectedTeachers: [teacher] })
    }

    hasInitializedTeacherSelection.current = true
  }, [eventToEdit, allTeachers, store])

  // Calculate used minutes per order from scheduled events
  const usedMinutesByOrder = useMemo<Record<string, number>>(() => {
    const usedMinutes: Record<string, number> = {}

    scheduledOrPublishedOpenTimeEvents.forEach(event => {
      const originalEvent = event.extendedProps?.originalEvent
      const metadata = originalEvent?.extendedProps?.metadata || originalEvent?.extendedProps?.event_metadata
      const orderIds = metadata?.orderIds as string[] | undefined
      const duration = metadata?.duration as number | undefined

      const eventDuration =
        duration ||
        (event.end && event.start ? Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60)) : 0)

      if (orderIds && orderIds.length > 0 && eventDuration > 0) {
        const minutesPerOrder = eventDuration / orderIds.length
        orderIds.forEach(orderId => {
          usedMinutes[orderId] = (usedMinutes[orderId] || 0) + minutesPerOrder
        })
      }
    })

    return usedMinutes
  }, [scheduledOrPublishedOpenTimeEvents])

  const firstClassDateByOrderId = useMemo<Record<string, Date | null>>(() => {
    const firstDateMap: Record<string, Date> = {}

    scheduledOrPublishedOpenTimeEvents.forEach(event => {
      const originalEvent = event.extendedProps?.originalEvent
      const metadata = originalEvent?.extendedProps?.metadata || originalEvent?.extendedProps?.event_metadata
      const orderIds = Array.isArray(metadata?.orderIds) ? (metadata.orderIds as string[]) : []
      if (orderIds.length === 0) return

      const eventDate = event.start ? new Date(event.start) : null
      if (!eventDate || Number.isNaN(eventDate.getTime())) return

      orderIds.forEach(orderId => {
        const current = firstDateMap[orderId]
        if (!current || eventDate < current) {
          firstDateMap[orderId] = eventDate
        }
      })
    })

    return studentOrders.reduce<Record<string, Date | null>>((acc, order) => {
      acc[order.id] = firstDateMap[order.id] || null
      return acc
    }, {})
  }, [scheduledOrPublishedOpenTimeEvents, studentOrders])

  const lastClassDateByOrderId = useMemo<Record<string, Date | null>>(() => {
    const lastDateMap: Record<string, Date> = {}

    scheduledOrPublishedOpenTimeEvents.forEach(event => {
      const originalEvent = event.extendedProps?.originalEvent
      const metadata = originalEvent?.extendedProps?.metadata || originalEvent?.extendedProps?.event_metadata
      const orderIds = Array.isArray(metadata?.orderIds) ? (metadata.orderIds as string[]) : []
      if (orderIds.length === 0) return

      const eventDate = event.start ? new Date(event.start) : null
      if (!eventDate || Number.isNaN(eventDate.getTime())) return

      orderIds.forEach(orderId => {
        const current = lastDateMap[orderId]
        if (!current || eventDate > current) {
          lastDateMap[orderId] = eventDate
        }
      })
    })

    return studentOrders.reduce<Record<string, Date | null>>((acc, order) => {
      acc[order.id] = lastDateMap[order.id] || null
      return acc
    }, {})
  }, [scheduledOrPublishedOpenTimeEvents, studentOrders])

  const expiryDateByOrderId = useMemo<Record<string, Date | null>>(() => {
    return studentOrders.reduce<Record<string, Date | null>>((acc, order) => {
      const firstClassDate = firstClassDateByOrderId[order.id]
      if (!firstClassDate) {
        acc[order.id] = null
        return acc
      }

      const classCount = Math.max(1, Math.round((order.totalMinutes || 0) / 50))
      const matchingSetting = settings
        .filter(s => s.language === order.language && s.class_count <= classCount)
        .sort((a, b) => b.class_count - a.class_count)[0]
      const fallbackSetting = settings
        .filter(s => s.language === order.language)
        .sort((a, b) => a.class_count - b.class_count)[0]

      const validMonths = matchingSetting?.valid_days ?? fallbackSetting?.valid_days
      if (validMonths === undefined || validMonths === null) {
        acc[order.id] = null
        return acc
      }

      acc[order.id] = moment(firstClassDate).add(validMonths, 'month').toDate()
      return acc
    }, {})
  }, [studentOrders, firstClassDateByOrderId, settings])

  // Merge member data with selectedStudent for display
  const studentWithInfo = useMemo<Student | undefined>(() => {
    if (!selectedStudent) return undefined
    const memberProps = member?.member_properties || {}
    return {
      ...selectedStudent,
      name: member?.name || selectedStudent.name || '',
      email: member?.email || selectedStudent.email || '',
      internalNote: memberProps['內部備註'] || '',
      preferredTeachers: memberProps['希望安排的老師'] || '',
      excludedTeachers: memberProps['不希望安排的老師'] || '',
    }
  }, [selectedStudent, member])

  // Get selected orders
  const selectedOrders = useMemo(() => {
    return studentOrders.filter(o => selectedOrderIds.includes(o.id))
  }, [studentOrders, selectedOrderIds])

  // Template hooks - get templates for the selected language
  const currentLanguage = useMemo(() => {
    if (selectedOrders.length === 0) return undefined
    const languages = uniqueStrings(selectedOrders.map(o => o.language))
    return languages[0]
  }, [selectedOrders])

  const { templates, refetch: refetchTemplates } = useScheduleTemplates(currentLanguage)
  const { saveTemplate } = useSaveScheduleTemplate()
  const { deleteTemplate } = useDeleteScheduleTemplate()

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
    return uniqueStrings(selectedOrders.map(order => order.language))
  }, [selectedOrders])

  // Get holidays for calendar
  const holidays = useMemo(() => {
    return defaultExcludeDates.map(h => h.date)
  }, [defaultExcludeDates])

  const apiEventsForStudent = useMemo(() => {
    if (!selectedStudent) return []
    return apiPersonalEvents.filter(e => e.studentId === selectedStudent.id)
  }, [apiPersonalEvents, selectedStudent])

  // Get events for calendar (API events + local pending events without apiEventId)
  const calendarEvents = useMemo(() => {
    if (!selectedStudent) return []
    const localEvents = pendingEvents.filter(e => e.studentId === selectedStudent.id && !e.apiEventId)
    return [...apiEventsForStudent, ...localEvents]
  }, [selectedStudent, pendingEvents, apiEventsForStudent])

  const pendingEventIdSet = useMemo(() => new Set(pendingEvents.map(e => e.id)), [pendingEvents])

  // Get materials from selected orders
  const orderMaterials = useMemo(() => {
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

  const getEventKey = useCallback((event: Pick<ScheduleEvent, 'id' | 'apiEventId'>) => event.apiEventId || event.id, [])

  const getClassroomIds = useCallback((event: Partial<ScheduleEvent>) => {
    if (Array.isArray(event.classroomIds) && event.classroomIds.length > 0) {
      return event.classroomIds.filter(Boolean)
    }
    if (event.classroomId) {
      return [event.classroomId]
    }
    return []
  }, [])

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
    [classrooms, formatMessage, getClassroomIds],
  )

  const resolveTeacherLabel = useCallback(
    (teacherId?: string) => {
      if (!teacherId) return '-'
      return allTeachers.find(teacher => teacher.id === teacherId)?.name || selectedTeachers.find(teacher => teacher.id === teacherId)?.name || '-'
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

  const buildPersonalEventMetadata = useCallback(
    (
      event: Partial<ScheduleEvent>,
      options?: {
        includeCreator?: boolean
        clientEventId?: string
      },
    ) => {
      const orderIds = event.orderIds || selectedOrderIds
      const orderProductNames =
        orderIds
          ?.map(orderId => orderMap.get(orderId)?.productName)
          .filter(Boolean)
          .join(', ') || ''
      const classroomIds = getClassroomIds(event)
      const isExternal = Boolean(event.isExternal)

      return {
        title: orderProductNames,
        scheduleType: 'personal',
        studentId: selectedStudent?.id,
        orderIds,
        campus: event.campus || '',
        language: (event.language || selectedLanguages[0] || 'zh-TW') as Language,
        teacherId: event.teacherId,
        classroomId: classroomIds[0],
        classroomIds,
        classMode: isExternal ? '外課' : '一般',
        is_external: isExternal,
        duration: event.duration,
        material: event.material,
        needsOnlineRoom: event.needsOnlineRoom,
        ...(options?.clientEventId ? { clientEventId: options.clientEventId } : {}),
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
      }
    },
    [selectedOrderIds, orderMap, getClassroomIds, selectedStudent, selectedLanguages, currentMemberId, currentMember],
  )

  const buildPersonalEventPayload = useCallback(
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
        title: event.material || '',
        extendedProps: {
          description: '',
          metadata: buildPersonalEventMetadata(event),
        },
      } as GeneralEventApi
    },
    [selectedDate, buildPersonalEventMetadata],
  )

  const handleSaveDraft = useCallback(
    (rows: CourseRow[]) => {
      store.setState({ draftRows: rows })
    },
    [store],
  )

  const handleSaveTemplate = useCallback(
    async (name: string, rows: CourseRow[]) => {
      if (!currentLanguage) {
        message.error('請先選擇訂單')
        return
      }

      const courseRows: CourseRowData[] = rows.map(row => ({
        weekday: row.weekday,
        duration: row.duration,
        startTime: row.startTime.format('HH:mm'),
        material: row.material,
        materialType: row.materialType,
        customMaterial: row.customMaterial,
        teacherId: row.teacherId,
        classroomIds: row.classroomIds,
        needsOnlineRoom: row.needsOnlineRoom,
      }))

      await saveTemplate(name, currentLanguage, courseRows)
      refetchTemplates()
    },
    [currentLanguage, saveTemplate, refetchTemplates],
  )

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      await deleteTemplate(templateId)
      refetchTemplates()
    },
    [deleteTemplate, refetchTemplates],
  )

  const handleApplyTemplate = useCallback((template: ScheduleTemplateProps) => {
    console.log('Template applied:', template.name)
  }, [])

  // Handlers
  const handleBack = useCallback(() => {
    history.push('/class-schedule/personal')
  }, [history])

  const handleOrdersChange = useCallback(
    (orderIds: string[]) => {
      store.setState({ selectedOrderIds: orderIds })
    },
    [store],
  )

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
      store.setState({
        selectedDate: date,
        editingEvent: undefined,
        draftRows: undefined,
        arrangeModalVisible: true,
      })
    },
    [store],
  )

  const handleEventClick = useCallback(
    (event: ScheduleEvent) => {
      store.setState({
        selectedDate: event.date,
        editingEvent: event,
        arrangeModalVisible: true,
      })
    },
    [store],
  )

  const handleSaveEvents = useCallback(
    async (events: Partial<ScheduleEvent>[]) => {
      const apiUpdates: Array<{ event: Partial<ScheduleEvent>; eventId: string }> = []
      const localExistingEvents: Partial<ScheduleEvent>[] = []
      const localNewEvents: Partial<ScheduleEvent>[] = []

      events.forEach(event => {
        const hasLocalId = Boolean(event.id && pendingEventIdSet.has(event.id))
        const apiEventId =
          event.apiEventId ||
          (event.id && !event.id.startsWith('local-') && !pendingEventIdSet.has(event.id) ? event.id : undefined)

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
              apiUpdates.map(({ event, eventId }) => updateEvent(authToken)(buildPersonalEventPayload(event))(eventId)),
            )
            refetchStudentEvents()
            refetchPersonalEvents()
          } catch (error) {
            console.error('Failed to update events:', error)
            message.error('課程更新失敗')
            hasError = true
          }
        }
      }

      if (localExistingEvents.length > 0 || localNewEvents.length > 0) {
        store.setState(prev => {
          const newEvents = [...prev.pendingEvents]
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
            const fallbackCampus =
              selectedTeachers[0]?.campusId || selectedTeachers[0]?.campusIds?.[0] || selectedTeachers[0]?.campus || ''

            newEvents.push({
              ...event,
              id: `local-${Date.now()}-${Math.random()}`,
              scheduleType: 'personal',
              status: 'pending',
              studentId: selectedStudent?.id,
              orderIds: selectedOrderIds,
              campus: event.campus || fallbackCampus,
              language: (selectedLanguages[0] || 'zh-TW') as Language,
              createdBy: currentMember?.name || 'current-user',
              createdByEmail: currentMember?.email || 'user@example.com',
              updatedAt: new Date(),
            } as ScheduleEvent)
          })
          return { pendingEvents: newEvents }
        })
      }

      if (!hasError) {
        message.success(localNewEvents.length > 0 ? '課程已加入待處理' : '課程已更新')
      }
      return !hasError
    },
    [
      authToken,
      buildPersonalEventPayload,
      pendingEventIdSet,
      refetchPersonalEvents,
      refetchStudentEvents,
      selectedStudent,
      selectedOrderIds,
      selectedLanguages,
      selectedTeachers,
      currentMemberId,
      currentMember,
      store,
    ],
  )

  const pendingCalendarEvents = useMemo(() => calendarEvents.filter(event => event.status === 'pending'), [calendarEvents])
  const preScheduledCalendarEvents = useMemo(
    () => calendarEvents.filter(event => event.status === 'pre-scheduled'),
    [calendarEvents],
  )

  const hasIncompleteOrders = useMemo(() => selectedOrders.some(order => order.status !== 'SUCCESS'), [selectedOrders])
  const hasPublishableEvents = useMemo(
    () => calendarEvents.some(event => event.status === 'pending' || event.status === 'pre-scheduled'),
    [calendarEvents],
  )
  const canPublish = useMemo(() => !hasIncompleteOrders && hasPublishableEvents, [hasIncompleteOrders, hasPublishableEvents])

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
    [pendingCalendarEvents, preScheduledCalendarEvents, getEventKey, toPublishDraft],
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
            studentId: selectedStudent?.id,
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
    [getEventKey, calendarEvents, getIncompleteFields, selectedStudent, allTeachers, classrooms],
  )

  const preScheduleEvents = useCallback(
    async (eventsToPreSchedule: PublishEventDraft[]) => {
      if (eventsToPreSchedule.length === 0) return []
      if (!authToken || !appId || !selectedStudent?.id) {
        throw new Error('MISSING_REQUIRED_INFORMATION')
      }

      const studentResources = await getResourceByTypeTargetFetcher(authToken)({
        type: 'member',
        targets: [selectedStudent.id],
      })
      const studentResource = studentResources?.[0]
      if (!studentResource) {
        throw new Error('STUDENT_RESOURCE_NOT_FOUND')
      }

      const apiEvents: GeneralEventApi[] = eventsToPreSchedule.map(event => {
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
          title: event.material || '',
          extendedProps: {
            description: '',
            metadata: buildPersonalEventMetadata(event, { includeCreator: true, clientEventId: event.id }),
          },
        } as GeneralEventApi
      })

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

      const createdEventIdByLocalKey = new Map<string, string>()
      eventsToPreSchedule.forEach((event, index) => {
        const createdEvent = createdEventByClientId.get(event.id) || createdEventsArray[index]
        if (createdEvent?.id) {
          createdEventIdByLocalKey.set(getEventKey(event), createdEvent.id)
          createdEventIdByLocalKey.set(event.id, createdEvent.id)
        }
      })

      const createdEventIds = Array.from(new Set(Array.from(createdEventIdByLocalKey.values())))
      const createdEventIdPayload = createdEventIds.map(id => ({ id }))

      if (createdEventIds.length > 0) {
        await createInvitationFetcher(authToken)([
          {
            temporally_exclusive_resource_id: studentResource.temporally_exclusive_resource_id,
            role: 'participant',
          } as any,
        ])(createdEventIdPayload)
      }

      const teacherIds = uniqueStrings(eventsToPreSchedule.map(event => event.teacherId))
      if (teacherIds.length > 0 && createdEventIds.length > 0) {
        const teacherResources = await getResourceByTypeTargetFetcher(authToken)({
          type: 'member',
          targets: teacherIds,
        })
        const teacherResourceMap = new Map<string, any>()
        teacherResources.forEach((resource: any) => {
          if (resource.target) {
            teacherResourceMap.set(resource.target, resource)
          }
        })

        await Promise.all(
          eventsToPreSchedule.map(async event => {
            const createdEventId = createdEventIdByLocalKey.get(event.id) || createdEventIdByLocalKey.get(getEventKey(event))
            if (!createdEventId || !event.teacherId) return
            const teacherResource = teacherResourceMap.get(event.teacherId)
            if (!teacherResource) return
            await createInvitationFetcher(authToken)([
              {
                temporally_exclusive_resource_id: teacherResource.temporally_exclusive_resource_id,
                role: 'host',
              } as any,
            ])([{ id: createdEventId }])
          }),
        )
      }

      const submittedEventKeys = new Set(eventsToPreSchedule.map(event => getEventKey(event)))
      store.setState(prev => ({
        pendingEvents: prev.pendingEvents.map(event => {
          const eventKey = getEventKey(event)
          if (!submittedEventKeys.has(eventKey)) return event
          const apiEventId = createdEventIdByLocalKey.get(event.id) || createdEventIdByLocalKey.get(eventKey)
          return {
            ...event,
            status: 'pre-scheduled' as const,
            apiEventId,
          }
        }),
      }))

      await Promise.all([refetchStudentEvents(), refetchPersonalEvents()])

      return createdEventIds
    },
    [
      authToken,
      appId,
      selectedStudent,
      buildPersonalEventMetadata,
      getEventKey,
      refetchStudentEvents,
      refetchPersonalEvents,
      store,
    ],
  )

  const publishEventIds = useCallback(
    async (events: PublishEventDraft[], eventIds: string[]) => {
      if (!authToken) {
        throw new Error('MISSING_AUTH_TOKEN')
      }
      if (eventIds.length === 0) {
        return
      }

      const publishedAt = new Date().toISOString()
      const eventByApiId = new Map<string, PublishEventDraft>()
      events.forEach(event => {
        const eventId = event.apiEventId || (!event.id.startsWith('local-') ? event.id : undefined)
        if (eventId) {
          eventByApiId.set(eventId, event)
        }
      })

      await Promise.all(
        eventIds.map(eventId => {
          const draftEvent = eventByApiId.get(eventId)
          const metadata = draftEvent
            ? buildPersonalEventMetadata(draftEvent)
            : {
                updatedBy: currentMemberId || '',
                updatedByEmail: currentMember?.email || '',
                updatedByName: currentMember?.name || '',
              }
          return updateEvent(authToken)({ published_at: publishedAt, metadata } as any)(eventId)
        }),
      )

      const publishedIdSet = new Set(eventIds)
      store.setState(prev => ({
        pendingEvents: prev.pendingEvents.map(event => {
          const eventId = event.apiEventId || (!event.id.startsWith('local-') ? event.id : undefined)
          if (eventId && publishedIdSet.has(eventId)) {
            return { ...event, status: 'published' as const }
          }
          return event
        }),
      }))

      await Promise.all([refetchStudentEvents(), refetchPersonalEvents()])
    },
    [authToken, buildPersonalEventMetadata, currentMemberId, currentMember, refetchStudentEvents, refetchPersonalEvents, store],
  )

  const handleOpenPreScheduleModal = useCallback(() => {
    setPreScheduleModalVisible(true)
  }, [])

  const handleConfirmPreSchedule = useCallback(async () => {
    if (pendingCalendarEvents.length === 0) {
      message.warning(formatMessage(scheduleMessages.SemesterClass.noPendingCourses))
      return
    }

    setPreScheduleLoading(true)
    try {
      await preScheduleEvents(pendingCalendarEvents.map(event => toPublishDraft(event)))
      setPreScheduleModalVisible(false)
      message.success(formatMessage(scheduleMessages.PreSchedule.successWithCount, { count: pendingCalendarEvents.length }))
    } catch (error) {
      console.error('Failed to pre-schedule events:', error)
      message.error('預排失敗，請稍後再試')
    } finally {
      setPreScheduleLoading(false)
    }
  }, [pendingCalendarEvents, preScheduleEvents, toPublishDraft, formatMessage])

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

  const handlePublishModeNext = useCallback(() => {
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
    selectedPublishModes,
    formatMessage,
    getPublishModeEvents,
    getIncompleteFields,
    getEventKey,
    validateCorrectionDrafts,
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
    [getEventKey, validateCorrectionDrafts, formatMessage],
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
  }, [
    validateCorrectionDrafts,
    publishEventDrafts,
    correctionEventKeys,
    getEventKey,
    formatMessage,
    handleSaveEvents,
  ])

  const handleConfirmPublish = useCallback(async () => {
    if (publishEventDrafts.length === 0) {
      message.warning(formatMessage(scheduleMessages.Publish.noEventsForSelectedModes))
      return
    }

    store.setState({ publishLoading: true })
    try {
      const pendingEventsForPublish = publishEventDrafts.filter(event => event.status === 'pending')
      const preScheduledEventIds = publishEventDrafts
        .filter(event => event.status === 'pre-scheduled')
        .map(event => event.apiEventId || (!event.id.startsWith('local-') ? event.id : undefined))
        .filter((eventId): eventId is string => Boolean(eventId))

      const createdEventIds =
        pendingEventsForPublish.length > 0 ? await preScheduleEvents(pendingEventsForPublish) : []

      const publishEventIdList = Array.from(new Set([...preScheduledEventIds, ...createdEventIds]))
      if (publishEventIdList.length === 0) {
        message.warning(formatMessage(scheduleMessages.Publish.noEventsForSelectedModes))
        return
      }

      await publishEventIds(publishEventDrafts, publishEventIdList)
      message.success(formatMessage(scheduleMessages.Publish.successWithCount, { count: publishEventIdList.length }))
      handleClosePublishModal()
    } catch (error) {
      console.error('Failed to publish events:', error)
      message.error('發布失敗，請稍後再試')
    } finally {
      store.setState({ publishLoading: false })
    }
  }, [
    publishEventDrafts,
    formatMessage,
    store,
    preScheduleEvents,
    publishEventIds,
    handleClosePublishModal,
  ])

  const correctionRows = useMemo(() => {
    return publishEventDrafts
      .filter(event => correctionEventKeys.includes(getEventKey(event)))
      .sort((a, b) => {
        const dateDiff = moment(a.date).valueOf() - moment(b.date).valueOf()
        if (dateDiff !== 0) return dateDiff
        return a.startTime.localeCompare(b.startTime)
      })
  }, [publishEventDrafts, correctionEventKeys, getEventKey])

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
          courseTimeLabel: `${event.startTime} - ${event.endTime}`,
          startTimeLabel: event.startTime,
          duration: event.duration,
          classroomLabel: resolveClassroomLabel(event),
          teacherLabel: resolveTeacherLabel(event.teacherId),
          materialLabel: event.material || '-',
          needsOnlineRoomLabel: resolveNeedsOnlineRoomLabel(event as PublishEventDraft),
        }))
    },
    [getEventKey, resolveClassroomLabel, resolveNeedsOnlineRoomLabel, resolveTeacherLabel, resolveWeekLabel],
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
      { title: formatMessage(scheduleMessages.ScheduleTable.courseDate), dataIndex: 'dateLabel', key: 'dateLabel', width: 120 },
      { title: formatMessage(scheduleMessages.ArrangeModal.week), dataIndex: 'weekLabel', key: 'weekLabel', width: 90 },
      {
        title: formatMessage(scheduleMessages.ScheduleTable.courseTime),
        dataIndex: 'courseTimeLabel',
        key: 'courseTimeLabel',
        width: 140,
      },
      { title: formatMessage(scheduleMessages.ArrangeModal.duration), dataIndex: 'duration', key: 'duration', width: 100 },
      { title: formatMessage(scheduleMessages.ArrangeModal.classroom), dataIndex: 'classroomLabel', key: 'classroomLabel', width: 160 },
      { title: formatMessage(scheduleMessages.ArrangeModal.teacher), dataIndex: 'teacherLabel', key: 'teacherLabel', width: 130 },
      { title: formatMessage(scheduleMessages.ArrangeModal.material), dataIndex: 'materialLabel', key: 'materialLabel', width: 140 },
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
      { title: formatMessage(scheduleMessages.ScheduleTable.courseDate), dataIndex: 'dateLabel', key: 'dateLabel', width: 120 },
      { title: formatMessage(scheduleMessages.ArrangeModal.week), dataIndex: 'weekLabel', key: 'weekLabel', width: 90 },
      { title: formatMessage(scheduleMessages.ArrangeModal.startTime), dataIndex: 'startTimeLabel', key: 'startTimeLabel', width: 110 },
      { title: formatMessage(scheduleMessages.ArrangeModal.duration), dataIndex: 'duration', key: 'duration', width: 100 },
      { title: formatMessage(scheduleMessages.ArrangeModal.classroom), dataIndex: 'classroomLabel', key: 'classroomLabel', width: 160 },
      { title: formatMessage(scheduleMessages.ArrangeModal.teacher), dataIndex: 'teacherLabel', key: 'teacherLabel', width: 130 },
      { title: formatMessage(scheduleMessages.ArrangeModal.material), dataIndex: 'materialLabel', key: 'materialLabel', width: 140 },
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
          const value =
            typeof event.needsOnlineRoom === 'boolean' ? (event.needsOnlineRoom ? 'yes' : 'no') : undefined
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
      getEventKey,
      correctionErrors,
      getClassroomIds,
      updateCorrectionEvent,
      classrooms,
      allTeachers,
    ],
  )

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

  if (ordersLoading && !member) {
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
            <Button onClick={handleOpenPreScheduleModal} disabled={pendingCalendarEvents.length === 0}>
              預排
            </Button>
            <Tooltip title={hasIncompleteOrders ? formatMessage(scheduleMessages.Publish.disabledIncompleteOrders) : ''}>
              <span>
                <Button type="primary" onClick={handleOpenPublishModal} disabled={!canPublish} loading={publishLoading}>
                  發布
                </Button>
              </span>
            </Tooltip>
          </Space>
        </ActionBar>

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
              lastClassDateByOrderId={lastClassDateByOrderId}
              expiryDateByOrderId={expiryDateByOrderId}
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

        <CollapsibleScheduleCard defaultActiveKey={['teacher']} className="mb-4">
          <Collapse.Panel header={formatMessage(scheduleMessages.TeacherList.title)} key="teacher">
            <TeacherListPanel
              languages={selectedLanguages}
              campus=""
              selectedTeachers={selectedTeachers}
              onTeacherSelect={handleTeachersChange}
            />
          </Collapse.Panel>
        </CollapsibleScheduleCard>

        <ScheduleCard size="small" title={formatMessage(scheduleMessages.Calendar.title)}>
          <ScheduleCalendar
            scheduleType="personal"
            events={calendarEvents}
            selectedTeachers={selectedTeachers}
            teacherOpenTimeEvents={teacherOpenTimeEvents}
            studentOpenTimeEvents={studentOpenTimeEvents}
            studentName={member?.name || selectedStudent?.name}
            holidays={scheduleCondition.excludeHolidays ? holidays : []}
            excludedDates={scheduleCondition.excludedDates}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </ScheduleCard>
      </PageWrapper>

      <ArrangeCourseModal
        visible={arrangeModalVisible}
        scheduleType="personal"
        selectedDate={selectedDate}
        selectedTeachers={selectedTeachers}
        campus=""
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
        classrooms={classrooms}
        existingScheduleEvents={calendarEvents}
        onClose={() => {
          store.setState({ arrangeModalVisible: false, editingEvent: undefined })
        }}
        onSave={handleSaveEvents}
        onSaveDraft={handleSaveDraft}
        templates={templates}
        onSaveTemplate={handleSaveTemplate}
        onApplyTemplate={handleApplyTemplate}
        onDeleteTemplate={handleDeleteTemplate}
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

const PersonalScheduleEditor: React.FC = () => {
  const initialState = useMemo(buildInitialState, [])

  return (
    <ScheduleEditorProvider initialState={initialState}>
      <PersonalScheduleEditorInner />
    </ScheduleEditorProvider>
  )
}

export default PersonalScheduleEditor
