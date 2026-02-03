import { AppstoreOutlined, CopyOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import {
  Button,
  Col,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  TimePicker,
  Tooltip,
  Typography,
} from 'antd'
import moment, { Moment } from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  checkScheduleConflict,
  StudentOpenTimeEvent,
  TeacherBusyEvent,
  TeacherOpenTimeEvent,
  useHolidays,
} from '../../hooks/scheduleManagement'
import {
  Classroom,
  DEFAULT_DURATION,
  DURATION_OPTIONS,
  Language,
  ScheduleCondition,
  ScheduleEvent,
  ScheduleStatus,
  ScheduleTemplateProps,
  ScheduleType,
  Teacher,
} from '../../types/schedule'
import { GeneralEventApi } from '../event/events.type'
import scheduleMessages from './translation'

const FormRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`

const IconButton = styled(Button)`
  padding: 4px 8px;
`

const ErrorTag = styled.div`
  padding: 4px 0;
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
`

// Error styles for form fields
const StyledFormRow = styled(FormRow)`
  flex-direction: column;

  .ant-picker-error,
  .ant-select-error {
    .ant-picker,
    .ant-select-selector {
      border-color: #ff4d4f !important;
    }
  }

  .ant-picker-error:hover,
  .ant-select-error:hover {
    .ant-picker,
    .ant-select-selector {
      border-color: #ff7875 !important;
    }
  }
`

const WarningModal = styled(Modal)`
  .ant-modal-body {
    padding: 24px;
    text-align: center;
  }
