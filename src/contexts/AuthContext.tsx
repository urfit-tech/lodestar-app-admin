import Axios from 'axios'
import jwt from 'jsonwebtoken'
import React, { useContext, useState } from 'react'
import { UserRole } from '../types/member'

type AuthContext = {
  isAuthenticating: boolean
  isAuthenticated: boolean
  currentUserRole: UserRole
  currentMemberId: string | null
  authToken: string | null
  currentMember: { name: string; username: string; email: string; pictureUrl: string } | null
  permissions: { [key: string]: boolean }
  backendEndpoint: string | null
  setBackendEndpoint?: (value: string) => void
  refreshToken?: (data: { appId: string }) => Promise<void>
  register?: (data: { appId: string; username: string; email: string; password: string }) => Promise<void>
  login?: (data: { appId: string; account: string; password: string }) => Promise<void>
  socialLogin?: (data: { appId: string; provider: string; providerToken: any }) => Promise<void>
  logout?: () => Promise<void>
}

const defaultAuthContext: AuthContext = {
  isAuthenticating: true,
  isAuthenticated: false,
  currentUserRole: 'anonymous',
  currentMemberId: null,
  authToken: null,
  currentMember: null,
  permissions: {},
  backendEndpoint: null,
}

const AuthContext = React.createContext<AuthContext>(defaultAuthContext)

export const AuthProvider: React.FC = ({ children }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(defaultAuthContext.isAuthenticating)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [backendEndpoint, setBackendEndpoint] = useState(process.env.REACT_APP_BACKEND_ENDPOINT || null)

  // TODO: add auth payload type
  const payload = authToken ? (jwt.decode(authToken) as any) : null

  return (
    <AuthContext.Provider
      value={{
        isAuthenticating,
        isAuthenticated: Boolean(authToken),
        currentUserRole: (payload && payload.role) || 'anonymous',
        currentMemberId: payload && payload.sub,
        authToken,
        currentMember: payload && {
          name: payload.name,
          username: payload.username,
          email: payload.email,
          pictureUrl: payload.pictureUrl,
        },
        permissions: payload?.permissions
          ? payload.permissions.reduce((accumulator: { [key: string]: boolean }, currentValue: string) => {
              accumulator[currentValue] = true
              return accumulator
            }, {})
          : {},
        backendEndpoint,
        setBackendEndpoint,
        refreshToken: backendEndpoint
          ? async ({ appId }) =>
              Axios.post(
                `${backendEndpoint}/auth/refresh-token`,
                { appId },
                {
                  method: 'POST',
                  withCredentials: true,
                },
              )
                .then(({ data: { code, message, result } }) => {
                  if (code === 'SUCCESS') {
                    setAuthToken(result.authToken)
                  } else {
                    setAuthToken(null)
                    throw new Error(code)
                  }
                })
                .finally(() => setIsAuthenticating(false))
          : undefined,
        register: backendEndpoint
          ? async ({ appId, username, email, password }) =>
              Axios.post(
                `${backendEndpoint}/auth/register`,
                {
                  appId,
                  username,
                  email,
                  password,
                },
                { withCredentials: true },
              ).then(({ data: { code, message, result } }) => {
                if (code === 'SUCCESS') {
                  setAuthToken(result.authToken)
                } else {
                  setAuthToken(null)
                  throw new Error(code)
                }
              })
          : undefined,
        login: backendEndpoint
          ? async ({ appId, account, password }) =>
              Axios.post(
                `${backendEndpoint}/auth/general-login`,
                { appId, account, password },
                { withCredentials: true },
              ).then(({ data: { code, result } }) => {
                if (code !== 'SUCCESS') {
                  setAuthToken(null)
                  throw new Error(code)
                } else if (result === null) {
                  window.location.assign(`/check-email?email=${account}&type=reset-password`)
                } else {
                  setAuthToken(result.authToken)
                }
              })
          : undefined,
        socialLogin: backendEndpoint
          ? async ({ appId, provider, providerToken }) =>
              Axios.post(
                `${backendEndpoint}/auth/social-login`,
                {
                  appId,
                  provider,
                  providerToken,
                },
                { withCredentials: true },
              ).then(({ data: { code, message, result } }) => {
                if (code === 'SUCCESS') {
                  setAuthToken(result.authToken)
                } else {
                  setAuthToken(null)
                  throw new Error(code)
                }
              })
          : undefined,
        logout: backendEndpoint
          ? async () => {
              localStorage.clear()
              return Axios(`${backendEndpoint}/auth/logout`, {
                method: 'POST',
                withCredentials: true,
              }).then(({ data: { code, message, result } }) => {
                setAuthToken(null)
                if (code !== 'SUCCESS') {
                  throw new Error(code)
                }
              })
            }
          : undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
