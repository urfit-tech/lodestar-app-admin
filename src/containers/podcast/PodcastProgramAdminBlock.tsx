import React from 'react'
import PodcastProgramAdminBlockComponent, {
  PodcastProgramAdminProps,
} from '../../components/podcast/PodcastProgramAdminBlock'

export type UpdatePodcastProgramProps = {
  onBefore?: () => void
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
  data: {
    title?: string
    audioUrl?: string
    description?: string
    categoryIds?: string[]
    abstract?: string
    listPrice?: number
    instructorIds?: string[]
  }
}

const PodcastProgramAdminBlock: React.FC<{
  podcastId: string
}> = () => {
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

  return <PodcastProgramAdminBlockComponent podcastProgramAdmin={podcastProgramAdmin} onUpdate={updatePodcastProgram} />
}

export default PodcastProgramAdminBlock