`

const CLASSROOM_UNASSIGNED = '__unassigned__'
const CLASSROOM_EXTERNAL = '__external__'

export interface CourseRow {
  id: string
  weekday: number
  duration: number
  startTime: Moment
  material: string
  materialType: 'order' | 'undecided' | 'custom'
  customMaterial: string
  teacherId?: string
  classroomIds: string[]
  needsOnlineRoom: boolean
}

export interface ArrangeCourseModalProps {
  visible: boolean
  scheduleType: ScheduleType
  selectedDate: Date
  selectedTeachers: Teacher[]
  campus: string
  language: Language
  orderMaterials?: string[]
  existingEvent?: ScheduleEvent
  // New props for enhanced functionality
  availableMinutes?: number // Total available minutes from selected orders
  scheduleCondition?: ScheduleCondition // For repeat scheduling logic
  draftRows?: CourseRow[] // Saved draft from previous session
  studentId?: string // Student ID for conflict detection
  studentName?: string // Student name for conflict message display
  studentOpenTimeEvents?: StudentOpenTimeEvent[] // Student's existing events for conflict detection
  teacherOpenTimeEvents?: TeacherOpenTimeEvent[] // Teacher's available open time events for validation
  teacherBusyEvents?: TeacherBusyEvent[] // Teacher's existing events for conflict checks
  classrooms?: Classroom[] // Available classrooms for selection
  existingScheduleEvents?: ScheduleEvent[] // Existing schedule events for conflict detection
  onClose: () => void
  onSave: (events: Partial<ScheduleEvent>[]) => void
  onSaveDraft?: (rows: CourseRow[]) => void // Save draft when closing
  // Template props - multi-row templates bound to editor
  templates?: ScheduleTemplateProps[]
  onSaveTemplate?: (name: string, rows: CourseRow[], rrule?: string) => Promise<void>
  onApplyTemplate?: (template: ScheduleTemplateProps) => void
  onDeleteTemplate?: (templateId: string) => Promise<void>
}

const ArrangeCourseModal: React.FC<ArrangeCourseModalProps> = ({
  visible,
  scheduleType,
  selectedDate,
  selectedTeachers,
  campus,
  language,
  orderMaterials = [],
  existingEvent,
  availableMinutes = 0,
  scheduleCondition,
  draftRows,
  studentId,
  studentName,
  studentOpenTimeEvents = [],
  teacherBusyEvents = [],
  classrooms = [],
  existingScheduleEvents = [],
  onClose,
  onSave,
  onSaveDraft,
  // Template props
  templates = [],
  onSaveTemplate,
  onApplyTemplate,
  onDeleteTemplate,
}) => {
  const { formatMessage } = useIntl()
  const { holidays: defaultExcludeDates } = useHolidays()
  const [rows, setRows] = useState<CourseRow[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [showDurationWarning, setShowDurationWarning] = useState(false)
  const [durationWarningTotal, setDurationWarningTotal] = useState<number | null>(null)
  const [showMinutesMismatchWarning, setShowMinutesMismatchWarning] = useState(false)
  const [minutesMismatch, setMinutesMismatch] = useState(0)
  const [materialSearch, setMaterialSearch] = useState('')
  // Template state
  const [showTemplateSelectModal, setShowTemplateSelectModal] = useState(false)
  const [showTemplateSaveModal, setShowTemplateSaveModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateSaveLoading, setTemplateSaveLoading] = useState(false)
  const [templateDeleteLoading, setTemplateDeleteLoading] = useState<string | null>(null)
  type GeneratedEventsResult = { events: Partial<ScheduleEvent>[]; minutesMismatch: number }

  // 教室選擇在所有排課類型下都顯示（至少可選「尚未排定」或「外課」）
  const showClassroom = true
  const columnSpans = useMemo(
    () =>
      showClassroom
        ? { week: 3, duration: 3, start: 3, material: 4, teacher: 4, classroom: 3, online: 2, actions: 2 }
        : { week: 3, duration: 3, start: 3, material: 5, teacher: 5, online: 3, actions: 2 },
    [showClassroom],
  )

  const normalizeClassroomSelection = useCallback((values: string[]) => {
    if (values.includes(CLASSROOM_EXTERNAL)) {
      return [CLASSROOM_EXTERNAL]
    }
    const withoutUnassigned = values.filter(v => v !== CLASSROOM_UNASSIGNED)
    if (withoutUnassigned.length > 0) {
      return withoutUnassigned
    }
    return [CLASSROOM_UNASSIGNED]
  }, [])

  const getClassroomState = useCallback((row: CourseRow) => {
    const ids = row.classroomIds || []
    const isExternal = ids.includes(CLASSROOM_EXTERNAL)
    const isUnassigned = ids.includes(CLASSROOM_UNASSIGNED)
    const assignedIds = ids.filter(id => id !== CLASSROOM_UNASSIGNED && id !== CLASSROOM_EXTERNAL)
    return { assignedIds, isExternal, isUnassigned }
  }, [])

  const existingEventIds = useMemo(() => {
    return new Set([existingEvent?.id, existingEvent?.apiEventId].filter(Boolean) as string[])
  }, [existingEvent])

  const isSameExistingApiEvent = useCallback(
    (originalEvent?: GeneralEventApi) => {
      if (!originalEvent || existingEventIds.size === 0) return false
      const originalId = (originalEvent as any).extendedProps?.event_id || (originalEvent as any).id
      if (originalId && existingEventIds.has(originalId)) return true
      const clientEventId =
        (originalEvent as any).extendedProps?.event_metadata?.clientEventId ||
        (originalEvent as any).extendedProps?.metadata?.clientEventId
      return Boolean(clientEventId && existingEvent?.id && clientEventId === existingEvent.id)
    },
    [existingEventIds, existingEvent],
  )

  // Filter materials based on search
  const filteredMaterials = useMemo(() => {
    if (!materialSearch) return orderMaterials
    const searchLower = materialSearch.toLowerCase()
    return orderMaterials.filter(m => m.toLowerCase().includes(searchLower))
  }, [orderMaterials, materialSearch])

  // 取得所選老師的校區 IDs（可能有多個）
  const getTeacherCampusIds = useCallback(
    (teacherId?: string): string[] => {
      if (!teacherId) return []
      const teacher = selectedTeachers.find(t => t.id === teacherId)
      if (!teacher) return []
      // 使用新的 campusIds 欄位，或回退到 campusId
      return teacher.campusIds || (teacher.campusId ? [teacher.campusId] : [])
    },
    [selectedTeachers],
  )

  // 根據老師校區過濾教室
  const getFilteredClassrooms = useCallback(
    (teacherId?: string): Classroom[] => {
      const campusIds = getTeacherCampusIds(teacherId)
      // 如果沒有選擇老師或老師沒有校區，顯示所有教室
      if (campusIds.length === 0) return classrooms
      // 過濾出屬於老師校區的教室
      return classrooms.filter(c => c.campusId && campusIds.includes(c.campusId))
    },
    [classrooms, getTeacherCampusIds],
  )

  // 判斷是否需要顯示校區前綴（老師有多個校區時）
  const shouldShowCampusPrefix = useCallback(
    (teacherId?: string): boolean => {
      const campusIds = getTeacherCampusIds(teacherId)
      return campusIds.length > 1
    },
    [getTeacherCampusIds],
  )

  // Calculate total duration of all rows
  const totalDuration = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.duration, 0)
  }, [rows])

  // Check if total duration exceeds available minutes or schedule condition total minutes
  const isExceedingLimit = useMemo(() => {
    // Check against order's available minutes
    if (availableMinutes > 0 && totalDuration > availableMinutes) {
      return true
    }
    // Check against schedule condition's total minutes (if set)
    if (scheduleCondition?.totalMinutes && totalDuration > scheduleCondition.totalMinutes) {
      return true
    }
    return false
  }, [totalDuration, availableMinutes, scheduleCondition])

  // Create default row
  const createDefaultRow = useCallback((date: Date, teacher?: Teacher): CourseRow => {
    // Use the clicked date/time directly from the calendar
    const defaultStartTime = moment(date)
    const weekday = moment(date).day() || 7 // 0 = Sunday -> 7

    return {
      id: `new-${Date.now()}-${Math.random()}`,
      weekday,
      duration: DEFAULT_DURATION,
      startTime: defaultStartTime,
      material: '',
      materialType: 'undecided',
      customMaterial: '',
      teacherId: teacher?.id,
      classroomIds: [CLASSROOM_UNASSIGNED],
      needsOnlineRoom: false,
    }
  }, [])

  // Initialize with selected date or draft
  useEffect(() => {
    if (visible) {
      // If there's a draft from previous session, restore it
      if (draftRows && draftRows.length > 0) {
        setRows(
          draftRows.map(row => ({
            ...row,
            startTime: moment(row.startTime), // Restore Moment object
            classroomIds: row.classroomIds?.length ? row.classroomIds : [CLASSROOM_UNASSIGNED],
          })),
        )
        return
      }

      if (existingEvent) {
        // Editing existing event
        setRows([
          {
            id: existingEvent.id,
            weekday: moment(existingEvent.date).day() || 7,
            duration: existingEvent.duration,
            startTime: moment(existingEvent.date)
              .hour(parseInt(existingEvent.startTime.split(':')[0]))
              .minute(parseInt(existingEvent.startTime.split(':')[1])),
            material: existingEvent.material || '',
            materialType: existingEvent.material ? 'order' : 'undecided',
            customMaterial: '',
            teacherId: existingEvent.teacherId,
            classroomIds: existingEvent.isExternal
              ? [CLASSROOM_EXTERNAL]
              : existingEvent.classroomIds?.length
              ? existingEvent.classroomIds
              : existingEvent.classroomId
              ? [existingEvent.classroomId]
              : [CLASSROOM_UNASSIGNED],
            needsOnlineRoom: existingEvent.needsOnlineRoom,
          },
        ])
      } else {
        // New event - use clicked date/time
        setRows([createDefaultRow(selectedDate, selectedTeachers[0])])
      }
      setErrors({})
      setMaterialSearch('')
    }
  }, [visible, selectedDate, existingEvent, selectedTeachers, draftRows, createDefaultRow])

  const updateRow = useCallback((id: string, updates: Partial<CourseRow>) => {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, ...updates } : row)))
  }, [])

  const addRow = useCallback(() => {
    const newRow = createDefaultRow(selectedDate, selectedTeachers[0])
    setRows(prev => [...prev, newRow])
  }, [selectedDate, selectedTeachers, createDefaultRow])

  const copyRow = useCallback((row: CourseRow) => {
    const newRow: CourseRow = {
      id: `new-${Date.now()}-${Math.random()}`,
      weekday: 0, // Reset weekday as per PRD (copy doesn't include week)
      duration: row.duration,
      startTime: row.startTime,
      material: row.material,
      materialType: row.materialType,
      customMaterial: row.customMaterial,
      teacherId: row.teacherId,
      classroomIds: row.classroomIds,
      needsOnlineRoom: row.needsOnlineRoom,
    }
    setRows(prev => [...prev, newRow])
  }, [])

  const removeRow = useCallback((id: string) => {
    setRows(prev => prev.filter(row => row.id !== id))
  }, [])

  // Check for duration limit warning when duration changes
  const handleDurationChange = useCallback(
    (id: string, newDuration: number) => {
      const otherRowsDuration = rows.filter(r => r.id !== id).reduce((sum, r) => sum + r.duration, 0)
      const newTotal = otherRowsDuration + newDuration

      if (availableMinutes > 0 && newTotal > availableMinutes) {
        setDurationWarningTotal(newTotal)
        setShowDurationWarning(true)
      }

      updateRow(id, { duration: newDuration })
    },
    [rows, availableMinutes, updateRow],
  )

  const validateRows = useCallback((): boolean => {
    const newErrors: Record<string, string[]> = {}
    let isValid = true
    const allConflictDetails: {
      teacherConflicts: Array<{ date: string; startTime: string; endTime: string; teacherName?: string }>
      roomConflicts: Array<{ date: string; startTime: string; endTime: string; roomName?: string }>
      studentConflicts: Array<{ date: string; startTime: string; endTime: string }>
      scheduleConditionErrors: Array<{ date: string; errorType: string }>
    } = {
      teacherConflicts: [],
      roomConflicts: [],
      studentConflicts: [],
      scheduleConditionErrors: [],
    }

    const parseRruleByday = (rrule: string): number[] => {
      const bydayMap: Record<string, number> = {
        SU: 0,
        MO: 1,
        TU: 2,
        WE: 3,
        TH: 4,
        FR: 5,
        SA: 6,
      }
      const bydayMatch = rrule.match(/BYDAY=([A-Z,]+)/i)
      if (bydayMatch) {
        return bydayMatch[1]
          .split(',')
          .map(day => bydayMap[day.toUpperCase()])
          .filter(d => d !== undefined)
      }
      return []
    }

    const isEventApplicableOnDate = (
      event: { start: Date; rrule?: string },
      rowWeekday: number,
      rowDateStr: string,
    ): boolean => {
      if (event.rrule) {
        const byday = parseRruleByday(event.rrule)
        if (byday.length > 0) {
          return byday.includes(rowWeekday)
        }
        const eventWeekday = moment(event.start).day()
        return rowWeekday === eventWeekday
      }

      const eventDateStr = moment(event.start).format('YYYY-MM-DD')
      return eventDateStr === rowDateStr
    }

    const hasOverlapWithEvent = (
      event: { start: Date; end: Date; rrule?: string },
      rowStartNum: number,
      rowEndNum: number,
      rowWeekday: number,
      rowDateStr: string,
    ): boolean => {
      if (!isEventApplicableOnDate(event, rowWeekday, rowDateStr)) return false

      const eventStartNum = parseInt(moment(event.start).format('HH:mm').replace(':', ''))
      const eventEndNum = parseInt(moment(event.end).format('HH:mm').replace(':', ''))
      return rowStartNum < eventEndNum && rowEndNum > eventStartNum
    }

    const addRowError = (rowErrors: string[], errorKey: string) => {
      if (!rowErrors.includes(errorKey)) {
        rowErrors.push(errorKey)
      }
    }

    rows.forEach(row => {
      const rowErrors: string[] = []

      // Required fields: week, duration, startTime
      if (!row.weekday || row.weekday < 1 || row.weekday > 7) {
        rowErrors.push('weekday')
        isValid = false
      }

      if (!row.startTime) {
        rowErrors.push('startTime')
        isValid = false
      }

      // Check for conflicts
      const endTime = moment(row.startTime).add(row.duration, 'minutes')
      const dateForRow = moment(selectedDate).isoWeekday(row.weekday)
      const dateStr = dateForRow.format('YYYY-MM-DD')
      const rowStartTime = row.startTime.format('HH:mm')
      const rowEndTime = endTime.format('HH:mm')
      const rowWeekday = dateForRow.day() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const rowStartNum = parseInt(rowStartTime.replace(':', ''))
      const rowEndNum = parseInt(rowEndTime.replace(':', ''))

      // Check schedule condition constraints
      if (scheduleCondition) {
        const { startDate, endDate, excludedDates, excludeHolidays } = scheduleCondition
        const holidays = excludeHolidays ? defaultExcludeDates.map(h => h.date) : []

        // Check if date is before start date
        if (startDate && dateForRow.isBefore(moment(startDate), 'day')) {
          rowErrors.push('beforeStartDate')
          isValid = false
          allConflictDetails.scheduleConditionErrors.push({
            date: dateStr,
            errorType: `早於開始日期 (${moment(startDate).format('YYYY-MM-DD')})`,
          })
        }

        // Check if date is after end date
        if (endDate && dateForRow.isAfter(moment(endDate), 'day')) {
          rowErrors.push('afterEndDate')
          isValid = false
          allConflictDetails.scheduleConditionErrors.push({
            date: dateStr,
            errorType: `晚於結束日期 (${moment(endDate).format('YYYY-MM-DD')})`,
          })
        }

        // Check if date is in excluded dates
        const isExcludedDate = excludedDates?.some(d => moment(d).format('YYYY-MM-DD') === dateStr)
        if (isExcludedDate) {
          rowErrors.push('excludedDate')
          isValid = false
          allConflictDetails.scheduleConditionErrors.push({
            date: dateStr,
            errorType: '為預計不排課日',
          })
        }

        // Check if date is a holiday
        const isHoliday = holidays.some(h => moment(h).format('YYYY-MM-DD') === dateStr)
        if (isHoliday) {
          rowErrors.push('holiday')
          isValid = false
          allConflictDetails.scheduleConditionErrors.push({
            date: dateStr,
            errorType: '為節假日',
          })
        }
      }

      const { assignedIds } = getClassroomState(row)
      const conflict = checkScheduleConflict(
        {
          date: dateForRow.toDate(),
          startTime: row.startTime.format('HH:mm'),
          endTime: endTime.format('HH:mm'),
          teacherId: row.teacherId,
          classroomId: assignedIds[0],
          classroomIds: assignedIds.length > 0 ? assignedIds : undefined,
          studentId,
          excludeEventId: existingEvent?.id,
          excludeApiEventId: existingEvent?.apiEventId,
        },
        existingScheduleEvents,
        selectedTeachers,
        classrooms,
      )

      if (conflict.hasTeacherConflict) {
        rowErrors.push('teacherConflict')
        isValid = false
        // Collect teacher conflict details
        conflict.conflictDetails.teacherConflicts.forEach(
          (tc: { startTime: string; endTime: string; teacherName?: string }) => {
            allConflictDetails.teacherConflicts.push({ date: dateStr, ...tc })
          },
        )
      }

      if (conflict.hasStudentConflict) {
        rowErrors.push('studentConflict')
        isValid = false
        // Collect student conflict details
        conflict.conflictDetails.studentConflicts.forEach((sc: { startTime: string; endTime: string }) => {
          allConflictDetails.studentConflicts.push({ date: dateStr, ...sc })
        })
      }

      if (conflict.hasRoomConflict) {
        rowErrors.push('roomConflict')
        isValid = false
        conflict.conflictDetails.roomConflicts.forEach(
          (rc: { startTime: string; endTime: string; roomName?: string }) => {
            allConflictDetails.roomConflicts.push({ date: dateStr, ...rc })
          },
        )
      }

      // Check conflicts with teacher's existing events (API)
      if (row.teacherId && teacherBusyEvents.length > 0) {
        const busyEvents = teacherBusyEvents.filter(e => {
          if (e.teacherId !== row.teacherId) return false
          // Exclude the event being edited (match API event id or clientEventId)
          if (isSameExistingApiEvent(e.extendedProps?.originalEvent)) return false
          return true
        })
        busyEvents.forEach(event => {
          if (!hasOverlapWithEvent(event, rowStartNum, rowEndNum, rowWeekday, dateStr)) {
            return
          }

          const eventStartTime = moment(event.start).format('HH:mm')
          const eventEndTime = moment(event.end).format('HH:mm')
          const alreadyAdded = allConflictDetails.teacherConflicts.some(
            tc =>
              tc.date === dateStr &&
              tc.startTime === eventStartTime &&
              tc.endTime === eventEndTime &&
              tc.teacherName === selectedTeachers.find(t => t.id === row.teacherId)?.name,
          )
          if (!alreadyAdded) {
            rowErrors.push('teacherConflict')
            isValid = false
            allConflictDetails.teacherConflicts.push({
              date: dateStr,
              startTime: eventStartTime,
              endTime: eventEndTime,
              teacherName: selectedTeachers.find(t => t.id === row.teacherId)?.name,
            })
          }
        })
      }

      // Check for conflicts with student's existing events (API)
      if (studentOpenTimeEvents.length > 0) {
        const busyEvents = studentOpenTimeEvents.filter(event => {
          if (event.extendedProps.status === 'open') return false
          // Exclude the event being edited (match API event id or clientEventId)
          if (isSameExistingApiEvent(event.extendedProps?.originalEvent)) return false
          return true
        })

        busyEvents.forEach(event => {
          if (!hasOverlapWithEvent(event, rowStartNum, rowEndNum, rowWeekday, dateStr)) {
            return
          }

          const eventStartTime = moment(event.start).format('HH:mm')
          const eventEndTime = moment(event.end).format('HH:mm')
          const alreadyAdded = allConflictDetails.studentConflicts.some(
            sc => sc.date === dateStr && sc.startTime === eventStartTime && sc.endTime === eventEndTime,
          )
          if (!alreadyAdded) {
            rowErrors.push('studentConflict')
            isValid = false
            allConflictDetails.studentConflicts.push({
              date: dateStr,
              startTime: eventStartTime,
              endTime: eventEndTime,
            })
          }
        })
      }

      // Check for duplicates within the modal
      const rowClassroomState = getClassroomState(row)
      const rowClassroomKey = rowClassroomState.isExternal
        ? CLASSROOM_EXTERNAL
        : rowClassroomState.isUnassigned
        ? CLASSROOM_UNASSIGNED
        : rowClassroomState.assignedIds.slice().sort().join('|')
      const duplicates = rows.filter(r => {
        if (r.id === row.id) return false
        if (r.weekday !== row.weekday) return false
        if (r.startTime.format('HH:mm') !== row.startTime.format('HH:mm')) return false
        if (r.teacherId !== row.teacherId) return false

        const otherState = getClassroomState(r)
        const otherKey = otherState.isExternal
          ? CLASSROOM_EXTERNAL
          : otherState.isUnassigned
          ? CLASSROOM_UNASSIGNED
          : otherState.assignedIds.slice().sort().join('|')
        return rowClassroomKey === otherKey
      })
      if (duplicates.length > 0) {
        addRowError(rowErrors, 'duplicate')
        isValid = false
      }

      // Check for overlapping rows within the modal (same time range)
      const overlappingRows = rows.filter(r => {
        if (r.id === row.id) return false
        if (r.weekday !== row.weekday) return false
        const otherStartNum = parseInt(r.startTime.format('HH:mm').replace(':', ''))
        const otherEndNum = parseInt(moment(r.startTime).add(r.duration, 'minutes').format('HH:mm').replace(':', ''))
        return rowStartNum < otherEndNum && rowEndNum > otherStartNum
      })

      if (overlappingRows.length > 0) {
        if (studentId) {
          addRowError(rowErrors, 'studentConflict')
          isValid = false
        }

        if (row.teacherId && overlappingRows.some(r => r.teacherId === row.teacherId)) {
          addRowError(rowErrors, 'teacherConflict')
          isValid = false
        }

        const hasRoomOverlap =
          !rowClassroomState.isExternal &&
          !rowClassroomState.isUnassigned &&
          rowClassroomState.assignedIds.length > 0 &&
          overlappingRows.some(r => {
            const otherState = getClassroomState(r)
            if (otherState.isExternal || otherState.isUnassigned) return false
            return otherState.assignedIds.some(id => rowClassroomState.assignedIds.includes(id))
          })

        if (hasRoomOverlap) {
          addRowError(rowErrors, 'roomConflict')
          isValid = false
        }
      }

      if (rowErrors.length > 0) {
        newErrors[row.id] = rowErrors
      }
    })

    // Show conflict toast messages
    if (!isValid) {
      const hasAnyConflict =
        allConflictDetails.teacherConflicts.length > 0 ||
        allConflictDetails.roomConflicts.length > 0 ||
        allConflictDetails.studentConflicts.length > 0 ||
        allConflictDetails.scheduleConditionErrors.length > 0

      if (hasAnyConflict) {
        const formatConflictTime = (c: { date: string; startTime: string; endTime: string }) =>
          `${c.date} ${c.startTime} ~ ${c.endTime}`

        const conflictMessages: string[] = []

        if (allConflictDetails.scheduleConditionErrors.length > 0) {
          const conditionErrorStr = allConflictDetails.scheduleConditionErrors
            .map(c => `${c.date} ${c.errorType}`)
            .join('\n')
          conflictMessages.push(`排課條件限制：\n${conditionErrorStr}`)
        }

        if (allConflictDetails.studentConflicts.length > 0) {
          const studentConflictStr = allConflictDetails.studentConflicts.map(formatConflictTime).join('\n')
          conflictMessages.push(`學員時間衝突${studentName ? `（${studentName}）` : ''}：\n${studentConflictStr}`)
        }

        if (allConflictDetails.teacherConflicts.length > 0) {
          const teacherConflictStr = allConflictDetails.teacherConflicts
            .map(c => `${formatConflictTime(c)}${c.teacherName ? ` (${c.teacherName})` : ''}`)
            .join('\n')
          conflictMessages.push(`教師時間衝突：\n${teacherConflictStr}`)
        }

        if (allConflictDetails.roomConflicts.length > 0) {
          const roomConflictStr = allConflictDetails.roomConflicts
            .map(c => `${formatConflictTime(c)}${c.roomName ? ` (${c.roomName})` : ''}`)
            .join('\n')
          conflictMessages.push(`教室時間衝突：\n${roomConflictStr}`)
        }

        message.error({
          content: (
            <div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>無法排課</div>
              {conflictMessages.join('\n\n')}
            </div>
          ),
          duration: 5,
        })
      }
    }

    setErrors(newErrors)
    return isValid
  }, [
    rows,
    selectedDate,
    existingEvent,
    studentId,
    studentName,
    studentOpenTimeEvents,
    teacherBusyEvents,
    selectedTeachers,
    scheduleCondition,
    getClassroomState,
    defaultExcludeDates,
    isSameExistingApiEvent,
  ])

  // Generate repeated events based on schedule condition
  const generateRepeatedEvents = useCallback(
    (baseRows: CourseRow[]): GeneratedEventsResult => {
      const events: Partial<ScheduleEvent>[] = []
      let minutesMismatch = 0

      if (!scheduleCondition || existingEvent) {
        // No repeat, just return single events for each row
        return {
          events: baseRows.map(row => {
            const dateForRow = moment(selectedDate).isoWeekday(row.weekday)
            const endTime = moment(row.startTime).add(row.duration, 'minutes')
            const classroomState = getClassroomState(row)
            const classroomIds =
              classroomState.isExternal || classroomState.isUnassigned ? undefined : classroomState.assignedIds

            return {
              id: row.id.startsWith('new-') ? undefined : row.id,
              apiEventId: row.id === existingEvent?.id ? existingEvent?.apiEventId : undefined,
              scheduleType,
              status: 'pending' as ScheduleStatus,
              campus,
              language,
              date: dateForRow.toDate(),
              startTime: row.startTime.format('HH:mm'),
              endTime: endTime.format('HH:mm'),
              duration: row.duration,
              material:
                row.materialType === 'custom'
                  ? row.customMaterial
                  : row.materialType === 'order'
                  ? row.material
                  : undefined,
              teacherId: row.teacherId,
              classroomId: classroomIds?.[0],
              classroomIds,
              isExternal: classroomState.isExternal,
              needsOnlineRoom: row.needsOnlineRoom,
            }
          }),
          minutesMismatch,
        }
      }

      const { startDate, endDate, totalMinutes, excludedDates, excludeHolidays } = scheduleCondition
      const holidays = excludeHolidays ? defaultExcludeDates.map(h => h.date) : []
      const endDateMoment = endDate ? moment(endDate) : null

      let accumulatedMinutes = 0
      let currentDate = moment(startDate)

      // Determine end condition
      const shouldStop = (date: Moment, minutes: number): boolean => {
        if (endDate && date.isAfter(moment(endDate), 'day')) {
          return true
        }
        if (totalMinutes && minutes >= totalMinutes) {
          return true
        }
        return false
      }

      // Safety limit: max 52 weeks
      const maxIterations = 52

      for (let iteration = 0; iteration < maxIterations; iteration++) {
        for (const row of baseRows) {
          // Calculate date for this row's weekday
          let dateForRow = currentDate
            .clone()
            .startOf('isoWeek')
            .add(row.weekday - 1, 'days')
          if (dateForRow.isBefore(currentDate, 'day')) {
            dateForRow = dateForRow.clone().add(1, 'week')
          }

          // Block dates after end date
          if (endDateMoment && dateForRow.isAfter(endDateMoment, 'day')) {
            continue
          }

          // Check if date is excluded
          const dateStr = dateForRow.format('YYYY-MM-DD')
          const isExcluded =
            excludedDates.some(d => moment(d).format('YYYY-MM-DD') === dateStr) ||
            holidays.some(h => moment(h).format('YYYY-MM-DD') === dateStr)

          if (isExcluded) {
            continue
          }

          // Check stop condition
          if (shouldStop(dateForRow, accumulatedMinutes + row.duration)) {
            // For totalMinutes mode, check if adding this would exceed
            if (totalMinutes && accumulatedMinutes + row.duration > totalMinutes) {
              // Don't add this event, we're at the limit
              break
            }
          }

          const endTime = moment(row.startTime).add(row.duration, 'minutes')
          const classroomState = getClassroomState(row)
          const classroomIds =
            classroomState.isExternal || classroomState.isUnassigned ? undefined : classroomState.assignedIds

          events.push({
            scheduleType,
            status: 'pending' as ScheduleStatus,
            campus,
            language,
            date: dateForRow.toDate(),
            startTime: row.startTime.format('HH:mm'),
            endTime: endTime.format('HH:mm'),
            duration: row.duration,
            material:
              row.materialType === 'custom'
                ? row.customMaterial
                : row.materialType === 'order'
                ? row.material
                : undefined,
            teacherId: row.teacherId,
            classroomId: classroomIds?.[0],
            classroomIds,
            isExternal: classroomState.isExternal,
            needsOnlineRoom: row.needsOnlineRoom,
          })

          accumulatedMinutes += row.duration

          // Check if we've reached the limit
          if (totalMinutes && accumulatedMinutes >= totalMinutes) {
            break
          }
        }

        // Check if we should stop iteration
        if (totalMinutes && accumulatedMinutes >= totalMinutes) {
          break
        }

        // Move to next week
        currentDate = currentDate.clone().add(1, 'week')

        // Check end date
        if (endDate && currentDate.isAfter(moment(endDate), 'day')) {
          break
        }
      }

      // Check for minutes mismatch (for totalMinutes mode)
      if (totalMinutes && accumulatedMinutes !== totalMinutes) {
        minutesMismatch = totalMinutes - accumulatedMinutes
      }

      return { events, minutesMismatch }
    },
    [
      scheduleCondition,
      scheduleType,
      campus,
      language,
      selectedDate,
      getClassroomState,
      defaultExcludeDates,
      existingEvent,
    ],
  )

  const handleSave = useCallback(() => {
    if (!validateRows()) {
      // validateRows 內部已經會顯示詳細的錯誤訊息，這裡不需要再顯示通用訊息
      return
    }

    // Generate events (with repeat logic if condition exists)
    const { events, minutesMismatch } = generateRepeatedEvents(rows)
    const generatedTotal = events.reduce((sum, event) => sum + (event.duration || 0), 0)

    if (availableMinutes > 0 && generatedTotal > availableMinutes) {
      setDurationWarningTotal(generatedTotal)
      setShowDurationWarning(true)
      return
    }

    // Check for duration limit (base rows)
    if (isExceedingLimit) {
      setDurationWarningTotal(totalDuration)
      setShowDurationWarning(true)
      return
    }

    if (minutesMismatch !== 0) {
      setMinutesMismatch(minutesMismatch)
      setShowMinutesMismatchWarning(true)
      return
    }

    onSave(events)
    onClose()
  }, [
    rows,
    validateRows,
    generateRepeatedEvents,
    availableMinutes,
    isExceedingLimit,
    totalDuration,
    onSave,
    onClose,
    formatMessage,
  ])

  const handleClose = useCallback(() => {
    // Save draft before closing
    if (onSaveDraft && rows.length > 0) {
      onSaveDraft(rows)
    }
    onClose()
  }, [rows, onSaveDraft, onClose])

  // Template handlers
  const handleOpenTemplateSelectModal = useCallback(() => {
    setShowTemplateSelectModal(true)
  }, [])

  const handleOpenTemplateSaveModal = useCallback(() => {
    setTemplateName('')
    setShowTemplateSaveModal(true)
  }, [])

  const handleSaveTemplateClick = useCallback(async () => {
    if (!templateName.trim()) {
      message.warning(formatMessage(scheduleMessages.ArrangeModal.templateNameRequired))
      return
    }

    if (rows.length === 0 || !onSaveTemplate) return

    setTemplateSaveLoading(true)
    try {
      await onSaveTemplate(templateName.trim(), rows)
      message.success(formatMessage(scheduleMessages.ArrangeModal.templateSaved))
      setShowTemplateSaveModal(false)
      setTemplateName('')
    } catch (error) {
      console.error('Failed to save template:', error)
      message.error('儲存模板失敗')
    } finally {
      setTemplateSaveLoading(false)
    }
  }, [templateName, rows, onSaveTemplate, formatMessage])

  const handleApplyTemplateClick = useCallback(
    (template: ScheduleTemplateProps) => {
      if (onApplyTemplate) {
        onApplyTemplate(template)
      }

      // Convert template course rows to CourseRow format
      const newRows: CourseRow[] = template.courseRows.map((data, index) => ({
        id: `template-${Date.now()}-${index}`,
        weekday: data.weekday,
        duration: data.duration,
        startTime: moment(data.startTime, 'HH:mm'),
        material: data.material,
        materialType: data.materialType,
        customMaterial: data.customMaterial,
        teacherId: data.teacherId,
        classroomIds: data.classroomIds?.length ? data.classroomIds : [CLASSROOM_UNASSIGNED],
        needsOnlineRoom: data.needsOnlineRoom,
      }))

      setRows(newRows)
      setShowTemplateSelectModal(false)
      message.success(formatMessage(scheduleMessages.ArrangeModal.templateApplied))
    },
    [onApplyTemplate, formatMessage],
  )

  const handleDeleteTemplateClick = useCallback(
    async (templateId: string) => {
      if (!onDeleteTemplate) return

      setTemplateDeleteLoading(templateId)
      try {
        await onDeleteTemplate(templateId)
        message.success(formatMessage(scheduleMessages.ArrangeModal.templateDeleted))
      } catch (error) {
        console.error('Failed to delete template:', error)
        message.error('刪除模板失敗')
      } finally {
        setTemplateDeleteLoading(null)
      }
    },
    [onDeleteTemplate, formatMessage],
  )

  const weekdayOptions = [
    { value: 1, label: '週一' },
    { value: 2, label: '週二' },
    { value: 3, label: '週三' },
    { value: 4, label: '週四' },
    { value: 5, label: '週五' },
    { value: 6, label: '週六' },
    { value: 7, label: '週日' },
  ]

  return (
    <>
      <Modal
        title={formatMessage(scheduleMessages.ArrangeModal.title)}
        visible={visible}
        onCancel={handleClose}
        width="80vw"
        footer={[
          <Button key="cancel" onClick={handleClose}>
            {formatMessage(scheduleMessages['*'].cancel)}
          </Button>,
          // Template buttons (multi-row)
          scheduleType === 'personal' && onSaveTemplate && (
            <Button key="saveTemplate" icon={<SaveOutlined />} onClick={handleOpenTemplateSaveModal}>
              {formatMessage(scheduleMessages.ArrangeModal.saveTemplate)}
            </Button>
          ),
          scheduleType === 'personal' && onApplyTemplate && (
            <Button key="applyTemplate" icon={<AppstoreOutlined />} onClick={handleOpenTemplateSelectModal}>
              {formatMessage(scheduleMessages.ArrangeModal.applyTemplate)}
            </Button>
          ),
          <Button key="save" type="primary" onClick={handleSave} disabled={isExceedingLimit}>
            {formatMessage(scheduleMessages['*'].confirm)}
          </Button>,
        ].filter(Boolean)}
      >
        {/* Summary info */}
        {availableMinutes > 0 && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
            <Space>
              <Typography.Text>
                {formatMessage(scheduleMessages.ArrangeModal.totalDuration)}: {totalDuration}{' '}
                {formatMessage(scheduleMessages.ArrangeModal.minutes)}
              </Typography.Text>
              <Typography.Text type="secondary">|</Typography.Text>
              <Typography.Text type={isExceedingLimit ? 'danger' : 'secondary'}>
                {formatMessage(scheduleMessages.ArrangeModal.availableLimit)}: {availableMinutes}{' '}
                {formatMessage(scheduleMessages.ArrangeModal.minutes)}
              </Typography.Text>
            </Space>
          </div>
        )}

        {/* Header Row */}
        <Row gutter={8} style={{ marginBottom: 8, fontWeight: 500, padding: '0 16px' }}>
          <Col span={columnSpans.week}>{formatMessage(scheduleMessages.ArrangeModal.week)}</Col>
          <Col span={columnSpans.duration}>{formatMessage(scheduleMessages.ArrangeModal.duration)}</Col>
          <Col span={columnSpans.start}>{formatMessage(scheduleMessages.ArrangeModal.startTime)}</Col>
          <Col span={columnSpans.material}>{formatMessage(scheduleMessages.ArrangeModal.material)}</Col>
          <Col span={columnSpans.teacher}>{formatMessage(scheduleMessages.ArrangeModal.teacher)}</Col>
          {showClassroom && (
            <Col span={columnSpans.classroom}>{formatMessage(scheduleMessages.ArrangeModal.classroom)}</Col>
          )}
          <Col span={columnSpans.online}>{formatMessage(scheduleMessages.ArrangeModal.needsOnlineRoom)}</Col>
          <Col span={columnSpans.actions}></Col>
        </Row>

        {/* Course Rows */}
        {rows.map(row => {
          const rowErrors = errors[row.id] || []
          const hasError = rowErrors.length > 0
          const endTime = moment(row.startTime).add(row.duration, 'minutes')

          return (
            <StyledFormRow key={row.id} style={{ backgroundColor: hasError ? '#fff2f0' : 'transparent' }}>
              <Row gutter={8} style={{ width: '100%', alignItems: 'flex-start' }}>
                {/* Weekday */}
                <Col span={columnSpans.week}>
                  <Select
                    value={row.weekday}
                    onChange={val => updateRow(row.id, { weekday: val })}
                    size="small"
                    style={{
                      width: '100%',
                      ...(rowErrors.includes('weekday') ? { borderColor: '#ff4d4f' } : {}),
                    }}
                  >
                    {weekdayOptions.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>

                {/* Duration */}
                <Col span={columnSpans.duration}>
                  <Select
                    value={row.duration}
                    onChange={val => handleDurationChange(row.id, val)}
                    size="small"
                    style={{ width: '100%' }}
                  >
                    {DURATION_OPTIONS.map(d => (
                      <Select.Option key={d} value={d}>
                        {d} {formatMessage(scheduleMessages.ArrangeModal.minutes)}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>

                {/* Start Time */}
                <Col span={columnSpans.start}>
                  <TimePicker
                    value={row.startTime}
                    onChange={val => val && updateRow(row.id, { startTime: val })}
                    format="HH:mm"
                    minuteStep={30}
                    size="small"
                    style={{ width: '100%' }}
                    className={rowErrors.includes('startTime') ? 'ant-picker-error' : ''}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    → {endTime.format('HH:mm')}
                  </Typography.Text>
                </Col>

                {/* Material with search */}
                <Col span={columnSpans.material}>
                  <Select
                    value={row.materialType === 'order' ? row.material : row.materialType}
                    onChange={val => {
                      if (val === 'undecided' || val === 'custom') {
                        updateRow(row.id, { materialType: val, material: '' })
                      } else {
                        updateRow(row.id, { materialType: 'order', material: val })
                      }
                    }}
                    size="small"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={false}
                    onSearch={setMaterialSearch}
                    placeholder={formatMessage(scheduleMessages.ArrangeModal.selectMaterial)}
                  >
                    {filteredMaterials.map(m => (
                      <Select.Option key={m} value={m}>
                        {m}
                      </Select.Option>
                    ))}
                    <Select.Option value="undecided">
                      {formatMessage(scheduleMessages.ArrangeModal.materialUndecided)}
                    </Select.Option>
                    <Select.Option value="custom">
                      {formatMessage(scheduleMessages.ArrangeModal.materialCustom)}
                    </Select.Option>
                  </Select>
                  {row.materialType === 'custom' && (
                    <Input
                      value={row.customMaterial}
                      onChange={e => updateRow(row.id, { customMaterial: e.target.value })}
                      placeholder={formatMessage(scheduleMessages.ArrangeModal.enterMaterialName)}
                      size="small"
                      style={{ marginTop: 4 }}
                    />
                  )}
                </Col>

                {/* Teacher */}
                <Col span={columnSpans.teacher}>
                  <Tooltip
                    title={
                      rowErrors.includes('teacherConflict')
                        ? formatMessage(scheduleMessages.ArrangeModal.teacherConflict)
                        : ''
                    }
                    color="red"
                  >
                    <Select
                      value={row.teacherId}
                      onChange={val => updateRow(row.id, { teacherId: val })}
                      size="small"
                      style={{ width: '100%' }}
                      className={rowErrors.includes('teacherConflict') ? 'ant-select-error' : ''}
                      allowClear
                      placeholder={formatMessage(scheduleMessages.ArrangeModal.selectTeacher)}
                    >
                      {selectedTeachers.map(t => (
                        <Select.Option key={t.id} value={t.id}>
                          {t.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Tooltip>
                </Col>

                {showClassroom && (
                  <Col span={columnSpans.classroom}>
                    <Tooltip
                      title={
                        rowErrors.includes('roomConflict')
                          ? formatMessage(scheduleMessages.ArrangeModal.roomConflict)
                          : ''
                      }
                      color="red"
                    >
                      <Select
                        value={row.classroomIds[0] || CLASSROOM_UNASSIGNED}
                        onChange={val => {
                          updateRow(row.id, { classroomIds: [val] })
                        }}
                        size="small"
                        style={{ width: '100%' }}
                        className={rowErrors.includes('roomConflict') ? 'ant-select-error' : ''}
                        placeholder={formatMessage(scheduleMessages.ArrangeModal.selectClassroom)}
                      >
                        <Select.Option value={CLASSROOM_UNASSIGNED}>
                          {formatMessage(scheduleMessages.ArrangeModal.classroomUndecided)}
                        </Select.Option>
                        <Select.Option value={CLASSROOM_EXTERNAL}>
                          {formatMessage(scheduleMessages.ArrangeModal.classroomExternal)}
                        </Select.Option>
                        {/* 根據所選老師過濾教室，多校區時顯示前綴 */}
                        {getFilteredClassrooms(row.teacherId).map(c => (
                          <Select.Option key={c.id} value={c.id}>
                            {shouldShowCampusPrefix(row.teacherId) && c.campusName ? `[${c.campusName}] ` : ''}
                            {c.name} ({c.capacity}人)
                          </Select.Option>
                        ))}
                      </Select>
                    </Tooltip>
                  </Col>
                )}

                {/* Online Room */}
                <Col span={columnSpans.online}>
                  <Radio.Group
                    value={row.needsOnlineRoom}
                    onChange={e => updateRow(row.id, { needsOnlineRoom: e.target.value })}
                    size="small"
                  >
                    <Space direction="vertical" size={0}>
                      <Radio value={true}>{formatMessage(scheduleMessages.ArrangeModal.yes)}</Radio>
                      <Radio value={false}>{formatMessage(scheduleMessages.ArrangeModal.no)}</Radio>
                    </Space>
                  </Radio.Group>
                  {row.needsOnlineRoom && (
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {formatMessage(scheduleMessages.ArrangeModal.onlineRoomHint)}
                    </Typography.Text>
                  )}
                </Col>

                {/* Actions */}
                <Col span={columnSpans.actions}>
                  <Space size={4} direction="vertical">
                    <Space size={4}>
                      <Tooltip title={formatMessage(scheduleMessages.ArrangeModal.addRow)}>
                        <IconButton icon={<PlusOutlined />} size="small" onClick={addRow} />
                      </Tooltip>
                      <Tooltip title={formatMessage(scheduleMessages.ArrangeModal.copyRow)}>
                        <IconButton icon={<CopyOutlined />} size="small" onClick={() => copyRow(row)} />
                      </Tooltip>
                    </Space>
                    {rows.length > 1 && (
                      <Tooltip title={formatMessage(scheduleMessages.ArrangeModal.removeRow)}>
                        <IconButton icon={<DeleteOutlined />} size="small" danger onClick={() => removeRow(row.id)} />
                      </Tooltip>
                    )}
                  </Space>
                </Col>
              </Row>

              {/* Error Messages */}
              {hasError && (
                <div style={{ width: '100%', marginTop: 8 }}>
                  {rowErrors.includes('duplicate') && (
                    <ErrorTag>{formatMessage(scheduleMessages.ArrangeModal.duplicateWarning)}</ErrorTag>
                  )}
                  {rowErrors.includes('studentConflict') && (
                    <ErrorTag>{formatMessage(scheduleMessages.ArrangeModal.studentConflict)}</ErrorTag>
                  )}
                  {rowErrors.includes('teacherConflict') && (
                    <ErrorTag>{formatMessage(scheduleMessages.ArrangeModal.teacherConflict)}</ErrorTag>
                  )}
                  {rowErrors.includes('roomConflict') && (
                    <ErrorTag>{formatMessage(scheduleMessages.ArrangeModal.roomConflict)}</ErrorTag>
                  )}
                </div>
              )}
            </StyledFormRow>
          )
        })}
      </Modal>

      {/* Duration Limit Warning Modal */}
      <WarningModal
        title={formatMessage(scheduleMessages.ArrangeModal.durationWarningTitle)}
        visible={showDurationWarning}
        onCancel={() => setShowDurationWarning(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowDurationWarning(false)}>
            {formatMessage(scheduleMessages['*'].confirm)}
          </Button>,
        ]}
      >
        <Typography.Text>
          {formatMessage(scheduleMessages.ArrangeModal.durationWarningMessage, {
            total: durationWarningTotal ?? totalDuration,
            available: availableMinutes,
          })}
        </Typography.Text>
      </WarningModal>

      {/* Minutes Mismatch Warning Modal */}
      <WarningModal
        title={formatMessage(scheduleMessages.ArrangeModal.minutesMismatchTitle)}
        visible={showMinutesMismatchWarning}
        onCancel={() => setShowMinutesMismatchWarning(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowMinutesMismatchWarning(false)}>
            {formatMessage(scheduleMessages['*'].confirm)}
          </Button>,
        ]}
      >
        <Typography.Text>
          {formatMessage(scheduleMessages.ArrangeModal.minutesMismatchMessage, {
            diff: minutesMismatch,
          })}
        </Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          {formatMessage(scheduleMessages.ArrangeModal.minutesMismatchHint)}
        </Typography.Text>
      </WarningModal>

      {/* Template Select Modal */}
      <Modal
        title={formatMessage(scheduleMessages.ArrangeModal.selectTemplate)}
        visible={showTemplateSelectModal}
        onCancel={() => setShowTemplateSelectModal(false)}
        footer={null}
        width={600}
      >
        {templates.length === 0 ? (
          <Typography.Text type="secondary">{formatMessage(scheduleMessages.ArrangeModal.noTemplate)}</Typography.Text>
        ) : (
          <List
            dataSource={templates}
            renderItem={template => (
              <List.Item
                key={template.id}
                actions={[
                  <Button key="apply" type="primary" size="small" onClick={() => handleApplyTemplateClick(template)}>
                    {formatMessage(scheduleMessages.ArrangeModal.applyTemplate)}
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title={formatMessage(scheduleMessages.ArrangeModal.deleteTemplateConfirm)}
                    onConfirm={() => handleDeleteTemplateClick(template.id)}
                    okText={formatMessage(scheduleMessages['*'].confirm)}
                    cancelText={formatMessage(scheduleMessages['*'].cancel)}
                    overlayInnerStyle={{ padding: 8 }}
                    overlayStyle={{ padding: 8 }}
                  >
                    <Button danger size="small" loading={templateDeleteLoading === template.id}>
                      {formatMessage(scheduleMessages['*'].delete)}
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta title={template.name} />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Template Save Modal */}
      <Modal
        title={formatMessage(scheduleMessages.ArrangeModal.saveTemplate)}
        visible={showTemplateSaveModal}
        onCancel={() => setShowTemplateSaveModal(false)}
        onOk={handleSaveTemplateClick}
        confirmLoading={templateSaveLoading}
        okText={formatMessage(scheduleMessages['*'].save)}
        cancelText={formatMessage(scheduleMessages['*'].cancel)}
      >
        <div style={{ marginBottom: 8 }}>
          <Typography.Text>{formatMessage(scheduleMessages.ArrangeModal.templateName)}</Typography.Text>
        </div>
        <Input
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          placeholder={formatMessage(scheduleMessages.ArrangeModal.templateNamePlaceholder)}
          onPressEnter={handleSaveTemplateClick}
        />
      </Modal>
    </>
  )
}

export default ArrangeCourseModal
