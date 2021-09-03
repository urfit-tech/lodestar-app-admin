import { AppProvider } from 'lodestar-app-element/src/contexts/AppContext'
import { AuthProvider } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export const ElementConfig: React.FC<{
  appId: string
}> = ({ appId, children }) => {
  const { authToken, isAuthenticating } = useAuth()

  return (
    <AppProvider appId={appId}>
      <AuthProvider authToken={authToken} isAuthenticating={isAuthenticating}>
        {children}
      </AuthProvider>
    </AppProvider>
  )
}
