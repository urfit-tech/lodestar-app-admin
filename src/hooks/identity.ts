import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { MetaProductType } from 'lodestar-app-element/src/types/metaProduct'
import hasura from '../hasura'

export const useIdentity = () => {
  const [insertMetaProjectAuthorIdentity] = useMutation<
    hasura.INSERT_META_PROJECT_AUTHOR_IDENTITY,
    hasura.INSERT_META_PROJECT_AUTHOR_IDENTITYVariables
  >(gql`
    mutation INSERT_META_PROJECT_AUTHOR_IDENTITY($appId: String!, $type: String!) {
      insert_identity(objects: { app_id: $appId, type: $type, name: "author", position: -1 }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  const [loadIdentity, { called, loading, data: getIdentityData, refetch }] = useLazyQuery<
    hasura.GET_IDENTITY,
    hasura.GET_IDENTITYVariables
  >(
    gql`
      query GET_IDENTITY($condition: identity_bool_exp!) {
        identity(where: $condition, order_by: { position: asc }) {
          id
          name
          position
        }
      }
    `,
  )

  return {
    getIdentity: (type: MetaProductType, roleName?: string) => {
      const condition: hasura.GET_IDENTITYVariables['condition'] = {
        type: { _eq: type },
        name: { _eq: roleName },
      }

      if (!called) {
        loadIdentity({ variables: { condition } })
      }

      if (roleName) {
        return { identityId: getIdentityData?.identity[0]?.id, identityLoading: loading }
      }

      const identityList = getIdentityData?.identity
        .map(identity => ({
          id: identity.id,
          name: identity.name,
          position: identity.position,
        }))
        .filter(v => v.name !== 'author')

      return {
        identityList: identityList,
        identityListLoading: loading,
        identityListRefetch: refetch,
      }
    },
    insertMetaProjectAuthorIdentity,
  }
}
