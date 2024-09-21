import { Box, Button, Flex, Spacer, Table, Tbody, Td, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react'
import { EventClickArg, EventInput } from '@fullcalendar/core'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment, { Duration } from 'moment'
import { converge, curry, filter, forEach, head, pipe, tap } from 'ramda'
import React, { useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { FetchedResource } from '../../helpers/eventHelper/eventFetcher.type'
import { DateRanges } from './DateRanges'
import { getActiveEvents, getAvailableEvents } from './eventAdaptor'
import {
  GeneralEventApi,
  ResourceEventsFetcher,
  ResourceGroupEventsFetcher,
  ResourceGroupsWithEvents,
} from './events.type'
import MemberEventAdminModal from './MemberEventAdminModal'

export const MemberEventCalendarBlock: React.FC<{
  defaultResourceEventsFetcher: ResourceEventsFetcher
  invitedResourceEventsFetcher: ResourceGroupEventsFetcher
  createResourceEventFetcher: (payload: { events: Array<GeneralEventApi>; invitedResource: Array<any> }) => any
  updateResourceEventFetcher: (payload: GeneralEventApi) => (event_id: string) => any
  deleteResourceEventFetcher: (deletedAt: Date) => (event_id: string) => any
  defaultMode?: string
  eventPaginationDuration?: Duration
  defaultEventDuration?: Duration
}> = ({
  defaultResourceEventsFetcher,
  invitedResourceEventsFetcher,
  createResourceEventFetcher,
  updateResourceEventFetcher,
  deleteResourceEventFetcher,
  defaultMode = 'default',
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

  const {
    trigger: getInvitedResourceEvents,
    isMutating: isFetchedInvitedResourceEventsLoading,
    data: fetchedInvitedResourceEvents,
    error: invitedResourceEventsError,
  } = useSWRMutation(
    [
      moment().subtract(eventPaginationDuration).startOf('day').toDate(),
      moment().add(eventPaginationDuration).startOf('day').toDate(),
    ],
    ([startedAt, until]) => invitedResourceEventsFetcher({ startedAt, until }),
  )

  const [mode, setMode] = useState<string>('default')

  const [focusedInvitedResource, setFocusedInvitedResource] = useState<FetchedResource | undefined>(undefined)
  const [focusedInvitedResourceEvents, setFocusedInvitedResourceEvents] = useState<Array<GeneralEventApi>>([])

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

  const [invitedResourceEvents, setInvitedResourceEvents] = useState<ResourceGroupsWithEvents | undefined>(undefined)

  const handleDateClick = (info: DateClickArg) => {
    pipe<[Date], { start: Date; end: Date }, { start: Date; end: Date }>(
      generateDefaultModalEvent(duration),
      tap(setModalEvent),
    )(info.date)

    onEventModalOpen()
  }

  const handleEventClick = (info: EventClickArg) => {
    const [targetEvent] = (defaultResourceEvents as Array<GeneralEventApi>).filter(
      event => event?.extendedProps?.event_id === info?.event._def.extendedProps?.event_id,
    )
    setModalEvent(targetEvent)
    onEventModalOpen()
  }

  const handleResourceClick = (resource: FetchedResource) => {
    pipe(
      tap(setFocusedInvitedResource),
      (resource: any) =>
        filter(
          (event: GeneralEventApi) =>
            event?.extendedProps?.temporally_exclusive_resource_id === resource.temporally_exclusive_resource_id,
        )(invitedResourceEvents?.resourceEvents as Array<GeneralEventApi>),
      tap(
        converge(
          forEach((event: GeneralEventApi) => (event.display = 'background')),
          [getAvailableEvents],
        ),
      ),
      tap(
        forEach((event: GeneralEventApi) => {
          event.backgroundColor = 'pink'
          event.borderColor = 'pink'
        }),
      ),
      tap(setFocusedInvitedResourceEvents),
    )(resource)
  }

  console.log('focusedInvitedResource', focusedInvitedResource)

  if (isDefaultResourceEventsLoading || defaultResourceEventsfetchingError) {
    return <></>
  }

  const { resources: defaultResource, resourceEvents: defaultResourceEvents } = fetchedDefaultResourceEvents as {
    resources: Array<FetchedResource>
    resourceEvents: Array<GeneralEventApi>
  }

  const activeEvents = getActiveEvents(defaultResourceEvents as any)

  activeEvents.forEach(event => (event.backgroundColor = 'royalblue'))

  const defaultAvailableEvents = getAvailableEvents(activeEvents as any)

  defaultAvailableEvents.forEach(event => (event.display = 'background'))

  // console.log(101, defaultAvailableEvents)

  const availableDateRangesForDefaultResource = pipe(
    DateRanges.parseFromEvents,
    DateRanges.merge,
  )(defaultAvailableEvents as any)

  // console.log(
  //   156,
  //   availableDateRanges.map(v => v?.toString()),
  // )

  console.log(125, fetchedInvitedResourceEvents)

  const onEventArrange = async () => {
    await getInvitedResourceEvents()
    if (!isFetchedInvitedResourceEventsLoading) {
      setMode('eventArrangement')
      setInvitedResourceEvents(fetchedInvitedResourceEvents)
    }
  }

  const onQuitEventArrange = () => {
    setMode('default')
    setFocusedInvitedResource(undefined)
    setFocusedInvitedResourceEvents([])
  }

  return (
    <Box>
      {mode === 'default' ? (
        <Button onClick={onEventArrange}>管理活動</Button>
      ) : (
        <Button colorScheme="red" onClick={onQuitEventArrange}>
          退出管理
        </Button>
      )}
      <Flex>
        {mode === 'eventArrangement' ? (
          <>
            <Box w="20%">
              <Flex direction="column" justify="center" align="center">
                {invitedResourceEvents?.resourceGroups.map((group, idx, arr) => (
                  <>
                    <Spacer />
                    <Box flex={1} w="90%" h="40%" key={group.permission_group_id}>
                      <Table variant="simple" border="2px solid" padding="5%" marginTop="5vh">
                        <Thead>
                          <Tr>
                            <Th fontSize="1.5em">{group.default_label}</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {invitedResourceEvents.resources
                            .filter(
                              resource =>
                                resource?.permission_group_ids?.includes(group.permission_group_id) &&
                                resource.type === group.type,
                            )
                            .map(resource => (
                              <Tr>
                                <Td
                                  cursor="pointer"
                                  key={resource.temporally_exclusive_resource_id}
                                  onClick={() => handleResourceClick(resource as FetchedResource)}
                                >
                                  <Box
                                    border={
                                      resource.temporally_exclusive_resource_id ===
                                      focusedInvitedResource?.temporally_exclusive_resource_id
                                        ? '1px solid pink'
                                        : ''
                                    }
                                    padding="0.2em"
                                  >
                                    {resource.name}
                                  </Box>
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    </Box>
                    <Spacer />
                  </>
                ))}
              </Flex>
            </Box>
            <Spacer />
          </>
        ) : (
          <></>
        )}
        <Box w="100%">
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
            events={activeEvents.concat(focusedInvitedResourceEvents as any) as EventInput}
          />
        </Box>
        {isEventModalOpen ? (
          <MemberEventAdminModal
            defaultResource={head(defaultResource)}
            isOpen={isEventModalOpen}
            onClose={onEventModalClose}
            focusedEvent={modalEvent}
            isRruleOptional={isRruleOptional}
            refetchResourceEvents={refetchDefaultResourceEvents}
            availableDateRangesForDefaultResource={availableDateRangesForDefaultResource}
            {...{
              createResourceEventFetcher,
              updateResourceEventFetcher,
              deleteResourceEventFetcher,
              focusedInvitedResource,
              setFocusedInvitedResource,
              defaultResourceEvents,
              focusedInvitedResourceEvents,
              invitedResourceEvents,
            }}
          />
        ) : (
          <></>
        )}
      </Flex>
    </Box>
  )
}

export default MemberEventCalendarBlock
