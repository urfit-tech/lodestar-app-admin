import { EventApi } from "@fullcalendar/core"

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