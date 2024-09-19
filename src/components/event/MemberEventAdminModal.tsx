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
import moment from 'moment'
import { all, curry, defaultTo, filter, ifElse, isNotNil, map, path, Path, pickAll, pipe, prop } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Frequency, Options, RRule, Weekday, WeekdayStr } from 'rrule'
import useSWRMutation from 'swr/mutation'
import { EventApiWithRRule, GeneralEventApi, isEventApiWithRRule } from '../../components/event/events.type'
import { dateToWeekday, getSafeRrule } from '../../helpers/eventHelper/eventAdaptor'
import { Resource } from '../../helpers/eventHelper/eventFetcher.type'
import { commonMessages } from '../../helpers/translation'
import { DateRanges } from './DateRanges'

const MemberEventAdminModal: React.FC<{
  memberId: string
  defaultResource: Resource
  isOpen: boolean
  onClose: () => void
  focusedEvent: GeneralEventApi
  isRruleOptional: boolean
  refetchResourceEvents: () => void
  createResourceEventFetcher: (payload: { events: Array<GeneralEventApi>; invitedResource: Array<any> }) => any
  updateResourceEventFetcher: (payload: GeneralEventApi) => (event_id: string) => any
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
  console.log(79, focusedEvent)

  const { formatMessage } = useIntl()

  const generateDefaultEventValue: <T>(value: T) => (path: Path) => T = value =>
    pipe<[Path], any, any>(_ => path(_)(focusedEvent), defaultTo(value))

  const [start, setStart] = useState<Date>(focusedEvent.start)
  const [end, setEnd] = useState<Date>(focusedEvent.end)
  const [title, setTitle] = useState(generateDefaultEventValue('')(['title']) as string)
  const [description, setDescription] = useState(
    generateDefaultEventValue('')(['extendedProps', 'description']) as string,
  )
  const [metadata, setMetadata] = useState(generateDefaultEventValue({})(['extendedProps', 'event_metadata']) as object)
  const [publishedAt, setPublishedAt] = useState(
    generateDefaultEventValue(undefined)(['extendedProps', 'published_at']) as Date | undefined,
  )

  // const [sourceType, setSourceType] = useState(
  //   isModalDefaultEventForBasicModeWithSource(focusedEvent) ? focusedEvent.source_type : undefined,
  // )
  // const [sourceTarget, setSourceTarget] = useState(
  //   isModalDefaultEventForBasicModeWithSource(focusedEvent) ? focusedEvent.source_target : undefined,
  // )

  const [isRrulePanelOpen, setIsRrulePanelOpen] = useState(!isRruleOptional || isEventApiWithRRule(focusedEvent))

  const getRruleValueBykey = curry(
    key =>
      pipe<[RRule | string], RRule, Partial<Options[keyof Options]> | undefined>(
        getSafeRrule,
        path(['origOptions', key]),
      ) as (key: keyof Options, rrule: RRule | string) => Partial<Options[keyof Options]> | undefined,
  )

  const getFocusedRecurringEventValueByKey: (key: keyof Options) => Partial<Options[keyof Options]> | undefined = (
    key: keyof Options,
  ) =>
    isEventApiWithRRule(focusedEvent)
      ? pipe<[EventApiWithRRule], RRule | string, RRule, Partial<Options[keyof Options]> | undefined>(
          prop('rrule'),
          getSafeRrule,
          getRruleValueBykey(key),
        )(focusedEvent)
      : undefined

  const [freq, setFreq] = useState<Options['freq'] | undefined>(
    getFocusedRecurringEventValueByKey('freq') as Options['freq'] | undefined,
  )
  const [until, setUntil] = useState<Date | undefined>(getFocusedRecurringEventValueByKey('until') as Date | undefined)
  const [byweekday, setByweekday] = useState<Array<Weekday> | undefined>(
    getFocusedRecurringEventValueByKey('byweekday') as Array<Weekday> | undefined,
  )

  const generateDefaultRrule: (event: GeneralEventApi) => RRule = event =>
    new RRule({
      freq: RRule.WEEKLY,
      until: moment(event.end).toDate(),
      byweekday: [dateToWeekday(event.start as Date)],
    })

  const generateDefaultRruleByEvent: (determinedEvent: GeneralEventApi) => RRule = ifElse(
    isEventApiWithRRule,
    pipe(prop('rrule') as (event: GeneralEventApi) => RRule | string, getSafeRrule),
    generateDefaultRrule,
  )

  const isRrulePanelFinallyOpen = !isRruleOptional || isRrulePanelOpen

  const toggleRrulePanel = () => {
    const getDefaultRruleValueByEventPayload = (key: keyof Options) =>
      pipe(pickAll(['start', 'end', 'rrule']), generateDefaultRruleByEvent, getRruleValueBykey(key))(eventPayload)

    const determineValueByKey = (key: keyof Options) =>
      !isRrulePanelFinallyOpen ? getDefaultRruleValueByEventPayload(key) : undefined

    setFreq(determineValueByKey('freq') as Frequency | undefined)
    setUntil(determineValueByKey('until') as Date | undefined)
    setByweekday(determineValueByKey('byweekday') as Array<Weekday> | undefined)
    setIsRrulePanelOpen(!isRruleOptional || !isRrulePanelOpen)
  }

  const [role, setRole] = useState(generateDefaultEventValue('')(['extendedProps', 'role']) as string)

  const changeEventStart = (targetStart: Date) => {
    const [adaptedStart, adaptedEnd] = map(moment)([targetStart, end])
    if (adaptedStart < adaptedEnd) {
      setStart(targetStart)
      setByweekday([dateToWeekday(targetStart)])
      setEnd(end)
    }
  }

  const changeEventEnd = (targetEndDate: Date) => {
    const [adaptedStart, adaptedEnd] = map(moment)([start, targetEndDate])
    if (adaptedStart < adaptedEnd) {
      setEnd(targetEndDate)
    }
  }

  const isInByweekday = (targetWeekday: Weekday) =>
    byweekday?.filter((weekday: Weekday) => weekday.equals(targetWeekday)).length !== 0

  const switchWeekDay = (targetWeekday: Weekday) => {
    if (!targetWeekday.equals(dateToWeekday(start))) {
      setByweekday(
        isInByweekday(targetWeekday)
          ? byweekday?.filter((weekday: Weekday) => !weekday.equals(targetWeekday))
          : byweekday?.concat(targetWeekday),
      )
    }
  }

  const formatLocalDateTime = (date: Date | undefined) => moment(date)?.format?.('YYYY-MM-DD HH:mm:ss')

  const rrule = all(isNotNil)([freq, until])
    ? {
        rrule: new RRule({
          dtstart: moment(start).clone().utc(false).toDate(),
          freq,
          byweekday,
          byhour: moment(start).utc(true).hour(),
          until: moment(until).clone().utc(false).toDate(),
        }).toString(),
        until,
      }
    : {}

  const eventPayload: GeneralEventApi = {
    start,
    end,
    title,
    extendedProps: {
      description,
      metadata,
      // source_type,
      // source_target,
      publishedAt,
    },
    ...rrule,
  }

  console.log(229, eventPayload)

  const invitedResource = pipe(
    filter((resource: Resource) => resource.target === memberId),
    map((resource: Resource) => ({
      temporally_exclusive_resource_id: resource.id,
      role: role,
    })),
  )(defaultResource)

  const getUnavailableDateRange = () =>
    DateRanges.parseFromEvents([
      { ...eventPayload, duration: moment(eventPayload.end).diff(moment(eventPayload.start)).valueOf() } as any,
    ]).deprive(availableDateRanges)

  console.log(`unavailable daterange:`, getUnavailableDateRange().stringify())

  const { trigger: createEventAndInviteResource } = useSWRMutation(
    [eventPayload, invitedResource],
    ([eventPayload, invitedResource]) => createResourceEventFetcher({ events: [eventPayload], invitedResource } as any),
  )

  const { trigger: updateEvent } = useSWRMutation([eventPayload, focusedEvent.id], ([eventPayload, focusedEventId]) =>
    updateResourceEventFetcher(eventPayload)(focusedEventId as string),
  )

  const { trigger: deleteEvent } = useSWRMutation([new Date(), focusedEvent.id], ([deletedAt, focusedEventId]) =>
    deleteResourceEventFetcher(deletedAt)(focusedEventId as string),
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
            value={formatLocalDateTime(start)}
            onChange={e => changeEventStart(new Date(e.target.value))}
          />
          To
          <Input
            size="md"
            type="datetime-local"
            value={formatLocalDateTime(end)}
            onChange={e => changeEventEnd(new Date(e.target.value))}
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
                  size="md"
                  type="datetime-local"
                  value={formatLocalDateTime(until)}
                  onChange={e => setUntil(new Date(e.target.value))}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </ModalBody>

        <ModalFooter>
          <FetchButton
            fetcher={focusedEvent.id ? updateEvent : createEventAndInviteResource}
            afterFetch={() => {
              onClose()
              refetchResourceEvents()
            }}
            colorScheme={'blue'}
          >
            {focusedEvent.id ? formatMessage(commonMessages.ui.modify) : formatMessage(commonMessages.ui.add)}
          </FetchButton>
          {focusedEvent.id ? (
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
