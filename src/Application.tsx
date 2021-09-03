import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { QueryParamProvider } from 'use-query-params'
import { ElementConfig } from './containers/ElementConfig'
import { ApiProvider } from './contexts/ApiContext'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import { CustomRendererProps, CustomRendererProvider } from './contexts/CustomRendererContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Routes, { RouteProps } from './Routes'
import './styles/default/index.scss'
import theme from './theme/default.json'

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
                <ThemeProvider theme={theme}>
                  <ConfigProvider locale={zhTW}>
                    <ElementConfig appId={appId}>
                      <CustomRendererProvider renderer={customRender}>
                        <Routes extra={extraRouteProps} />
                      </CustomRendererProvider>
                    </ElementConfig>
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
