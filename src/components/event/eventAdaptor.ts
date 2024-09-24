import { filter, pipe, path, equals, isNil, tap } from 'ramda'
import { RRule, rrulestr, Weekday, WeekdayStr } from 'rrule'
import moment from 'moment'

import { sealIf, sealNil } from './adaptObject'
import { GeneralEventApi } from "./events.type"
import { FetchedResource } from '../../helpers/eventHelper/eventFetcher.type'

export const getSafeRrule = (rrule: RRule | string): RRule => typeof rrule === 'string' ? rrulestr(rrule) : rrule

export function dateToWeekday(date: Date | null | undefined): Weekday {
    const weekdayKey = moment(date).clone().locale('en').format('dd').toUpperCase() as WeekdayStr
    return RRule[weekdayKey]
}

export const isAvailableEvent: (events: GeneralEventApi) => boolean
    = pipe(
        path(['extendedProps', 'role']) as (event: GeneralEventApi) => string,
        equals('available'),
    )

export const getAvailableEvents: (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
    = filter(isAvailableEvent)

export const getActiveEvents: (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
    = filter(
        pipe(
            path(['extendedProps', 'event_deleted_at']),
            isNil,
        )
    )

export const getEventsByResource: (resource: FetchedResource) => (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
    = resource => filter(
        pipe(
            path<string>(['extendedProps', 'temporally_exclusive_resource_id']),
            sealNil(equals(resource?.temporally_exclusive_resource_id))
        )
    )