import { curry, pipeWith, andThen, pluck, tap } from 'ramda'
import axios, { AxiosRequestConfig } from "axios";
import {
    ResourceType, FetchedResource, EventRequest, EventResource, FetchedResourceEvent,
} from '../types/event';

const authedConfig = curry(
    (authToken: string, config: AxiosRequestConfig | undefined) => {
        return { ...(config ?? {}), headers: { Authorization: `Bearer ${authToken}` } }
    }
)

export const createResourceFetcher = curry(
    async (authToken: string, payload: { type: ResourceType, target: string }) => {
        return (await axios.post(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/temporally-exclusive-resource`,
            payload,
            authedConfig(authToken)(undefined)
        )).data
    }
)

export const createEventFetcher = curry(
    async (authToken: string, payload: { events: Array<EventRequest> }) => {
        console.log(25, payload)
        return (await axios.post(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event`,
            payload,
            authedConfig(authToken)(undefined)
        )).data
    }
)

export const createInvitationFetcher = curry(
    async (authToken: string, eventResources: Array<EventResource> | undefined, eventIds: Array<{ id: string }> | undefined) => {
        console.log(eventResources, eventIds)
        if (eventResources && eventIds && eventResources?.length > 0 && eventIds?.length > 0) {
            return (await axios.post(
                `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event/invite-resource`,
                { eventResources, eventIds },
                authedConfig(authToken)(undefined)
            )).data
        }
        else {
            throw new Error(`Failed to invite resource: event resources or event ids is empty.`)
        }
    }
)

export const createEventAndInviteResourceFetcher = curry(
    async (
        authToken: string,
        payload: {
            events: Array<EventRequest>,
            invitedResource: Array<any>
        }
    ) => {
        if (authToken && payload.invitedResource.length > 0) {
            return await pipeWith(andThen)([
                createEventFetcher(authToken),
                tap((any: any) => console.log(60, any)),
                pluck('id'),
                createInvitationFetcher(authToken)(payload.invitedResource)
            ])({ events: payload.events })
        } else {
            throw new Error(`Failed to create the event or invite resources.`)
        }
    }
)

export const getResourceByTypeTargetFetcher = curry(
    async (authToken: string, typeTargets: { type: ResourceType, targets: Array<string> }) => {
        const { type, targets } = typeTargets
        return (await axios.post(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/temporally-exclusive-resource/batch/get/${type}`,
            targets,
            authedConfig(authToken)(undefined)
        )).data as Array<FetchedResource>
    }
)

export const getEventsByResourceFetcher = curry(
    async (authToken: string, startUntil: { startedAt: Date, until: Date }, resourceIds: Array<string>) => {
        const { startedAt, until } = startUntil
        if (resourceIds) {
            const result = (await axios.post(
                `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event/batch/get?started_at=${startedAt.toISOString()}&until=${until.toISOString()}`,
                resourceIds,
                authedConfig(authToken)(undefined)
            )).data as Array<FetchedResourceEvent>
            return result
        } else {
            return []
        }
    }
)

export const getResourceEventsFethcer = curry(
    async (
        authToken: string,
        typeTargets: { type: ResourceType, targets: Array<string> },
        startUntil: { startedAt: Date, until: Date }
    ) => {
        const resources = await getResourceByTypeTargetFetcher(authToken)(typeTargets)
        const resourceIds = pluck('id')(resources)
        const resourceEvents = await getEventsByResourceFetcher(authToken)(startUntil)(resourceIds)
        return { resources, resourceEvents }
    }
)

export const updateEvent = curry(
    async (
        authToken: string,
        payload: EventRequest,
        event_id: string,
    ) => {
        return (await axios.patch(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event/${event_id}`,
            payload,
            authedConfig(authToken)(undefined)
        )).data
    }
)

export const deleteEvent = curry(
    async (authToken: string, deletedAt: Date, event_id: string) =>
        await updateEvent(authToken)({ deleted_at: deletedAt } as EventRequest)(event_id)
)