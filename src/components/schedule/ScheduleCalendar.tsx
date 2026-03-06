import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { EventClickArg, EventInput } from '@fullcalendar/core'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Button, Space, Switch, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  StudentOpenTimeEvent,
  STUDENT_EVENT_COLORS,
  TeacherTimelineEvent,
  TeacherTimelineStatus,
} from '../../hooks/scheduleManagement'
import { getStatusColor, ScheduleEvent, ScheduleType, SCHEDULE_COLORS, Teacher } from '../../types/schedule'
import scheduleMessages from './translation'
import {
  buildScheduleEventIdSet,
  resolveTeacherLayerColor,
  shouldShowStudentLayerEvent,
  shouldShowTeacherLayerEvent,
  StudentLayerStatus,
  StudentStatusVisibility,
  TeacherStatusVisibility,
} from './utils/calendarLayerUtils'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const CalendarWrapper = styled.div`
  .fc {
    width: 100% !important;
  }

  .fc-scrollgrid {
    width: 100% !important;
  }

  .fc-scrollgrid-section > * {
    width: 100% !important;
  }

  .fc-scrollgrid table,
  .fc-col-header,
  .fc-col-header table,
  .fc-timegrid-body,
  .fc-timegrid-body table,
  .fc-timegrid-slots,
  .fc-timegrid-slots table {
    width: 100% !important;
    table-layout: fixed !important;
  }

  .fc-timegrid-slot {
    height: 28px;
  }

  .fc-col-header-cell.today {
    background-color: ${SCHEDULE_COLORS.today};
    color: white;
  }

  .fc-day-today {
    background-color: transparent !important;
  }

  .fc-event {
    cursor: pointer;
    border-radius: 4px;
    font-size: 12px;
  }

  .fc-event.fc-layer-event {
    pointer-events: none;
    cursor: default;
    opacity: 0.9;
  }

  .fc-timegrid-event.fc-layer-event {
    z-index: 1 !important;
  }

  .fc-timegrid-event:not(.fc-layer-event) {
    z-index: 2 !important;
  }

  .fc-event-external::after {
    content: '外';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 10px;
    background: rgba(0, 0, 0, 0.3);
    padding: 1px 3px;
    border-radius: 2px;
  }

  .holiday-slot {
    background-color: #f5f5f5 !important;
  }

  .excluded-slot {
    background-color: #e5e7eb !important;
  }
`

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const DateDisplay = styled.span`
  font-size: 16px;
  font-weight: 500;
`

const TodayButton = styled(Button)<{ $isToday?: boolean }>`
  ${props =>
    props.$isToday &&
    `
    background-color: ${SCHEDULE_COLORS.today};
    color: white;
    border-color: ${SCHEDULE_COLORS.today};

    &:hover {
      background-color: ${SCHEDULE_COLORS.today} !important;
      border-color: ${SCHEDULE_COLORS.today} !important;
      opacity: 0.9;
    }
  `}
`

