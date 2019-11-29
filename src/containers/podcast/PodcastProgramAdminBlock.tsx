import React from 'react'
import PodcastProgramAdminBlockComponent, {
  PodcastProgramAdminProps,
} from '../../components/podcast/PodcastProgramAdminBlock'

const PodcastProgramAdminBlock: React.FC<{
  podcastId: string
}> = () => {
  // ! fake data
  const podcastProgramAdmin: PodcastProgramAdminProps = {
    id: 'podcast-1',
    title: '未命名的廣播',
  }

  return <PodcastProgramAdminBlockComponent podcastProgramAdmin={podcastProgramAdmin} />
}

export default PodcastProgramAdminBlock
