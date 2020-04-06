import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { PostType } from '../types/blog'
import types from '../types'

export const usePost = (
  postId: string,
): {
  loading: boolean
  error?: Error
  data: PostType
  refetch: () => void
} => {
  const { loading, error, data, refetch } = useQuery<types.GET_POST, types.GET_POSTVariables>(GET_POST, {
    variables: {
      id: postId,
    },
  })

  return {
    loading,
    error,
    data: data?.post_by_pk
      ? {
          id: data.post_by_pk.id,
          title: data.post_by_pk.title,
          videoUrl: data.post_by_pk.video_url,
          description: data.post_by_pk.description,
          isDeleted: data.post_by_pk.is_deleted,
          categories: data.post_by_pk.post_categories.map(category => ({
            id: category?.category?.id || '',
            name: category?.category?.name || '',
          })),
          tagNames: data.post_by_pk.post_tags.map(tag => tag.tag_name),
        }
      : {
          id: '',
          title: '',
          videoUrl: '',
          description: '',
          isDeleted: false,
          categories: [{ id: '', name: '' }],
          tagNames: [],
        },
    refetch,
  }
}

const GET_POST = gql`
  query GET_POST($id: uuid!) {
    post_by_pk(id: $id) {
      id
      title
      video_url
      description
      is_deleted
      post_categories {
        id
        category {
          id
          name
        }
      }
      post_tags {
        id
        tag_name
      }
    }
  }
`
