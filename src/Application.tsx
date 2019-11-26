import { ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale-provider/zh_TW'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import 'moment/locale/zh-tw'
import React from 'react'
import { Helmet } from 'react-helmet'
import { hot } from 'react-hot-loader'
import { Route } from 'react-router-dom'
import { Organization, WithContext } from 'schema-dts'
import { ThemeProvider } from 'styled-components'
import { QueryParamProvider } from 'use-query-params'
import { AuthProvider } from './components/auth/AuthContext'
import { ApiProvider } from './components/common/ApiContext'
import { useGA, usePixel, useTappay } from './hooks/util'
import Routes from './Routes'
import settings from './settings'
import './styles/default/index.scss'
import theme from './theme/default.json'

const Application = () => {
  useGA()
  usePixel()
  useTappay()
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ApiProvider>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ConfigProvider locale={zhTW}>
              <ApplicationHelmet />
              <Routes />
            </ConfigProvider>
          </QueryParamProvider>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

const ApplicationHelmet = () => {
  const linkedJson: WithContext<Organization> | null = settings.seo.name
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: settings.seo.name,
        logo: settings.seo.logo,
        url: settings.seo.url,
      }
    : null

  return (
    <Helmet>
      <title>{process.env.REACT_APP_ID}</title>
      <meta name="description" content={process.env.REACT_APP_ID} />

      {/* open graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={settings.openGraph.title} />
      <meta property="og:url" content={settings.openGraph.url} />
      <meta property="og:image" content={settings.openGraph.image} />
      <meta property="og:description" content={settings.openGraph.description} />

      {/* JSON LD */}
      {linkedJson ? <script type="application/ld+json">{JSON.stringify(linkedJson)}</script> : null}
    </Helmet>
  )
}

// export default Application
export default process.env.NODE_ENV === 'development' ? hot(module)(Application) : Application
