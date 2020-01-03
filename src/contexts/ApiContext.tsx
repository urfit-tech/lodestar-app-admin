import { ApolloProvider } from '@apollo/react-hooks'
import { message } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { createApolloClient } from '../helpers/apollo'
import types from '../types'
import { useAuth } from './AuthContext'

export const ApiProvider: React.FC = ({ children }) => {
  const [appId, setAppId] = useState<string | null>(null)
  const { currentUserRole, currentMemberId, isAuthenticated } = useAuth()
  const [apolloClient, setApolloClient] = useState(createApolloClient({ currentMemberId, currentUserRole }))

  useEffect(() => {
    localStorage.removeItem('kolable.app.id')
    apolloClient
      .query<types.GET_APPLICATION, types.GET_APPLICATIONVariables>({
        query: GET_APPLICATION,
        variables: { host: window.location.host },
      })
      .then(({ data }) => {
        if (data && data.app_admin_by_pk) {
          const appId = data.app_admin_by_pk.app_id
          localStorage.setItem('kolable.app.id', appId)
          setAppId(appId)
        } else {
          message.error('無法取得應用程式')
        }
      })
  }, [apolloClient, setApolloClient, setAppId])

  useEffect(() => {
    if (appId && currentMemberId && currentUserRole) {
      const client = createApolloClient({ currentMemberId, currentUserRole, appId })
      setApolloClient(client)

      if (isAuthenticated) {
        client.mutate<types.UPDATE_LOGINED_AT, types.UPDATE_LOGINED_ATVariables>({
          mutation: UPDATE_LOGINED_AT,
          variables: {
            memberId: currentMemberId,
            loginedAt: new Date(),
          },
        })
      }
    }
  }, [appId, currentMemberId, currentUserRole, isAuthenticated])

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

const UPDATE_LOGINED_AT = gql`
  mutation UPDATE_LOGINED_AT($memberId: String!, $loginedAt: timestamptz) {
    update_member(where: { id: { _eq: $memberId } }, _set: { logined_at: $loginedAt }) {
      affected_rows
    }
  }
`

const GET_APPLICATION = gql`
  query GET_APPLICATION($host: String!) {
    app_admin_by_pk(host: $host) {
      app_id
    }
  }
`
