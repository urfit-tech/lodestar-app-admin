import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { PodcastProgramColumnProps } from '../components/podcast/PodcastProgramCollectionAdminTable'
import types from '../types'
import { PeriodType, CategoryProps } from '../types/general'
import { PodcastPlanProps, PodcastProgramAdminProps } from '../types/podcast'

export const usePodcastProgramCollection = (memberId?: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PODCAST_PROGRAM_ADMIN_COLLECTION,
    types.GET_PODCAST_PROGRAM_ADMIN_COLLECTIONVariables
  >(
    gql`
      query GET_PODCAST_PROGRAM_ADMIN_COLLECTION($memberId: String) {
        podcast_program(
          where: {
            _or: [{ creator_id: { _eq: $memberId } }, { podcast_program_roles: { member_id: { _eq: $memberId } } }]
          }
          order_by: { updated_at: desc_nulls_last }
        ) {
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
          }
          podcast_program_enrollments_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
    { variables: { memberId } },
  )

  const podcastPrograms: PodcastProgramColumnProps[] =
    loading || error || !data
      ? []
      : data.podcast_program.map(podcastProgram => ({
          id: podcastProgram.id,
          coverUrl: podcastProgram.cover_url,
          title: podcastProgram.title,
          instructorName: podcastProgram.podcast_program_roles.length
            ? podcastProgram.podcast_program_roles[0].member?.name ||
              podcastProgram.podcast_program_roles[0].member?.username ||
              ''
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

  return {
    loadingPodcastPrograms: loading,
    errorPodcastPrograms: error,
    podcastPrograms,
    refetchPodcastPrograms: refetch,
  }
}

export const usePodcastProgramAdmin = (podcastProgramId: string) => {
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
          podcast_program_tags {
            id
            tag {
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

  const podcastProgramAdmin:
    | (PodcastProgramAdminProps & {
        categories: CategoryProps[]
        tags: string[]
      })
    | null =
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
          categories: data.podcast_program_by_pk.podcast_program_categories.map(podcastProgramCategory => ({
            id: podcastProgramCategory.category.id,
            name: podcastProgramCategory.category.name,
          })),
          tags: data.podcast_program_by_pk.podcast_program_tags.map(podcastProgramTag => podcastProgramTag.tag.name),
        }

  return {
    loadingPodcastProgramAdmin: loading,
    errorPodcastProgramAdmin: error,
    podcastProgramAdmin,
    refetchPodcastProgramAdmin: refetch,
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

export const usePodcastPlanAdminCollection = (creatorId?: string) => {
  const { data, loading, error, refetch } = useQuery<
    types.GET_PODCAST_PLAN_ADMIN_COLLECTION,
    types.GET_PODCAST_PLAN_ADMIN_COLLECTIONVariables
  >(
    gql`
      query GET_PODCAST_PLAN_ADMIN_COLLECTION($creatorId: String) {
        podcast_plan(where: { creator_id: { _eq: $creatorId } }, order_by: { updated_at: desc }) {
          id
          is_subscription
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
          creator_id
          creator {
            id
            name
            username
            picture_url
          }
        }
      }
    `,
    { variables: { creatorId } },
  )

  const podcastPlans: (PodcastPlanProps & {
    creator: {
      id: string
      name: string
      avatarUrl: string | null
    }
    salesCount: number
  })[] =
    loading || error || !data
      ? []
      : data.podcast_plan.map(podcastPlan => ({
          id: podcastPlan.id,
          isSubscription: podcastPlan.is_subscription,
          title: '',
          listPrice: podcastPlan.list_price,
          salePrice: podcastPlan.sale_price,
          soldAt: podcastPlan.sold_at && new Date(podcastPlan.sold_at),
          publishedAt: podcastPlan.published_at && new Date(podcastPlan.published_at),
          periodAmount: podcastPlan.period_amount,
          periodType: podcastPlan.period_type as PeriodType,
          creatorId: podcastPlan.creator_id,
          creator: {
            id: podcastPlan.creator?.id || '',
            name: podcastPlan.creator?.name || podcastPlan.creator?.username || '',
            avatarUrl: podcastPlan.creator?.picture_url || null,
          },
          salesCount: podcastPlan.podcast_plan_enrollments_aggregate.aggregate?.count || 0,
        }))

  return {
    loadingPodcastPlans: loading,
    errorPodcastPlans: error,
    podcastPlans,
    refetchPodcastPlans: refetch,
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
