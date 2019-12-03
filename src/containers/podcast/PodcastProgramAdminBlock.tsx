import React, { createContext } from 'react'
import PodcastProgramAdminBlockComponent from '../../components/podcast/PodcastProgramAdminBlock'

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
  onBefore?: () => void
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
    instructors: [
      {
        id: 'creator-1',
        name: '王小美',
      },
      {
        id: 'creator-2',
        name: 'Wangdaming',
      },
    ],
    publishedAt: null,
  }

  const updatePodcastProgram: (props: UpdatePodcastProgramProps) => void = ({
    onBefore,
    onSuccess,
    onError,
    onFinally,
    data,
  }) => {
    onBefore && onBefore()
    console.log(data)
    onFinally && onFinally()
  }

  return (
    <PodcastProgramAdminContext.Provider value={{ podcastProgramAdmin, updatePodcastProgram }}>
      <PodcastProgramAdminBlockComponent />
    </PodcastProgramAdminContext.Provider>
  )
}

export default PodcastProgramAdminBlock
