import { curry, pipeWith, andThen, pluck, tap, evolve, invoker, pipe, map, mapObjIndexed, values } from 'ramda'
import axios, { AxiosRequestConfig } from "axios";
import moment from 'moment';
import {
    ResourceType, FetchedResource, EventRequest, EventResource, FetchedResourceEvent,
} from './eventFetcher.type';
import { renameKey } from 'lodestar-app-element/src/helpers/adaptObject';
import { adaptFetchedResourceEvent } from './eventAdaptor'

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
        return (await axios.post(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event`,
            payload,
            authedConfig(authToken)(undefined)
        )).data
    }
)

export const createInvitationFetcher = curry(
    async (authToken: string, eventResources: Array<EventResource> | undefined, eventIds: Array<{ id: string }> | undefined) => {
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


export const getResourcesByPermissionGroups = curry(
    async (
        authToken: string,
        permissionGroups: Array<string>,
        type: 'physical_space' | 'member',
        properties?: Array<string> | undefined
    ) => {
        const query = pipe(
            evolve({
                permissionGroups: invoker(1, 'join')(','),
                properties: v => v ? invoker(1, 'join')(',') : v
            }) as (obj: { type: string, properties: Array<string> | undefined, permissionGroups: Array<string> | undefined }) => { type: string, properties: string, permissionGroups: string },
            renameKey({
                ids: 'permissionGroups'
            }) as (obj: { type: string, properties: string, permissionGroups: string }) => ({ type: string, properties: string, ids: string }),
            mapObjIndexed((value, key) => value ? `${key}=${value}` : ''),
            values as (obj: { type: string, properties: string, ids: string }) => Array<string>,
            invoker(1, 'join')('&')
        )({ type, permissionGroups, properties })

        return (await axios.get(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/temporally-exclusive-resource/permission-group?${query}`,
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

export const getDefaultResourceEventsFethcer = curry(
    async (
        authToken: string,
        typeTargets: { type: ResourceType, targets: Array<string> },
        startUntil: { startedAt: Date, until: Date }
    ) => {
        try {
            const resources = await getResourceByTypeTargetFetcher(authToken)(typeTargets)
            const resourceIds = pluck('id')(resources)
            const resourceEvents = await getEventsByResourceFetcher(authToken)(startUntil)(resourceIds)
            const adaptedResourceEvents = resourceEvents.map(adaptFetchedResourceEvent)
            return { resources, resourceEvents: adaptedResourceEvents }
        } catch (e) {
            console.error(e)
        }
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