import React from 'react'
import PodcastProgramCollectionAdminTableComponent, {
  PodcastProgramProps,
} from '../../components/podcast/PodcastProgramCollectionAdminTable'

const PodcastProgramCollectionAdminTable: React.FC = () => {
  // ! fake data
  const podcastPrograms: PodcastProgramProps[] = [
    {
      id: 'podcast-1',
      title: '高效職場人必備技能：讓你好好開會，好好報告高效職場人必備技能',
      creator: '王小美',
      listPrice: 600,
      salePrice: 500,
      salesCount: 3,
      isPublished: true,
    },
    {
      id: 'podcast-2',
      title: '性格講座《容格⼼理類型及相關應⽤》',
      creator: '王小美',
      listPrice: 600,
      salesCount: 10,
      isPublished: true,
    },
    {
      id: 'podcast-3',
      title: 'BCG問題解決力：15堂課全面掌握高效工作法',
      creator: '大飛',
      listPrice: 600,
      salesCount: 10,
      isPublished: false,
    },
    {
      id: 'podcast-4',
      title: '高效職場人必備技能：讓你好好開會，好好報告高效職場人必備技能讓你好好開...',
      creator: 'Andy',
      listPrice: 600,
      salesCount: 10,
      isPublished: true,
    },
    {
      id: 'podcast-5',
      title: '性格講座《容格⼼理類型及相關應⽤》',
      creator: '王小美',
      listPrice: 600,
      salesCount: 10,
      isPublished: true,
    },
  ]

  return <PodcastProgramCollectionAdminTableComponent podcastPrograms={podcastPrograms} />
}

export default PodcastProgramCollectionAdminTable
