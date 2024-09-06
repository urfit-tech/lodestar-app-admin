import { ascend, concat, converge, curry, filter, head, map, pipe, propOr, reduce, slice, sort, __ } from 'ramda'

import * as Moment from 'moment'
import { extendMoment, DateRange } from 'moment-range'
import { RRule } from "rrule";

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

export class DateRanges extends Array<DateRange | null>  {

    static makeFunctor: (arrayOfDateRange: Array<DateRange | null>) => DateRanges =
        (arrayOfDateRange) => new DateRanges(...arrayOfDateRange)

    static trim: (dateRanges: DateRanges) => DateRanges & Array<DateRange> = filter(v => v !== null) as (dateRanges: DateRanges) => DateRanges & Array<DateRange>

    trim() {
        return DateRanges.trim(this);
    }

    static absolute: (dateRanges: DateRanges) => DateRanges = pipe(
        map(absolute),
        DateRanges.makeFunctor
    )

    absolute() {
        return DateRanges.absolute(this);
    }

    static ascendStart: (dateRanges: DateRanges) => DateRanges = pipe(
        sort(ascend(propOr(0, 'start'))),
        DateRanges.makeFunctor
    )

    ascendStart() {
        return DateRanges.ascendStart(this);
    }

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
                        slice(0, -1) as (dateRange: Array<DateRange | null>) => Array<DateRange | null>,
                        pipe(
                            slice(-1, -1) as (dateRange: Array<DateRange | null>) => Array<DateRange | null>,
                            head,
                            DateRanges.mergeTwo(__)(dateRange)
                        )
                    ]
                ),
                DateRanges.makeFunctor
            )(dateRanges)
        )

    static merge: (dateRanges: DateRanges) => DateRanges = pipe(
        DateRanges.absolute,
        DateRanges.ascendStart,
        DateRanges.trim,
        reduce(DateRanges.tailMerge, new DateRanges())
    )

    merge = (mergedDateRanges: DateRanges) => DateRanges.merge(DateRanges.makeFunctor(this.concat(mergedDateRanges)))

    intersect(intersectedEventRanges) {
        return EventRanges.merge(
            this.absolute().flatMap((eventRange) =>
                intersectedEventRanges
                    .absolute()
                    .flatMap((intersectedEventRange) =>
                        intersectedEventRange.intersect(eventRange)
                    )
                    .absolute()
            )
        );
    }

    deprive(deprivedEventRanges) {
        return new EventRanges(
            ...this.absolute().flatMap((eventRange) =>
                this.intersect(deprivedEventRanges.absolute())
                    .map(
                        (deprivedEventRange) =>
                            new EventRanges(...eventRange.subtract(deprivedEventRange))
                    )
                    .reduce((result, current) => result.intersect(current))
            )
        );
    }
}