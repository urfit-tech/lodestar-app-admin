import { Button, Col, Collapse, message, Row, Space, Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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

      const orderIds = event.orderIds || selectedOrderIds
      const orderProductNames =
        orderIds
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
            studentId: selectedStudent?.id,
            orderIds,
            campus: event.campus || '',
            language: (event.language || selectedLanguages[0] || 'zh-TW') as Language,
            teacherId: event.teacherId,
            duration: event.duration,
            material: event.material,
            needsOnlineRoom: event.needsOnlineRoom,
            updatedBy: currentMemberId || '',
            updatedByEmail: currentMember?.email || '',
            updatedByName: currentMember?.name || '',
          },
        },
      } as GeneralEventApi
    },
    [selectedDate, selectedOrderIds, selectedLanguages, selectedStudent, orderMap, currentMemberId, currentMember],
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
            newEvents.push({
              ...event,
              id: `local-${Date.now()}-${Math.random()}`,
              scheduleType: 'personal',
              status: 'pending',
              studentId: selectedStudent?.id,
              orderIds: selectedOrderIds,
              campus: '',
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
      currentMember,
      store,
    ],
  )

  const handlePreSchedule = useCallback(async () => {
    const eventsToPreSchedule = calendarEvents.filter(e => e.status === 'pending')
    if (eventsToPreSchedule.length === 0) {
      message.warning('沒有待處理的課程')
      return
    }

    if (!authToken || !appId || !selectedStudent?.id) {
      message.error('無法預排：缺少必要資訊')
      return
    }

    try {
      const studentResources = await getResourceByTypeTargetFetcher(authToken)({
        type: 'member',
        targets: [selectedStudent.id],
      })
      const studentResource = studentResources?.[0]

      if (!studentResource) {
        message.error('無法找到學員資源')
        return
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
              createdBy: currentMemberId || '',
              createdByEmail: currentMember?.email || '',
              createdByName: currentMember?.name || '',
              updatedBy: currentMemberId || '',
              updatedByEmail: currentMember?.email || '',
              updatedByName: currentMember?.name || '',
            },
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
      const resolveCreatedEvent = (pendingEvent: ScheduleEvent, index: number) =>
        createdEventByClientId.get(pendingEvent.id) || createdEventsArray[index]

      if (createdEventsArray.length > 0) {
        const eventIds = createdEventsArray.map((e: any) => e.id)
        await createInvitationFetcher(authToken)([
          {
            temporally_exclusive_resource_id: studentResource.temporally_exclusive_resource_id,
            role: 'participant',
          } as any,
        ])(eventIds)
      }

      const teacherIds = uniqueStrings(eventsToPreSchedule.map(e => e.teacherId))
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
        pendingEvents: prev.pendingEvents.map((event, index) => {
          if (submittedEventIds.has(event.id)) {
            const createdEvent = resolveCreatedEvent(event, index)
            const apiEventId = createdEvent?.id
            return {
              ...event,
              status: 'pre-scheduled' as const,
              apiEventId,
            }
          }
          return event
        }),
      }))

      refetchStudentEvents()
      refetchPersonalEvents()

      message.success(`已預排 ${eventsToPreSchedule.length} 堂課程`)
    } catch (error) {
      console.error('Failed to pre-schedule events:', error)
      message.error('預排失敗，請稍後再試')
    }
  }, [
    authToken,
    appId,
    selectedStudent,
    calendarEvents,
    orderMap,
    refetchStudentEvents,
    currentMemberId,
    currentMember,
    refetchPersonalEvents,
    store,
  ])

  const handlePublish = useCallback(async () => {
    const hasIncompleteOrders = selectedOrders.some(o => o.status !== 'SUCCESS')
    if (hasIncompleteOrders) {
      message.error(formatMessage(scheduleMessages.Publish.disabled))
      return
    }

    if (!authToken) {
      message.error('無法發布：缺少認證資訊')
      return
    }

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

    store.setState({ publishLoading: true })

    try {
      const publishedAt = new Date().toISOString()

      await Promise.all(
        unpublishedEvents.map(event => {
          const originalEvent = event.extendedProps?.originalEvent
          const eventId = originalEvent?.extendedProps?.event_id
          const existingMetadata = originalEvent?.extendedProps?.event_metadata as Record<string, any> | undefined
          const metadata = {
            ...(existingMetadata || {}),
            updatedBy: currentMemberId || '',
            updatedByEmail: currentMember?.email || '',
            updatedByName: currentMember?.name || '',
          }

          return updateEvent(authToken)({ published_at: publishedAt, metadata } as any)(eventId)
        }),
      )

      store.setState(prev => ({
        pendingEvents: prev.pendingEvents.map(event => {
          if (event.status === 'pre-scheduled') {
            return { ...event, status: 'published' as const }
          }
          return event
        }),
      }))
      refetchStudentEvents()

      message.success(`已發布 ${unpublishedEvents.length} 堂課程`)
    } catch (error) {
      console.error('Failed to publish events:', error)
      message.error('發布失敗，請稍後再試')
    } finally {
      store.setState({ publishLoading: false })
    }
  }, [
    authToken,
    selectedOrders,
    studentOpenTimeEvents,
    formatMessage,
    refetchStudentEvents,
    currentMemberId,
    currentMember,
    store,
  ])

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
