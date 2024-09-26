import { curry, pipe, map, cond, equals, mergeLeft, omit, filter, tap, keys, isNil } from 'ramda'
import { GeneralEventApi } from './events.type';
import { getEventsByResource, isAvailableEvent } from "./eventAdaptor";
import { sealIf } from './adaptObject';

import { Dispatch, SetStateAction } from 'react'
import { FetchedResource } from '../../helpers/eventHelper/eventFetcher.type';
import { Color } from 'react-color';


export const cloneWithEventsUnderConditionSetProps
    = curry<(
        condition: (...args: Array<GeneralEventApi>) => boolean,
        props: Record<string, any>,
        state: 'up' | 'down') =>
        (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
    >(
        (condition, props, state) => map(
            pipe(
                sealIf(
                    condition,
                    cond(
                        [
                            [() => equals('up')(state), mergeLeft(props) as any],
                            [() => equals('down')(state), omit(keys(props))],
                        ]
                    ),
                )
            ))
    )

export const cloneAvailbleEventWithBackgroundDisplay:
    (state: 'up' | 'down') => (events: Array<GeneralEventApi>) => Array<GeneralEventApi>
    = state => cloneWithEventsUnderConditionSetProps(isAvailableEvent)({ display: 'background' })(state)


export const setAvailableEventsSetBackgroundStateAction
    = curry<(state: 'up' | 'down', setState: Dispatch<SetStateAction<Array<GeneralEventApi>>> | null) => ((events: Array<GeneralEventApi>) => void)>(
        (state, setState) => pipe(
            cloneAvailbleEventWithBackgroundDisplay(state),
            sealIf(isNil, () => { console.log('??') })(setState)
        )
    )

export const setFetchedFocusedInvitedResourceStateAction
    = curry<(status: 'up' | 'down', setState: Dispatch<SetStateAction<FetchedResource | undefined>>) => ((resource: FetchedResource | undefined) => void)>(
        (status, setState) => cond([
            [() => equals('up')(status), setState as any],
            [() => equals('down')(status), () => setState(undefined)],
        ])
    )

export const cloneEventWithBackgroundColorSet
    = curry<(state: 'up' | 'down', color: Color | undefined) =>
        (events: Array<GeneralEventApi>) => Array<GeneralEventApi>>(
            (state, color) => map(
                cloneWithEventsUnderConditionSetProps(() => true)({ backgroundColor: color, borderColor: color })(state)
            )
        )

export const setFetchedFocusedEventsByResource: (resource: FetchedResource) => (events: Array<GeneralEventApi>) => void
    = resource => pipe(
        getEventsByResource(resource),
        cloneAvailbleEventWithBackgroundDisplay('up'),
        cloneEventWithBackgroundColorSet('up')(resource?.color as any) as any,
    )

export const setFetchedFocusedInvitedResourceEventStateAction
    = curry<(status: 'up' | 'down', setState: Dispatch<SetStateAction<Array<GeneralEventApi>>>, resource: FetchedResource) => ((events: Array<GeneralEventApi>) => void)>(
        (status, setState, Resource) => cond([
            [() => equals('up')(status), setState as any],
            [() => equals('down')(status), () => setState([])],
        ])
    )