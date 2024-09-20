import { EventApi } from '@fullcalendar/core'
import moment, { Moment } from 'moment'
import {
  converge, evolve, identity, invoker, map,
  chain, pick, pipe, mergeLeft, prop, pluck, project,
  tap, values, concat, keys, ifElse, isNil, omit, filter,
  path, equals
} from 'ramda'
import { RRule, rrulestr, Weekday, WeekdayStr } from 'rrule'
import { evolveWithSelf, renameKey } from '../../components/event/adaptObject'
import { EventApiWithRRule, GeneralEventApi } from '../../components/event/events.type'
import { EventRequest, FetchedResourceEvent } from './eventFetcher.type'

const eventKeysMap: Partial<Record<keyof EventApi, keyof FetchedResourceEvent>> = {
  id: 'event_id',
  start: 'started_at',
  end: 'ended_at',
}

export function dateToWeekday(date: Date | null | undefined): Weekday {
  const weekdayKey = moment(date).clone().locale('en').format('dd').toUpperCase() as WeekdayStr
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

export const getSafeRrule = (rrule: RRule | string): RRule => typeof rrule === 'string' ? rrulestr(rrule) : rrule

const adaptRrule = (rruleStr: string | null): string =>
  isNil(rruleStr) ?
    identity(rruleStr) :
    pipe(
      rrulestr,
      parseRRuleWithTimeZone,
      invoker(0, 'toString')
    )(rruleStr)

const evolveMapForResourceEvent = {
  title: (titile: string | undefined) => identity(titile),
  until: (until: string | undefined) => identity(until),
  rrule: adaptRrule
}

const getDuration: (resourceEvent: FetchedResourceEvent) => number
  = resourceEvent => {
    const diff = moment(resourceEvent.ended_at).diff(moment(resourceEvent.started_at))
    return diff > 0 ? diff : 3600000
  }

const getExtendedProps: (resourceEvent: FetchedResourceEvent) => Partial<FetchedResourceEvent>
  = pick<Array<keyof FetchedResourceEvent>>([
    'event_id',
    'description',
    'event_metadata',
    'temporally_exclusive_resource_id',
    'role',
    'is_exclusive',
    'is_attending',
    'published_at',
    'event_deleted_at'
  ])

const evolveMapWithSelfForResourceEvent = {
  duration: getDuration,
  extendedProps: getExtendedProps
}

export const adaptFetchedResourceEvent: (event: FetchedResourceEvent) => GeneralEventApi
  = pipe<
    [FetchedResourceEvent],
    FetchedResourceEvent & { duration: undefined, extendedProps: undefined },
    FetchedResourceEvent & { duration: undefined, extendedProps: undefined } & { title: string | undefined, rrule: string },
    FetchedResourceEvent & { duration: undefined, extendedProps: undefined } & { title: string, rrule: string } & { duration: number, extendedProps: Partial<FetchedResourceEvent> },
    Partial<FetchedResourceEvent> & Partial<EventApi>,
    GeneralEventApi
  >(
    mergeLeft({ duration: undefined, extendedProps: undefined }),
    evolve(evolveMapForResourceEvent) as any,
    evolveWithSelf(evolveMapWithSelfForResourceEvent),
    renameKey(eventKeysMap as any) as any,
    pick(
      chain(keys, [eventKeysMap, evolveMapForResourceEvent, evolveMapWithSelfForResourceEvent])
    ) as any,
  )

const keysMapForEventPayload = {
  started_at: 'start',
  ended_at: 'end',
  published_at: 'publishedAt',
  deleted_at: 'deletedAt'
}

export const adaptedEventPayload: (eventPayload: Partial<GeneralEventApi>) => EventRequest
  = pipe<
    [Partial<GeneralEventApi>],
    Partial<GeneralEventApi> & {
      description: string,
      metadata: object,
      publishedAt: Date
      deletedAt: Date
    },
    EventRequest & { extendedProps: object },
    EventRequest
  >(
    converge(
      mergeLeft as any,
      [
        identity,
        prop('extendedProps')
      ]
    ),
    renameKey(keysMapForEventPayload as any) as any,
    omit(['extendedProps']) as any,
  )

export const getAvailableEvents: (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
  = filter(
    pipe(
      path(['extendedProps', 'role']) as (event: GeneralEventApi) => string,
      equals('available')
    ),
  )

export const getActiveEvents: (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
  = filter(pipe(path(['extendedProps', 'event_deleted_at']), isNil))