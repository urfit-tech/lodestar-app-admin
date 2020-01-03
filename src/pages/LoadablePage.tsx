import React, { useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState()
  const [PageComponentModule, setPageComponentModule] = useState()

  useEffect(() => {
    setLoading(true)
    let componentModule
    try {
      componentModule = require(`./default/${pageName}`)
    } catch {
      componentModule = 'not found'
    }
    setPageComponentModule(componentModule)
    setLoading(false)
  }, [pageName])

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

  return loading || !PageComponentModule ? (
    <LoadingPage />
  ) : PageComponentModule === 'not found' ? (
    <NotFoundPage />
  ) : (
    <PageComponentModule.default {...props} />
  )
}

export default LoadablePage
