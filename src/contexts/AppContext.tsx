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
  host: '',
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
    { variables: { appId } },
  )

  const settings = Object.fromEntries(data?.app_by_pk?.app_settings.map(v => [v.key, v.value]) || [])

  const contextValue = {
    ...defaultContextValue,
    loading,
    error,
    refetch,
    id: appId,
    host: data?.app_by_pk?.app_hosts.shift()?.host || '',
    name: data?.app_by_pk?.name || '',
    title: data?.app_by_pk?.title || '',
    description: data?.app_by_pk?.description || '',
    vimeoProjectId: data?.app_by_pk?.vimeo_project_id,
    enabledModules: Object.fromEntries(data?.app_by_pk?.app_modules.map(v => [v.module_id as Module, true]) || []),
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
  query GET_APPLICATION($appId: String!) {
    currency {
      id
      name
      label
      unit
    }
    app_by_pk(id: $appId) {
      id
      name
      title
      description
      vimeo_project_id
      app_modules {
        id
        module_id
      }
      app_hosts(order_by: { priority: asc }) {
        host
      }
      app_settings {
        key
        value
      }
    }
  }
`

export const useApp = () => useContext(AppContext)
