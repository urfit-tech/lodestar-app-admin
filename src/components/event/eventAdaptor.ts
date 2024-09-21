import { filter, pipe, path, equals, isNil } from 'ramda'
import { RRule, rrulestr, Weekday, WeekdayStr } from 'rrule'
import moment from 'moment'

import { sealIf } from './adaptObject'
import { GeneralEventApi } from "./events.type"

export const getSafeRrule = (rrule: RRule | string): RRule => typeof rrule === 'string' ? rrulestr(rrule) : rrule

export function dateToWeekday(date: Date | null | undefined): Weekday {
    const weekdayKey = moment(date).clone().locale('en').format('dd').toUpperCase() as WeekdayStr
    return RRule[weekdayKey]
}

export const getAvailableEvents: (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
    = filter(
        pipe(
            path(['extendedProps', 'role']) as (event: GeneralEventApi) => string,
            equals('available'),
        )
    )

export const getActiveEvents: (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
    = filter(
        pipe(
            path(['extendedProps', 'event_deleted_at']),
            isNil,
        )
    )