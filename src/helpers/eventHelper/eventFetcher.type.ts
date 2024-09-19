export type ResourceType = 'member' | 'physical_space'

export type FetchedResource = {
    id: string,
    type: ResourceType,
    target: string,
    appId: string
}

export type EventRequest = {
    app_id: string,
    title?: string,
    description?: string,
    started_at: Date,
    ended_at: Date,
    metadata?: object,
    published_at?: Date,
    deleted_at?: Date,
} & (
        {
            rrule: string,
            until: Date,
        } | {
            rrule?: undefined,
            until?: undefined,
        }
    )
    & (
        {
            source_type: string,
            source_target: string,
        } |
        {
            source_type?: undefined,
            source_target?: undefined,
        }
    )

export type EventResource = {
    temporally_exclusive_resource_id: string
    metadata?: object
    deleted_at?: Date
    role?: string
    is_exclusive?: boolean
}

export type FetchedResourceEvent = {
    event_id: string,
    started_at: string,
    ended_at: string,
    title?: string,
    description?: string,
    event_metadata?: object,
    temporally_exclusive_resource_id: string,
    role: string | null,
    is_exclusive: boolean,
    is_attending: string | null,
    published_at: string | null,
    event_deleted_at: string | null
} & (
        {
            rrule: string,
            until: string,
        } | {
            rrule?: undefined,
            until?: undefined,
        }
    ) & (
        {
            source_type: string
            source_target: string
        } | {
            source_type?: undefined
            source_target?: undefined
        }
    )

export type Resource = {
    id: string
    type: string
    target: string
    app_id: string
}