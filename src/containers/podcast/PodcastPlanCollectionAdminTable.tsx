import React from 'react'
import PodcastPlanCollectionAdminTableComponent, { PodcastPlan } from '../../components/podcast/PodcastPlanCollectionAdminTable'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import types from '../../types'
import { useAuth } from '../../components/auth/AuthContext'
import { Skeleton } from 'antd'
import { now } from 'moment'
import { sum } from 'ramda'

const PodcastPlanCollectionAdminTable: React.FC = () => {
  const { loading, error, data } = useQuery<types.GET_PODCAST_PLAN_ADMIN_COLLECTION>(
    GET_PODCAST_PLAN_ADMIN_COLLECTION,
  )

  if (loading) {
    return <Skeleton />
  }

  if (error || !data) {
    return <div>讀取錯誤</div>
  }

  const podcastPlans: PodcastPlan[] = data.podcast_plan.map(podcastPlan => ({
    id: podcastPlan.id,
    avatarUrl: podcastPlan.member.picture_url,
    creator: podcastPlan.member.name || podcastPlan.member.username,
    listPrice: podcastPlan.list_price,
    salePrice: podcastPlan.sold_at > now() ? podcastPlan.sale_price || 0 : undefined,
    salesCount: sum(podcastPlan.member.podcast_programs.map(podcastProgram => podcastProgram &&
      podcastProgram.podcast_program_enrollments_aggregate && podcastProgram.podcast_program_enrollments_aggregate.aggregate &&
      podcastProgram.podcast_program_enrollments_aggregate.aggregate.count || 0
    )),
    isPublished: !!podcastPlan.published_at,
    periodAmount: podcastPlan.period_amount,
    periodType: 'W',
  }))

  return (<>
    <PodcastPlanCollectionAdminTableComponent podcastPlans={podcastPlans} />
  </>)
}

export default PodcastPlanCollectionAdminTable

const GET_PODCAST_PLAN_ADMIN_COLLECTION = gql`
  query GET_PODCAST_PLAN_ADMIN_COLLECTION {
    podcast_plan {
      id
      period_type
      period_amount
      list_price
      sale_price
      sold_at
      published_at
      member {
        name
        username
        picture_url
        podcast_programs {
          podcast_program_enrollments_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    }
  }
`
