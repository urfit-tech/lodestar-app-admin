import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { MetaProductType } from 'lodestar-app-element/src/types/metaProduct'
import hasura from '../hasura'

export const useIdentity = () => {
  const [insertMetaProductIdentity] = useMutation<
    hasura.INSERT_META_PRODUCT_IDENTITY,
    hasura.INSERT_META_PRODUCT_IDENTITYVariables
  >(gql`
    mutation INSERT_META_PRODUCT_IDENTITY($appId: String!, $type: String!, $name: String, $position: Int) {
      insert_identity(objects: { app_id: $appId, type: $type, name: $name, position: $position }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

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
        return { identityId: getIdentityData?.identity[0]?.id, identityLoading: loading, identityListRefetch: refetch }
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
    insertMetaProductIdentity,
    insertMetaProjectAuthorIdentity,
  }
}

export const useProjectIdentity = () => {
  const [updateMetaProjectIdentityName] = useMutation<
    hasura.UPDATE_META_PROJECT_IDENTITY_NAME,
    hasura.UPDATE_META_PROJECT_IDENTITY_NAMEVariables
  >(gql`
    mutation UPDATE_META_PROJECT_IDENTITY_NAME($identityId: uuid!, $name: String) {
      update_identity(_set: { name: $name }, where: { id: { _eq: $identityId } }) {
        affected_rows
      }
    }
  `)

  const [updateMetaProjectIdentityPosition] = useMutation<
    hasura.UPDATE_META_PROJECT_IDENTITY_POSITION,
    hasura.UPDATE_META_PROJECT_IDENTITY_POSITIONVariables
  >(gql`
    mutation UPDATE_META_PROJECT_IDENTITY_POSITION($data: [identity_insert_input!]!) {
      insert_identity(objects: $data, on_conflict: { constraint: identity_pkey, update_columns: position }) {
        affected_rows
      }
    }
  `)

  const [deleteMetaProjectIdentity] = useMutation<
    hasura.DELETE_META_PROJECT_IDENTITY,
    hasura.DELETE_META_PROJECT_IDENTITYVariables
  >(gql`
    mutation DELETE_META_PROJECT_IDENTITY($identityId: uuid!) {
      delete_identity(where: { id: { _eq: $identityId } }) {
        affected_rows
      }
    }
  `)
  return {
    updateMetaProjectIdentityName,
    updateMetaProjectIdentityPosition,
    deleteMetaProjectIdentity,
  }
}
