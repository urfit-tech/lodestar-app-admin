import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/file-input/dist/style.css'
import '@uppy/status-bar/dist/style.css'
import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import { LodestarAppProvider } from 'lodestar-app-element/src/contexts/LodestarAppContext'
import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { CustomRendererProps, CustomRendererProvider } from './contexts/CustomRendererContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Routes, { RouteProps } from './Routes'
import './styles/default/index.scss'

const Application: React.FC<{
  appId: string
  extraRouteProps?: { [routeKey: string]: RouteProps }
  customRender?: CustomRendererProps
}> = ({ appId, extraRouteProps, customRender }) => {
  return (
    <LodestarAppProvider appId={appId}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <QueryParamProvider ReactRouterRoute={Route}>
          <LanguageProvider>
            <ConfigProvider locale={zhTW}>
              <CustomRendererProvider renderer={customRender}>
                <Routes extra={extraRouteProps} />
              </CustomRendererProvider>
            </ConfigProvider>
          </LanguageProvider>
        </QueryParamProvider>
      </BrowserRouter>
    </LodestarAppProvider>
  )
}

export default Application
