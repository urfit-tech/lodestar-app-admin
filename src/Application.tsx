import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { QueryParamProvider } from 'use-query-params'
import { ApiProvider } from './contexts/ApiContext'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { useApiHost, useAppAdmin } from './hooks/util'
import LoadingPage from './pages/default/LoadingPage'
import Routes, { RouteProps } from './Routes'
import './styles/default/index.scss'
import theme from './theme/default.json'

const Application: React.FC<{
  appId?: string
  extraRouteProps?: { [routeKey: string]: RouteProps }
}> = ({ appId, extraRouteProps }) => {
  const apiHost = useApiHost(appId || '')
  const appAdmin = useAppAdmin(window.location.host)

  if (!appAdmin || !appAdmin.apiHost) {
    return <LoadingPage />
  }

  return (
    <BrowserRouter>
      <QueryParamProvider ReactRouterRoute={Route}>
        <AuthProvider appId={appId || appAdmin.appId} apiHost={appId ? apiHost || appAdmin.apiHost : appAdmin.apiHost}>
          <ApiProvider>
            <AppProvider appId={appId || appAdmin.appId}>
              <LanguageProvider>
                <ThemeProvider theme={theme}>
                  <ConfigProvider locale={zhTW}>
                    <Routes extra={extraRouteProps} />
                  </ConfigProvider>
                </ThemeProvider>
              </LanguageProvider>
            </AppProvider>
          </ApiProvider>
        </AuthProvider>
      </QueryParamProvider>
    </BrowserRouter>
  )
}

export default Application
