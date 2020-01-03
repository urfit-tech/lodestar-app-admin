import { useQuery } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import PodcastProgramCollectionAdminTableComponent, { PodcastProgramProps } from '../../components/podcast/PodcastProgramCollectionAdminTable'
import types from '../../types'

const PodcastProgramCollectionAdminTable: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_PODCAST_PROGRAM_ADMIN_COLLECTION>(
    GET_PODCAST_PROGRAM_ADMIN_COLLECTION,
  )

  useEffect(() => {
    refetch()
  }, [refetch])

  if (loading) {
    return <Skeleton active />
  }

  if (error || !data) {
    return <div>讀取錯誤</div>
  }

  const podcastPrograms: PodcastProgramProps[] = data.podcast_program.map(podcastProgram => ({
    id: podcastProgram.id,
    coverUrl: podcastProgram.cover_url,
    title: podcastProgram.title,
    instructorName: podcastProgram.podcast_program_roles.length
      ? podcastProgram.podcast_program_roles[0].member.name || podcastProgram.podcast_program_roles[0].member.username
      : '',
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
    podcast_program(order_by: { updated_at: desc_nulls_last }) {
      id
      title
      cover_url
      abstract
      list_price
      sale_price
      sold_at
      published_at
      creator {
        id
        name
        username
      }
      podcast_program_categories(order_by: { category: { position: asc } }) {
        id
        category {
          id
          name
        }
      }
      podcast_program_roles(where: { name: { _eq: "instructor" } }) {
        id
        member {
          id
          name
          username
        }
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
