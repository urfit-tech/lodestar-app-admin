import { ascend, chain, concat, construct, converge, curry, drop, filter, head, identity, init, last, map, pipe, prop, propOr, reduce, Reduced, slice, sort, tap, useWith as rUseWith, __ } from 'ramda'

import * as Moment from 'moment'
import momentTZ from 'moment-timezone';
import { extendMoment, DateRange } from 'moment-range'
import { RRule } from "rrule";

import { parseRRule } from './eventAdaptor'

const selfReduce = curry(
    (fn, arr) => converge(reduce(fn) as any, [head, drop(1)])(arr)
)

const moment = extendMoment(Moment)


export const eventToDateRanges = (payload: {
    startTime: Moment.Moment
    rrule?: RRule
    endTime: Moment.Moment
    duration: number
}) => pipe(
    // map((startTime: Moment.Moment) => momentTZ.utc(startTime.clone()).tz(Intl.DateTimeFormat().resolvedOptions().timeZone)),
    map(
        (startTime: Moment.Moment) => moment.range(
            startTime,
            payload.rrule ? startTime.clone().add(payload.duration) : payload.endTime
        )
    ),
    DateRanges.makeFunctor
)(payload.rrule ? payload.rrule.all().map(v => moment(new Date(v).toJSON().replace('Z', ''))) : [payload.startTime])

const absolute = (dateRange: DateRange | null) =>
    dateRange === null || dateRange.start <= dateRange.end
        ? dateRange
        : moment.range(dateRange.end, dateRange.start)

const looseIntersect = curry(
    (
        dateRange: DateRange | null,
        intersectedDateRange: DateRange | null
    ): DateRange | null => (dateRange === null || intersectedDateRange === null) ?
            null :
            dateRange.intersect(intersectedDateRange)
)
export class DateRanges extends Array<DateRange | null>  {

    static makeFunctor: (arrayOfDateRange: Array<DateRange | null>) => DateRanges =
        (arrayOfDateRange) => new DateRanges(...arrayOfDateRange)

    static absolute: (dateRanges: DateRanges) => DateRanges = map(absolute) as any

    absolute = () => DateRanges.absolute(this)

    static trim: (dateRanges: DateRanges) => DateRanges & Array<DateRange> = filter(v => v !== null) as (dateRanges: DateRanges) => DateRanges & Array<DateRange>

    trim = () => DateRanges.trim(this)

    static ascendStart: (dateRanges: DateRanges) => DateRanges = pipe(
        sort(ascend(propOr(0, 'start'))),
        DateRanges.makeFunctor
    )

    ascendStart = () => DateRanges.ascendStart(this)

    static mergeTwo = curry(
        (dateRange: DateRange, mergedDateRange: DateRange): DateRanges => {
            console.log(65, dateRange.toString(), mergedDateRange.toString(), dateRange.overlaps(mergedDateRange, { adjacent: true }))
            return DateRanges.makeFunctor(
                dateRange.overlaps(mergedDateRange, { adjacent: true }) ?
                    [dateRange.add(mergedDateRange, { adjacent: true })] : [dateRange, mergedDateRange]
            )
        }
    )

    static tailMerge =
        curry(
            (dateRanges: DateRanges, dateRange: DateRange): DateRanges => pipe(
                converge(
                    concat as (...args: any) => Array<DateRange | null>,
                    [
                        pipe(
                            init as (dateRange: Array<DateRange | null>) => Array<DateRange | null>,
                        ),
                        pipe(
                            last,
                            (tail: DateRange) => DateRanges.mergeTwo(tail)(dateRange),
                        )
                    ]
                ),
                DateRanges.makeFunctor
            )(dateRanges)
        )

    static merge: (dateRanges: DateRanges) => DateRanges = pipe(
        DateRanges.ascendStart,
        DateRanges.trim,
        converge(reduce(DateRanges.tailMerge as any) as any, [pipe(head, (v: DateRange) => new DateRanges(v)), pipe(drop(1))])
    )

    merge = () => pipe(
        concat(this),
        DateRanges.makeFunctor,
        DateRanges.merge
    )

    static selfIntersect: (dateRanges: DateRanges) => DateRanges | null = selfReduce(looseIntersect)

    selfIntersect = () => DateRanges.selfIntersect(this)

    static intersectDateRange = curry(
        (dateRanges: DateRanges, intersecteDateRange: DateRange) => pipe(
            map(looseIntersect(intersecteDateRange)),
            DateRanges.selfIntersect
        )(dateRanges)
    )

    static intersect = curry(
        (dateRanges: DateRanges, intersecteDateRanges: DateRanges): DateRanges => pipe(
            DateRanges.trim,
            map(DateRanges.intersectDateRange(intersecteDateRanges)),
            DateRanges.makeFunctor,
            DateRanges.merge
        )(dateRanges)
    )

    intersect = () => DateRanges.intersect(this as DateRanges)

    static depriveFromDateRange = curry(
        (dateRanges: DateRanges, deprivedDateRange: DateRange) => pipe(
            DateRanges.trim,
            map(
                pipe(
                    deprivedDateRange.subtract,
                    DateRanges.makeFunctor
                )
            ),
            selfReduce(DateRanges.intersect)
        )(dateRanges)
    )

    static deprive = curry(
        (dateRanges: DateRanges, deprivedDateRanges: DateRanges): DateRanges => pipe(
            DateRanges.trim,
            chain(DateRanges.depriveFromDateRange(deprivedDateRanges)),
            DateRanges.makeFunctor,
            DateRanges.merge
        )(dateRanges)
    )

}