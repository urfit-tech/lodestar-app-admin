import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { AppThemeProvider } from './components/AppThemeContext'
import { ApiProvider } from './contexts/ApiContext'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import { CustomRendererProps, CustomRendererProvider } from './contexts/CustomRendererContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Routes, { RouteProps } from './Routes'

const Application: React.FC<{
  appId: string
  extraRouteProps?: { [routeKey: string]: RouteProps }
  customRender?: CustomRendererProps
}> = ({ appId, extraRouteProps, customRender }) => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <QueryParamProvider ReactRouterRoute={Route}>
        <AuthProvider appId={appId}>
          <ApiProvider>
            <AppProvider appId={appId}>
              <LanguageProvider>
                <AppThemeProvider>
                  <ConfigProvider locale={zhTW}>
                    <CustomRendererProvider renderer={customRender}>
                      <Routes extra={extraRouteProps} />
                    </CustomRendererProvider>
                  </ConfigProvider>
                </AppThemeProvider>
              </LanguageProvider>
            </AppProvider>
          </ApiProvider>
        </AuthProvider>
      </QueryParamProvider>
    </BrowserRouter>
  )
}

export default Application
