import { Box, useDisclosure } from '@chakra-ui/react'
import { EventApi, EventClickArg, EventInput } from '@fullcalendar/core'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment, { Duration } from 'moment'
import { curry, equals, filter, isNil, path, pipe, tap } from 'ramda'
import React, { useState } from 'react'
import useSWR from 'swr'
import { DateRanges } from './DateRanges'
import { GeneralEventApi, ResourceEventsFetcher, TemporallyExclusiveResource } from './events.type'
import MemberEventAdminModal from './MemberEventAdminModal'

export const MemberEventCalendarBlock: React.FC<{
  memberId: string
  defaultResourceEventsFetcher: ResourceEventsFetcher
  invitedResourceEventsFetcher?: ResourceEventsFetcher
  createResourceEventFetcher: (payload: { events: Array<GeneralEventApi>; invitedResource: Array<any> }) => any
  updateResourceEventFetcher: (payload: GeneralEventApi) => (event_id: string) => any
  deleteResourceEventFetcher: (deletedAt: Date) => (event_id: string) => any
  eventPaginationDuration?: Duration
  defaultEventDuration?: Duration
}> = ({
  memberId,
  defaultResourceEventsFetcher,
  invitedResourceEventsFetcher,
  createResourceEventFetcher,
  updateResourceEventFetcher,
  deleteResourceEventFetcher,
  eventPaginationDuration = moment.duration(1, 'years'),
  defaultEventDuration = moment.duration(1, 'hours'),
}) => {
  const {
    data: fetchedDefaultResourceEvents,
    isLoading: isDefaultResourceEventsLoading,
    error: defaultResourceEventsfetchingError,
    mutate: refetchDefaultResourceEvents,
  } = useSWR(
    [
      moment().subtract(eventPaginationDuration).startOf('day').toDate(),
      moment().add(eventPaginationDuration).startOf('day').toDate(),
    ],
    ([startedAt, until]) => defaultResourceEventsFetcher({ startedAt, until }),
  )

  // const { trigger: getInvitedResourceEvents } = useSWRMutation(
  //   [
  //     moment().subtract(eventPaginationDuration).startOf('day').toDate(),
  //     moment().add(eventPaginationDuration).startOf('day').toDate(),
  //   ],
  //   ([startedAt, until]) => invitedResourceEventsFetcher({ startedAt, until })
  // )

  const { isOpen: isEventModalOpen, onOpen: onEventModalOpen, onClose: onEventModalClose } = useDisclosure()

  const generateDefaultModalEvent = curry((duration: Duration | number, date: Date) => ({
    start: date,
    end: moment(date).clone().add(duration).toDate(),
  }))

  const [modalEvent, setModalEvent] = useState<GeneralEventApi>(
    generateDefaultModalEvent(defaultEventDuration)(new Date()),
  )

  const [duration, setDuration] = useState<number | Duration>(defaultEventDuration)
  const [isRruleOptional, setIsRruleOptional] = useState<boolean>(true)

  const handleDateClick = (info: DateClickArg) => {
    pipe<[Date], { start: Date; end: Date }, { start: Date; end: Date }>(
      generateDefaultModalEvent(duration),
      tap(setModalEvent),
    )(info.date)

    onEventModalOpen()
  }

  const handleEventClick = (info: EventClickArg) => {
    const [targetEvent] = (defaultResourceEvents as Array<GeneralEventApi>).filter(event => event.id === info.event.id)
    setModalEvent(targetEvent)
    onEventModalOpen()
  }

  if (isDefaultResourceEventsLoading || defaultResourceEventsfetchingError) {
    return <></>
  }

  const { resources: defaultResource, resourceEvents: defaultResourceEvents } = fetchedDefaultResourceEvents as {
    resources: Array<TemporallyExclusiveResource>
    resourceEvents: Array<EventApi>
  }

  const activeEvents = filter(pipe(path(['extendedProps', 'event_deleted_at']), isNil))(defaultResourceEvents)

  const availableEvents = filter(
    pipe(path(['extendedProps', 'role']) as (event: EventApi) => string, equals('available')),
  )(activeEvents)

  availableEvents.forEach(event => (event.display = 'background'))

  console.log(101, availableEvents)

  const availableDateRanges = pipe(DateRanges.parseFromEvents, DateRanges.merge)(availableEvents as any)

  console.log(
    156,
    availableDateRanges.map(v => v?.toString()),
  )

  return (
    <Box>
      <FullCalendar
        plugins={[rrulePlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        firstDay={1}
        views={{
          timeGridWeek: {
            type: 'timeGridWeek',
          },
        }}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={activeEvents as EventInput}
      />
      {isEventModalOpen ? (
        <MemberEventAdminModal
          memberId={memberId}
          defaultResource={defaultResource as any}
          isOpen={isEventModalOpen}
          onClose={onEventModalClose}
          focusedEvent={modalEvent}
          isRruleOptional={isRruleOptional}
          refetchResourceEvents={refetchDefaultResourceEvents}
          availableDateRanges={availableDateRanges}
          {...{
            createResourceEventFetcher,
            updateResourceEventFetcher,
            deleteResourceEventFetcher,
          }}
        />
      ) : (
        <></>
      )}
    </Box>
  )
}

export default MemberEventCalendarBlock
