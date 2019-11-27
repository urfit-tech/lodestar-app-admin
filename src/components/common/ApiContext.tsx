import { ApolloProvider, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo-hooks'
import { createApolloClient } from '../../helpers/apollo'
import types from '../../types'
import { useAuth } from '../auth/AuthContext'
import { message } from 'antd'

export const ApiProvider: React.FC = ({ children }) => {
  const [appId, setAppId] = useState<string | null>(null)
  const { currentUserRole, currentMemberId, isAuthenticated } = useAuth()
  const [apolloClient, setApolloClient] = useState(createApolloClient({ currentMemberId, currentUserRole }))
  useEffect(() => {
    localStorage.removeItem('kolable.app.id')
    apolloClient
      .query<types.GET_APPLICATION, types.GET_APPLICATIONVariables>({
        query: GET_APPLICATION,
        variables: { adminHost: window.location.host },
      })
      .then(({ data }) => {
        const app = (data && data.app.length && data.app[0]) || null
        if (app) {
          localStorage.setItem('kolable.app.id', app.id)
          setAppId(app.id)
        } else {
          message.error('無法取得應用程式')
        }
      })
  }, [setApolloClient, setAppId])
  useEffect(() => {
    appId &&
      currentMemberId &&
      currentUserRole &&
      setApolloClient(createApolloClient({ currentMemberId, currentUserRole, appId }))
  }, [currentMemberId, currentUserRole, appId])
  useEffect(() => {
    if (isAuthenticated && currentMemberId) {
      apolloClient.mutate<types.UPDATE_LOGINED_AT, types.UPDATE_LOGINED_ATVariables>({
        mutation: UPDATE_LOGINED_AT,
        variables: {
          memberId: currentMemberId,
          loginedAt: new Date(),
        },
      })
    }
  }, [isAuthenticated, currentMemberId])

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
  query GET_APPLICATION($adminHost: String!) {
    app(where: { admin_host: { _eq: $adminHost } }) {
      id
    }
  }
`
