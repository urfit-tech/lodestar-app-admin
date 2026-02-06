import { unstable_batchedUpdates } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

export type StoreApi<T> = {
  getState: () => T
  setState: (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void
  subscribe: (listener: () => void) => () => void
}

export const batchUpdates = (fn: () => void) => {
  unstable_batchedUpdates(fn)
}

export const createStore = <T extends object>(initialState: T): StoreApi<T> => {
  let state = initialState
  const listeners = new Set<() => void>()

  const getState = () => state

  const setState: StoreApi<T>['setState'] = (partial, replace = false) => {
    const nextPartial = typeof partial === 'function' ? partial(state) : partial
    const nextState = (replace ? nextPartial : { ...state, ...nextPartial }) as T

    if (Object.is(nextState, state)) return
    state = nextState
    batchUpdates(() => {
      listeners.forEach(listener => listener())
    })
  }

  const subscribe: StoreApi<T>['subscribe'] = listener => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { getState, setState, subscribe }
}

export type EqualityFn<S> = (prev: S, next: S) => boolean

export const useStore = <T, S>(
  store: StoreApi<T>,
  selector: (state: T) => S,
  equalityFn: EqualityFn<S> = Object.is,
): S => {
  const selectorRef = useRef(selector)
  const equalityRef = useRef(equalityFn)
  selectorRef.current = selector
  equalityRef.current = equalityFn

  const [selected, setSelected] = useState(() => selector(store.getState()))

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const nextSelected = selectorRef.current(store.getState())
      setSelected(prev => (equalityRef.current(prev, nextSelected) ? prev : nextSelected))
    })

    return unsubscribe
  }, [store])

  return selected
}

export const shallowEqual = <T extends Record<string, any>>(prev: T, next: T): boolean => {
  if (Object.is(prev, next)) return true
  const prevKeys = Object.keys(prev)
  const nextKeys = Object.keys(next)
  if (prevKeys.length !== nextKeys.length) return false
  for (const key of prevKeys) {
    if (!Object.prototype.hasOwnProperty.call(next, key)) return false
    if (!Object.is(prev[key], next[key])) return false
  }
  return true
}
