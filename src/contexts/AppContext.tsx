import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { createContext, useContext, useEffect } from 'react'
import hasura from '../hasura'
import { AppProps, Module } from '../types/app'
import { useAuth } from './AuthContext'

type AppContextProps = AppProps & {
  loading: boolean
  error?: Error
  refetch?: () => void
}

const defaultContextValue: AppContextProps = {
  loading: true,
  id: '',
  name: '',
  title: null,
  description: null,
  enabledModules: {},
  settings: {},
  currencies: {},
}

const AppContext = createContext<AppContextProps>(defaultContextValue)

export const AppProvider: React.FC<{
  appId: string
}> = ({ appId, children }) => {
  const { refreshToken, authToken } = useAuth()
  const { loading, error, data, refetch } = useQuery<hasura.GET_APPLICATION, hasura.GET_APPLICATIONVariables>(
    GET_APPLICATION,
    { variables: { host: window.location.host } },
  )

  const settings =
    data?.app_admin_by_pk?.app.app_settings?.reduce((accumulator, appSetting) => {
      accumulator[appSetting.key] = appSetting.value
      return accumulator
    }, {} as { [key: string]: string }) || {}

  const contextValue = {
    ...defaultContextValue,
    loading,
    error,
    refetch,
    id: appId,
    name: data?.app_admin_by_pk?.app.name || '',
    title: data?.app_admin_by_pk?.app.title || '',
    description: data?.app_admin_by_pk?.app.description || '',
    vimeoProjectId: data?.app_admin_by_pk?.app.vimeo_project_id,
    enabledModules:
      data?.app_admin_by_pk?.app.app_modules.reduce((dict, el) => {
        dict[el.module_id as Module] = true
        return dict
      }, {} as { [key in Module]?: boolean }) || {},
    settings,
    currencies:
      data?.currency.reduce((accumulator, currency) => {
        accumulator[currency.id] = {
          name: currency.id === 'LSC' && settings['coin.name'] ? settings['coin.name'] : currency.name,
          label: currency.id === 'LSC' && settings['coin.label'] ? settings['coin.label'] : currency.label,
          unit: currency.id === 'LSC' && settings['coin.unit'] ? settings['coin.unit'] : currency.unit,
        }
        return accumulator
      }, {} as AppProps['currencies']) || {},
  }

  useEffect(() => {
    if (!authToken) {
      refreshToken?.()
    }
  }, [authToken, refreshToken])

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

const GET_APPLICATION = gql`
  query GET_APPLICATION($host: String!) {
    currency {
      id
      name
      label
      unit
    }
    app_admin_by_pk(host: $host) {
      host
      app {
        id
        name
        title
        description
        vimeo_project_id
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
  }
`

export const useApp = () => useContext(AppContext)
