import Fingerprint2 from 'fingerprintjs2'
import jwt from 'jsonwebtoken'
import React, { useContext, useEffect, useState } from 'react'
import { UserRole } from '../../schemas/general'

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
  let defaultAuthToken: string | null = window.localStorage ? localStorage.getItem('kolable.auth.token') : null

  const [authToken, setAuthToken] = useState<string | null>(defaultAuthToken)
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
            localStorage.removeItem(`kolable.auth.token`)
          } catch (error) {}
          window.location.reload()
        }

        setAuthState({
          ...defaultContext,
          fingerprint,
          isLoading: false,
          isAuthenticated: true,
          currentMemberId: payload.sub,
          allowedUserRoles: payload.allowedRoles,
        })
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
