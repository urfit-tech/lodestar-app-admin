import { ArrowRightOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { notification } from 'antd'
import gql from 'graphql-tag'
import { keys } from 'ramda'
import React, { createContext, useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
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
  hosts: [],
  name: '',
  title: null,
  description: null,
  enabledModules: {},
  settings: {},
  secrets: {},
  currencies: {},
  locales: {},
  navs: [],
}

const AppContext = createContext<AppContextProps>(defaultContextValue)

export const AppProvider: React.FC<{
  appId: string
}> = ({ appId, children }) => {
  const history = useHistory()
  const { refreshToken, authToken } = useAuth()
  const { loading, error, data, refetch } = useQuery<hasura.GET_APPLICATION, hasura.GET_APPLICATIONVariables>(
    GET_APPLICATION,
    { variables: { appId } },
  )

  data?.setting
    .filter(v => !v.is_secret && v.app_settings.length === 0)
    .forEach(v => {
      notification.error({
        message: '請設定參數（No settings）',
        description: (
          <div className="d-flex align-items-center">
            <div className="mr-3">{v.key}</div>
            <a href="#!">
              <ArrowRightOutlined onClick={() => history.push('/app/setting')} />
            </a>
          </div>
        ),
        duration: null,
      })
    })
  data?.setting
    .filter(v => v.is_secret && v.app_secrets.length === 0)
    .forEach(v => {
      notification.error({
        message: '請設定金鑰（No secrets）',
        description: (
          <div className="d-flex align-items-center">
            <div className="mr-3">{v.key}</div>
            <a href="#!">
              <ArrowRightOutlined onClick={() => history.push('/app/secret')} />
            </a>
          </div>
        ),
        duration: null,
      })
    })

  const settings = Object.fromEntries(data?.app_by_pk?.app_settings.map(v => [v.key, v.value]) || [])
  const secrets = Object.fromEntries(data?.app_by_pk?.app_secrets.map(v => [v.key, v.value]) || [])

  const contextValue = {
    ...defaultContextValue,
    loading,
    error,
    refetch,
    id: appId,
    hosts: data?.app_by_pk?.app_hosts.map(v => v.host) || [],
    host: data?.app_by_pk?.app_hosts.shift()?.host || '',
    name: data?.app_by_pk?.name || '',
    title: data?.app_by_pk?.title || '',
    description: data?.app_by_pk?.description || '',
    vimeoProjectId: data?.app_by_pk?.vimeo_project_id,
    enabledModules: Object.fromEntries(data?.app_by_pk?.app_modules.map(v => [v.module_id as Module, true]) || []),
    settings,
    secrets,
    navs:
      data?.app_by_pk?.app_navs.map(v => ({
        block: v.block as AppProps['navs'][number]['block'],
        label: v.label,
        href: v.href,
        external: v.external,
        tag: v.tag,
        position: v.position,
      })) || [],
    locales:
      data?.locale.reduce((accum, v) => {
        keys(v)
          .filter(u => u !== 'key')
          .forEach(u => {
            // convert snake_case to dash-case
            const locale = u.replaceAll('_', '-')
            const value = v[u]
            if (!accum[locale]) {
              accum[locale] = {}
            }
            accum[locale][v.key] = value
          })
        return accum
      }, {} as AppProps['locales']) || {},
    currencies:
      data?.currency.reduce((accumulator, currency) => {
        accumulator[currency.id] = {
          name: currency.id === 'LSC' && settings['coin.name'] ? settings['coin.name'] : currency.name,
          label: currency.id === 'LSC' && settings['coin.label'] ? settings['coin.label'] : currency.label,
          unit: currency.id === 'LSC' && settings['coin.unit'] ? settings['coin.unit'] : currency.unit,
          minorUnits: currency.minor_units ? currency.minor_units : 0,
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
      minor_units
    }
    locale {
      key
      zh
      zh_cn
      zh_acsi
      en
      vi
    }
    setting(where: { is_required: { _eq: true } }) {
      key
      is_secret
      app_settings(where: { app_id: { _eq: $appId } }) {
        value
      }
      app_secrets(where: { app_id: { _eq: $appId } }) {
        value
      }
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
      app_navs(order_by: { position: asc }) {
        block
        label
        href
        external
        tag
        position
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
`

export const useApp = () => useContext(AppContext)
