import {
    curry, pipeWith, andThen, pluck, props, append, filter,
    tap, evolve, invoker, pipe, map, apply, useWith, isNotEmpty,
    identity, mapObjIndexed, values, mergeLeft, converge, chain, flatten
} from 'ramda'
import axios, { AxiosRequestConfig } from "axios";
import {
    ResourceType, FetchedResource, EventRequest, EventResource, FetchedResourceEvent, ResourceGroup,
} from './eventFetcher.type';
import { renameKey } from 'lodestar-app-element/src/helpers/adaptObject';
import { adaptedEventPayload, adaptFetchedResourceEvent } from './fetchedEventAdaptor'
import { GeneralEventApi, ResourceGroupsWithEvents } from '../../components/event/events.type';

const authedConfig: (authToken: string) => (config: AxiosRequestConfig) => AxiosRequestConfig
    = authToken => mergeLeft({ headers: { Authorization: `Bearer ${authToken}` } })

export const createResourceFetcher = curry(
    async (authToken: string, payload: { type: ResourceType, target: string }) => {
        return (await axios.post(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/temporally-exclusive-resource`,
            payload,
            authedConfig(authToken)({})
        )).data
    }
)

export const getResourceByTypeTargetFetcher = curry<
    (
        authToken: string,
        typeTargets: { type: ResourceType, targets: Array<string> }
    ) =>
        Promise<Array<FetchedResource>>
>(
    async (authToken, typeTargets) => {
        const { type, targets } = typeTargets
        return (await axios.post(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/temporally-exclusive-resource/batch/get/${type}`,
            targets,
            authedConfig(authToken)({})
        )).data
    }
)

export const getEventsByResourceFetcher = curry(
    async (authToken: string, startUntil: { startedAt: Date, until: Date }, resourceIds: Array<string>) => {
        const { startedAt, until } = startUntil
        if (resourceIds) {
            const result = (await axios.post(
                `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event/batch/get?started_at=${startedAt.toISOString()}&until=${until.toISOString()}`,
                resourceIds,
                authedConfig(authToken)({})
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
            const resources = await pipe<
                [{ type: ResourceType, targets: Array<string> }],
                { type: ResourceType, targets: Array<string> },
                Promise<Array<EventResource>>
            >(
                tap(createResourceFetcher(authToken) as any),
                getResourceByTypeTargetFetcher(authToken),
            )(typeTargets)

            const resourceEvents = await pipe(
                pluck('temporally_exclusive_resource_id'),
                getEventsByResourceFetcher(authToken)(startUntil) as any,
                andThen(map(adaptFetchedResourceEvent))
            )(resources)

            return { resources, resourceEvents }
        } catch (e) {
            console.error(e)
        }
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
                properties: v => { console.log(v); return v ? invoker(1, 'join')(',') : v }
            }),
            renameKey({
                ids: 'permissionGroups'
            }),
            mapObjIndexed((value, key) => value ? `${key}=${value}` : ''),
            values,
            filter(isNotEmpty),
            invoker(1, 'join')('&')
        )({ type, permissionGroups, properties })

        return (await axios.get(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/temporally-exclusive-resource/permission-group?${query}`,
            authedConfig(authToken)({})
        )).data as Array<ResourceGroupsWithEvents>
    }
)

export const getResourceGroup: (authToken: string) => Promise<Array<ResourceGroup>>
    = async authToken => {
        return await [
            {
                "name": "instructor",
                "type": "member",
                "permission_group_id": "6e34cf8f-4668-4d9d-94bc-bbf76212ace8",
                "default_label": "教師"
            },
            {
                "name": "classroom",
                "type": "physical_space",
                "permission_group_id": "6e34cf8f-4668-4d9d-94bc-bbf76212ace8",
                "default_label": "教室"
            }
        ]
    }

export const getInvitedResourceEventsFetcher =
    curry<
        (authToken: string, startUntil: { startedAt: Date, until: Date }) =>
            Promise<{
                resourceGroups: Array<ResourceGroup>,
                resources: Array<EventResource>,
                resourceEvents: Array<FetchedResourceEvent>
            }>
    >(async (authToken, startUntil) => {
        const resourceGroups = await getResourceGroup(authToken)

        const rawResources = await Promise.all(map(pipe<
            [ResourceGroup],
            ResourceGroup & { permission_group_id: Array<string> },
            Array<[Array<string>, string]>,
            Array<[Array<string>, string, undefined]>,
            Promise<Array<ResourceGroupsWithEvents>>,
            Array<ResourceGroupsWithEvents>
        >(
            evolve({ permission_group_id: v => [v] }) as any,
            props(['permission_group_id', 'type']) as any,
            append(undefined) as any,
            apply(getResourcesByPermissionGroups(authToken)) as any,
            andThen(identity) as any,
        ))(resourceGroups))
        const resources = flatten(rawResources)

        const resourceEvents = await pipe(
            pluck('temporally_exclusive_resource_id'),
            getEventsByResourceFetcher(authToken)(startUntil) as any,
            andThen(map(adaptFetchedResourceEvent))
        )(resources as any) as any

        return { resourceGroups, resources, resourceEvents } as any
    })

export const createEventFetcher = curry(
    async (authToken: string, app_id: string, payload: { events: Array<GeneralEventApi> }) => {
        const adaptedEvents = map(
            pipe<[GeneralEventApi],
                GeneralEventApi & { app_id: string },
                EventRequest
            >(
                mergeLeft({ app_id }),
                adaptedEventPayload
            )
        )(payload.events)

        return (await axios.post(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event`,
            { events: adaptedEvents },
            authedConfig(authToken)({})
        )).data
    }
)

export const createInvitationFetcher = curry(
    async (authToken: string, eventResources: Array<EventResource> | undefined, eventIds: Array<{ id: string }> | undefined) => {
        if (eventResources && eventIds && eventResources?.length > 0 && eventIds?.length > 0) {
            return (await axios.post(
                `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event/invite-resource`,
                { eventResources, eventIds },
                authedConfig(authToken)({})
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
        app_id: string,
        payload: {
            events: Array<GeneralEventApi>,
            invitedResource: Array<EventResource>
        }
    ) => {
        if (authToken && payload.invitedResource.length > 0) {
            return await pipeWith(andThen)([
                createEventFetcher(authToken)(app_id),
                tap((any: any) => console.log(60, any)),
                pluck('id'),
                createInvitationFetcher(authToken)(payload.invitedResource)
            ])({ events: payload.events })
        } else {
            throw new Error(`Failed to create the event or invite resources.`)
        }
    }
)

export const updateEvent = curry(
    async (
        authToken: string,
        payload: Partial<GeneralEventApi>,
        event_id: string,
    ) => {
        return (await axios.patch(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/event/${event_id}`,
            adaptedEventPayload(payload),
            authedConfig(authToken)({})
        )).data
    }
)

export const deleteEvent = curry(
    async (authToken: string, deletedAt: Date, event_id: string) =>
        await updateEvent(authToken)({ extendedProps: { deletedAt } })(event_id)
)