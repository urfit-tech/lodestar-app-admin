import { filter } from 'ramda'
import { useEffect, useRef } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { routesProps } from '../Routes'

export const useRouteKeys = () => {
  let match = useRouteMatch()
  return Object.keys(filter(routeProps => routeProps.path === match.path, routesProps))
}

export const useInterval = (callback: Function, delay: number | null, immediately?: boolean) => {
  const savedCallback = useRef<Function>()

  // 保存新回调
  useEffect(() => {
    savedCallback.current = callback
  })

  // 建立 interval
  useEffect(() => {
    const tick = () => {
      savedCallback.current && savedCallback.current()
    }
    if (delay !== null) {
      immediately && tick()
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, immediately])
}
