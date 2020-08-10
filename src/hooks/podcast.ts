import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { PodcastProgramColumnProps } from '../components/podcast/PodcastProgramCollectionAdminTable'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import types from '../types'
import { PeriodType } from '../types/general'
import { PodcastPlanProps, PodcastProgramProps } from '../types/podcast'

export const usePodcastProgramCollection = (memberId?: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PODCAST_PROGRAM_ADMIN_COLLECTION,
    types.GET_PODCAST_PROGRAM_ADMIN_COLLECTIONVariables
  >(
    gql`
      query GET_PODCAST_PROGRAM_ADMIN_COLLECTION($memberId: String) {
        podcast_program(where: { creator_id: { _eq: $memberId } }, order_by: { updated_at: desc_nulls_last }) {
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

export type PodcastProgramContent = {
  id: string
  title: string
  abstract: string | null
  description: string | null
  coverUrl: string | null
  publishedAt: Date
  categories: {
    id: string
    name: string
  }[]
  url: string
  instructorIds: string[]
}

export const usePodcastProgramContent = (podcastProgramId: string) => {
  const { authToken } = useAuth()
  const [url, setUrl] = useState('')
  const { loading, error, data, refetch } = useQuery<
    types.GET_PODCAST_PROGRAM_WITH_BODY,
    types.GET_PODCAST_PROGRAM_WITH_BODYVariables
  >(
    gql`
      query GET_PODCAST_PROGRAM_WITH_BODY($podcastProgramId: uuid!) {
        podcast_program_by_pk(id: $podcastProgramId) {
          id
          title
          cover_url
          abstract
          content_type
          published_at
          creator_id
          podcast_program_categories {
            category {
              id
              name
            }
          }
          podcast_program_body {
            description
          }
          podcast_program_roles {
            name
            member_id
          }
        }
      }
    `,
    { variables: { podcastProgramId } },
  )

  const contentType = data?.podcast_program_by_pk?.content_type
  const contentPath =
    contentType &&
    `${process.env.REACT_APP_STREAMING_APP}/_definst_/mp3:amazons3/${process.env.REACT_APP_S3_BUCKET}/audios/${process.env.REACT_APP_ID}/${podcastProgramId}.${contentType}`

  useEffect(() => {
    contentPath &&
      axios
        .post<{ result: { url: string } }>(
          `${process.env.REACT_APP_BACKEND_ENDPOINT}/sys/secure-streaming`,
          {
            contentPath,
            parameters: {},
          },
          {
            headers: { authorization: `Bearer ${authToken}` },
          },
        )
        .then(({ data }) => {
          setUrl(data.result.url)
        })
  }, [contentPath, setUrl, authToken])

  const podcastProgram: PodcastProgramContent | null =
    loading || error || !data || !data.podcast_program_by_pk
      ? null
      : {
          id: data.podcast_program_by_pk.id || '',
          title: data.podcast_program_by_pk.title || '',
          abstract: data.podcast_program_by_pk.abstract || '',
          description: data.podcast_program_by_pk.podcast_program_body?.description || null,
          coverUrl: data.podcast_program_by_pk.cover_url || null,
          publishedAt: data.podcast_program_by_pk.published_at && new Date(data.podcast_program_by_pk.published_at),
          categories: (data.podcast_program_by_pk.podcast_program_categories || []).map(programCategory => ({
            id: programCategory.category.id || '',
            name: programCategory.category.name || '',
          })),
          url,
          instructorIds:
            data.podcast_program_by_pk.podcast_program_roles
              .filter(role => role.name === 'instructor')
              .map(role => role.member_id) || [],
        }

  return {
    loadingPodcastProgram: loading,
    errorPodcastProgram: error,
    podcastProgram,
    refetchPodcastProgram: refetch,
  }
}
