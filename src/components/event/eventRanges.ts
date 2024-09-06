import { ascend, chain, concat, converge, curry, drop, filter, head, identity, init, last, map, pipe, propOr, reduce, Reduced, slice, sort, __ } from 'ramda'

import * as Moment from 'moment'
import { extendMoment, DateRange } from 'moment-range'
import { RRule } from "rrule";

const selfReduce = curry(
    (fn, arr) => converge(reduce(fn) as any, [head, drop(1)])(arr)
)

const moment = extendMoment(Moment)

export class RecurringEvent {
    rrule: RRule
    endTime: Date
    constructor(rrule: RRule, endTime: Date) {
        this.rrule = rrule;
        this.endTime = endTime;
    }
    all(): DateRanges {
        return new DateRanges(
            ...this.rrule.all()
                .map((startTime: Date) => moment.range(startTime, this.endTime))
        )
    }
}

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
    constructor(...args: Array<DateRange | null>) {
        super(...args)
        DateRanges.absolute(this)
    }

    static makeFunctor: (arrayOfDateRange: Array<DateRange | null>) => DateRanges =
        (arrayOfDateRange) => new DateRanges(...arrayOfDateRange)

    static absolute: (dateRanges: DateRanges) => DateRanges = pipe(
        map(absolute),
        DateRanges.makeFunctor
    )

    absolute = DateRanges.absolute(this)

    static trim: (dateRanges: DateRanges) => DateRanges & Array<DateRange> = filter(v => v !== null) as (dateRanges: DateRanges) => DateRanges & Array<DateRange>

    trim = DateRanges.trim(this)

    static ascendStart: (dateRanges: DateRanges) => DateRanges = pipe(
        sort(ascend(propOr(0, 'start'))),
        DateRanges.makeFunctor
    )

    ascendStart = DateRanges.ascendStart(this)

    static mergeTwo = curry(
        (dateRange: DateRange, mergedDateRange: DateRange): DateRanges => DateRanges.makeFunctor(
            dateRange.overlaps(mergedDateRange) ?
                [dateRange.add(mergedDateRange)] : [dateRange, mergedDateRange]
        )
    )

    static tailMerge =
        curry(
            (dateRanges: DateRanges, dateRange: DateRange): DateRanges => pipe(
                converge(
                    concat as (...args: any) => Array<DateRange | null>,
                    [
                        init as (dateRange: Array<DateRange | null>) => Array<DateRange | null>,
                        pipe(
                            last,
                            head,
                            DateRanges.mergeTwo(__)(dateRange)
                        )
                    ]
                ),
                DateRanges.makeFunctor
            )(dateRanges)
        )

    static merge: (dateRanges: DateRanges) => DateRanges = pipe(
        DateRanges.ascendStart,
        DateRanges.trim,
        reduce(DateRanges.tailMerge, new DateRanges())
    )

    merge = pipe(
        concat(this),
        DateRanges.makeFunctor,
        DateRanges.merge
    )

    static selfIntersect: (dateRanges: DateRanges) => DateRanges | null = selfReduce(looseIntersect)

    selfIntersect = DateRanges.selfIntersect(this)

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

    intersect = DateRanges.intersect(this as DateRanges)

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