import { useQuery } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import PodcastProgramCollectionAdminTableComponent, {
  PodcastProgramProps,
} from '../../components/podcast/PodcastProgramCollectionAdminTable'
import types from '../../types'

const PodcastProgramCollectionAdminTable: React.FC = () => {
  const { loading, error, data } = useQuery<types.GET_PODCAST_PROGRAM_ADMIN_COLLECTION>(
    GET_PODCAST_PROGRAM_ADMIN_COLLECTION,
  )

  if (loading) {
    return <Skeleton />
  }

  if (error || !data) {
    return <div>讀取錯誤</div>
  }

  const podcastPrograms: PodcastProgramProps[] = data.podcast_program.map(podcastProgram => ({
    id: podcastProgram.id,
    coverUrl: podcastProgram.cover_url,
    title: podcastProgram.title,
    creator: podcastProgram.creator_id,
    listPrice: podcastProgram.list_price,
    salePrice:
      podcastProgram.sold_at && new Date(podcastProgram.sold_at).getTime() > Date.now()
        ? podcastProgram.sale_price || 0
        : undefined,
    salesCount: podcastProgram.podcast_program_enrollments_aggregate.aggregate
      ? podcastProgram.podcast_program_enrollments_aggregate.aggregate.count || 0
      : 0,
    isPublished: !!podcastProgram.published_at,
  }))

  return <PodcastProgramCollectionAdminTableComponent podcastPrograms={podcastPrograms} />
}

const GET_PODCAST_PROGRAM_ADMIN_COLLECTION = gql`
  query GET_PODCAST_PROGRAM_ADMIN_COLLECTION {
    podcast_program {
      id
      creator_id
      title
      cover_url
      abstract
      list_price
      sale_price
      sold_at
      published_at
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
      podcast_program_enrollments_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

export default PodcastProgramCollectionAdminTable
