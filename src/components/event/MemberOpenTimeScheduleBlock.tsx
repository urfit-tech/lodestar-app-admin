import { CloseOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { EventClickArg, EventInput } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Button, message, Space, Typography } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { RRule, rrulestr } from 'rrule'
import styled from 'styled-components'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import {
  createEventAndInviteResourceFetcher,
  deleteEvent,
  getDefaultResourceEventsFethcer,
  updateEvent,
} from '../../helpers/eventHelper/eventFetchers'
import memberMessages from '../member/translation'
import DeleteOpenTimeModal from './DeleteOpenTimeModal'
import { getActiveEvents, getAvailableEvents } from './eventAdaptor'
import { GeneralEventApi } from './events.type'
import { DeleteModalInfo, RepeatConfig, WeeklySchedule } from './openTimeSchedule.type'
import {
  compareTimeStrings,
  eventsToWeeklySchedule,
  filterFutureEvents,
  getEventDisplayInfo,
  timeStringToMinutes,
} from './openTimeSchedule.utils'
import OpenTimeSettingsModal from './OpenTimeSettingsModal'

const OPEN_TIME_COLOR = '#C4A35A' // 金色/土黃色

const CalendarWrapper = styled.div`
  .fc {
    height: 100%;
  }

  .fc-timegrid-slot {
    height: 24px;
  }

  .fc-day-today {
    background-color: rgba(196, 163, 90, 0.1) !important;
  }

  .fc-event {
    cursor: pointer;
    border-radius: 4px;
    font-size: 12px;
  }

  .fc-event.delete-mode {
    position: relative;
  }

  .fc-event.delete-mode::after {
    content: '🗑️';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    padding: 4px;
    border-radius: 4px;
  }
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

const ViewButtonGroup = styled.div`
  display: flex;
  gap: 0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
`

const ViewButton = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  border: none;
  background: ${props => (props.$active ? '#1890ff' : 'white')};
  color: ${props => (props.$active ? 'white' : 'inherit')};
  cursor: pointer;
  font-size: 14px;

  &:not(:last-child) {
    border-right: 1px solid #d9d9d9;
  }

  &:hover {
    background: ${props => (props.$active ? '#1890ff' : '#f5f5f5')};
  }
`

interface MemberOpenTimeScheduleBlockProps {
  memberId: string
}

