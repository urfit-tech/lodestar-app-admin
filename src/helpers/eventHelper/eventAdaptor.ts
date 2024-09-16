import { EventApi, EventInput } from '@fullcalendar/core'
import moment, { Moment } from 'moment'
import { converge, evolve, identity, invoker, map, chain, pick, pipe, merge, pluck, project, tap, values, concat, keys, ifElse, isNil } from 'ramda'
import { RRule, rrulestr, Weekday, WeekdayStr } from 'rrule'
import { evolveWithSelf, renameKey } from '../../components/event/adaptObject'
import { FetchedResourceEvent, isModalDefaultEventForEditModeAndRecurring } from './eventFetcher.type'

const eventKeysMap: Partial<Record<keyof EventApi, keyof FetchedResourceEvent>> = {
  id: 'event_id',
  start: 'started_at',
  end: 'ended_at',
}

const eventKeysMapForRecurring = {
  ...eventKeysMap,
  startRecur: 'started_at',
  endRecur: 'until',
}

const keysMapSelectorForDefaultResourceEvent: (event: FetchedResourceEvent) => Partial<Record<keyof EventApi, keyof FetchedResourceEvent>>
  = event => event?.rrule ? eventKeysMapForRecurring : eventKeysMap

export function momentToWeekday(moment: Moment): Weekday {
  const weekdayKey = moment.clone().locale('en').format('dd').toUpperCase() as WeekdayStr
  return RRule[weekdayKey]
}

export const parseRRule: (rrule: RRule) => RRule
  = rrule => {
    const adaptedDtstart = moment(rrule.origOptions.dtstart).hour(rrule.origOptions.byhour as number | undefined ?? moment(rrule.origOptions.dtstart).hour()).toDate()
    return new RRule({ ...rrule.origOptions, dtstart: adaptedDtstart })
  }

export const parseRRuleWithTimeZone: (rrule: RRule) => RRule
  = rrule => {
    const adaptedRRule = parseRRule(rrule)
    return new RRule({ ...adaptedRRule.origOptions, tzid: Intl.DateTimeFormat().resolvedOptions().timeZone })
  }

const adaptRrule = (rruleStr: string | null) =>
  isNil(rruleStr) ?
    identity(rruleStr) :
    pipe(
      rrulestr,
      parseRRuleWithTimeZone,
      invoker(0, 'toString')
    )((rruleStr))

const evolveMapForDefaultResourceEvent = {
  title: identity,
  rrule: adaptRrule
}

const getDuration: (resourceEvent: FetchedResourceEvent) => number
  = resourceEvent => {
    const diff = moment(resourceEvent.ended_at).diff(moment(resourceEvent.started_at))
    return diff > 0 ? diff : 3600000
  }

const getExtendedProps: (resourceEvent: FetchedResourceEvent) => Partial<FetchedResourceEvent>
  = pick([
    'description',
    'event_metadata',
    'temporally_exclusive_resource_id',
    'role',
    'is_exclusive',
    'is_attending',
    'published_at',
    'event_deleted_at'
  ])

const evolveMapWithSelfForDefaultResourceEvent = {
  duration: getDuration,
  extendedProps: getExtendedProps
}

export const adaptFetchedResourceEvent: (event: FetchedResourceEvent) => EventApi
  = pipe(
    merge({ duration: undefined, extendedProps: undefined }),
    evolve(evolveMapForDefaultResourceEvent),
    evolveWithSelf(evolveMapWithSelfForDefaultResourceEvent),
    converge(renameKey as any,
      [
        keysMapSelectorForDefaultResourceEvent,
        identity,
      ]
    ) as any,
    tap(_ => console.log(79, _)),
    converge(
      pick as any,
      [
        pipe(
          converge(
            concat,
            [
              pipe(
                keysMapSelectorForDefaultResourceEvent,
                keys,
              ),
              () => chain(keys, [evolveMapForDefaultResourceEvent, evolveMapWithSelfForDefaultResourceEvent]),
            ] as any
          ),
          tap(_ => console.log(104, _))
        ),
        identity
      ]
    ) as any,
    tap(_ => console.log(105, _))
  )

const fetchedEventValuesAdaptorMap = {
  started_at: moment,
  ended_at: moment,
  published_at: moment,
  event_deleted_at: moment,
  rrule: rrulestr,
  until: moment,
}

export const adaptEventToModal = evolve(fetchedEventValuesAdaptorMap)
