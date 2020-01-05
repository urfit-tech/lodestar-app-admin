import React, { lazy } from 'react'
import ReactPixel from 'react-facebook-pixel'
import { Redirect } from 'react-router-dom'
import useRouter from 'use-react-router'
import { useAuth } from '../contexts/AuthContext'
import { getUserRoleLevel } from '../helpers'
import { useGAPageView } from '../hooks/util'
import { UserRole } from '../schemas/general'
import settings from '../settings'

type LoadablePageProps = {
  pageName: string
  authenticated?: boolean
  allowedUserRole?: UserRole
}
const LoadablePage: React.FC<LoadablePageProps> = ({ pageName, authenticated, allowedUserRole, ...props }) => {
  useGAPageView()
  settings.trackingId.fbPixel && ReactPixel.pageView()

  const { location } = useRouter()
  const { isAuthenticated, isAuthenticating, currentUserRole } = useAuth()

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
