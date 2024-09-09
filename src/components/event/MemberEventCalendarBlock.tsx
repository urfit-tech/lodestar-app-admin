import { Box, useDisclosure } from '@chakra-ui/react'
import { EventClickArg } from '@fullcalendar/core'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment, { Duration } from 'moment'
import { filter, isNil, pipe, prop, propEq, tap } from 'ramda'
import React, { useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import {
  EventRequest,
  FetchedResource,
  FetchedResourceEvent,
  GeneralModalDefaultEventForEditMode,
  ModalDefaultEventForBasicMode,
  ResourceType,
} from '../../types/event'
import { DateRanges } from './DateRanges'
import { adaptEventsToCalendar, adaptEventToModal } from './eventAdaptor'
import MemberEventAdminModal from './MemberEventAdminModal'

export const MemberEventCalendarBlock: React.FC<{
  memberId: string
  resourceEventsFetcher: (typeTarget: { type: ResourceType; targets: Array<string> }) => (startUntil: {
    startedAt: Date
    until: Date
  }) => {
    resources: Array<FetchedResource>
    resourceEvents: Array<FetchedResourceEvent>
  }
  createResourceFetcher: (payload: { type: ResourceType; target: string }) => any
  createResourceEventFetcher: (payload: { events: Array<EventRequest>; invitedResource: Array<any> }) => any
  updateResourceEventFetcher: (payload: EventRequest) => (event_id: string) => any
  deleteResourceEventFetcher: (deletedAt: Date) => (event_id: string) => any
  eventPaginationDuration?: Duration
  defaultEventDuration?: Duration
}> = ({
  memberId,
  createResourceFetcher,
  resourceEventsFetcher,
  createResourceEventFetcher,
  updateResourceEventFetcher,
  deleteResourceEventFetcher,
  eventPaginationDuration = moment.duration(1, 'years'),
  defaultEventDuration = moment.duration(1, 'hours'),
}) => {
  const {
    data: fetchedResourceEvents,
    isLoading: isResourceEventsLoading,
    error: resourceEventsfetchingError,
    mutate: refetchResourceEvents,
  } = useSWR(
    [
      { type: 'member' as ResourceType, targets: [memberId] },
      {
        startedAt: moment().subtract(eventPaginationDuration).startOf('day').toDate(),
        until: moment().add(eventPaginationDuration).startOf('day').toDate(),
      },
    ],
    ([typeTarget, startUntil]) => resourceEventsFetcher(typeTarget)(startUntil),
  )

  const { trigger: createResourceForMember } = useSWRMutation([memberId], ([memberId]) =>
    createResourceFetcher({ type: 'member', target: memberId }),
  )

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
    const [targetEvent] = (resourceEvents as Array<FetchedResourceEvent>).filter(
      event => event.event_id === info.event.id,
    )
    pipe(adaptEventToModal, tap(setModalEvent))(targetEvent)
    onEventModalOpen()
  }

  if (isResourceEventsLoading || resourceEventsfetchingError) {
    return <></>
  }

  const { resources, resourceEvents } = fetchedResourceEvents as {
    resources: Array<FetchedResource>
    resourceEvents: Array<FetchedResourceEvent>
  }

  if (!resources || resources.length === 0) createResourceForMember()
  const memberResource = filter(propEq('target', memberId))(resources)

  const activeEvents = filter(pipe(prop('event_deleted_at'), isNil))(resourceEvents)
  console.log(123, activeEvents)

  const availableEvents = filter(propEq('role', 'available'))(activeEvents)
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
        events={pipe(
          filter((event: FetchedResourceEvent) => !event.event_deleted_at),
          adaptEventsToCalendar,
        )(resourceEvents)}
      />
      {isEventModalOpen ? (
        <MemberEventAdminModal
          memberId={memberId}
          membersAsResources={memberResource as any}
          isOpen={isEventModalOpen}
          onClose={onEventModalClose}
          focusedEvent={modalEvent}
          isRruleOptional={isRruleOptional}
          refetchResourceEvents={refetchResourceEvents}
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
