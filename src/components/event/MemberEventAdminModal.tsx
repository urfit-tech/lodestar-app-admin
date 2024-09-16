import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
} from '@chakra-ui/react'
import { FetchButton } from 'lodestar-app-element/src/components/buttons/FetchButton'
import moment, { Moment } from 'moment'
import { curry, filter, map, pickAll, pipe } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Frequency, Options, RRule, Weekday, WeekdayStr } from 'rrule'
import useSWRMutation from 'swr/mutation'
import { momentToWeekday } from '../../helpers/eventHelper/eventAdaptor'
import {
  EventRequest,
  GeneralModalDefaultEventForEditMode,
  isModalDefaultEventForBasicModeWithSource,
  isModalDefaultEventForEditMode,
  isModalDefaultEventForEditModeAndRecurring,
  ModalDefaultEventForBasicMode,
  ModalDefaultEventForBasicModeWithSource,
  ModalDefaultEventForEditMode,
  Resource,
} from '../../helpers/eventHelper/eventFetcher.type'
import { commonMessages } from '../../helpers/translation'
import { DateRanges } from './DateRanges'

const MemberEventAdminModal: React.FC<{
  memberId: string
  defaultResource: Resource
  isOpen: boolean
  onClose: () => void
  focusedEvent:
    | ModalDefaultEventForBasicMode
    | ModalDefaultEventForBasicModeWithSource
    | GeneralModalDefaultEventForEditMode
  isRruleOptional: boolean
  refetchResourceEvents: () => void
  createResourceEventFetcher: (payload: { events: Array<EventRequest>; invitedResource: Array<any> }) => any
  updateResourceEventFetcher: (payload: EventRequest) => (event_id: string) => any
  deleteResourceEventFetcher: (deletedAt: Date) => (event_id: string) => any
  availableDateRanges: DateRanges
}> = ({
  memberId,
  defaultResource,
  isOpen,
  onClose,
  focusedEvent,
  isRruleOptional,
  refetchResourceEvents,
  createResourceEventFetcher,
  updateResourceEventFetcher,
  deleteResourceEventFetcher,
  availableDateRanges,
}) => {
  const { formatMessage } = useIntl()

  const generateDefaultEventValue = curry(
    <K extends keyof ModalDefaultEventForEditMode>(
      key: K,
      value: ModalDefaultEventForEditMode[K],
    ): ModalDefaultEventForEditMode[K] => (isModalDefaultEventForEditMode(focusedEvent) ? focusedEvent?.[key] : value),
  )

  console.log(focusedEvent)

  const [startTime, setStartTime] = useState(focusedEvent.started_at)
  const [endTime, setEndTime] = useState(focusedEvent.ended_at)
  const [title, setTitle] = useState(generateDefaultEventValue('title')('') as string)
  const [description, setDescription] = useState(generateDefaultEventValue('description')('') as string)
  const [eventMetadata, setEventMetadata] = useState(generateDefaultEventValue('event_metadata')({}) as object)
  const [publishedAt, setPublishedAt] = useState(generateDefaultEventValue('published_at')('') as Moment)

  const [sourceType, setSourceType] = useState(
    isModalDefaultEventForBasicModeWithSource(focusedEvent) ? focusedEvent.source_type : undefined,
  )
  const [sourceTarget, setSourceTarget] = useState(
    isModalDefaultEventForBasicModeWithSource(focusedEvent) ? focusedEvent.source_target : undefined,
  )

  const [isRrulePanelOpen, setIsRrulePanelOpen] = useState(
    !isRruleOptional || isModalDefaultEventForEditModeAndRecurring(focusedEvent),
  )

  const getRruleValueBykey = curry((rrule: RRule, key: keyof Options) => rrule.origOptions[key])

  const getFocusedRecurringEventValueByKey = (key: keyof Options) =>
    isModalDefaultEventForEditModeAndRecurring(focusedEvent) ? getRruleValueBykey(focusedEvent.rrule)(key) : undefined

  const [rruleFreq, setRruleFreq] = useState(getFocusedRecurringEventValueByKey('freq') as Frequency | undefined)
  const [until, setUntil] = useState(
    pipe(getFocusedRecurringEventValueByKey as (key: string) => Date, moment)('until') as Moment | undefined,
  )
  const [byweekday, setByweekday] = useState(
    getFocusedRecurringEventValueByKey('byweekday') as Array<Weekday> | undefined,
  )

  const generateDefaultRruleByEvent = (determinedEvent: {
    started_at: Moment | Date
    ended_at: Moment | Date
    rrule?: RRule
  }): RRule =>
    isModalDefaultEventForEditModeAndRecurring(determinedEvent)
      ? determinedEvent.rrule
      : new RRule({
          freq: RRule.WEEKLY,
          until: moment(determinedEvent.ended_at).toDate(),
          byweekday: [momentToWeekday(moment(determinedEvent.started_at))],
        })

  const isRrulePanelFinallyOpen = !isRruleOptional || isRrulePanelOpen

  const toggleRrulePanel = () => {
    const getDefaultRruleValueByEventPayload = pipe(
      pickAll(['started_at', 'ended_at', 'rrule']),
      generateDefaultRruleByEvent,
      getRruleValueBykey,
    )(eventPayload)

    const determineValueByKey = (key: keyof Options) =>
      !isRrulePanelFinallyOpen ? getDefaultRruleValueByEventPayload(key) : undefined
    setRruleFreq(determineValueByKey('freq') as Frequency | undefined)
    setUntil(pipe(determineValueByKey as (key: string) => Date, moment)('until') as Moment | undefined)
    setByweekday(determineValueByKey('byweekday') as Array<Weekday> | undefined)
    setIsRrulePanelOpen(!isRruleOptional || !isRrulePanelOpen)
  }

  const [role, setRole] = useState(generateDefaultEventValue('role')('') as string)

  const changeEventStartTime = (targetStartTime: Moment) => {
    if (targetStartTime < endTime) {
      setStartTime(targetStartTime)
      setByweekday([momentToWeekday(targetStartTime)])
      setEndTime(targetStartTime)
    }
  }

  const changeEventEndTime = (targetEndDate: Moment) => {
    if (targetEndDate > startTime) {
      setEndTime(targetEndDate)
    }
  }

  const isInByweekday = (targetWeekday: Weekday) =>
    byweekday?.filter((weekday: Weekday) => weekday.equals(targetWeekday)).length !== 0

  const switchWeekDay = (targetWeekday: Weekday) => {
    if (!targetWeekday.equals(momentToWeekday(startTime))) {
      setByweekday(
        isInByweekday(targetWeekday)
          ? byweekday?.filter((weekday: Weekday) => !weekday.equals(targetWeekday))
          : byweekday?.concat(targetWeekday),
      )
    }
  }

  const formatLocalDateTime = (moment: Moment | undefined) => moment?.format?.('YYYY-MM-DD HH:mm:ss')

  console.log(until)

  const rrule = isRrulePanelFinallyOpen
    ? new RRule({
        dtstart: startTime.clone().utc(false).toDate(),
        freq: rruleFreq,
        byweekday,
        byhour: startTime.clone().utc(true).hour(),
        until: (until as Moment).clone().utc(false).toDate(),
      })
    : undefined

  console.log(rrule)

  const eventPayload = {
    ...{
      title,
      description,
      started_at: startTime.toDate(),
      ended_at: endTime.toDate(),
      source_type: sourceType,
      source_target: sourceTarget,
      metadata: eventMetadata,
      published_at: publishedAt?.toDate?.(),
    },
    ...(rrule
      ? {
          rrule: rrule.toString(),
          until: until,
        }
      : {}),
  }

  const invitedResource = pipe(
    filter((resource: Resource) => resource.target === memberId),
    map((resource: Resource) => ({
      temporally_exclusive_resource_id: resource.id,
      role: role,
    })),
  )(defaultResource)

  const getUnavailableDateRange = () =>
    DateRanges.parseFromFetchedEvents([
      { ...eventPayload, duration: moment(eventPayload.ended_at).diff(moment(eventPayload.started_at)) } as any,
    ]).deprive(availableDateRanges)

  console.log(`unavailable daterange: ${getUnavailableDateRange().map(v => v?.toString())}`)

  const { trigger: createEventAndInviteResource } = useSWRMutation(
    [eventPayload, invitedResource],
    ([eventPayload, invitedResource]) => createResourceEventFetcher({ events: [eventPayload], invitedResource } as any),
  )

  const { trigger: updateEvent } = useSWRMutation(
    [eventPayload as EventRequest, (focusedEvent as GeneralModalDefaultEventForEditMode).event_id],
    ([eventPayload, focusedEventId]) => updateResourceEventFetcher(eventPayload)(focusedEventId),
  )

  const { trigger: deleteEvent } = useSWRMutation(
    [new Date(), (focusedEvent as GeneralModalDefaultEventForEditMode).event_id],
    ([deletedAt, focusedEventId]) => deleteResourceEventFetcher(deletedAt)(focusedEventId),
  )

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Select placeholder="角色類別" defaultValue={role} value={role} onChange={e => setRole(e.target.value)}>
            <option value="available">開放時段</option>
            <option value="participant">排課</option>
          </Select>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Title
          <Input size="md" type="text" value={title} onChange={e => setTitle(e.target.value)} />
          Description
          <Textarea size="md" value={description} onChange={e => setDescription(e.target.value)} />
          From
          <Input
            size="md"
            type="datetime-local"
            value={formatLocalDateTime(startTime)}
            onChange={e => changeEventStartTime(moment(new Date(e.target.value)))}
          />
          To
          <Input
            size="md"
            type="datetime-local"
            value={formatLocalDateTime(endTime)}
            onChange={e => changeEventEndTime(moment(new Date(e.target.value)))}
          />
          <Accordion defaultIndex={isRruleOptional ? undefined : [0]} index={isRrulePanelFinallyOpen ? [0] : []}>
            <AccordionItem>
              <AccordionButton onClick={toggleRrulePanel}>
                <Box as="span" textAlign="left">
                  <Checkbox isChecked={isRrulePanelFinallyOpen} onClick={e => e.preventDefault()} /> Rrule
                </Box>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ButtonGroup gap="4">
                  {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(id => {
                    const weekday = RRule[id as WeekdayStr]
                    return (
                      <Button
                        colorScheme={isInByweekday(weekday) ? 'blue' : 'gray'}
                        id={id}
                        key={id}
                        height="2.4em"
                        width="2.4em"
                        borderRadius="1.2em"
                        onClick={() => switchWeekDay(weekday)}
                      >
                        {id}
                      </Button>
                    )
                  })}
                </ButtonGroup>
                <p>Until</p>
                <Input
                  value={formatLocalDateTime(moment(until))}
                  size="md"
                  type="datetime-local"
                  onChange={e => setUntil(moment(e.target.value))}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </ModalBody>

        <ModalFooter>
          <FetchButton
            fetcher={isModalDefaultEventForEditMode(focusedEvent) ? updateEvent : createEventAndInviteResource}
            afterFetch={() => {
              onClose()
              refetchResourceEvents()
            }}
            colorScheme={'blue'}
          >
            {isModalDefaultEventForEditMode(focusedEvent)
              ? formatMessage(commonMessages.ui.modify)
              : formatMessage(commonMessages.ui.add)}
          </FetchButton>
          {isModalDefaultEventForEditMode(focusedEvent) ? (
            <FetchButton
              fetcher={deleteEvent}
              afterFetch={() => {
                onClose()
                refetchResourceEvents()
              }}
              colorScheme={'red'}
            >
              {formatMessage(commonMessages.ui.delete)}
            </FetchButton>
          ) : (
            <></>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MemberEventAdminModal
