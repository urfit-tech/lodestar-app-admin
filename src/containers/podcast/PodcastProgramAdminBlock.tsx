import { useQuery } from '@apollo/react-hooks'
import { message, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { createContext } from 'react'
import PodcastProgramAdminBlockComponent from '../../components/podcast/PodcastProgramAdminBlock'
import types from '../../types'

type PodcastProgramAdminProps = {
  id: string
  title: string
  contentType: string | null
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
  instructorIds: string[]
  publishedAt: Date | null
}
type UpdatePodcastProgramProps = {
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
  data: {
    description?: string
    title?: string
    categoryIds?: string[]
    coverUrl?: string
    abstract?: string
    listPrice?: number
    salePrice?: number | null
    soldAt?: Date | null
    instructorIds?: string[]
    publishedAt?: Date | null
  }
}

const defaultPodcastProgramAdmin: PodcastProgramAdminProps = {
  id: '',
  title: '',
  coverUrl: null,
  contentType: null,
  description: null,
  categories: [],
  abstract: null,
  listPrice: 0,
  salePrice: null,
  soldAt: null,
  creatorId: '',
  instructorIds: [],
  publishedAt: null,
}

export const PodcastProgramAdminContext = createContext<{
  podcastProgramAdmin: PodcastProgramAdminProps
  updatePodcastProgram: (props: UpdatePodcastProgramProps) => void
}>({
  podcastProgramAdmin: defaultPodcastProgramAdmin,
  updatePodcastProgram: () => {},
})

const PodcastProgramAdminBlock: React.FC<{
  podcastProgramId: string
}> = ({ podcastProgramId }) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PODCAST_PROGRAM_ADMIN,
    types.GET_PODCAST_PROGRAM_ADMINVariables
  >(GET_PODCAST_PROGRAM_ADMIN, {
    variables: {
      podcastProgramId: podcastProgramId,
    },
  })

  const updatePodcastProgram: (props: UpdatePodcastProgramProps) => void = ({
    onSuccess,
    onError,
    onFinally,
    data,
  }) => {
    console.log(data)
    onSuccess && onSuccess()
    message.success('儲存成功')
    onFinally && onFinally()
  }

  if (loading) {
    return <Skeleton active />
  }

  if (error || !data || !data.podcast_program_by_pk) {
    return <div>讀取錯誤 {podcastProgramId}</div>
  }

  const podcastProgramAdmin = {
    id: data.podcast_program_by_pk.id,
    title: data.podcast_program_by_pk.title,
    contentType: data.podcast_program_by_pk.content_type,
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
    soldAt: data.podcast_program_by_pk.sold_at ? new Date(data.podcast_program_by_pk.sold_at) : null,
    creatorId: data.podcast_program_by_pk.creator_id,
    instructorIds: data.podcast_program_by_pk.podcast_program_roles.map(
      podcastProgramRole => podcastProgramRole.member_id,
    ),
    publishedAt: data.podcast_program_by_pk.published_at ? new Date(data.podcast_program_by_pk.published_at) : null,
  }

  return (
    <PodcastProgramAdminContext.Provider value={{ podcastProgramAdmin, updatePodcastProgram }}>
      <PodcastProgramAdminBlockComponent />
    </PodcastProgramAdminContext.Provider>
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
      published_at
      creator_id
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
        member_id
        name
      }
    }
  }
`

export default PodcastProgramAdminBlock
