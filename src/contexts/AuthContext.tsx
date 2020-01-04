import Axios from 'axios'
import jwt from 'jsonwebtoken'
import React, { useContext, useEffect, useState } from 'react'
import { useInterval } from '../hooks/util'
import { UserRole } from '../schemas/general'

type AuthContext = {
  isAuthenticating: boolean
  isAuthenticated: boolean
  currentUserRole: UserRole
  currentMemberId: string | null
  authToken: string | null
  login?: (data: { appId: string; account: string; password: string }) => Promise<void>
  socialLogin?: (data: { provider: string; providerToken: any }) => Promise<void>
  logout?: () => Promise<void>
}

const defaultAuthContext: AuthContext = {
  isAuthenticating: true,
  isAuthenticated: false,
  currentUserRole: 'anonymous',
  currentMemberId: null,
  authToken: null,
}

const AuthContext = React.createContext<AuthContext>(defaultAuthContext)

export const AuthProvider: React.FC = ({ children }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(defaultAuthContext.isAuthenticating)
  const [authToken, setAuthToken] = useState<string | null>(null)

  // TODO: add auth payload type
  const payload = authToken ? (jwt.decode(authToken) as any) : null

  const refreshToken = () => {
    setIsAuthenticating(true)
    Axios(`${process.env.REACT_APP_BACKEND_ENDPOINT}/refreshToken`, {
      method: 'post',
      withCredentials: true,
    })
      .then(({ data }) => setAuthToken(data.authToken))
      .catch(() => setAuthToken(null))
      .finally(() => setIsAuthenticating(false))
  }

  useEffect(() => {
    !authToken && refreshToken()
  }, [authToken])

  useInterval(refreshToken, 35000)

  // useEffect(() => {
  //   const payload = authToken ? jwt.decode(authToken) : null

  //   Fingerprint2.get(components => {
  //     const values = components.map(component => component.value)
  //     const fingerprint = Fingerprint2.x64hash128(values.join(''), 31)
  //     if (payload && typeof payload === 'object') {
  //       let currentTime = Date.now() / 1000
  //       let expiredTime = payload.exp - 86400

  //       if (expiredTime < currentTime) {
  //         try {
  //           localStorage.removeItem(`kolable.auth.token`)
  //         } catch (error) {}
  //         window.location.reload()
  //       }

  //       setAuthState({
  //         ...defaultContext,
  //         fingerprint,
  //         isAuthenticating: false,
  //         isAuthenticated: true,
  //         currentMemberId: payload.sub,
  //         allowedUserRoles: payload.allowedRoles,
  //       })
  //     } else {
  //       // use fingerprint as the currentMemberId
  //       setAuthState({
  //         ...defaultContext,
  //         fingerprint,
  //         isAuthenticating: false,
  //         isAuthenticated: false,
  //         currentMemberId: fingerprint,
  //       })
  //     }
  //   })
  // }, [authState.authToken])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticating,
        isAuthenticated: Boolean(authToken),
        currentUserRole: (payload && payload.role) || 'anonymous',
        currentMemberId: payload && payload.sub,
        authToken,
        login: async ({ appId, account, password }) =>
          Axios.post(
            `${process.env.REACT_APP_BACKEND_ENDPOINT}/generalLogin`,
            { appId, account, password },
            {
              withCredentials: true,
              // prevent preflight
              // TODO: find a better way to do so
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            },
          ).then(({ data, status }) => {
            if (status === 204) {
              window.location.assign(`/check-email?email=${account}&type=reset-password`)
            } else {
              setAuthToken(data.authToken)
            }
          }),
        socialLogin: async ({ provider, providerToken }) =>
          Axios.post(
            `${process.env.REACT_APP_BACKEND_ENDPOINT}/socialLogin`,
            {
              appId: process.env.REACT_APP_ID,
              provider,
              providerToken,
            },
            {
              withCredentials: true,
              // prevent preflight
              // TODO: find a better way to do so
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            },
          ).then(({ data }) => {
            setAuthToken(data.authToken)
          }),
        logout: async () =>
          Axios(`${process.env.REACT_APP_BACKEND_ENDPOINT}/logout`, {
            method: 'POST',
            withCredentials: true,
          }).then(() => setAuthToken(null)),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
