import { ApolloProvider } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { createApolloClient } from '../helpers/apollo'
import types from '../types'
import { useAuth } from './AuthContext'

export const ApiProvider: React.FC = ({ children }) => {
  const { currentMemberId, authToken } = useAuth()
  const apolloClient = createApolloClient({ authToken })
  useEffect(() => {
    currentMemberId &&
      apolloClient.mutate<types.UPDATE_LOGINED_AT, types.UPDATE_LOGINED_ATVariables>({
        mutation: UPDATE_LOGINED_AT,
        variables: {
          memberId: currentMemberId,
          loginedAt: new Date(),
        },
      })
  }, [apolloClient, currentMemberId])
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

const UPDATE_LOGINED_AT = gql`
  mutation UPDATE_LOGINED_AT($memberId: String!, $loginedAt: timestamptz) {
    update_member(where: { id: { _eq: $memberId } }, _set: { logined_at: $loginedAt }) {
      affected_rows
    }
  }
`
