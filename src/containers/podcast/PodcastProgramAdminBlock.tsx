import gql from 'graphql-tag'
import React, { createContext } from 'react'
import PodcastProgramAdminBlockComponent from '../../components/podcast/PodcastProgramAdminBlock'
import { message } from 'antd'

type PodcastProgramAdminProps = {
  id: string
  title: string
  audioUrl: string | null
  description: string | null
  categories: {
    id: string
    name: string
  }[]
  coverUrl?: string | null
  abstract: string | null
  listPrice: number
  salePrice?: number | null
  soldAt?: Date | null
  owner: {
    id: string
    avatarUrl?: string | null
    name: string
  }
  instructors: {
    id: string
    avatarUrl?: string | null
    name: string
  }[]
  publishedAt: Date | null
}
type UpdatePodcastProgramProps = {
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
  data: {
    audioUrl?: string
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

export const PodcastProgramAdminContext = createContext<{
  podcastProgramAdmin: PodcastProgramAdminProps
  updatePodcastProgram: (props: UpdatePodcastProgramProps) => void
}>({
  podcastProgramAdmin: {
    id: '',
    title: '',
    audioUrl: null,
    description: null,
    categories: [],
    abstract: null,
    listPrice: 0,
    owner: {
      id: '',
      name: '',
    },
    instructors: [],
    publishedAt: null,
  },
  updatePodcastProgram: () => {},
})

const PodcastProgramAdminBlock: React.FC<{
  podcastId: string
}> = podcastId => {
  // ! fake data
  const podcastProgramAdmin: PodcastProgramAdminProps = {
    id: 'podcast-1',
    title: '未命名的廣播',
    audioUrl: null,
    description: '123',
    categories: [],
    abstract: '456',
    listPrice: 0,
    owner: {
      id: 'creator-1',
      name: '王小美',
    },
    instructors: [],
    publishedAt: null,
  }

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
