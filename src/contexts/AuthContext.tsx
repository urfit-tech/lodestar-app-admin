import Axios from 'axios'
import jwt from 'jsonwebtoken'
import React, { useContext, useEffect, useState } from 'react'
import { handleError } from '../helpers'
import { UserRole } from '../schemas/general'
import { AppContext } from './AppContext'

type AuthContext = {
  isAuthenticating: boolean
  isAuthenticated: boolean
  currentUserRole: UserRole
  currentMemberId: string | null
  authToken: string | null
  currentMember: { name: string; username: string; email: string; pictureUrl: string } | null
  register?: (data: { appId: string; username: string; email: string; password: string }) => Promise<void>
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
  currentMember: null,
}

const AuthContext = React.createContext<AuthContext>(defaultAuthContext)

export const AuthProvider: React.FC = ({ children }) => {
  const { id: appId } = useContext(AppContext)
  const [isAuthenticating, setIsAuthenticating] = useState(defaultAuthContext.isAuthenticating)
  const [authToken, setAuthToken] = useState<string | null>(null)

  // TODO: add auth payload type
  const payload = authToken ? (jwt.decode(authToken) as any) : null

  // refresh token if expired or unauthenticated
  useEffect(() => {
    if (payload === null || payload.exp * 1000 < Date.now()) {
      setIsAuthenticating(true)
      Axios({
        method: 'POST',
        url: `${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/refresh-token`,
        withCredentials: true,
      })
        .then(({ data: { code, message, result } }) => {
          code === 'SUCCESS' ? setAuthToken(result.authToken) : setAuthToken(null)
        })
        .catch((error: Error) => {
          setAuthToken(null)
          handleError(error)
        })
        .finally(() => setIsAuthenticating(false))
    } else {
      setIsAuthenticating(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(payload)])

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
        socialLogin: async ({ provider, providerToken }) =>
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
          return Axios(`${process.env.REACT_APP_BACKEND_ENDPOINT}/auth/logout`, {
            method: 'POST',
            withCredentials: true,
          }).then(() => {
            setAuthToken(null)
          })
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
