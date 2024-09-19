import { pipe, props, all, complement, isNil } from 'ramda'
import { RRule } from "rrule"
import { EventApi } from "@fullcalendar/core"

type EventBase = Partial<EventApi> & { start: Date, end: Date }

type RRruleEventBase = {
    rrule: RRule | string,
    duration: number,
    exrule?: RRule | string,
    exdate?: Array<Date>
    until?: Date
}

export type EventApiWithRRule = EventBase & RRruleEventBase

export type GeneralEventApi = EventBase | EventApiWithRRule

export const isEventApiWithRRule
    = pipe(
        props(['rrule', 'duration', 'until']),
        all(complement(isNil))
    ) as (event: unknown) => event is EventApiWithRRule

export type TemporallyExclusiveResource = {
    id: string
} & Record<string, any>

export type ResourceEventsFetcher = (startUntil: {
    startedAt: Date
    until: Date
}) => {
    resources: Array<TemporallyExclusiveResource>
    resourceEvents: Array<Partial<EventApi>>
}