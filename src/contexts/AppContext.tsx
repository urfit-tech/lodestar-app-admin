import { useApolloClient, useQuery } from '@apollo/react-hooks'
import { message } from 'antd'
import gql from 'graphql-tag'
import React, { createContext, useEffect, useState } from 'react'
import types from '../types'
import { AppProps, Module } from '../types/app'

type AppContextProps = { loading: boolean } & AppProps
const defaultAppProps: AppContextProps = {
  loading: true,
  id: process.env.REACT_APP_ID || '',
  name: '',
  title: null,
  description: null,
  enabledModules: {},
  settings: {},
}
export const AppContext = createContext<AppContextProps>(defaultAppProps)

export const AppProvider: React.FC = ({ children }) => {
  const apolloClient = useApolloClient()
  const [appId, setAppId] = useState<string | null>(null)

  useEffect(() => {
    apolloClient
      .query<types.GET_APPLICATION, types.GET_APPLICATIONVariables>({
        query: GET_APPLICATION,
        variables: { host: window.location.host },
      })
      .then(({ data }) => {
        if (data && data.app_admin_by_pk) {
          const appId = data.app_admin_by_pk.app_id
          setAppId(appId)
        } else {
          message.error('Loading app error.')
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
          app_modules {
            id
            module_id
          }
          app_settings {
            key
            value
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

  const app: AppContextProps =
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
            settings: data.app_by_pk.app_settings.reduce((dict, el, index) => {
              dict[el.key] = el.value
              return dict
            }, {} as { [key: string]: string }),
          }
        })()

  return <AppContext.Provider value={app}>{children}</AppContext.Provider>
}

const GET_APPLICATION = gql`
  query GET_APPLICATION($host: String!) {
    app_admin_by_pk(host: $host) {
      app_id
    }
  }
`

export default AppContext
