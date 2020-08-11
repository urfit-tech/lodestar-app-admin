import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { createContext } from 'react'
import types from '../types'
import { AppProps, Module } from '../types/app'

type AppContextProps = { loading: boolean; error?: Error; refetch?: () => void } & AppProps
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
export const AppContext = createContext<AppContextProps>(defaultContextValue)

export const AppProvider: React.FC = ({ children }) => {
  const { loading, error, refetch, data } = useQuery<types.GET_APPLICATION, types.GET_APPLICATIONVariables>(
    GET_APPLICATION,
    {
      variables: { host: window.location.host },
    },
  )
  const contextValue = {
    ...defaultContextValue,
    loading,
    error,
    refetch,
    id: data?.app_admin_by_pk?.app.id || '',
    name: data?.app_admin_by_pk?.app.name || '',
    title: data?.app_admin_by_pk?.app.title || '',
    description: data?.app_admin_by_pk?.app.description || '',
    vimeoProjectId: data?.app_admin_by_pk?.app.vimeo_project_id,
    enabledModules:
      data?.app_admin_by_pk?.app.app_modules.reduce((dict, el, indx) => {
        dict[el.module_id as Module] = true
        return dict
      }, {} as { [key in Module]?: boolean }) || {},
    settings:
      data?.app_admin_by_pk?.app.app_settings.reduce((dict, el, index) => {
        dict[el.key] = el.value
        return dict
      }, {} as { [key: string]: string }) || {},
    secrets:
      data?.app_admin_by_pk?.app.app_secrets.reduce((dict, el, index) => {
        dict[el.key] = el.value
        return dict
      }, {} as { [key: string]: string }) || {},
    currencies:
      data?.currency.reduce((accum, currency) => {
        accum[currency.id] = {
          name: currency.name,
          label: currency.label,
          unit: currency.unit,
        }
        return accum
      }, {} as AppProps['currencies']) || {},
  }

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
        app_secrets {
          key
          value
        }
      }
    }
  }
`

export default AppContext
