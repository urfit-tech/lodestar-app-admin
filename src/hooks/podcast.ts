import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import types from '../types'

export const usePodcastPlan = (podcastPlanId: string) => {
  const { data, loading, error, refetch } = useQuery<types.GET_PODCAST_PLAN, types.GET_PODCAST_PLANVariables>(
    GET_PODCAST_PLAN,
    {
      variables: {
        podcastPlanId,
      },
    },
  )
  const podcastPlan: {
    id: string
    listPrice: number
    salePrice?: number | null
    soldAt?: Date | null
    periodAmount: number
    periodType: 'Y' | 'M' | 'W'
    isPublished: boolean
    creatorId: string
  } | null =
    loading || error || !data || !data.podcast_plan_by_pk
      ? null
      : {
          id: data.podcast_plan_by_pk.id,
          listPrice: data.podcast_plan_by_pk.list_price,
          salePrice: data.podcast_plan_by_pk.sale_price,
          soldAt: new Date(data.podcast_plan_by_pk.sold_at),
          periodAmount: data.podcast_plan_by_pk.period_amount,
          periodType: data.podcast_plan_by_pk.period_type as 'Y' | 'M' | 'W',
          isPublished: new Date(data.podcast_plan_by_pk.published_at).getTime() < Date.now(),
          creatorId: data.podcast_plan_by_pk.creator_id,
        }

  return {
    loadingPodcastPlan: loading,
    errorPodcastPlan: error,
    podcastPlan,
    refetchPodcastPlan: refetch,
  }
}

export type PodcastPlan = {
  id: string
  avatarUrl?: string | null
  creator: string
  listPrice: number
  salePrice: number
  salesCount: number
  isPublished: boolean
  periodAmount: number
  periodType: string
}

export const usePodcastPlanAdminCollection = () => {
  const { data, loading, error, refetch } = useQuery<types.GET_PODCAST_PLAN_ADMIN_COLLECTION>(
    GET_PODCAST_PLAN_ADMIN_COLLECTION,
  )

  const podcastPlans: PodcastPlan[] | null =
    loading || error || !data || !data.podcast_plan
      ? null
      : data.podcast_plan.map(podcastPlan => ({
          id: podcastPlan.id,
          avatarUrl: podcastPlan.member.picture_url,
          creator: podcastPlan.member.name || podcastPlan.member.username,
          listPrice: podcastPlan.list_price,
          salePrice:
            podcastPlan.sold_at && new Date(podcastPlan.sold_at).getTime() > Date.now() ? podcastPlan.sale_price : 0,
          salesCount: sum(
            podcastPlan.member.podcast_programs.map(
              podcastProgram =>
                (podcastProgram &&
                  podcastProgram.podcast_program_enrollments_aggregate &&
                  podcastProgram.podcast_program_enrollments_aggregate.aggregate &&
                  podcastProgram.podcast_program_enrollments_aggregate.aggregate.count) ||
                0,
            ),
          ),
          isPublished: !!podcastPlan.published_at,
          periodAmount: podcastPlan.period_amount,
          periodType: podcastPlan.period_type,
        }))

  return {
    loadingPodcastPlanAdminCollection: loading,
    errorPodcastPlanAdminCollection: error,
    podcastPlans,
    refetchPodcastPlanAdminCollection: refetch,
  }
}

const GET_PODCAST_PLAN = gql`
  query GET_PODCAST_PLAN($podcastPlanId: uuid!) {
    podcast_plan_by_pk(id: $podcastPlanId) {
      id
      creator_id
      period_type
      period_amount
      list_price
      sale_price
      sold_at
      published_at
    }
  }
`

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
