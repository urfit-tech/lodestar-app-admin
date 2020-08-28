import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import React from 'react'
import { hot } from 'react-hot-loader/root'
import { BrowserRouter, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { QueryParamProvider } from 'use-query-params'
import { ApiProvider } from './contexts/ApiContext'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Routes from './Routes'
import './styles/default/index.scss'
import theme from './theme/default.json'

const Application: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryParamProvider ReactRouterRoute={Route}>
        <AuthProvider>
          <ApiProvider>
            <AppProvider>
              <LanguageProvider>
                <ThemeProvider theme={theme}>
                  <ConfigProvider locale={zhTW}>
                    <Routes />
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

export default process.env.NODE_ENV === 'development' ? hot(Application) : Application
