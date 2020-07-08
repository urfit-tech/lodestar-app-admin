import React, { lazy } from 'react'
import ReactPixel from 'react-facebook-pixel'
import { Redirect, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserRoleLevel } from '../helpers'
import { useGAPageView } from '../hooks/util'
import settings from '../settings'
import { UserRole } from '../types/general'
import LoadingPage from './default/LoadingPage'

const LoadablePage: React.FC<{
  pageName: string
  authenticated?: boolean
  allowedUserRole?: UserRole
}> = ({ pageName, authenticated, allowedUserRole, ...props }) => {
  const location = useLocation()
  const { isAuthenticated, isAuthenticating, currentUserRole } = useAuth()

  useGAPageView()
  settings.trackingId.fbPixel && ReactPixel.pageView()

  if (isAuthenticating) {
    return <LoadingPage />
  }

  // redirect to home page if not authenticated
  if (authenticated && !isAuthenticating && !isAuthenticated) {
    return <Redirect to={{ pathname: '/', state: { from: location } }} />
  }

  // load forbidden page if not allowed roles
  const Page = lazy(() =>
    !isAuthenticating && allowedUserRole && getUserRoleLevel(allowedUserRole) > getUserRoleLevel(currentUserRole)
      ? import(`./default/ForbiddenPage`)
      : import(`./default/${pageName}`),
  )

  return <Page {...props} />
}

export default LoadablePage
