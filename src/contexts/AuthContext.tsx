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
  refreshToken?: (data: { appId: string }) => Promise<void>
  register?: (data: { appId: string; username: string; email: string; password: string }) => Promise<void>
  login?: (data: { appId: string; account: string; password: string }) => Promise<void>
  socialLogin?: (data: { appId: string; provider: string; providerToken: any }) => Promise<void>
  logout?: () => void
}

const defaultAuthContext: AuthContext = {
  isAuthenticating: true,
  isAuthenticated: false,
  currentUserRole: 'anonymous',
  currentMemberId: null,
  authToken: null,
  currentMember: null,
}

const AuthContext = React.createContext<AuthContext>(defaultAuthContext)

export const AuthProvider: React.FC = ({ children }) => {
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
        refreshToken: async ({ appId }) =>
          Axios.post(
            `${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/refresh-token`,
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
            .finally(() => setIsAuthenticating(false)),
        register: async ({ appId, username, email, password }) =>
          Axios.post(
            `${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/register`,
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
          }),
        login: async ({ appId, account, password }) =>
          Axios.post(
            `${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/general-login`,
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
          }),
        socialLogin: async ({ appId, provider, providerToken }) =>
          Axios.post(
            `${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/social-login`,
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
          }),
        logout: async () => {
          localStorage.clear()
          Axios(`${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/logout`, {
            method: 'POST',
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