const TeacherIndicator = styled.span<{ $color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  margin-right: 4px;
`

const STUDENT_STATUS_LABELS: Record<StudentLayerStatus, string> = {
  open: '開放時間',
  scheduled: '已預排',
  published: '已發布',
  template: '固定課表',
}

const TEACHER_STATUS_LABELS: Record<TeacherTimelineStatus, string> = {
  open: '開放時間',
  scheduled: '已預排',
  published: '已發布',
}

const STUDENT_LAYER_STATUSES: StudentLayerStatus[] = ['open', 'scheduled', 'published', 'template']
const TEMPLATE_PLACEHOLDER_ENABLED = false

interface ScheduleCalendarProps {
  scheduleType: ScheduleType
  events: ScheduleEvent[]
  selectedTeachers: Teacher[]
  teacherOpenTimeEvents?: TeacherTimelineEvent[]
  studentOpenTimeEvents?: StudentOpenTimeEvent[]
  studentName?: string
  holidays?: Date[]
  excludedDates?: Date[]
  viewDate?: Date
  unpaidStudentsByEventId?: Record<string, Array<{ name: string; email: string }>>
  onDateClick?: (date: Date) => void
  onEventClick?: (event: ScheduleEvent) => void
  onWeekChange?: (startDate: Date, endDate: Date) => void
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  scheduleType,
  events,
  selectedTeachers,
  teacherOpenTimeEvents = [],
  studentOpenTimeEvents = [],
  studentName,
  holidays = [],
  excludedDates = [],
  viewDate,
  unpaidStudentsByEventId = {},
  onDateClick,
  onEventClick,
  onWeekChange,
}) => {
  const { formatMessage } = useIntl()
  const calendarRef = useRef<FullCalendar>(null)
  const [currentDate, setCurrentDate] = useState(viewDate || new Date())
  const [visibleTeacherIds, setVisibleTeacherIds] = useState<Set<string>>(new Set())
  const [teacherStatusVisibility, setTeacherStatusVisibility] = useState<TeacherStatusVisibility>({
    open: true,
    scheduled: true,
    published: true,
  })
  const [studentStatusVisibility, setStudentStatusVisibility] = useState<StudentStatusVisibility>({
    open: true,
    scheduled: true,
    published: true,
    template: false,
  })

  // Auto-enable open time display for newly selected teachers
  useEffect(() => {
    if (selectedTeachers.length > 0) {
      setVisibleTeacherIds(prev => {
        const next = new Set(prev)
        selectedTeachers.forEach(teacher => {
          if (teacher?.id) {
            next.add(teacher.id)
          }
        })
        return next
      })
    }
  }, [selectedTeachers])

  const scheduleEventIdSet = useMemo(() => buildScheduleEventIdSet(events), [events])

  const calendarEvents: EventInput[] = useMemo(() => {
    const scheduleEventsForCalendar: EventInput[] = events.map(event => {
      const startDateTime = dayjs(event.date)
        .hour(parseInt(event.startTime.split(':')[0]))
        .minute(parseInt(event.startTime.split(':')[1]))
        .toDate()

      const endDateTime = dayjs(event.date)
        .hour(parseInt(event.endTime.split(':')[0]))
        .minute(parseInt(event.endTime.split(':')[1]))
        .toDate()

      const statusColor = getStatusColor(scheduleType, event.status)
      const statusForTeacherLayer: TeacherTimelineStatus | null =
        event.status === 'published' ? 'published' : event.status === 'pre-scheduled' ? 'scheduled' : null
      const isTeacherSelected = Boolean(
        event.teacherId && selectedTeachers.some(teacher => teacher.id === event.teacherId),
      )
      const teacherColor =
        selectedTeachers.length > 0 && statusForTeacherLayer && isTeacherSelected
          ? resolveTeacherLayerColor(selectedTeachers, event.teacherId, statusForTeacherLayer)
          : statusColor

      return {
        id: event.id,
        start: startDateTime,
        end: endDateTime,
        title: event.material || '',
        backgroundColor: selectedTeachers.length > 0 ? teacherColor : statusColor,
        borderColor: selectedTeachers.length > 0 ? teacherColor : statusColor,
        extendedProps: {
          event,
          isExternal: event.isExternal,
          isLayerEvent: false,
        },
        classNames: event.isExternal ? ['fc-event-external'] : [],
      }
    })

    const teacherLayerEvents: EventInput[] = teacherOpenTimeEvents
      .filter(event =>
        shouldShowTeacherLayerEvent(
          {
            teacherId: event.teacherId,
            status: event.extendedProps.status,
            originalEventId: event.extendedProps.originalEventId,
          },
          visibleTeacherIds,
          teacherStatusVisibility,
          scheduleEventIdSet,
        ),
      )
      .map(event => {
        const layerColor = resolveTeacherLayerColor(selectedTeachers, event.teacherId, event.extendedProps.status)
        const eventInput: EventInput = {
          id: event.id,
          start: event.start,
          end: event.end,
          title: event.title,
          backgroundColor: layerColor,
          borderColor: layerColor,
          extendedProps: {
            ...event.extendedProps,
            isLayerEvent: true,
          },
          classNames: ['fc-layer-event', ...(event.extendedProps.isExternal ? ['fc-event-external'] : [])],
        }
        if (event.rrule) {
          eventInput.rrule = event.rrule
        }
        if (event.duration) {
          eventInput.duration = event.duration
        }
        return eventInput
      })

    const studentLayerEvents: EventInput[] = studentOpenTimeEvents
      .filter(event => {
        const status = event.extendedProps.status
        if (!STUDENT_LAYER_STATUSES.includes(status as StudentLayerStatus)) {
          return false
        }
        if (event.extendedProps.originalEventId && scheduleEventIdSet.has(event.extendedProps.originalEventId)) {
          return false
        }
        return shouldShowStudentLayerEvent(
          status as StudentLayerStatus,
          studentStatusVisibility,
          TEMPLATE_PLACEHOLDER_ENABLED,
        )
      })
      .map(event => {
        const eventInput: EventInput = {
          id: event.id,
          start: event.start,
          end: event.end,
          title: event.title,
          backgroundColor: event.backgroundColor,
          borderColor: event.borderColor,
          extendedProps: {
            ...event.extendedProps,
            isLayerEvent: true,
          },
          classNames: ['fc-layer-event', ...(event.extendedProps.isExternal ? ['fc-event-external'] : [])],
        }
        if (event.rrule) {
          eventInput.rrule = event.rrule
        }
        if (event.duration) {
          eventInput.duration = event.duration
        }
        return eventInput
      })

    return [...studentLayerEvents, ...teacherLayerEvents, ...scheduleEventsForCalendar]
  }, [
    events,
    scheduleType,
    selectedTeachers,
    teacherOpenTimeEvents,
    visibleTeacherIds,
    teacherStatusVisibility,
    studentOpenTimeEvents,
    studentStatusVisibility,
    scheduleEventIdSet,
  ])

  useEffect(() => {
    if (!viewDate) return
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.gotoDate(viewDate)
      setCurrentDate(viewDate)
      const startOfWeek = dayjs(viewDate).startOf('week').add(1, 'day').toDate()
      const endOfWeek = dayjs(viewDate).endOf('week').add(1, 'day').toDate()
      onWeekChange?.(startOfWeek, endOfWeek)
    }
  }, [viewDate, onWeekChange])

  // Listen for container/window resize to update calendar size
  useEffect(() => {
    const handleResize = () => {
      calendarRef.current?.getApi().updateSize()
    }
    window.addEventListener('resize', handleResize)
    // Also trigger once after mount to ensure correct initial size
    const timeoutId = setTimeout(handleResize, 100)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const handleDateClick = useCallback(
    (info: DateClickArg) => {
      // Check if the clicked slot is a holiday or excluded date
      const clickedDate = dayjs(info.date)
      const isHoliday = holidays.some(h => dayjs(h).isSame(clickedDate, 'day'))
      const isExcluded = excludedDates.some(d => dayjs(d).isSame(clickedDate, 'day'))

      // Check if there's already an event at this time that's pre-scheduled or published
      const existingEvent = events.find(e => {
        const eventDate = dayjs(e.date)
        if (!eventDate.isSame(clickedDate, 'day')) return false
        if (e.status === 'pending') return false

        const clickedHour = clickedDate.hour()
        const clickedMinute = clickedDate.minute()
        const eventStartHour = parseInt(e.startTime.split(':')[0])
        const eventStartMinute = parseInt(e.startTime.split(':')[1])
        const eventEndHour = parseInt(e.endTime.split(':')[0])
        const eventEndMinute = parseInt(e.endTime.split(':')[1])

        const clickedTime = clickedHour * 60 + clickedMinute
        const eventStart = eventStartHour * 60 + eventStartMinute
        const eventEnd = eventEndHour * 60 + eventEndMinute

        return clickedTime >= eventStart && clickedTime < eventEnd
      })

      if (isHoliday || isExcluded || existingEvent) {
        return // Cannot schedule on this slot
      }

      onDateClick?.(info.date)
    },
    [holidays, excludedDates, events, onDateClick],
  )

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      // Ignore clicks on teacher/student layer events
      if (info.event.extendedProps?.isLayerEvent) {
        return
      }

      const event = info.event.extendedProps.event as ScheduleEvent
      if (!event) {
        return
      }

      onEventClick?.(event)
    },
    [onEventClick],
  )

  const navigateWeek = useCallback(
    (direction: 'prev' | 'next') => {
      const calendarApi = calendarRef.current?.getApi()
      if (calendarApi) {
        if (direction === 'prev') {
          calendarApi.prev()
        } else {
          calendarApi.next()
        }
        const newDate = calendarApi.getDate()
        setCurrentDate(newDate)
        const startOfWeek = dayjs(newDate).startOf('week').add(1, 'day').toDate() // Monday
        const endOfWeek = dayjs(newDate).endOf('week').add(1, 'day').toDate() // Sunday
        onWeekChange?.(startOfWeek, endOfWeek)
      }
    },
    [onWeekChange],
  )

  const goToToday = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.today()
      setCurrentDate(new Date())
      const startOfWeek = dayjs().startOf('week').add(1, 'day').toDate()
      const endOfWeek = dayjs().endOf('week').add(1, 'day').toDate()
      onWeekChange?.(startOfWeek, endOfWeek)
    }
  }, [onWeekChange])

  const isCurrentWeek = useMemo(() => {
    return dayjs(currentDate).isSame(new Date(), 'week')
  }, [currentDate])

  const weekDisplay = useMemo(() => {
    const start = dayjs(currentDate).startOf('week').add(1, 'day')
    const end = dayjs(currentDate).endOf('week').add(1, 'day')
    return `${start.format('YYYY/MM/DD')} - ${end.format('YYYY/MM/DD')}`
  }, [currentDate])

  const studentStatusCounts = useMemo(() => {
    return studentOpenTimeEvents.reduce<Record<StudentLayerStatus, number>>(
      (acc, event) => {
        const status = event.extendedProps.status as StudentLayerStatus
        if (STUDENT_LAYER_STATUSES.includes(status)) {
          acc[status] += 1
        }
        return acc
      },
      { open: 0, scheduled: 0, published: 0, template: 0 },
    )
  }, [studentOpenTimeEvents])

  const teacherStatusCounts = useMemo(() => {
    return teacherOpenTimeEvents.reduce<Record<TeacherTimelineStatus, number>>(
      (acc, event) => {
        acc[event.extendedProps.status] += 1
        return acc
      },
      { open: 0, scheduled: 0, published: 0 },
    )
  }, [teacherOpenTimeEvents])

  const renderEventContent = useCallback(
    (eventInfo: {
      event: { title: string; extendedProps: { event?: ScheduleEvent; isExternal?: boolean; isLayerEvent?: boolean } }
    }) => {
      if (eventInfo.event.extendedProps.isLayerEvent) {
        return null
      }

      const event = eventInfo.event.extendedProps.event
      // Guard against undefined event (should not happen for non-background events)
      if (!event) {
        return null
      }

      const teacher = selectedTeachers.find(t => t.id === event.teacherId)

      const unpaidStudents = unpaidStudentsByEventId[event.id] || []
      const firstUnpaid = unpaidStudents[0]
      const unpaidCount = unpaidStudents.length
      const totalStudents = event.studentIds?.length || 0

      return (
        <Tooltip
          title={
            <div>
              <div>
                {event.startTime} - {event.endTime}
              </div>
              {teacher && <div>{teacher.name}</div>}
              {event.material && <div>{event.material}</div>}
              {unpaidCount > 0 && (
                <div>
                  {formatMessage(scheduleMessages.Calendar.preScheduledStudents)}:{' '}
                  {unpaidStudents.map(s => `${s.name} / ${s.email}`).join(', ')}
                </div>
              )}
              {unpaidCount === 0 && totalStudents > 0 && (
                <div>
                  {formatMessage(scheduleMessages.Calendar.preScheduledStudents)}: {totalStudents}
                </div>
              )}
            </div>
          }
        >
          <div style={{ padding: '2px 4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {unpaidCount > 0 ? (
              <Typography.Text ellipsis style={{ color: 'inherit', fontSize: 11 }}>
                {formatMessage(scheduleMessages.Calendar.preScheduledStudents)}:{' '}
                {firstUnpaid ? `${firstUnpaid.name} / ${firstUnpaid.email}` : '-'}
                {unpaidCount > 1 && ` (${unpaidCount - 1}人)`}
              </Typography.Text>
            ) : (
              <Typography.Text ellipsis style={{ color: 'inherit', fontSize: 11 }}>
                {eventInfo.event.title}
              </Typography.Text>
            )}
          </div>
        </Tooltip>
      )
    },
    [selectedTeachers, formatMessage, unpaidStudentsByEventId],
  )

  return (
    <CalendarWrapper>
      <CalendarHeader>
        <Space>
          <Button icon={<LeftOutlined />} onClick={() => navigateWeek('prev')}>
            {formatMessage(scheduleMessages.Calendar.prevWeek)}
          </Button>
          <TodayButton $isToday={isCurrentWeek} onClick={goToToday}>
            {formatMessage(scheduleMessages.Calendar.backToToday)}
          </TodayButton>
          <Button icon={<RightOutlined />} onClick={() => navigateWeek('next')}>
            {formatMessage(scheduleMessages.Calendar.nextWeek)}
          </Button>
        </Space>
        <DateDisplay>{weekDisplay}</DateDisplay>
        <Space size="large">
          {scheduleType === 'personal' && (
            <Space size="middle">
              <span>{studentName || '學生'}</span>
              {(Object.keys(STUDENT_STATUS_LABELS) as StudentLayerStatus[]).map(status => {
                const color = STUDENT_EVENT_COLORS[status]
                const disabled = status === 'template' ? false : studentStatusCounts[status] === 0
                return (
                  <Space key={`student-${status}`} size={4}>
                    <TeacherIndicator $color={color} />
                    <span>{STUDENT_STATUS_LABELS[status]}</span>
                    <Tooltip
                      title={
                        studentStatusVisibility[status]
                          ? `隱藏${STUDENT_STATUS_LABELS[status]}`
                          : `顯示${STUDENT_STATUS_LABELS[status]}`
                      }
                    >
                      <Switch
                        size="small"
                        checked={studentStatusVisibility[status]}
                        disabled={disabled}
                        onChange={checked =>
                          setStudentStatusVisibility(prev => ({
                            ...prev,
                            [status]: checked,
                          }))
                        }
                        style={{
                          backgroundColor: studentStatusVisibility[status] ? color : undefined,
                        }}
                      />
                    </Tooltip>
                  </Space>
                )
              })}
            </Space>
          )}

          {selectedTeachers.length > 0 && (
            <Space size="middle">
              {(Object.keys(TEACHER_STATUS_LABELS) as TeacherTimelineStatus[]).map(status => {
                const color =
                  status === 'published'
                    ? SCHEDULE_COLORS.teacher.teacher1.dark
                    : status === 'scheduled'
                    ? SCHEDULE_COLORS.teacher.teacher1.medium
                    : SCHEDULE_COLORS.teacher.teacher1.light
                const disabled = teacherStatusCounts[status] === 0
                return (
                  <Space key={`teacher-status-${status}`} size={4}>
                    <TeacherIndicator $color={color} />
                    <span>{TEACHER_STATUS_LABELS[status]}</span>
                    <Tooltip
                      title={
                        teacherStatusVisibility[status]
                          ? `隱藏老師${TEACHER_STATUS_LABELS[status]}`
                          : `顯示老師${TEACHER_STATUS_LABELS[status]}`
                      }
                    >
                      <Switch
                        size="small"
                        checked={teacherStatusVisibility[status]}
                        disabled={disabled}
                        onChange={checked =>
                          setTeacherStatusVisibility(prev => ({
                            ...prev,
                            [status]: checked,
                          }))
                        }
                        style={{
                          backgroundColor: teacherStatusVisibility[status] ? color : undefined,
                        }}
                      />
                    </Tooltip>
                  </Space>
                )
              })}

              {selectedTeachers.map((teacher, index) => {
                const colorKeys = ['teacher1', 'teacher2', 'teacher3'] as const
                const color = SCHEDULE_COLORS.teacher[colorKeys[index]]?.dark || '#64748B'
                const isOpenTimeVisible = visibleTeacherIds.has(teacher.id)
                return (
                  <Space key={teacher.id} size={4}>
                    <TeacherIndicator $color={color} />
                    <span>{teacher.name}</span>
                    <Tooltip title={isOpenTimeVisible ? '隱藏老師色塊' : '顯示老師色塊'}>
                      <Switch
                        size="small"
                        checked={isOpenTimeVisible}
                        onChange={checked => {
                          setVisibleTeacherIds(prev => {
                            const next = new Set(prev)
                            if (checked) {
                              next.add(teacher.id)
                            } else {
                              next.delete(teacher.id)
                            }
                            return next
                          })
                        }}
                        style={{
                          backgroundColor: isOpenTimeVisible ? color : undefined,
                        }}
                      />
                    </Tooltip>
                  </Space>
                )
              })}
            </Space>
          )}
        </Space>
      </CalendarHeader>

      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin, rrulePlugin]}
        initialView="timeGridWeek"
        firstDay={1} // Monday
        slotDuration="00:30:00"
        slotMinTime="00:00:00"
        slotMaxTime="23:59:59"
        scrollTime="08:00:00"
        allDaySlot={false}
        nowIndicator
        headerToolbar={false}
        events={calendarEvents}
        editable={false}
        slotEventOverlap={false}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="auto"
        dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
        dayHeaderContent={arg => {
          const isToday = dayjs(arg.date).isSame(new Date(), 'day')
          return (
            <div
              style={{
                padding: '4px 8px',
                backgroundColor: isToday ? SCHEDULE_COLORS.today : 'transparent',
                color: isToday ? 'white' : 'inherit',
                borderRadius: isToday ? '4px' : '0',
              }}
            >
              <div>{dayjs(arg.date).format('ddd')}</div>
              <div>{dayjs(arg.date).format('M/D')}</div>
            </div>
          )
        }}
        dayCellClassNames={arg => {
          const classes = []
          const cellDate = dayjs(arg.date)
          if (holidays.some(h => dayjs(h).isSame(cellDate, 'day'))) {
            classes.push('holiday-slot')
          }
          if (excludedDates.some(d => dayjs(d).isSame(cellDate, 'day'))) {
            classes.push('excluded-slot')
          }
          return classes
        }}
      />
    </CalendarWrapper>
  )
}

export default ScheduleCalendar
