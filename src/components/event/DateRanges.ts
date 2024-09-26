import {
    ascend, chain, concat, converge, curry,
    drop, evolve, filter, head, tail, identity,
    init, prop, props, invoker, last, map, pipe, project,
    propOr, reduce, sort, replace, useWith,
    ifElse, apply, tap, __, Reduced
} from 'ramda'

import * as Moment from 'moment'
import { extendMoment, DateRange } from 'moment-range'
import { RRule, rrulestr } from "rrule";

import { FetchedResourceEvent } from '../../helpers/eventHelper/eventFetcher.type';
import { renameKey, sealIf, sealNil } from '../../components/event/adaptObject'
import {
    LooseDateRange,
    EventApiWithRRule, GeneralEventApi, isEventApiWithRRule
} from './events.type';
import { Duration, EventApi } from '@fullcalendar/core';
import { getSafeRrule } from './eventAdaptor';

const selfReduce: <T, S>(fn: (accm: S, curr: T) => S) => (arr: Array<T>) => S
    = fn => converge(reduce(fn), [head, tail])

const moment = extendMoment(Moment)

const stripeTimeZone: (date: string | Date) => Date
    = pipe(
        (date: string | Date) => new Date(date),
        invoker(0, 'toJSON'),
        replace('Z', ''),
        (date: string) => new Date(date),
    )

const generateDateRange: (duration: Duration | number) => (start: Date) => [Date, Date]
    = duration => start => [start, moment(start).clone().add(duration).toDate()]

const gerenerateDateRangesFromStarts:
    (duration: Duration | number, starts: Array<Date>) => Array<DateRange>
    = (duration, starts) =>
        map(pipe<[Date], [Date, Date], DateRange>(
            generateDateRange(duration),
            moment.range
        ))(starts)

const eventToDateRanges: (event: GeneralEventApi) => Array<DateRange> = ifElse(
    isEventApiWithRRule,
    converge(
        gerenerateDateRangesFromStarts,
        [
            prop('duration'),
            pipe<
                [EventApiWithRRule],
                string | RRule,
                RRule,
                Array<Date>,
                Array<Date>
            >(
                prop('rrule'),
                getSafeRrule,
                invoker(0, 'all'),
                map(stripeTimeZone),
            ),
        ]
    ) as any,
    pipe<
        [GeneralEventApi],
        Array<Date | null>,
        DateRange,
        Array<DateRange>
    >(
        props(['start', 'end']),
        moment.range,
        (dateRange: DateRange) => new Array(dateRange)
    )
)

const naiveAbsolute: (startEnd: { start: Date, end: Date }) => { start: Date, end: Date }
    = pipe(
        sealIf(
            startEnd => startEnd.start > startEnd.end,
            startEnd => ({ start: startEnd.end, end: startEnd.start }),
        ),
    )

export const absolute: (dateRange: { start: Date, end: Date }) => { start: Date, end: Date }
    = sealNil(naiveAbsolute)

const absoluteDateRange: (dateRange: LooseDateRange) => LooseDateRange
    = pipe<
        [LooseDateRange],
        { start: Date, end: Date },
        [Date, Date],
        LooseDateRange
    >(
        sealNil(naiveAbsolute),
        props(['start', 'end']) as ((startEnd: { start: Date, end: Date }) => [Date, Date]),
        startEnd => new DateRange(startEnd)
    )

const looseIntersect = curry<
    (dateRange: LooseDateRange, intersectedDateRange: LooseDateRange) => LooseDateRange
>(
    (dateRange, intersectedDateRange) =>
        (!dateRange || !intersectedDateRange) ?
            null :
            dateRange.intersect(intersectedDateRange)
)

export class DateRanges extends Array<LooseDateRange>  {

    static makeFunctor: (arrayOfDateRange: Array<LooseDateRange> | null) => DateRanges =
        (arrayOfDateRange) => arrayOfDateRange === null ? new DateRanges(null) : new DateRanges(...(arrayOfDateRange as Array<LooseDateRange>))