const MemberOpenTimeScheduleBlock: React.FC<MemberOpenTimeScheduleBlockProps> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()

  const calendarRef = useRef<FullCalendar>(null)
  const [viewType, setViewType] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek')

  const [currentDate, setCurrentDate] = useState(new Date())
  const [clickedDate, setClickedDate] = useState<Date | null>(null)

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEvents, setEditingEvents] = useState<GeneralEventApi[] | null>(null)

  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEventForDelete, setSelectedEventForDelete] = useState<DeleteModalInfo | null>(null)

  const sanitizeScheduleForSave = useCallback((schedule: WeeklySchedule) => {
    const conflicts: Array<{ dayLabel: string; timeRange: string }> = []
    const sanitizedSchedule = schedule.map(daySchedule => {
      const sortedSlots = [...daySchedule.slots].sort((a, b) => compareTimeStrings(a.startTime, b.startTime))
      const keptSlots: typeof daySchedule.slots = []
      let lastEndMinutes = -1

      sortedSlots.forEach(slot => {
        const startMinutes = timeStringToMinutes(slot.startTime)
        const endMinutes = timeStringToMinutes(slot.endTime)
        if (startMinutes >= lastEndMinutes) {
          keptSlots.push(slot)
          lastEndMinutes = endMinutes
        } else {
          conflicts.push({
            dayLabel: daySchedule.dayLabel,
            timeRange: `${slot.startTime}-${slot.endTime}`,
          })
        }
      })

      return {
        ...daySchedule,
        slots: keptSlots,
      }
    })

    return { sanitizedSchedule, conflicts }
  }, [])

  const eventPaginationDuration = moment.duration(1, 'years')
  const {
    data: fetchedData,
    isLoading,
    error,
    mutate: refetchEvents,
  } = useSWR(
    authToken
      ? [
          'member-open-time-events',
          memberId,
          moment().subtract(eventPaginationDuration).startOf('day').toDate(),
          moment().add(eventPaginationDuration).startOf('day').toDate(),
        ]
      : null,
    () =>
      getDefaultResourceEventsFethcer(authToken as string)(
        { type: 'member', targets: [memberId] },
        {
          startedAt: moment().subtract(eventPaginationDuration).startOf('day').toDate(),
          until: moment().add(eventPaginationDuration).startOf('day').toDate(),
        },
      ),
  )

  const { trigger: createEvents, isMutating: isCreating } = useSWRMutation(
    'create-open-time-events',
    async (
      _,
      {
        arg,
      }: {
        arg: {
          events: GeneralEventApi[]
          invitedResource: Array<{ temporally_exclusive_resource_id: string; role: string }>
        }
      },
    ) => {
      if (!authToken || !appId) throw new Error('未授權')
      return createEventAndInviteResourceFetcher(authToken)(appId)(arg)
    },
  )

  const { trigger: deleteEventTrigger, isMutating: isDeleting } = useSWRMutation(
    'delete-open-time-event',
    async (_, { arg }: { arg: { eventId: string } }) => {
      if (!authToken) throw new Error('未授權')
      return deleteEvent(authToken)(new Date())(arg.eventId)
    },
  )

  const { trigger: updateEventTrigger } = useSWRMutation(
    'update-open-time-event',
    async (_, { arg }: { arg: { eventId: string; payload: Partial<GeneralEventApi> } }) => {
      if (!authToken) throw new Error('未授權')
      return updateEvent(authToken)(arg.payload)(arg.eventId)
    },
  )

  const openTimeEvents = useMemo(() => {
    if (!fetchedData?.resourceEvents) {
      return []
    }

    const activeEvents = getActiveEvents(fetchedData.resourceEvents as GeneralEventApi[])
    const availableEvents = getAvailableEvents(activeEvents)
    const futureEvents = filterFutureEvents(availableEvents)
    return futureEvents
  }, [fetchedData])

  const calendarEvents: EventInput[] = useMemo(() => {
    const events = openTimeEvents.map(event => ({
      ...event,
      id: event.extendedProps?.event_id || event.id,
      title: event.title || '開放時間',
      backgroundColor: OPEN_TIME_COLOR,
      borderColor: OPEN_TIME_COLOR,
      extendedProps: {
        ...event.extendedProps,
        originalEvent: event,
      },
      classNames: isDeleteMode ? ['delete-mode'] : [],
    }))

    return events
  }, [openTimeEvents, isDeleteMode])

  const handleDateClick = useCallback(
    (info: DateClickArg) => {
      if (isDeleteMode) {
        return // 刪除模式下不開啟設定 Modal
      }

      setClickedDate(info.date)
      setIsSettingsModalOpen(true)
    },
    [isDeleteMode],
  )

  const handleSelect = useCallback(
    (info: { start: Date; end: Date }) => {
      if (isDeleteMode) {
        return
      }

      setClickedDate(info.start)
      setIsSettingsModalOpen(true)
    },
    [isDeleteMode],
  )

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const originalEvent = info.event.extendedProps.originalEvent as GeneralEventApi

      if (isDeleteMode) {
        // 刪除模式：顯示刪除確認對話框
        const { dayLabel, timeRange } = getEventDisplayInfo(originalEvent)

        setSelectedEventForDelete({
          event: originalEvent,
          dayLabel,
          timeRange,
        })
        setIsDeleteModalOpen(true)
      } else {
        // 編輯模式：收集當週所有開放時間事件
        const weekStart = moment(originalEvent.start).startOf('isoWeek')
        const weekEnd = moment(originalEvent.start).endOf('isoWeek')

        // 篩選出當週的所有開放時間事件
        const weekEvents = openTimeEvents.filter(e => {
          const eventDate = moment(e.start)
          return eventDate.isBetween(weekStart, weekEnd, 'day', '[]')
        })

        setEditingEvents(weekEvents)
        setClickedDate(originalEvent.start)
        setIsEditMode(true)
        setIsSettingsModalOpen(true)
      }
    },
    [isDeleteMode, openTimeEvents],
  )

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      if (direction === 'prev') {
        calendarApi.prev()
      } else {
        calendarApi.next()
      }
      setCurrentDate(calendarApi.getDate())
    }
  }, [])

  const goToToday = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.today()
      setCurrentDate(new Date())
    }
  }, [])

  const changeView = useCallback((view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.changeView(view)
      setViewType(view)
    }
  }, [])

  const dateDisplay = useMemo(() => {
    if (viewType === 'dayGridMonth') {
      return moment(currentDate).format('YYYY/MM')
    }
    if (viewType === 'timeGridWeek') {
      const start = moment(currentDate).startOf('isoWeek')
      const end = moment(currentDate).endOf('isoWeek')
      return `${start.format('YYYY/MM/DD')} - ${end.format('MM/DD')}`
    }
    return moment(currentDate).format('YYYY/MM/DD')
  }, [currentDate, viewType])

  const handleSaveOpenTime = useCallback(
    async (schedule: WeeklySchedule, repeatConfig: RepeatConfig, existingEventIds?: string[]) => {
      try {
        if (!fetchedData?.resources?.[0]) {
          message.error('找不到會員資源')
          return
        }

        const resource = fetchedData.resources[0]
        const isEditing = existingEventIds && existingEventIds.length > 0

        // 編輯 -> 先刪除舊事件
        if (isEditing) {
          for (const eventId of existingEventIds) {
            await deleteEventTrigger({ eventId })
          }
        }

        // 將週期時間表轉換為事件
        const events: GeneralEventApi[] = []
        const baseDate = clickedDate || new Date()
        const { sanitizedSchedule, conflicts: internalConflicts } = sanitizeScheduleForSave(schedule)
        const windowStart = moment(baseDate).startOf('day').toDate()
        const windowEnd = moment(baseDate).add(7, 'days').endOf('day').toDate()
        const externalConflicts: Array<{ dayLabel: string; timeRange: string }> = []

        // 編輯模式下不檢查外部衝突（因為舊事件已刪除）
        const existingEvents = isEditing
          ? []
          : fetchedData?.resourceEvents
          ? getAvailableEvents(getActiveEvents(fetchedData.resourceEvents as GeneralEventApi[]))
          : []
        const existingEventRanges = existingEvents.flatMap(event => {
          const durationMs =
            (event as { duration?: number }).duration ?? moment(event.end).diff(moment(event.start), 'milliseconds')
          if ((event as { rrule?: string }).rrule) {
            try {
              const rule = rrulestr((event as { rrule: string }).rrule)
              return rule.between(windowStart, windowEnd, true).map(date => ({
                start: date,
                end: moment(date).add(durationMs, 'milliseconds').toDate(),
              }))
            } catch (error) {
              console.error('Failed to parse rrule for conflict checking:', error)
              return []
            }
          }

          const eventStart = moment(event.start)
          const eventEnd = moment(event.end)
          if (eventEnd.isBefore(windowStart) || eventStart.isAfter(windowEnd)) {
            return []
          }
          return [{ start: eventStart.toDate(), end: eventEnd.toDate() }]
        })

        sanitizedSchedule.forEach(daySchedule => {
          daySchedule.slots.forEach(slot => {
            const currentDay = moment(baseDate).isoWeekday()
            let daysToAdd = daySchedule.dayOfWeek - currentDay
            if (daysToAdd < 0) daysToAdd += 7

            const targetDate = moment(baseDate).add(daysToAdd, 'days')

            const startDate = targetDate
              .clone()
              .hour(parseInt(slot.startTime.split(':')[0]))
              .minute(parseInt(slot.startTime.split(':')[1]))
              .second(0)
              .toDate()

            const endDate = targetDate
              .clone()
              .hour(parseInt(slot.endTime.split(':')[0]))
              .minute(parseInt(slot.endTime.split(':')[1]))
              .second(0)
              .toDate()

            const event: GeneralEventApi = {
              start: startDate,
              end: endDate,
              title: '開放時間',
              extendedProps: {
                description: '',
                metadata: {},
              },
            }

            if (repeatConfig.isWeeklyRepeat) {
              const weekdays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU]
              const rruleWeekday = weekdays[daySchedule.dayOfWeek - 1]

              const rruleOptions: any = {
                freq: RRule.WEEKLY,
                dtstart: moment(startDate).clone().utc(false).toDate(),
                byweekday: [rruleWeekday],
                byhour: moment(startDate).utc(true).hour(),
              }

              if (repeatConfig.repeatUntil) {
                rruleOptions.until = moment(repeatConfig.repeatUntil).clone().utc(false).toDate()
              }

              const rrule = new RRule(rruleOptions)
              ;(event as any).rrule = rrule.toString()
              ;(event as any).duration = moment(endDate).diff(moment(startDate), 'milliseconds')
              if (repeatConfig.repeatUntil) {
                ;(event as any).until = repeatConfig.repeatUntil
              }
            }

            const hasOverlap = existingEventRanges.some(range => startDate < range.end && range.start < endDate)
            if (hasOverlap) {
              externalConflicts.push({
                dayLabel: daySchedule.dayLabel,
                timeRange: `${slot.startTime}-${slot.endTime}`,
              })
              return
            }

            events.push(event)
          })
        })

        const conflicts = [...internalConflicts, ...externalConflicts]
        if (conflicts.length > 0) {
          message.warning(`有時間重疊：${conflicts.map(item => `${item.dayLabel} ${item.timeRange}`).join('、')}`)
        }

        if (events.length === 0) {
          message.warning(conflicts.length > 0 ? '有時間重疊，未新增任何時段' : '請至少設定一個開放時段')
          return
        }

        const result = await createEvents({
          events,
          invitedResource: [
            {
              temporally_exclusive_resource_id: resource.temporally_exclusive_resource_id,
              role: 'available',
            },
          ],
        })

        message.success(isEditing ? '開放時間編輯成功' : '開放時間設定成功')
        setIsSettingsModalOpen(false)
        setEditingEvents(null)
        setIsEditMode(false)

        await refetchEvents()
      } catch (error) {
        console.error('Error saving open time:', error)
        message.error('設定開放時間失敗')
      }
    },
    [clickedDate, fetchedData, createEvents, deleteEventTrigger, refetchEvents, sanitizeScheduleForSave],
  )

  const handleDeleteOpenTime = useCallback(
    async (deleteType: 'thisWeek' | 'untilDate' | 'all', untilDate?: Date) => {
      try {
        if (!selectedEventForDelete) return

        const event = selectedEventForDelete.event
        const eventId = event.extendedProps?.event_id
        if (!eventId) {
          message.error('找不到事件 ID')
          return
        }

        const isRecurring = !!(event as any).rrule
        const resource = fetchedData?.resources?.[0]

        switch (deleteType) {
          case 'thisWeek': {
            if (isRecurring && resource) {
              // 拆分事件策略：
              // 1. 修改原事件的 until 為本週該時段的前一天
              // 2. 建立新的重複事件，從下週開始
              const eventDate = moment(event.start)
              const thisWeekDate = eventDate.clone().startOf('day')
              const previousDay = thisWeekDate.clone().subtract(1, 'day').endOf('day')
              const nextWeekDate = thisWeekDate.clone().add(7, 'days')

              // 解析原始 rrule 取得 until
              let originalUntil: Date | undefined
              try {
                const rule = rrulestr((event as any).rrule)
                originalUntil = rule.origOptions.until as Date | undefined
              } catch (e) {
                console.error('Failed to parse rrule:', e)
              }

              // 更新原事件的 until 為前一天
              const eventMetadata =
                (event.extendedProps?.event_metadata as Record<string, any> | undefined) ||
                (event.extendedProps?.metadata as Record<string, any> | undefined) ||
                {}
              await updateEventTrigger({
                eventId,
                payload: {
                  extendedProps: {
                    metadata: eventMetadata,
                    until: previousDay.toISOString(),
                  },
                } as Partial<GeneralEventApi>,
              })

              // 建立新事件從下週開始（如果原本沒有結束日期或結束日期在下週之後）
              if (!originalUntil || moment(originalUntil).isAfter(nextWeekDate)) {
                const newStartDate = nextWeekDate
                  .clone()
                  .hour(eventDate.hour())
                  .minute(eventDate.minute())
                  .second(0)
                  .toDate()

                const eventEndMoment = moment(event.end)
                const newEndDate = nextWeekDate
                  .clone()
                  .hour(eventEndMoment.hour())
                  .minute(eventEndMoment.minute())
                  .second(0)
                  .toDate()

                // 建立新的 rrule
                const weekdays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU]
                const dayOfWeek = nextWeekDate.isoWeekday()
                const rruleWeekday = weekdays[dayOfWeek - 1]

                const newRruleOptions: any = {
                  freq: RRule.WEEKLY,
                  dtstart: moment(newStartDate).clone().utc(false).toDate(),
                  byweekday: [rruleWeekday],
                  byhour: moment(newStartDate).utc(true).hour(),
                }

                if (originalUntil) {
                  newRruleOptions.until = moment(originalUntil).clone().utc(false).toDate()
                }

                const newRrule = new RRule(newRruleOptions)

                const newEvent: GeneralEventApi = {
                  start: newStartDate,
                  end: newEndDate,
                  title: event.title || '開放時間',
                  extendedProps: {
                    description: '',
                    metadata: {},
                  },
                  rrule: newRrule.toString(),
                  duration: moment(newEndDate).diff(moment(newStartDate), 'milliseconds'),
                } as any

                if (originalUntil) {
                  ;(newEvent as any).until = originalUntil
                }

                await createEvents({
                  events: [newEvent],
                  invitedResource: [
                    {
                      temporally_exclusive_resource_id: resource.temporally_exclusive_resource_id,
                      role: 'available',
                    },
                  ],
                })
              }
            } else {
              await deleteEventTrigger({ eventId })
            }
            break
          }

          case 'untilDate': {
            if (!untilDate) {
              message.error('請選擇日期')
              return
            }

            if (isRecurring) {
              const eventMetadata =
                (event.extendedProps?.event_metadata as Record<string, any> | undefined) ||
                (event.extendedProps?.metadata as Record<string, any> | undefined) ||
                {}
              await updateEventTrigger({
                eventId,
                payload: {
                  extendedProps: {
                    metadata: eventMetadata,
                    until: moment(untilDate).endOf('day').toISOString(),
                  },
                } as Partial<GeneralEventApi>,
              })
            } else {
              await deleteEventTrigger({ eventId })
            }
            break
          }

          case 'all': {
            await deleteEventTrigger({ eventId })
            break
          }
        }

        message.success('開放時間已移除')
        setIsDeleteModalOpen(false)
        setSelectedEventForDelete(null)
        refetchEvents()
      } catch (error) {
        console.error('Error deleting open time:', error)
        message.error('移除開放時間失敗')
      }
    },
    [selectedEventForDelete, fetchedData, deleteEventTrigger, updateEventTrigger, createEvents, refetchEvents],
  )

  if (isLoading) {
    return <div>載入中...</div>
  }

  if (error) {
    return <div>載入失敗：{error.message}</div>
  }

  return (
    <div>
      <PageHeader>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {formatMessage(memberMessages.label.openTimeSettings)}
        </Typography.Title>
        {isDeleteMode ? (
          <Button danger icon={<CloseOutlined />} onClick={() => setIsDeleteMode(false)}>
            {formatMessage(memberMessages.ui.cancelDeleteMode)}
          </Button>
        ) : (
          <Button danger icon={<DeleteOutlined />} onClick={() => setIsDeleteMode(true)}>
            {formatMessage(memberMessages.ui.remove)}
          </Button>
        )}
      </PageHeader>

      <CalendarWrapper>
        <CalendarHeader>
          <ViewButtonGroup>
            <ViewButton $active={viewType === 'dayGridMonth'} onClick={() => changeView('dayGridMonth')}>
              {formatMessage(memberMessages.ui.viewMonth)}
            </ViewButton>
            <ViewButton $active={viewType === 'timeGridWeek'} onClick={() => changeView('timeGridWeek')}>
              {formatMessage(memberMessages.ui.viewWeek)}
            </ViewButton>
            <ViewButton $active={viewType === 'timeGridDay'} onClick={() => changeView('timeGridDay')}>
              {formatMessage(memberMessages.ui.viewDay)}
            </ViewButton>
          </ViewButtonGroup>

          <Space>
            <Button icon={<LeftOutlined />} onClick={() => navigateWeek('prev')} />
            <Button icon={<RightOutlined />} onClick={() => navigateWeek('next')} />
            <Button onClick={goToToday}>{formatMessage(memberMessages.ui.today)}</Button>
          </Space>

          <DateDisplay>{dateDisplay}</DateDisplay>
        </CalendarHeader>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
          initialView="timeGridWeek"
          firstDay={1}
          slotDuration="00:30:00"
          slotMinTime="00:00:00"
          slotMaxTime="23:59:59"
          allDaySlot={false}
          nowIndicator
          headerToolbar={false}
          selectable
          events={calendarEvents}
          dateClick={handleDateClick}
          select={handleSelect}
          eventClick={handleEventClick}
          height="auto"
          dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
          dayHeaderContent={arg => {
            const isToday = moment(arg.date).isSame(new Date(), 'day')
            return (
              <div
                style={{
                  padding: '4px 8px',
                  backgroundColor: isToday ? OPEN_TIME_COLOR : 'transparent',
                  color: isToday ? 'white' : 'inherit',
                  borderRadius: isToday ? '4px' : '0',
                }}
              >
                <div>{moment(arg.date).format('ddd')}</div>
                <div>{moment(arg.date).format('M/D')}</div>
              </div>
            )
          }}
          eventContent={eventInfo => (
            <div style={{ padding: '2px 4px', overflow: 'hidden' }}>
              <Typography.Text ellipsis style={{ color: 'white', fontSize: 11 }}>
                {eventInfo.timeText}
              </Typography.Text>
            </div>
          )}
        />
      </CalendarWrapper>

      <OpenTimeSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false)
          setEditingEvents(null)
          setIsEditMode(false)
        }}
        onSave={handleSaveOpenTime}
        isLoading={isCreating}
        initialSchedule={editingEvents ? eventsToWeeklySchedule(editingEvents).schedule : undefined}
        initialRepeatConfig={editingEvents ? eventsToWeeklySchedule(editingEvents).repeatConfig : undefined}
        isEditMode={isEditMode}
        existingEventIds={editingEvents?.map(e => e.extendedProps?.event_id).filter(Boolean) as string[] | undefined}
      />

      {selectedEventForDelete && (
        <DeleteOpenTimeModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedEventForDelete(null)
          }}
          onConfirm={handleDeleteOpenTime}
          eventInfo={selectedEventForDelete}
          isLoading={isDeleting}
        />
      )}
    </div>
  )
}

export default MemberOpenTimeScheduleBlock
