import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import '@uppy/file-input/dist/style.css'
import '@uppy/status-bar/dist/style.css'
import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import { LodestarAppProvider } from 'lodestar-app-element/src/contexts/LodestarAppContext'
import React from 'react'
import AdminRouter, { RouteProps } from './components/common/AdminRouter'
import { CustomRendererProps, CustomRendererProvider } from './contexts/CustomRendererContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './styles/default/index.scss'

const Application: React.FC<{
  appId: string
  extraRouteProps?: { [routeKey: string]: RouteProps }
  customRender?: CustomRendererProps
}> = ({ appId, extraRouteProps = {}, customRender }) => {
  return (
    <LodestarAppProvider appId={appId}>
      <LanguageProvider>
        <ConfigProvider locale={zhTW}>
          <CustomRendererProvider renderer={customRender}>
            <AdminRouter extraRouteProps={extraRouteProps} />
          </CustomRendererProvider>
        </ConfigProvider>
      </LanguageProvider>
    </LodestarAppProvider>
  )
}

export default Application
