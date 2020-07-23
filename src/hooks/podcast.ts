import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { PodcastProgramProps } from '../types/podcast'

export const usePodcastProgramCollection = (podcastProgramId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PODCAST_PROGRAM_ADMIN,
    types.GET_PODCAST_PROGRAM_ADMINVariables
  >(
    gql`
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
          duration
          published_at
          creator_id
          support_locales
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
            name
            member {
              id
              picture_url
              name
              username
            }
          }
        }
      }
    `,
    { variables: { podcastProgramId } },
  )

  const podcastProgram: PodcastProgramProps | null =
    loading || error || !data || !data.podcast_program_by_pk
      ? null
      : {
          id: data.podcast_program_by_pk.id,
          title: data.podcast_program_by_pk.title,
          contentType: data.podcast_program_by_pk.content_type,
          duration: data.podcast_program_by_pk.duration,
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
          soldAt: data.podcast_program_by_pk.sold_at,
          creatorId: data.podcast_program_by_pk.creator_id,
          instructors: data.podcast_program_by_pk.podcast_program_roles.map(podcastProgramRole => ({
            id: podcastProgramRole.member?.id || '',
            name: podcastProgramRole.member?.name || '',
            pictureUrl: podcastProgramRole.member?.picture_url || '',
          })),
          publishedAt: data.podcast_program_by_pk.published_at
            ? new Date(data.podcast_program_by_pk.published_at)
            : null,
          supportLocales: data.podcast_program_by_pk.support_locales || [],
        }

  return {
    loadingPodcastProgram: loading,
    errorPodcastProgram: error,
    podcastProgram,
    refetchPodcastProgram: refetch,
  }
}

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
          soldAt: data.podcast_plan_by_pk.sold_at,
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
          avatarUrl: podcastPlan.creator?.picture_url || '',
          creator: podcastPlan.creator?.name || podcastPlan.creator?.username || '',
          listPrice: podcastPlan.list_price,
          salePrice:
            podcastPlan.sold_at && new Date(podcastPlan.sold_at).getTime() > Date.now() ? podcastPlan.sale_price : 0,
          salesCount: podcastPlan.podcast_plan_enrollments_aggregate.aggregate?.count || 0,
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

export const useUpdatePodcastProgramContent = () => {
  const [updatePodcastProgramContent] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_CONTENT,
    types.UPDATE_PODCAST_PROGRAM_CONTENTVariables
  >(UPDATE_PODCAST_PROGRAM_CONTENT)

  return updatePodcastProgramContent
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
    podcast_plan(order_by: { updated_at: desc }) {
      id
      period_type
      period_amount
      list_price
      sale_price
      sold_at
      published_at
      podcast_plan_enrollments_aggregate {
        aggregate {
          count
        }
      }
      creator {
        name
        username
        picture_url
      }
    }
  }
`
const UPDATE_PODCAST_PROGRAM_CONTENT = gql`
  mutation UPDATE_PODCAST_PROGRAM_CONTENT($podcastProgramId: uuid!, $contentType: String, $updatedAt: timestamptz!) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { content_type: $contentType, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`