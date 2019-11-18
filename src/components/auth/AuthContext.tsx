import Fingerprint2 from 'fingerprintjs2'
import jwt from 'jsonwebtoken'
import React, { useContext, useEffect, useState } from 'react'
import { UserRole } from '../../schemas/general'
import { message } from 'antd'

type AuthContext = {
  isLoading: boolean
  fingerprint: string
  isAuthenticated: boolean
  currentMemberId?: string
  allowedUserRoles: UserRole[]
  currentUserRole?: UserRole
  setCurrentUserRole?: React.Dispatch<React.SetStateAction<UserRole | undefined>>
  setAuthToken?: React.Dispatch<React.SetStateAction<string | null>>
}
const defaultContext: AuthContext = {
  isLoading: true,
  fingerprint: '',
  isAuthenticated: false,
  allowedUserRoles: [],
}
const AuthContext = React.createContext<AuthContext>(defaultContext)

export const AuthProvider: React.FC = ({ children }) => {
  let defaultAuthToken: string | null
  try {
    defaultAuthToken = localStorage.getItem(`${process.env.REACT_APP_ID}.auth.token`)
  } catch (error) {
    defaultAuthToken = null
  }
  const [authToken, setAuthToken] = useState(defaultAuthToken)
  const [authState, setAuthState] = useState(defaultContext)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>()
  useEffect(() => {
    const payload = authToken ? jwt.decode(authToken) : null
    Fingerprint2.get(components => {
      const values = components.map(component => component.value)
      const fingerprint = Fingerprint2.x64hash128(values.join(''), 31)
      if (payload && typeof payload === 'object') {
        let currentTime = Date.now() / 1000
        let expiredTime = payload.exp - 86400
        if (expiredTime < currentTime) {
          try {
            localStorage.removeItem(`${process.env.REACT_APP_ID}.auth.token`)
          } catch (error) {}
          window.location.reload()
        }
        const allowedRoles = payload.allowedRoles as string[]
        const withRoleAuth = (currentUserRole && allowedRoles.includes(currentUserRole)) || false
        if (withRoleAuth) {
          setAuthState({
            ...defaultContext,
            fingerprint,
            isLoading: false,
            isAuthenticated: true,
            currentMemberId: payload.sub,
            allowedUserRoles: payload.allowedRoles,
          })
        } else {
          message.error('沒有該角色權限')
          localStorage.removeItem(`${process.env.REACT_APP_ID}.auth.token`)
        }
      } else {
        // use fingerprint as the currentMemberId
        setAuthState({
          ...defaultContext,
          fingerprint,
          isLoading: false,
          isAuthenticated: false,
          currentMemberId: fingerprint,
        })
      }
    })
  }, [authToken])
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        currentUserRole: authToken ? currentUserRole : undefined,
        setCurrentUserRole,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
