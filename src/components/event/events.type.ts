import { pipe, props, all, complement, isNil } from 'ramda'
import { RRule } from "rrule"
import { DateRange } from 'moment-range'
import { EventApi } from "@fullcalendar/core"
import { FetchedResource, ResourceGroup } from '../../helpers/eventHelper/eventFetcher.type'

export type LooseDateRange = DateRange | null

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

type StartUntil = {
    startedAt: Date
    until: Date
}

type ResourcesWithEvents = {
    resources: Array<FetchedResource>
    resourceEvents: Array<Partial<GeneralEventApi>>
}

export type ResourceGroupsWithEvents = ResourcesWithEvents & { resourceGroups: Array<ResourceGroup> }

export type ResourceEventsFetcher = (startUntil: StartUntil) => ResourcesWithEvents
export type ResourceGroupEventsFetcher = (startUntil: StartUntil) => ResourceGroupsWithEvents
