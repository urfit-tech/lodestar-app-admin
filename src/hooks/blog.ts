import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { PostType } from '../types/blog'

export const usePost = (
  postId: string,
): {
  loading: boolean
  error?: Error
  data: PostType
  refetch: () => void
} => {
  const { loading, error, data, refetch } = useQuery(GET_POST, {
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
        }
      : { id: '', title: '', videoUrl: '', description: '' },
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
    }
  }
`
