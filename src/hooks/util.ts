import Axios from 'axios'
import { filter } from 'ramda'
import { useEffect, useRef, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { handleError } from '../helpers'
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

export const useAppAdmin = (host: string) => {
  const [appAdmin, setAppAdmin] = useState<{
    appId: string
    apiHost: string | null
  } | null>(null)

  useEffect(() => {
    if (appAdmin) {
      return
    }
    Axios.post(`${process.env.REACT_APP_GRAPHQL_ENDPOINT}`, {
      operationName: 'GET_APP_ADMIN',
      query: `query GET_APP_ADMIN($host: String!) {\n  app_admin_by_pk(host: $host) {\n    app_id\n    api_host\n  }\n}`,
      variables: { host },
    })
      .then(({ data }) => {
        setAppAdmin({
          appId: data.data.app_admin_by_pk.app_id,
          apiHost: data.data.app_admin_by_pk.api_host || process.env.REACT_APP_API_HOST || null,
        })
      })
      .catch(handleError)
  }, [appAdmin, host])

  return appAdmin
}
