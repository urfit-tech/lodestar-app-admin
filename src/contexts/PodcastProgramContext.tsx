import { useQuery } from '@apollo/react-hooks'
import { ApolloError } from 'apollo-client'
import gql from 'graphql-tag'
import React, { createContext } from 'react'
import types from '../types'

type PodcastProgramProps = {
  id: string
  title: string
  contentType: string | null
  duration: number
  description: string | null
  categories: {
    id: string
    name: string
  }[]
  coverUrl: string | null
  abstract: string | null
  listPrice: number
  salePrice: number | null
  soldAt: Date | null
  creatorId: string
  instructors: { id: string; name: string; pictureUrl: string }[]
  publishedAt: Date | null
  supportLocales: string[]
}

const PodcastProgramContext = createContext<{
  loadingPodcastProgram: boolean
  errorPodcastProgram?: ApolloError
  podcastProgram?: PodcastProgramProps
  refetchPodcastProgram?: () => void
}>({
  loadingPodcastProgram: true,
})

export const PodcastProgramProvider: React.FC<{
  podcastProgramId: string
}> = ({ podcastProgramId, children }) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PODCAST_PROGRAM_ADMIN,
    types.GET_PODCAST_PROGRAM_ADMINVariables
  >(GET_PODCAST_PROGRAM_ADMIN, {
    variables: {
      podcastProgramId,
    },
  })

  const podcastProgram: PodcastProgramProps | undefined =
    loading || !!error || !data || !data.podcast_program_by_pk
      ? undefined
      : {
          id: data.podcast_program_by_pk.id,
          title: data.podcast_program_by_pk.title,
          contentType: data.podcast_program_by_pk.content_type,
          duration: data.podcast_program_by_pk.duration,
          description: data.podcast_program_by_pk.podcast_program_bodies[0]
            ? data.podcast_program_by_pk.podcast_program_bodies[0].description
            : null,
          categories: data.podcast_program_by_pk.podcast_program_categories.map(podcastProgramCategory => ({
            id: podcastProgramCategory.category.id,
            name: podcastProgramCategory.category.name,
          })),
          coverUrl: data.podcast_program_by_pk.cover_url,
          abstract: data.podcast_program_by_pk.abstract,
          listPrice: data.podcast_program_by_pk.list_price,
          salePrice: data.podcast_program_by_pk.sale_price,
          soldAt: data.podcast_program_by_pk.sold_at,
          creatorId: data.podcast_program_by_pk.creator_id,
          instructors: data.podcast_program_by_pk.podcast_program_roles.map(podcastProgramRole => ({
            id: podcastProgramRole.member?.id || '',
            name: podcastProgramRole.member?.name || '',
            pictureUrl: podcastProgramRole.member?.picture_url || '',
          })),
          publishedAt: data.podcast_program_by_pk.published_at
            ? new Date(data.podcast_program_by_pk.published_at)
            : null,
          supportLocales: data.podcast_program_by_pk.support_locales || [],
        }

  return (
    <PodcastProgramContext.Provider
      value={{
        loadingPodcastProgram: loading,
        errorPodcastProgram: error,
        podcastProgram,
        refetchPodcastProgram: refetch,
      }}
    >
      {children}
    </PodcastProgramContext.Provider>
  )
}

const GET_PODCAST_PROGRAM_ADMIN = gql`
  query GET_PODCAST_PROGRAM_ADMIN($podcastProgramId: uuid!) {
    podcast_program_by_pk(id: $podcastProgramId) {
      id
      title
      cover_url
      abstract
      list_price
      sale_price
      sold_at
      content_type
      duration
      published_at
      creator_id
      support_locales
      podcast_program_bodies {
        id
        description
      }
      podcast_program_categories(order_by: { category: { position: asc } }) {
        id
        category {
          id
          name
        }
      }
      podcast_program_roles {
        id
        name
        member {
          id
          picture_url
          name
          username
        }
      }
    }
  }
`

export default PodcastProgramContext
