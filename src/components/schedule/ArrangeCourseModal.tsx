import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Input, message, Modal, Radio, Row, Select, Space, TimePicker, Tooltip, Typography } from 'antd'
import moment, { Moment } from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  StudentOpenTimeEvent,
  TeacherBusyEvent,
  TeacherOpenTimeEvent,
  useClassrooms,
  useHolidays,
} from '../../hooks/scheduleManagement'
import {
  DEFAULT_DURATION,
  DURATION_OPTIONS,
  Language,
  ScheduleCondition,
  ScheduleEvent,
  ScheduleStatus,
  scheduleStore,
  ScheduleType,
  Teacher,
} from '../../types/schedule'
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
  onClose: () => void
  onSave: (events: Partial<ScheduleEvent>[]) => void
  onSaveTemplate?: (row: CourseRow) => void
  onApplyTemplate?: () => CourseRow | null
  onSaveDraft?: (rows: CourseRow[]) => void // Save draft when closing
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
  teacherOpenTimeEvents = [],
  teacherBusyEvents = [],
  onClose,
  onSave,
  onSaveTemplate,
  onApplyTemplate,
  onSaveDraft,
}) => {
  const { formatMessage } = useIntl()
  const { holidays: defaultExcludeDates } = useHolidays()
  const [rows, setRows] = useState<CourseRow[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [showDurationWarning, setShowDurationWarning] = useState(false)
  const [showMinutesMismatchWarning, setShowMinutesMismatchWarning] = useState(false)
  const [minutesMismatch, setMinutesMismatch] = useState(0)
  const [materialSearch, setMaterialSearch] = useState('')
  type GeneratedEventsResult = { events: Partial<ScheduleEvent>[]; minutesMismatch: number }

  const showClassroom = scheduleType === 'group'
  const { classrooms, loading: classroomsLoading } = useClassrooms(showClassroom ? campus : undefined)
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

  // Filter materials based on search
  const filteredMaterials = useMemo(() => {
    if (!materialSearch) return orderMaterials
    const searchLower = materialSearch.toLowerCase()
    return orderMaterials.filter(m => m.toLowerCase().includes(searchLower))
  }, [orderMaterials, materialSearch])

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
    const clickedHour = date.getHours()
    const clickedMinute = date.getMinutes()
    const defaultStartTime = moment(date)
      .hour(clickedHour || 10)
      .minute(clickedMinute || 0)
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
      teacherNotAvailable: Array<{ date: string; startTime: string; endTime: string; teacherName?: string }>
      studentNotAvailable: Array<{ date: string; startTime: string; endTime: string }>
      scheduleConditionErrors: Array<{ date: string; errorType: string }>
    } = {
      teacherConflicts: [],
      roomConflicts: [],
      studentConflicts: [],
      teacherNotAvailable: [],
      studentNotAvailable: [],
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

    const isWithinEventTime = (
      event: { start: Date; end: Date; rrule?: string },
      rowStartNum: number,
      rowEndNum: number,
      rowWeekday: number,
      rowDateStr: string,
    ): boolean => {
      if (!isEventApplicableOnDate(event, rowWeekday, rowDateStr)) return false

      const eventStartNum = parseInt(moment(event.start).format('HH:mm').replace(':', ''))
      const eventEndNum = parseInt(moment(event.end).format('HH:mm').replace(':', ''))
      return rowStartNum >= eventStartNum && rowEndNum <= eventEndNum
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
      const conflict = scheduleStore.hasConflict(
        dateForRow.toDate(),
        row.startTime.format('HH:mm'),
        endTime.format('HH:mm'),
        row.teacherId,
        assignedIds[0],
        existingEvent?.id,
        studentId,
        assignedIds.length > 0 ? assignedIds : undefined,
      )

      if (conflict.hasTeacherConflict) {
        rowErrors.push('teacherConflict')
        isValid = false
        // Collect teacher conflict details
        conflict.conflictDetails.teacherConflicts.forEach(tc => {
          allConflictDetails.teacherConflicts.push({ date: dateStr, ...tc })
        })
      }

      if (conflict.hasStudentConflict) {
        rowErrors.push('studentConflict')
        isValid = false
        // Collect student conflict details
        conflict.conflictDetails.studentConflicts.forEach(sc => {
          allConflictDetails.studentConflicts.push({ date: dateStr, ...sc })
        })
      }

      if (conflict.hasRoomConflict) {
        rowErrors.push('roomConflict')
        isValid = false
        conflict.conflictDetails.roomConflicts.forEach(rc => {
          allConflictDetails.roomConflicts.push({ date: dateStr, ...rc })
        })
      }

      // Check if selected time is within teacher's open time (if teacher has open time events)
      if (row.teacherId && teacherOpenTimeEvents.length > 0) {
        const teacherEvents = teacherOpenTimeEvents.filter(e => e.teacherId === row.teacherId)

        // Only validate if this teacher has open time events defined
        if (teacherEvents.length > 0) {
          // Check if the row time falls within any of the teacher's open time slots
          const isWithinOpenTime = teacherEvents.some(event =>
            isWithinEventTime(event, rowStartNum, rowEndNum, rowWeekday, dateStr),
          )

          if (!isWithinOpenTime) {
            const selectedTeacher = selectedTeachers.find(t => t.id === row.teacherId)
            rowErrors.push('teacherNotAvailable')
            isValid = false
            allConflictDetails.teacherNotAvailable.push({
              date: dateStr,
              startTime: rowStartTime,
              endTime: rowEndTime,
              teacherName: selectedTeacher?.name,
            })
          }
        }
      }

      // Check conflicts with teacher's existing events (API)
      if (row.teacherId && teacherBusyEvents.length > 0) {
        const busyEvents = teacherBusyEvents.filter(e => e.teacherId === row.teacherId)
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

      // Check if selected time is within student's open time (if open time exists)
      if (studentOpenTimeEvents.length > 0) {
        const openTimeEvents = studentOpenTimeEvents.filter(
          event => event.extendedProps.status === 'open' || event.extendedProps.role === 'available',
        )

        if (openTimeEvents.length > 0) {
          const isWithinStudentOpenTime = openTimeEvents.some(event =>
            isWithinEventTime(event, rowStartNum, rowEndNum, rowWeekday, dateStr),
          )

          if (!isWithinStudentOpenTime) {
            rowErrors.push('studentNotAvailable')
            isValid = false
            allConflictDetails.studentNotAvailable.push({
              date: dateStr,
              startTime: rowStartTime,
              endTime: rowEndTime,
            })
          }
        }
      }

      // Check for conflicts with student's existing events (API)
      if (studentOpenTimeEvents.length > 0) {
        const busyEvents = studentOpenTimeEvents.filter(event => event.extendedProps.status !== 'open')

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
        rowErrors.push('duplicate')
        isValid = false
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
        allConflictDetails.teacherNotAvailable.length > 0 ||
        allConflictDetails.studentNotAvailable.length > 0 ||
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

        if (allConflictDetails.teacherNotAvailable.length > 0) {
          const teacherNotAvailableStr = allConflictDetails.teacherNotAvailable
            .map(c => `${formatConflictTime(c)}${c.teacherName ? ` (${c.teacherName})` : ''}`)
            .join('\n')
          conflictMessages.push(`教師無開放時間：\n${teacherNotAvailableStr}`)
        }

        if (allConflictDetails.studentNotAvailable.length > 0) {
          const studentNotAvailableStr = allConflictDetails.studentNotAvailable.map(formatConflictTime).join('\n')
          conflictMessages.push(`學員無開放時間：\n${studentNotAvailableStr}`)
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
    teacherOpenTimeEvents,
    teacherBusyEvents,
    selectedTeachers,
    scheduleCondition,
    getClassroomState,
  ])

  // Generate repeated events based on schedule condition
  const generateRepeatedEvents = useCallback(
    (baseRows: CourseRow[]): GeneratedEventsResult => {
      const events: Partial<ScheduleEvent>[] = []
      let minutesMismatch = 0

      if (!scheduleCondition) {
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
    [scheduleCondition, scheduleType, campus, language, selectedDate, getClassroomState],
  )

  const handleSave = useCallback(() => {
    if (!validateRows()) {
      // validateRows 內部已經會顯示詳細的錯誤訊息，這裡不需要再顯示通用訊息
      return
    }

    // Check for duration limit
    if (isExceedingLimit) {
      setShowDurationWarning(true)
      return
    }

    // Generate events (with repeat logic if condition exists)
    const { events, minutesMismatch } = generateRepeatedEvents(rows)

    if (minutesMismatch !== 0) {
      setMinutesMismatch(minutesMismatch)
      setShowMinutesMismatchWarning(true)
      return
    }

    onSave(events)
    onClose()
  }, [rows, validateRows, isExceedingLimit, generateRepeatedEvents, onSave, onClose, formatMessage])

  const handleClose = useCallback(() => {
    // Save draft before closing
    if (onSaveDraft && rows.length > 0) {
      onSaveDraft(rows)
    }
    onClose()
  }, [rows, onSaveDraft, onClose])

  const handleSaveTemplate = useCallback(() => {
    if (rows.length > 0 && onSaveTemplate) {
      onSaveTemplate(rows[0])
      message.success(formatMessage(scheduleMessages.ArrangeModal.templateSaved))
    }
  }, [rows, onSaveTemplate, formatMessage])

  const handleApplyTemplate = useCallback(() => {
    if (onApplyTemplate) {
      const template = onApplyTemplate()
      if (template) {
        setRows([
          {
            ...template,
            id: `new-${Date.now()}`,
            startTime: moment(template.startTime),
          },
        ])
      } else {
        message.info(formatMessage(scheduleMessages.ArrangeModal.noTemplate))
      }
    }
  }, [onApplyTemplate, formatMessage])

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
          scheduleType === 'personal' && onSaveTemplate && (
            <Button key="saveTemplate" onClick={handleSaveTemplate}>
              {formatMessage(scheduleMessages.ArrangeModal.saveTemplate)}
            </Button>
          ),
          scheduleType === 'personal' && onApplyTemplate && (
            <Button key="applyTemplate" onClick={handleApplyTemplate}>
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
          const classroomState = getClassroomState(row)
          const dateForRow = moment(selectedDate).isoWeekday(row.weekday)
          const classroomOptions = showClassroom
            ? classrooms.map(room => {
                const conflict = scheduleStore.hasConflict(
                  dateForRow.toDate(),
                  row.startTime.format('HH:mm'),
                  endTime.format('HH:mm'),
                  undefined,
                  room.id,
                  existingEvent?.id,
                )
                return {
                  value: room.id,
                  label: room.name,
                  disabled: conflict.hasRoomConflict,
                }
              })
            : []

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

                {/* Classroom */}
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
                        mode="multiple"
                        value={row.classroomIds}
                        onChange={vals => updateRow(row.id, { classroomIds: normalizeClassroomSelection(vals) })}
                        size="small"
                        style={{ width: '100%' }}
                        className={rowErrors.includes('roomConflict') ? 'ant-select-error' : ''}
                        placeholder={formatMessage(scheduleMessages.ArrangeModal.selectClassroom)}
                        maxTagCount={1}
                        allowClear
                        loading={classroomsLoading}
                      >
                        <Select.Option value={CLASSROOM_UNASSIGNED}>
                          {formatMessage(scheduleMessages.ArrangeModal.classroomUndecided)}
                        </Select.Option>
                        <Select.Option value={CLASSROOM_EXTERNAL}>
                          {formatMessage(scheduleMessages.ArrangeModal.classroomExternal)}
                        </Select.Option>
                        {classroomOptions.map(option => (
                          <Select.Option key={option.value} value={option.value} disabled={option.disabled}>
                            {option.label}
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
                  {rowErrors.includes('teacherNotAvailable') && (
                    <ErrorTag>{formatMessage(scheduleMessages.ArrangeModal.teacherNotAvailable)}</ErrorTag>
                  )}
                  {rowErrors.includes('studentNotAvailable') && (
                    <ErrorTag>{formatMessage(scheduleMessages.ArrangeModal.studentNotAvailable)}</ErrorTag>
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
            total: totalDuration,
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
    </>
  )
}

export default ArrangeCourseModal
