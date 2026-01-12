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

const adaptRrule = (rruleStr: string | null): string | null => {
  if (isNil(rruleStr)) {
    return null
  }

  try {
    // Check if the rrule is a JSON object string
    if (rruleStr.trim().startsWith('{')) {
      const rruleObj = JSON.parse(rruleStr)

      // Convert JSON object to RRule options
      const options: any = {}

      // Map FREQ
      if (rruleObj.FREQ) {
        const freqMap: Record<string, number> = {
          'YEARLY': RRule.YEARLY,
          'MONTHLY': RRule.MONTHLY,
          'WEEKLY': RRule.WEEKLY,
          'DAILY': RRule.DAILY,
          'HOURLY': RRule.HOURLY,
          'MINUTELY': RRule.MINUTELY,
          'SECONDLY': RRule.SECONDLY,
        }
        options.freq = freqMap[rruleObj.FREQ]
      }

      // Map BYDAY (weekday)
      if (rruleObj.BYDAY) {
        const dayMap: Record<string, any> = {
          'MO': RRule.MO,
          'TU': RRule.TU,
          'WE': RRule.WE,
          'TH': RRule.TH,
          'FR': RRule.FR,
          'SA': RRule.SA,
          'SU': RRule.SU,
        }
        const days = Array.isArray(rruleObj.BYDAY) ? rruleObj.BYDAY : [rruleObj.BYDAY]
        options.byweekday = days.map((day: string) => dayMap[day]).filter(Boolean)
      }

      // Map DTSTART
      if (rruleObj.DTSTART) {
        options.dtstart = new Date(rruleObj.DTSTART)
      }

      // Map UNTIL - 如果沒有設置 UNTIL，使用 100 年後作為默認值
      // 這是為了讓 FullCalendar 的 rrule 插件能正確展開重複事件
      if (rruleObj.UNTIL) {
        options.until = new Date(rruleObj.UNTIL)
      } else {
        // 默認顯示 100 年內的重複事件（永久重複）
        options.until = moment().add(100, 'year').toDate()
      }

      // Map BYHOUR
      if (rruleObj.BYHOUR !== undefined) {
        options.byhour = Array.isArray(rruleObj.BYHOUR) ? rruleObj.BYHOUR : [rruleObj.BYHOUR]
      }

      // Map BYMINUTE
      if (rruleObj.BYMINUTE !== undefined) {
        options.byminute = Array.isArray(rruleObj.BYMINUTE) ? rruleObj.BYMINUTE : [rruleObj.BYMINUTE]
      }

      const rrule = new RRule(options)
      const adaptedRRule = parseRRuleWithTimeZone(rrule)
      return adaptedRRule.toString()
    }

    // Standard RRule string format
    const parsedRRule = rrulestr(rruleStr)
    const adaptedRRule = parseRRuleWithTimeZone(parsedRRule)

    // 如果沒有 UNTIL，設置默認值（一年後）
    if (!adaptedRRule.origOptions.until) {
      const defaultUntil = moment().add(100, 'year').toDate()
      const optionsWithUntil = { ...adaptedRRule.origOptions, until: defaultUntil }
      return new RRule(optionsWithUntil).toString()
    }

    return adaptedRRule.toString()
  } catch (e) {
    console.error('Failed to parse rrule:', e, 'rruleStr:', rruleStr)
    return null
  }
}

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
    omit(['extendedProps', 'duration', 'role']) as any,
  )