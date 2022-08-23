import { notification } from 'antd'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { createHttpLink } from 'apollo-link-http'
import { BatchHttpLink } from 'apollo-link-batch-http'

// create onError link
const onErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
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

// link to use if batching (default)
// also adds a `batch: true` header to the request to prove it's a different link
const batchHttpLink = new BatchHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  headers: { batch: 'true' },
})
// create http link:
const httpLink = createHttpLink({ uri: process.env.REACT_APP_GRAPHQL_ENDPOINT })

export const createApolloClient = (options: { authToken: string | null }) => {
  const apolloClient = new ApolloClient({
    link: split(
      operation => operation.getContext().important === true,
      ApolloLink.from([onErrorLink, withAuthTokenLink(options.authToken), httpLink]),
      ApolloLink.from([onErrorLink, withAuthTokenLink(options.authToken), batchHttpLink]),
    ),
    cache: new InMemoryCache(),
  })
  return apolloClient
}
