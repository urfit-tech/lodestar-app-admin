import { Box, Button, Flex, Spacer, Table, Tbody, Td, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react'
import { EventClickArg, EventInput } from '@fullcalendar/core'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment, { Duration } from 'moment'
import { andThen, complement, concat, cond, converge, curry, equals, filter, forEach, head, ifElse, includes, isNil, map, pipe, pipeWith, tap } from 'ramda'
import React, { useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { FetchedResource } from '../../helpers/eventHelper/eventFetcher.type'
import { sealIf } from './adaptObject'
import { DateRanges } from './DateRanges'
import { getActiveEvents, getAvailableEvents, getEventsByResource } from './eventAdaptor'
import { ArrangeMode, GeneralEventApi, ResourceEventsFetcher, ResourceGroupEventsFetcher, ResourceGroupsWithEvents } from './events.type'
import MemberEventAdminModal from './MemberEventAdminModal'
import { cloneAvailbleEventWithBackgroundDisplay, cloneWithEventsUnderConditionSetProps } from './stateActions'

export const MemberEventCalendarBlock: React.FC<{
  allowedMode: Array<ArrangeMode>
  defaultMode?: ArrangeMode
  defaultResourceEventsFetcher: ResourceEventsFetcher
  invitedResourceEventsFetcher: ResourceGroupEventsFetcher
  createResourceEventFetcher: (payload: { events: Array<GeneralEventApi>; invitedResource: Array<any> }) => any
  updateResourceEventFetcher: (payload: GeneralEventApi) => (event_id: string) => any
  deleteResourceEventFetcher: (deletedAt: Date) => (event_id: string) => any
  eventPaginationDuration?: Duration
  defaultEventDuration?: Duration
}> = ({
  allowedMode,
  defaultMode = 'default',
  defaultResourceEventsFetcher,
  invitedResourceEventsFetcher,
  createResourceEventFetcher,
  updateResourceEventFetcher,
  deleteResourceEventFetcher,
  eventPaginationDuration = moment.duration(1, 'years'),
  defaultEventDuration = moment.duration(1, 'hours'),
}) => {
    const [mode, setMode] = useState<ArrangeMode>(defaultMode)

    const isModeAllowed: (mode: ArrangeMode) => boolean = mode => includes(mode)(allowedMode)
    const decideModeSafely: (mode: ArrangeMode) => ArrangeMode = sealIf(complement(isModeAllowed), () => 'default')
    const setModeSafely: (mode: ArrangeMode) => void = pipe(decideModeSafely, setMode)

    console.log('mode: ', mode)

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

    const [invitedResources, setInvitedResources] = useState<ResourceGroupsWithEvents | undefined>(undefined)
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

    const modeCond = <F extends Function>(modeFnPair: Array<[ArrangeMode, F]>) =>
      cond(map(([mode, fn]) => [equals(mode), fn])(modeFnPair) as any)

    const handleDateClick = (info: DateClickArg) => {
      const generateDefaultEvent = pipe<[Date], { start: Date; end: Date }, { start: Date; end: Date }>(
        generateDefaultModalEvent(duration),
        tap(setModalEvent),
      )(info.date)

      modeCond([['default', () => generateDefaultEvent]])(mode)

      onEventModalOpen()
    }

    const handleEventClick = (info: EventClickArg) => {
      const [targetEvent] = (defaultResourceEvents as Array<GeneralEventApi>).filter(
        event => event?.extendedProps?.event_id === info?.event._def.extendedProps?.event_id,
      )
      if (info.event._def.ui.display !== 'background') {
        setModalEvent(targetEvent)
        onEventModalOpen()
      }
    }

    const handleResourceClick: (resource: FetchedResource) => void = pipe(
      tap(setFocusedInvitedResource),
      (resource: FetchedResource) =>
        filter(
          (event: GeneralEventApi) =>
            event?.extendedProps?.temporally_exclusive_resource_id === resource?.temporally_exclusive_resource_id,
        )(fetchedInvitedResourceEvents?.resourceEvents as Array<GeneralEventApi>),
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
    )

    const onEventArrange = async () => {
      // await getInvitedResourceEvents()
      setModeSafely('arrange')
    }

    const onQuitEventArrange = () => {
      setModeSafely('default')
      setFocusedInvitedResource(undefined)
      setFocusedInvitedResourceEvents([])
    }

    if (isDefaultResourceEventsLoading || defaultResourceEventsfetchingError) {
      return <></>
    }

    console.log('focusedInvitedResource', focusedInvitedResource)

    const { resources: defaultResource, resourceEvents: defaultResourceEvents } = fetchedDefaultResourceEvents as {
      resources: Array<FetchedResource>
      resourceEvents: Array<GeneralEventApi>
    }

    const activeEvents = getActiveEvents(defaultResourceEvents as any)

    const defaultAvailableEvents = getAvailableEvents(activeEvents as any)

    const availableDateRangesForDefaultResource = pipe(
      DateRanges.parseFromEvents,
      DateRanges.merge,
    )(defaultAvailableEvents as any)

    const renderEventsInDefaultMode: () => Array<GeneralEventApi> = () =>
      pipe<[Array<GeneralEventApi>], Array<GeneralEventApi>, Array<GeneralEventApi>>(
        cloneWithEventsUnderConditionSetProps(() => true)({ backgroundColor: 'royalblue' })('up'),
        getActiveEvents,
      )(defaultResourceEvents)

    // console.log(`fetchedInvitedResourceEvents`, fetchedInvitedResourceEvents)

    const renderEventsInArrangeMode: () => Array<GeneralEventApi> = () =>
      ifElse(
        isNil,
        pipe(tap(pipeWith(andThen, [async () => await getInvitedResourceEvents(), tap(setInvitedResources)])), () => []),
        pipe(
          ifElse(isNil, () => () => [], getEventsByResource)(focusedInvitedResource as any) as any,
          concat(cloneAvailbleEventWithBackgroundDisplay('up')(defaultResourceEvents)) as any,
          getActiveEvents,
        ),
      )(invitedResources?.resourceEvents) as any

    const renderEvents: (mode: ArrangeMode) => Array<GeneralEventApi> = pipe(
      modeCond([
        ['default', renderEventsInDefaultMode],
        ['arrange', renderEventsInArrangeMode],
      ]) as any,
    )

    return (
      <Box>
        {mode === 'arrange' ? (
          <Button colorScheme="red" onClick={onQuitEventArrange}>
            退出管理
          </Button>
        ) : (
          <Button onClick={onEventArrange}>管理活動</Button>
        )}
        <Flex>
          {mode === 'arrange' ? (
            <>
              <Box w="20%">
                <Flex direction="column" justify="center" align="center">
                  {fetchedInvitedResourceEvents?.resourceGroups.map((group, idx, arr) => (
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
                            {fetchedInvitedResourceEvents.resources
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
              events={renderEvents(mode) as Array<EventInput>}
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
              invitedResourceEvents={fetchedInvitedResourceEvents}
              {...{
                createResourceEventFetcher,
                updateResourceEventFetcher,
                deleteResourceEventFetcher,
                focusedInvitedResource,
                setFocusedInvitedResource,
                defaultResourceEvents,
                focusedInvitedResourceEvents,
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
