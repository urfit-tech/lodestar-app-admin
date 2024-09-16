import { Box, useDisclosure } from '@chakra-ui/react'
import { EventApi, EventClickArg, EventInput } from '@fullcalendar/core'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment, { Duration } from 'moment'
import { equals, filter, isNil, path, pipe } from 'ramda'
import React, { useState } from 'react'
import useSWR from 'swr'
import {
  EventRequest,
  GeneralModalDefaultEventForEditMode,
  ModalDefaultEventForBasicMode,
} from '../../helpers/eventHelper/eventFetcher.type'
import { DateRanges } from './DateRanges'
import { ResourceEventsFetcher, TemporallyExclusiveResource } from './events.type'
import MemberEventAdminModal from './MemberEventAdminModal'

export const MemberEventCalendarBlock: React.FC<{
  memberId: string
  defaultResourceEventsFetcher: ResourceEventsFetcher
  invitedResourceEventsFetcher?: ResourceEventsFetcher
  createResourceEventFetcher: (payload: { events: Array<EventRequest>; invitedResource: Array<any> }) => any
  updateResourceEventFetcher: (payload: EventRequest) => (event_id: string) => any
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

  type DefaultEvent = ModalDefaultEventForBasicMode | GeneralModalDefaultEventForEditMode

  const [modalEvent, setModalEvent]: [DefaultEvent, React.Dispatch<React.SetStateAction<DefaultEvent>>] = useState({
    started_at: moment(),
    ended_at: moment(),
  })
  const [duration, setDuration] = useState(defaultEventDuration)
  const [isRruleOptional, setIsRruleOptional] = useState(true)

  const handleDateClick = (info: DateClickArg) => {
    const started_at = moment(info.date)
    const ended_at = moment(info.date).clone().add(duration)
    setModalEvent({ started_at, ended_at })
    onEventModalOpen()
  }

  const handleEventClick = (info: EventClickArg) => {
    const [targetEvent] = (defaultResourceEvents as Array<EventApi>).filter(
      event => event.extendedProps.event_id === info.event.id,
    )
    // pipe(adaptEventToModal, tap(setModalEvent))(targetEvent)
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

  const availableDateRanges = pipe(DateRanges.parseFromFetchedEvents, DateRanges.merge)(availableEvents)

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
