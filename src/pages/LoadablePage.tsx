import React, { useEffect, useState, lazy } from 'react'
import ReactPixel from 'react-facebook-pixel'
import { Redirect } from 'react-router-dom'
import useRouter from 'use-react-router'
import { useAuth } from '../contexts/AuthContext'
import { useGAPageView } from '../hooks/util'
import { UserRole } from '../schemas/general'
import settings from '../settings'
import LoadingPage from './default/LoadingPage'
import NotFoundPage from './default/NotFoundPage'

type LoadablePageProps = {
  pageName: string
  authenticated?: boolean
  allowedUserRole?: UserRole
}
const LoadablePage: React.FC<LoadablePageProps> = ({ pageName, authenticated, allowedUserRole, ...props }) => {
  useGAPageView()
  settings.trackingId.fbPixel && ReactPixel.pageView()

  const { location } = useRouter()
  const { isAuthenticated, isLoading, allowedUserRoles, setCurrentUserRole } = useAuth()

  useEffect(() => {
    if (setCurrentUserRole) {
      if (allowedUserRole) {
        setCurrentUserRole(allowedUserRole)
      } else {
        setCurrentUserRole(isAuthenticated ? 'general-member' : undefined)
      }
    }
  }, [allowedUserRole, setCurrentUserRole, isAuthenticated])

  // redirect to home page if not authenticated
  if (authenticated && !isLoading && !isAuthenticated) {
    return <Redirect to={{ pathname: '/', state: { from: location } }} />
  }

  // redirect to home page if not allowed roles
  if (allowedUserRole && !isLoading && !allowedUserRoles.includes(allowedUserRole)) {
    return <Redirect to={{ pathname: '/' }} />
  }

  const Page = lazy(() => import(`./default/${pageName}`))

  return <Page {...props} />
}

export default LoadablePage