    static parseFromEvents: (events: Array<GeneralEventApi>) => DateRanges
        = pipe(
            chain(eventToDateRanges),
            DateRanges.makeFunctor
        )

    stringify = (): Array<string | null> => this.map((dateRange: LooseDateRange) => dateRange ? dateRange.toString() : null)

    static absolute: (dateRanges: DateRanges) => DateRanges
        = pipe(
            map<LooseDateRange, LooseDateRange>(absoluteDateRange),
            DateRanges.makeFunctor
        )

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

    static mergeTwo = curry<(mergedDateRange: DateRange, dateRange: DateRange) => DateRanges>(
        (mergedDateRange, dateRange) =>
            DateRanges.makeFunctor(
                dateRange.overlaps(mergedDateRange, { adjacent: true }) ?
                    [dateRange.add(mergedDateRange, { adjacent: true })] :
                    [dateRange, mergedDateRange]
            )
    )

    static tailMerge: (dateRange: DateRange) => (dateRanges: DateRanges) => DateRanges
        = dateRange => pipe(
            converge(
                concat,
                [
                    init,
                    pipe<[DateRanges], DateRange, DateRanges>(
                        last,
                        DateRanges.mergeTwo(dateRange),
                    )
                ]
            ),
            DateRanges.makeFunctor
        )

    static merge: (dateRanges: DateRanges) => DateRanges = pipe(
        DateRanges.ascendStart,
        DateRanges.trim,
        converge(
            reduce((dateRanges: DateRanges, dateRange: DateRange) => DateRanges.tailMerge(dateRange)(dateRanges)),
            [
                pipe(head, (v: DateRange) => new DateRanges(v)),
                pipe(tail)
            ]
        )
    )

    merge = () => pipe(
        concat(this),
        DateRanges.makeFunctor,
        DateRanges.merge
    )

    static selfIntersect: (dateRanges: DateRanges) => DateRanges | null = selfReduce(looseIntersect as any)

    selfIntersect = () => DateRanges.selfIntersect(this)

    static intersectDateRange:
        (intersecteDateRange: LooseDateRange) => (dateRanges: DateRanges) => Array<LooseDateRange>
        = intersecteDateRange =>
            map(looseIntersect(intersecteDateRange as any) as any)

    static intersect: (intersecteDateRanges: DateRanges) => (dateRanges: DateRanges) => DateRanges =
        (intersecteDateRanges: DateRanges) => pipe<
            [DateRanges],
            DateRanges,
            Array<LooseDateRange>,
            DateRanges, DateRanges
        >(
            DateRanges.trim,
            chain(dateRange => DateRanges.intersectDateRange(dateRange)(intersecteDateRanges)),
            DateRanges.makeFunctor,
            DateRanges.merge
        )


    intersect = () => DateRanges.intersect(this as DateRanges)

    static depriveFromDateRange: (dateRanges: DateRanges) => (deprivedDateRange: DateRange) => DateRanges
        = dateRanges => pipe(
            (deprivedDateRange: DateRange) => map(
                pipe(
                    (dateRange: DateRange) => deprivedDateRange.subtract(dateRange),
                    DateRanges.makeFunctor,
                )
            )(dateRanges as any) as any,
            selfReduce(
                (dateRanges: DateRanges, intersecteDateRanges: DateRanges) =>
                    DateRanges.intersect(intersecteDateRanges)(dateRanges)
            ),
        )

    static deprive:
        (dateRanges: DateRanges) => (deprivedDateRanges: DateRanges) => DateRanges
        = dateRanges => pipe<
            [DateRanges],
            DateRanges,
            DateRanges,
            DateRanges,
            DateRanges
        >(
            DateRanges.trim,
            chain(DateRanges.depriveFromDateRange(dateRanges)) as any,
            DateRanges.trim,
            DateRanges.merge
        )

    deprive: (dateRanges: DateRanges) => DateRanges = (dateRanges: DateRanges) => DateRanges.deprive(dateRanges)(this as DateRanges)
}