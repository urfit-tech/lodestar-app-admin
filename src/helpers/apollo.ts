import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { createHttpLink } from 'apollo-link-http'
import { notification } from 'antd'

// create onError link
const onErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path, extensions }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`, extensions)
      if (extensions && extensions.code === 'invalid-jwt') {
        notification.info({ message: '連線已過期，將重新整理此畫面' })
        setTimeout(() => window.location.reload(), 3000)
      }
    })
  if (networkError) console.log(`[Network error]: ${networkError}`)
})

// create auth context link
const withAuthTokenLink = (authToken: string | null) =>
  setContext(
    () =>
      authToken && {
        headers: { authorization: `Bearer ${authToken}` },
      },
  )

// create http link:
const httpLink = createHttpLink({ uri: process.env.REACT_APP_GRAPHQL_ENDPOINT })

export const createApolloClient = (options: { authToken: string | null }) => {
  const apolloClient = new ApolloClient({
    link: ApolloLink.from([onErrorLink, withAuthTokenLink(options.authToken), httpLink]),
    cache: new InMemoryCache(),
  })
  return apolloClient
}
