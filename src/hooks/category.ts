import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { Category, ClassType } from '../types/category'

export const useCategory = (appId: string, classType?: ClassType) => {
  const { loading, data, error, refetch } = useQuery<types.GET_CATEGORIES, types.GET_CATEGORIESVariables>(
    gql`
      query GET_CATEGORIES($appId: String!, $classType: String) {
        category(where: { app_id: { _eq: $appId }, class: { _eq: $classType } }, order_by: { position: asc }) {
          id
          name
          position
        }
      }
    `,
    {
      variables: { appId, classType },
    },
  )

  const categories: Category[] =
    loading || error || !data
      ? []
      : data.category.map(category => ({
          id: category.id,
          name: category.name,
          position: category.position,
        }))

  return {
    loading,
    categories,
    error,
    refetch,
  }
}
