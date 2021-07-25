import axios from 'axios'
import jwt from 'jsonwebtoken'
import React, { useContext, useState } from 'react'
import { UserRole } from '../types/member'

type AuthProps = {
  isAuthenticating: boolean
  isAuthenticated: boolean
  currentUserRole: UserRole
  currentMemberId: string | null
  authToken: string | null
  currentMember: { name: string; username: string; email: string; pictureUrl: string } | null
  permissions: { [key: string]: boolean }
  refreshToken?: () => Promise<void>
  register?: (data: { username: string; email: string; password: string }) => Promise<void>
  login?: (data: { account: string; password: string }) => Promise<void>
  socialLogin?: (data: { provider: string; providerToken: any }) => Promise<void>
  logout?: () => Promise<void>
}

const defaultAuthContext: AuthProps = {
  isAuthenticating: true,
  isAuthenticated: false,
  currentUserRole: 'anonymous',
  currentMemberId: null,
  authToken: null,
  currentMember: null,
  permissions: {},
}

const AuthContext = React.createContext<AuthProps>(defaultAuthContext)

export const AuthProvider: React.FC<{
  appId: string
}> = ({ appId, children }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(defaultAuthContext.isAuthenticating)
  const [authToken, setAuthToken] = useState<string | null>(null)

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
        refreshToken: async () =>
          axios
            .post(
              `${process.env.REACT_APP_API_BASE_ROOT}/auth/refresh-token`,
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
              }
            })
            .finally(() => setIsAuthenticating(false)),
        register: async ({ username, email, password }) =>
          axios
            .post(
              `${process.env.REACT_APP_API_BASE_ROOT}/auth/register`,
              {
                appId,
                username,
                email,
                password,
              },
              { withCredentials: true },
            )
            .then(({ data: { code, message, result } }) => {
              if (code === 'SUCCESS') {
                setAuthToken(result.authToken)
              } else {
                setAuthToken(null)
                throw new Error(code)
              }
            }),
        login: async ({ account, password }) =>
          axios
            .post(
              `${process.env.REACT_APP_API_BASE_ROOT}/auth/general-login`,
              { appId, account, password },
              { withCredentials: true },
            )
            .then(({ data: { code, result } }) => {
              if (code !== 'SUCCESS') {
                setAuthToken(null)
                throw new Error(code)
              } else if (result === null) {
                window.location.assign(`/check-email?email=${account}&type=reset-password`)
              } else {
                setAuthToken(result.authToken)
              }
            }),
        socialLogin: async ({ provider, providerToken }) =>
          axios
            .post(
              `${process.env.REACT_APP_API_BASE_ROOT}/auth/social-login`,
              {
                appId,
                provider,
                providerToken,
              },
              { withCredentials: true },
            )
            .then(({ data: { code, message, result } }) => {
              if (code === 'SUCCESS') {
                setAuthToken(result.authToken)
              } else {
                setAuthToken(null)
                throw new Error(code)
              }
            }),
        logout: async () => {
          localStorage.clear()
          axios(`${process.env.REACT_APP_API_BASE_ROOT}/auth/logout`, {
            method: 'post',
            withCredentials: true,
          }).then(({ data: { code, message, result } }) => {
            setAuthToken(null)
            if (code !== 'SUCCESS') {
              throw new Error(code)
            }
          })
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
