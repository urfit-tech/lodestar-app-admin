import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { uniq } from 'ramda'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import hasura from '../hasura'
import { PostProps } from '../types/blog'

export const usePost = (postId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_POST, hasura.GET_POSTVariables>(
    gql`
      query GET_POST($id: uuid!) {
        post_by_pk(id: $id) {
          id
          title
          source
          video_url
          description
          is_deleted
          code_name
          cover_url
          published_at
          meta_tag
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
    `,
    { variables: { id: postId } },
  )

  const post: PostProps | null =
    loading || error || !data || !data.post_by_pk
      ? null
      : {
          id: data.post_by_pk.id,
          title: data.post_by_pk.title,
          source: data.post_by_pk.source,
          videoUrl: data.post_by_pk.video_url,
          description: data.post_by_pk.description,
          metaTag: data.post_by_pk.meta_tag,
          isDeleted: data.post_by_pk.is_deleted,
          categories:
            data.post_by_pk.post_categories.map(category => ({
              id: category.category.id,
              name: category.category.name,
            })) || [],
          tagNames: data.post_by_pk.post_tags.map(tag => tag.tag_name) || [],
          codeName: data.post_by_pk.code_name,
          codeNames: uniq([
            ...data.post.map(post => post.id),
            ...data.post.filter(post => post.code_name).map(post => post.code_name),
          ]),
          coverUrl: data.post_by_pk.cover_url,
          merchandiseIds: data.post_by_pk.post_merchandises?.map(postMerchandise => postMerchandise.merchandise_id),
          creatorId: data.post_by_pk.post_roles.find(postRole => postRole.name === 'creator')?.member_id || '',
          authors: data.post_by_pk.post_roles
            .filter(postRole => postRole.name === 'author')
            .map(postRole => ({
              id: postRole.member_id,
              name: postRole.member?.name || '',
              pictureUrl: postRole.member?.picture_url || null,
            })),
          publishedAt: data.post_by_pk.published_at,
        }

  return {
    loadingPost: loading,
    errorPost: error,
    post,
    refetchPost: refetch,
  }
}

export const useMutatePost = () => {
  const [updatePostMetaTag] = useMutation<hasura.UPDATE_POST_META_TAG, hasura.UPDATE_POST_META_TAGVariables>(
    gql`
      mutation UPDATE_POST_META_TAG($id: uuid!, $metaTag: jsonb) {
        update_post(where: { id: { _eq: $id } }, _set: { meta_tag: $metaTag }) {
          affected_rows
        }
      }
    `,
  )

  return {
    updatePostMetaTag,
  }
}

export const usePostCollection = () => {
  const { permissions } = useAuth()
  const { currentMemberId } = useAuth()
  const condition: hasura.GET_POSTSVariables['condition'] = {
    is_deleted: { _eq: false },
    post_roles: permissions.POST_ADMIN
      ? undefined
      : permissions.POST_NORMAL
      ? { member: { id: { _eq: currentMemberId } } }
      : { member: { id: { _eq: '' } } },
  }
  const { loading, error, data, refetch } = useQuery<hasura.GET_POSTS, hasura.GET_POSTSVariables>(
    gql`
      query GET_POSTS($condition: post_bool_exp) {
        post(where: $condition, order_by: { updated_at: desc }) {
          id
          title
          cover_url
          video_url
          post_roles {
            id
            name
            post_id
            member {
              id
              name
              username
            }
          }
          published_at
          views
        }
      }
    `,
    {
      variables: { condition },
    },
  )

  const posts: {
    id: string
    title: string
    coverUrl: string | null
    videoUrl: string | null
    views: number | null
    publishedAt: Date | null
    authorName?: string | null
    roles: { name: string; memberId?: string | null }[]
  }[] =
    loading || error || !data
      ? []
      : data.post.map(post => ({
          id: post.id,
          title: post.title,
          coverUrl: post.cover_url,
          videoUrl: post.video_url,
          views: post.views,
          publishedAt: post.published_at,
          authorName: post.post_roles.find(postRole => postRole.name === 'author')?.member?.name,
          roles: post.post_roles.map(role => ({
            name: role.name,
            memberId: role.member?.id,
          })),
        }))

  return {
    loadingPosts: loading,
    errorPosts: error,
    posts,
    refetchPosts: refetch,
  }
}
