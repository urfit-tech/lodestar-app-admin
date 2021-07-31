import React, { lazy } from 'react'
import { Redirect, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserRoleLevel } from '../helpers'
import { UserRole } from '../types/member'
import LoadingPage from './LoadingPage'

const LoadablePage: React.FC<{
  pageName: string
  authenticated?: boolean
  allowedUserRole?: UserRole
}> = ({ pageName, authenticated, allowedUserRole, ...props }) => {
  const location = useLocation()
  const { isAuthenticated, isAuthenticating, currentUserRole } = useAuth()

  if (isAuthenticating) {
    return <LoadingPage />
  }

  // redirect to home page if not authenticated
  if (authenticated && !isAuthenticating && !isAuthenticated) {
    return <Redirect to={{ pathname: `/`, state: { from: location } }} />
  }

  // load forbidden page if not allowed roles
  const Page = lazy(() =>
    !isAuthenticating && allowedUserRole && getUserRoleLevel(allowedUserRole) > getUserRoleLevel(currentUserRole)
      ? import(`./ForbiddenPage`)
      : import(`./${pageName}`),
  )

  return <Page {...props} />
}

export default LoadablePage
