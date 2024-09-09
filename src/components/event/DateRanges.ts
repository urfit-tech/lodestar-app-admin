import { ascend, chain, concat, converge, curry, drop, evolve, filter, head, identity, init, invoker, last, map, pipe, project, propOr, reduce, sort, tap, __ } from 'ramda'

import * as Moment from 'moment'
import { extendMoment, DateRange } from 'moment-range'
import { RRule, rrulestr } from "rrule";

import { FetchedResourceEvent } from '../../types/event';
import { inertTransform, renameKey } from 'lodestar-app-element/src/helpers/adaptObject';

const selfReduce = curry(
    (fn, arr) => converge(reduce(fn) as any, [head, drop(1)])(arr)
)

const moment = extendMoment(Moment)

const stripeTimeZone = (dateString: string | Date): string => new Date(dateString).toJSON().replace('Z', '')

export const eventToDateRanges = (payload: {
    startTime: Moment.Moment
    rrule?: RRule
    endTime: Moment.Moment
    duration: number
}) => pipe(
    map(
        (startTime: Moment.Moment) => moment.range(
            startTime,
            payload.rrule ? startTime.clone().add(payload.duration) : payload.endTime
        )
    ),
    DateRanges.makeFunctor
)(payload.rrule ? map(pipe(stripeTimeZone, moment))(payload.rrule.all()) : [payload.startTime])

const absolute = (dateRange: DateRange | null) =>
    dateRange === null || dateRange.start <= dateRange.end
        ? dateRange
        : moment.range(dateRange.end, dateRange.start)

const looseIntersect = curry(
    (
        dateRange: DateRange | null,
        intersectedDateRange: DateRange | null
    ): DateRange | null => (!dateRange || !intersectedDateRange) ?
            null :
            dateRange.intersect(intersectedDateRange)
)
export class DateRanges extends Array<DateRange | null>  {

    static makeFunctor: (arrayOfDateRange: Array<DateRange | null> | null) => DateRanges =
        (arrayOfDateRange) => arrayOfDateRange === null ? new DateRanges(null) : new DateRanges(...(arrayOfDateRange as Array<DateRange | null>))

    static parseFromFetchedEvents: (events: Array<FetchedResourceEvent>) => DateRanges = pipe(
        project(['started_at', 'ended_at', 'rrule', 'duration']) as (events: Array<FetchedResourceEvent>) => Array<{
            started_at: string
            ended_at: string
            rrule: string
            duration: number
        }>,
        chain(
            pipe(
                renameKey({
                    startTime: 'started_at',
                    endTime: 'ended_at',
                }) as (payload: { started_at: string; ended_at: string; rrule: string }) => {
                    startTime: string
                    endTime: string
                    rrule: string
                },
                evolve({
                    startTime: inertTransform(moment),
                    endTime: inertTransform(moment),
                    rrule: str => (str ? rrulestr(str) : undefined),
                    duration: identity,
                }) as any,
                eventToDateRanges,
            ),
        ),
        DateRanges.makeFunctor
    )

    stringify = (): Array<string | null> => this.map((dateRange: DateRange | null) => dateRange ? dateRange.toString() : null)

    static absolute: (dateRanges: DateRanges) => DateRanges = map(absolute) as any

    absolute = () => DateRanges.absolute(this)

    static trim: (dateRanges: DateRanges) => DateRanges & Array<DateRange> = pipe(
        filter(v => !!v),
        DateRanges.makeFunctor
    ) as (dateRanges: DateRanges) => DateRanges & Array<DateRange>

    trim = () => DateRanges.trim(this)

    static ascendStart: (dateRanges: DateRanges) => DateRanges = pipe(
        sort(ascend(propOr(0, 'start'))),
        DateRanges.makeFunctor
    )

    ascendStart = () => DateRanges.ascendStart(this)

    static mergeTwo = curry(
        (dateRange: DateRange, mergedDateRange: DateRange): DateRanges => DateRanges.makeFunctor(
            dateRange.overlaps(mergedDateRange, { adjacent: true }) ?
                [dateRange.add(mergedDateRange, { adjacent: true })] : [dateRange, mergedDateRange]
        )
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
        (dateRanges: DateRanges, intersecteDateRange: DateRange | null) => pipe(
            chain(looseIntersect(intersecteDateRange as any)),
            DateRanges.makeFunctor,
        )(dateRanges)
    )

    static intersect = curry(
        (dateRanges: DateRanges, intersecteDateRanges: DateRanges): DateRanges => pipe(
            DateRanges.trim,
            chain(DateRanges.intersectDateRange(intersecteDateRanges)),
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
                    (dateRange: DateRange) => deprivedDateRange.subtract(dateRange),
                    DateRanges.makeFunctor,
                )
            ),
            selfReduce(DateRanges.intersect)
        )(dateRanges)
    )

    static deprive = curry(
        (dateRanges: DateRanges, deprivedDateRanges: DateRanges): DateRanges => pipe(
            DateRanges.trim,
            chain(DateRanges.depriveFromDateRange(deprivedDateRanges)) as (dateRanges: any) => DateRanges,
            DateRanges.trim,
            DateRanges.makeFunctor,
            DateRanges.merge
        )(dateRanges)
    )

    deprive: (dateRanges: DateRanges) => DateRanges = DateRanges.deprive(this as DateRanges)
}