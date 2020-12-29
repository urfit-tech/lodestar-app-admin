import Application from 'lodestar-app-admin/src/Application'
import React from 'react'
import './App.scss'
import TermsPtPage from './pages/TermsPtPage'

const App = () => {
  return (
    <Application
      extraRouteProps={{
        terms: {
          path: '/terms',
          pageName: <TermsPtPage />,
          authenticated: false,
        },
      }}
    />
  )
}

export default App
