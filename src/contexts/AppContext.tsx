import { useApolloClient, useQuery } from '@apollo/react-hooks'
import { message } from 'antd'
import gql from 'graphql-tag'
import React, { createContext, useEffect, useState } from 'react'
import ApplicationHelmet from '../components/common/ApplicationHelmet'
import types from '../types'

type Module = 'activity' | 'voucher' | 'member_card' | 'podcast' | 'appointment'

type AppProps = {
  loading: boolean
  id: string
  name: string
  title: string | null
  description: string | null
  enabledModules: {
    [key in Module]?: boolean
  }
  domain: string | null
}
const defaultAppProps: AppProps = {
  loading: true,
  id: process.env.REACT_APP_ID || '',
  name: '',
  title: null,
  description: null,
  enabledModules: {},
  domain: '',
}
export const AppContext = createContext<AppProps>(defaultAppProps)

export const AppProvider: React.FC = ({ children }) => {
  const [appId, setAppId] = useState<string | null>(null)
  const apolloClient = useApolloClient()

  useEffect(() => {
    localStorage.removeItem('kolable.app.id')
    apolloClient
      .query<types.GET_APPLICATION, types.GET_APPLICATIONVariables>({
        query: GET_APPLICATION,
        variables: { host: window.location.host },
      })
      .then(({ data }) => {
        if (data && data.app_admin_by_pk) {
          const appId = data.app_admin_by_pk.app_id
          localStorage.setItem('kolable.app.id', appId)
          setAppId(appId)
        } else {
          message.error('無法取得應用程式')
        }
      })
  }, [apolloClient, setAppId])

  const { loading, error, data } = useQuery<types.GET_APP, types.GET_APPVariables>(
    gql`
      query GET_APP($appId: String!) {
        app_by_pk(id: $appId) {
          id
          name
          title
          description
          domain
          app_modules {
            id
            module_id
          }
        }
      }
    `,
    {
      variables: {
        appId: appId || '',
      },
    },
  )

  const app: AppProps =
    loading || error || !data || !data.app_by_pk
      ? defaultAppProps
      : (() => {
          const enabledModules: { [key in Module]?: boolean } = {}

          data.app_by_pk &&
            data.app_by_pk.app_modules.forEach(appModule => {
              enabledModules[appModule.module_id as Module] = true
            })

          return {
            loading: false,
            id: data.app_by_pk.id,
            name: data.app_by_pk.name,
            title: data.app_by_pk.title,
            description: data.app_by_pk.description,
            enabledModules,
            domain: data.app_by_pk ? data.app_by_pk.domain : '',
          }
        })()

  return (
    <AppContext.Provider value={app}>
      <ApplicationHelmet />
      {children}
    </AppContext.Provider>
  )
}

const GET_APPLICATION = gql`
  query GET_APPLICATION($host: String!) {
    app_admin_by_pk(host: $host) {
      app_id
    }
  }
`

export default AppContext
