import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http'
import { UserRole } from '../schemas/general'

const createApolloClient = ({
  appId,
  currentMemberId,
  currentUserRole,
}: {
  appId?: string
  currentMemberId?: string
  currentUserRole?: UserRole
}) => {
  // Create HTTP link:
  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  })

  // Create context link
  const contextLink = setContext(() => {
    let authToken: string | null
    try {
      authToken = localStorage.getItem(`kolable.auth.token`)
    } catch (error) {
      authToken = null
    }

    return currentUserRole
      ? {
          headers: {
            'x-hasura-app-id': appId,
            authorization: `Bearer ${authToken}`,
            'x-hasura-role': currentUserRole,
            'x-hasura-user-id': currentMemberId,
          },
        }
      : {
          headers: {
            'x-hasura-app-id': appId,
            'x-hasura-user-id': currentMemberId,
          },
        }
  })

  const apolloClient = new ApolloClient({
    link: ApolloLink.from([contextLink, httpLink]),
    cache: new InMemoryCache(),
  })

  return apolloClient
}

export { createApolloClient }
