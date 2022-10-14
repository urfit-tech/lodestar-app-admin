import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { MetaProductType } from 'lodestar-app-element/src/types/metaProduct'
import hasura from '../hasura'

export const useRole = () => {
  const useGetAuthorIdentityId = (type: MetaProductType) => {
    const { loading, error, data, refetch } = useQuery<
      hasura.GET_AUTHOR_IDENTITY_ID,
      hasura.GET_AUTHOR_IDENTITY_IDVariables
    >(
      gql`
        query GET_AUTHOR_IDENTITY_ID($type: String!) {
          identity(where: { type: { _eq: $type }, name: { _eq: "author" } }) {
            id
          }
        }
      `,
      {
        variables: { type },
      },
    )

    return { authorIdentityId: data?.identity[0]?.id, authorIdentityIdLoading: loading }
  }
  const [insertMetaProjectAuthorIdentity] = useMutation<
    hasura.INSERT_META_PROJECT_AUTHOR_IDENTITY,
    hasura.INSERT_META_PROJECT_AUTHOR_IDENTITYVariables
  >(gql`
    mutation INSERT_META_PROJECT_AUTHOR_IDENTITY($appId: String!, $type: String!) {
      insert_identity(objects: { app_id: $appId, type: $type, name: "author" }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)
  return {
    useGetAuthorIdentityId,
    insertMetaProjectAuthorIdentity,
  }
}
