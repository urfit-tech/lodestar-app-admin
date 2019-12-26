import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import 'moment/locale/zh-tw'
import React from 'react'
import { hot } from 'react-hot-loader/root'
import { BrowserRouter, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { QueryParamProvider } from 'use-query-params'
import { AuthProvider } from './components/auth/AuthContext'
import { ApiProvider } from './components/common/ApiContext'
import { AppProvider } from './containers/common/AppContext'
import { useGA, usePixel, useTappay } from './hooks/util'
import Routes from './Routes'
import './styles/default/index.scss'
import theme from './theme/default.json'

const Application = () => {
  useGA()
  usePixel()
  useTappay()

  return (
    <AuthProvider>
      <ApiProvider>
        <AppProvider>
          <ThemeProvider theme={theme}>
            <ConfigProvider locale={zhTW}>
              <BrowserRouter>
                <QueryParamProvider ReactRouterRoute={Route}>
                  <Routes />
                </QueryParamProvider>
              </BrowserRouter>
            </ConfigProvider>
          </ThemeProvider>
        </AppProvider>
      </ApiProvider>
    </AuthProvider>
  )
}

// export default Application
export default process.env.NODE_ENV === 'development' ? hot(Application) : Application
