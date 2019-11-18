import { filter } from 'ramda'
import { useEffect, useRef, useState } from 'react'
import ReactPixel from 'react-facebook-pixel'
import ReactGA from 'react-ga'
import useRouter from 'use-react-router'
import { TPDirect } from '../helpers'
import { routesProps } from '../Routes'
import settings from '../settings'

//create your forceUpdate hook
export const useForceUpdate = () => {
  const [state, setState] = useState(true) //boolean state
  return () => setState(!state) // toggle the state to force render
}

export const useTheme = () => {
  const theme = require(`../theme/default.json`)
  return theme
}

export const useRouteKeys = () => {
  const { location } = useRouter()
  return Object.keys(filter(routeProps => routeProps.path === location.pathname, routesProps))
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
export const useTappay = () => {
  settings.tappayApp.id &&
    settings.tappayApp.key &&
    TPDirect &&
    TPDirect.setupSDK(
      settings.tappayApp.id,
      settings.tappayApp.key,
      process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    )
}

export const useGA = () => {
  settings.trackingId.ga && ReactGA.initialize(settings.trackingId.ga)
}
export const useGAPageView = () => {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }, [])
}

export const usePixel = () => {
  settings.trackingId.fbPixel && ReactPixel.init(settings.trackingId.fbPixel)
}
