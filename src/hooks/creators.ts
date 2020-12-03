import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { CreatorProps } from '../types/creator'

export const useCreator = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_CREATOR_COLLECTION>(
    gql`
      query GET_CREATOR_COLLECTION {
        creator(order_by: { published_at: desc, position: asc }) {
          id
          name
          picture_url
          published_at
          creator_categories {
            id
            category {
              id
              name
            }
          }
          member_specialities {
            id
            tag_name
          }
        }
      }
    `,
  )

  const creators: CreatorProps[] =
    loading || error || !data
      ? []
      : data.creator.map(v => ({
          id: v.id || '',
          isPublished: !!v.published_at,
          pictureUrl: v.picture_url,
          name: v.name || '',
          categoryNames: v.creator_categories.map(w => w.category.name),
          specialityNames: v.member_specialities.map(w => w.tag_name),
        }))

  return {
    loadingCreators: loading,
    errorCreators: error,
    creators,
    refetchCreators: refetch,
  }
}
