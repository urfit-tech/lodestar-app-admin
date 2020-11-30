import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { CreatorProps } from '../types/creator'

export const useCreator = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_CREATOR_COLLECTION>(
    gql`
      query GET_CREATOR_COLLECTION {
        creator {
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
  const [insertCreatorDisplayHandler] = useMutation<
    types.INSERT_CREATOR_DISPLAY,
    types.INSERT_CREATOR_DISPLAYVariables
  >(gql`
    mutation INSERT_CREATOR_DISPLAY($creatorId: String!) {
      insert_creator_display_one(object: { member_id: $creatorId }) {
        id
      }
    }
  `)

  const [deleteCreatorDisplayHandler] = useMutation<
    types.DELETE_CREATOR_DISPLAY,
    types.DELETE_CREATOR_DISPLAYVariables
  >(gql`
    mutation DELETE_CREATOR_DISPLAY($creatorId: String!) {
      delete_creator_display(where: { member_id: { _eq: $creatorId }, block_id: { _eq: "default" } }) {
        affected_rows
      }
    }
  `)

  const insertCreatorDisplay = (creatorId: string) => {
    return insertCreatorDisplayHandler({
      variables: {
        creatorId,
      },
    })
  }

  const deleteCreatorDisplay = (creatorId: string) => {
    return deleteCreatorDisplayHandler({
      variables: {
        creatorId,
      },
    })
  }

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
    insertCreatorDisplay,
    deleteCreatorDisplay,
  }
}
