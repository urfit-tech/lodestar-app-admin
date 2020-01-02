import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { createContext } from 'react'
import ApplicationHelmet from '../../components/common/ApplicationHelmet'
import types from '../../types'

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
  const appId = localStorage.getItem('kolable.app.id') || ''

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
        appId: appId,
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
export default AppContext
