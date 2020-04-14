import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { uniq } from 'ramda'
import types from '../types'
import { PostType } from '../types/blog'

export const usePost = (
  postId: string,
): {
  loading: boolean
  error?: Error
  post: PostType
  refetch: () => void
} => {
  const { loading, error, data, refetch } = useQuery<types.GET_POST, types.GET_POSTVariables>(GET_POST, {
    variables: {
      id: postId,
    },
  })
  const codeNames =
    data &&
    uniq([...data.post.map(post => post.id), ...data.post.filter(post => post.code_name).map(post => post.code_name)])

  const post: PostType =
    loading || error || !data
      ? {
          id: '',
          title: '',
          videoUrl: '',
          description: '',
          isDeleted: false,
          categories: [],
          tagNames: [],
          codeName: '',
          codeNames: [],
          coverUrl: '',
          merchandiseIds: [],
          creatorId: '',
          authors: [],
          publishedAt: null,
        }
      : {
          id: data?.post_by_pk?.id || '',
          title: data?.post_by_pk?.title || '',
          videoUrl: data?.post_by_pk?.video_url || '',
          description: data?.post_by_pk?.description || '',
          isDeleted: data?.post_by_pk?.is_deleted || false,
          categories:
            data?.post_by_pk?.post_categories.map(category => ({
              id: category?.category?.id || '',
              name: category?.category?.name || '',
            })) || [],
          tagNames: data?.post_by_pk?.post_tags.map(tag => tag.tag_name) || [],
          codeName: data?.post_by_pk?.code_name || '',
          codeNames,
          coverUrl: data?.post_by_pk?.cover_url || '',
          merchandiseIds: data.post_by_pk?.post_merchandises?.map(postMerchandise => postMerchandise.merchandise_id),
          creatorId: data?.post_by_pk?.post_roles.find(postRole => postRole.name === 'creator')?.member_id || '',
          authors: data.post_by_pk?.post_roles
            .filter(postRole => postRole.name === 'author')
            .map(postRole => ({
              id: postRole.member_id,
              name: postRole?.member?.name || '',
              pictureUrl: postRole?.member?.picture_url || '',
            })),
          publishedAt: data?.post_by_pk?.published_at,
        }

  return {
    loading,
    error,
    post,
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
      code_name
      cover_url
      published_at
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
      post_merchandises {
        merchandise_id
      }
      post_roles {
        name
        member_id
        member {
          name
          picture_url
        }
      }
    }
    post {
      id
      code_name
    }
  }
`

export const usePostCollection = () => {
  const { loading, error, data } = useQuery<types.GET_POSTS>(GET_POSTS)

  const posts: {
    id: string
    title: string
    coverUrl: string | null
    videoUrl: string | null
    views: number | null
    publishedAt: Date | null
    memberName?: string | null
  }[] =
    loading || error || !data
      ? [
          {
            id: '',
            title: '',
            coverUrl: '',
            videoUrl: '',
            views: null,
            publishedAt: null,
            memberName: '',
          },
        ]
      : data?.post.map(post => {
          return {
            id: post.id,
            title: post.title,
            coverUrl: post.cover_url,
            videoUrl: post.video_url,
            views: post.views,
            publishedAt: post.published_at,
            memberName: post?.post_roles[0].member?.name || post?.post_roles[0].member?.username || '',
          }
        })

  return {
    loading,
    error,
    posts,
  }
}

const GET_POSTS = gql`
  query GET_POSTS {
    post(where: { is_deleted: { _eq: false } }) {
      id
      title
      cover_url
      video_url
      post_roles {
        id
        post_id
        member {
          name
          username
        }
      }
      published_at
      views
    }
  }
`

export const useInsertPost = () => {
  const [insertPost] = useMutation<types.INSERT_POST, types.INSERT_POSTVariables>(
    gql`
      mutation INSERT_POST(
        $appId: String!
        $title: String!
        $postCategories: [post_category_insert_input!]!
        $postRoles: [post_role_insert_input!]!
      ) {
        insert_post(
          objects: {
            app_id: $appId
            title: $title
            post_categories: { data: $postCategories }
            post_roles: { data: $postRoles }
          }
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `,
  )

  return insertPost
}
