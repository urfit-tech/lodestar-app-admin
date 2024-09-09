import { EventInput } from '@fullcalendar/core'
import moment, { Moment } from 'moment'
import { map, pipe, project } from 'ramda'
import { RRule, rrulestr, Weekday, WeekdayStr } from 'rrule'
import { adaptValue, inertTransform, renameKey } from 'lodestar-app-element/src/helpers/adaptObject'
import { FetchedResourceEvent, isModalDefaultEventForEditModeAndRecurring } from '../../types/event'

const eventKeysMap = {
  id: 'event_id',
  start: 'started_at',
  end: 'ended_at',
}

const eventKeysMapForRecurring = {
  ...eventKeysMap,
  startRecur: 'started_at',
  endRecur: 'until',
}

const keysMapSelector = (event: { [key: string]: any }) => (event?.rrule ? eventKeysMapForRecurring : eventKeysMap)

const localize = (string: string) => moment(string).utc(true)

export function momentToWeekday(moment: Moment): Weekday {
  const weekdayKey = moment.clone().locale('en').format('dd').toUpperCase() as WeekdayStr
  return RRule[weekdayKey]
}

const fetchedEventValuesAdaptorMap: { [K in keyof FetchedResourceEvent]?: Function } = {
  started_at: inertTransform(moment),
  ended_at: inertTransform(moment),
  published_at: inertTransform(moment),
  event_deleted_at: inertTransform(moment),
  rrule: inertTransform(rrulestr),
  until: inertTransform(moment),
}

export const parseRRule = (rrule: RRule) => {
  const adaptedDtstart = moment(rrule.origOptions.dtstart).hour(rrule.origOptions.byhour as number | undefined ?? moment(rrule.origOptions.dtstart).hour()).toDate()
  return new RRule({ ...rrule.origOptions, dtstart: adaptedDtstart })
}

export const parseRRuleWithTimeZone = (rrule: RRule) => {
  const adaptedRRule = parseRRule(rrule)
  return new RRule({ ...adaptedRRule.origOptions, tzid: Intl.DateTimeFormat().resolvedOptions().timeZone })
}

export const adaptEventsToCalendar: (events: Array<FetchedResourceEvent>) => Array<EventInput> = pipe(
  map((event: { [key: string]: any }) => (event ? renameKey(keysMapSelector(event))(event) : undefined)),
  map((event) => {
    if ((event as { rrule?: string | undefined })?.rrule) {
      return {
        ...event,
        rrule: parseRRuleWithTimeZone(rrulestr((event as { rrule: string }).rrule)).toString()
      }
    } return event
  }),
  project(['id', 'title', 'start', 'end', 'rrule', 'duration']),
)

export const adaptEventToModal = adaptValue(fetchedEventValuesAdaptorMap)
