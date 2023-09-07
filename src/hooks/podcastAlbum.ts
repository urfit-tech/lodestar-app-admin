import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import hasura from '../hasura'
import { PodcastAlbum } from '../types/podcastAlbum'

export const usePodcastAlbumAdmin = (podcastAlbumId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PODCAST_ALBUM, hasura.GET_PODCAST_ALBUMVariables>(
    gql`
      query GET_PODCAST_ALBUM($podcastAlbumId: uuid!) {
        podcast_album_by_pk(id: $podcastAlbumId) {
          id
          title
          cover_url
          abstract
          description
          is_public
          is_deleted
          published_at
          podcast_album_categories(order_by: { position: asc }) {
            category {
              id
              name
            }
          }
          podcast_album_podcast_programs {
            id
            position
            podcast_program {
              id
              title
              cover_url
              duration_second
            }
          }
          author {
            id
            name
          }
        }
      }
    `,
    { variables: { podcastAlbumId } },
  )
  const podcastAlbum: PodcastAlbum = {
    id: data?.podcast_album_by_pk?.id,
    title: data?.podcast_album_by_pk?.title || '',
    coverUrl: data?.podcast_album_by_pk?.cover_url || '',
    author: {
      id: data?.podcast_album_by_pk?.author?.id || '',
      name: data?.podcast_album_by_pk?.author?.name || '',
    },
    abstract: data?.podcast_album_by_pk?.abstract || '',
    description: data?.podcast_album_by_pk?.description || '',
    isPublic: !!data?.podcast_album_by_pk?.is_public,
    isDeleted: !!data?.podcast_album_by_pk?.is_deleted,
    publishedAt: data?.podcast_album_by_pk?.published_at ? new Date(data.podcast_album_by_pk.published_at) : null,
    podcastPrograms:
      data?.podcast_album_by_pk?.podcast_album_podcast_programs.map(v => ({
        id: v?.podcast_program?.id,
        podcastAlbumPodcastProgramId: v.id,
        title: v.podcast_program?.title || '',
        coverUrl: v.podcast_program?.cover_url || '',
        position: v.position,
        durationSecond: v.podcast_program?.duration_second || 0,
      })) || [],
    categories:
      data?.podcast_album_by_pk?.podcast_album_categories.map(v => ({
        id: v?.category?.id || '',
        name: v?.category?.name || '',
      })) || [],
  }

  return {
    loading,
    error,
    podcastAlbum,
    refetch,
  }
}

export const usePodcastAlbumCounts = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PODCAST_ALBUM_COUNTS,
    hasura.GET_PODCAST_ALBUM_COUNTSVariables
  >(
    gql`
      query GET_PODCAST_ALBUM_COUNTS($appId: String!) {
        draft: podcast_album_aggregate(
          where: { app_id: { _eq: $appId }, published_at: { _is_null: true }, is_deleted: { _eq: false } }
        ) {
          aggregate {
            count
          }
        }
        published: podcast_album_aggregate(
          where: { app_id: { _eq: $appId }, published_at: { _is_null: false }, is_deleted: { _eq: false } }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: { appId },
      fetchPolicy: 'no-cache',
    },
  )
  const counts: { [key: string]: number } | null = data
    ? {
        draft: data?.draft.aggregate?.count || 0,
        published: data?.published.aggregate?.count || 0,
      }
    : null

  return {
    loadingPodcastAlbumCounts: loading,
    errorPodcastAlbumCounts: error,
    counts,
    refetchPodcastAlbumCounts: refetch,
  }
}
