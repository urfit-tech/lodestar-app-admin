import React, { createContext, useContext, useRef } from 'react'
import { createStore, shallowEqual, StoreApi, useStore } from '../../../helpers/store'

const ScheduleEditorStoreContext = createContext<StoreApi<any> | null>(null)

interface ScheduleEditorProviderProps<T extends object> {
  initialState: T
  children: React.ReactNode
}

export const ScheduleEditorProvider = <T extends object>({ initialState, children }: ScheduleEditorProviderProps<T>) => {
  const storeRef = useRef<StoreApi<T>>()

  if (!storeRef.current) {
    storeRef.current = createStore(initialState)
  }

  return <ScheduleEditorStoreContext.Provider value={storeRef.current}>{children}</ScheduleEditorStoreContext.Provider>
}

export const useScheduleEditorStoreApi = <T extends object>() => {
  const store = useContext(ScheduleEditorStoreContext)
  if (!store) {
    throw new Error('ScheduleEditorProvider is missing')
  }
  return store as StoreApi<T>
}

export const useScheduleEditorStore = <T, S extends Record<string, any>>(
  selector: (state: T) => S,
  equalityFn = shallowEqual,
): S => {
  const store = useContext(ScheduleEditorStoreContext)
  if (!store) {
    throw new Error('ScheduleEditorProvider is missing')
  }
  return useStore(store as StoreApi<T>, selector, equalityFn)
}
