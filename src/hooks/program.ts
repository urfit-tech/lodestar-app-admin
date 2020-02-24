import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { uniq, unnest } from 'ramda'
import { useContext } from 'react'
import { array, object, string } from 'yup'
import AppContext from '../contexts/AppContext'
import { programContentSchema, programSchema } from '../schemas/program'
import types from '../types'

export const useProgram = (programId: string) => {
  const { loading, data, error, refetch } = useQuery<types.GET_PROGRAM, types.GET_PROGRAMVariables>(
    gql`
      query GET_PROGRAM($programId: uuid!) {
        program_by_pk(id: $programId) {
          id
          app_id
          title
          abstract
          description
          is_subscription
          sold_at
          sale_price
          list_price
          cover_url
          cover_video_url
          published_at
          in_advance
          funding_id
          is_sold_out
          program_content_sections(order_by: { position: asc }) {
            id
            title
            program_contents(order_by: { position: asc }) {
              id
              title
              published_at
              list_price
              duration
              program_content_type {
                id
                type
              }
              program_content_plans {
                id
                program_plan {
                  id
                  title
                }
              }
            }
          }
          program_roles {
            id
            name
            member {
              id
              name
              picture_url
            }
          }
          program_plans(order_by: { created_at: asc }) {
            id
            type
            title
            description
            gains
            sale_price
            discount_down_price
            list_price
            period_type
            sold_at
          }
          program_categories(order_by: { position: asc }) {
            position
            category {
              id
              name
            }
          }
        }
      }
    `,
    { variables: { programId }, fetchPolicy: 'network-only' },
  )
  const program: {
    id: string
    title: string
    appId: string
    isSubscription: boolean
    soldAt: Date | null
    coverUrl: string | null
    abstract: string | null
    description: string | null
    salePrice: number | null
    listPrice: number
    coverVideoUrl: string | null
    publishedAt: Date | null
    inAdvance: boolean
    fundingId: any | null
    isSoldOut: boolean | null
    contentSections: {
      id: string
      title: string
      programContents: {
        id: string
        title: string
        publishedAt: Date | null
        listPrice: number | null
        duration: number | null
        programContentType: {
          id: string
          type: string | null
        } | null
        programContentPlans: {
          id: any
          programPlan: {
            id: any
            title: string | null
          }
        }[]
      }[]
    }[]
    roles: {
      id: string
      name: string
      member: {
        id: string | null
        name: string | null
        pictureUrl: string | null
      } | null
    }[]
    plans: {
      id: string
      type: number
      title: string | null
      description: string | null
      gains: string | null
      salePrice: number
      listPrice: number
      discountDownPrice: number
      periodType: string | null
      soldAt: Date | null
    }[]
    categories: {
      position: number
      category: {
        id: string
        name: string
      }
    }[]
  } | null =
    loading || error || !data || !data.program_by_pk
      ? null
      : {
          id: data.program_by_pk.id,
          appId: data.program_by_pk.app_id,
          title: data.program_by_pk.title,
          abstract: data.program_by_pk.abstract,
          description: data.program_by_pk.description,
          isSubscription: data.program_by_pk.is_subscription,
          soldAt: data.program_by_pk.sold_at,
          salePrice: data.program_by_pk.sale_price,
          listPrice: data.program_by_pk.list_price,
          coverUrl: data.program_by_pk.cover_url,
          coverVideoUrl: data.program_by_pk.cover_video_url,
          publishedAt: data.program_by_pk.published_at,
          inAdvance: data.program_by_pk.in_advance,
          fundingId: data.program_by_pk.funding_id,
          isSoldOut: data.program_by_pk.is_sold_out,
          contentSections: data.program_by_pk.program_content_sections.map(programContentSection => ({
            id: programContentSection.id,
            title: programContentSection.title,
            programContents: programContentSection.program_contents.map(programContent => ({
              id: programContent.id,
              title: programContent.title,
              publishedAt: programContent.published_at,
              listPrice: programContent.list_price,
              duration: programContent.duration,
              programContentType: programContent.program_content_type,
              programContentPlans: programContent.program_content_plans.map(programContentPlan => ({
                id: programContentPlan.id,
                programPlan: {
                  id: programContentPlan.program_plan.id,
                  title: programContentPlan.program_plan.title,
                },
              })),
            })),
          })),
          roles: data.program_by_pk.program_roles.map(programRole => ({
            id: programRole.id,
            name: programRole.name,
            member: {
              id: programRole.member && programRole.member.id,
              name: programRole.member && programRole.member.name,
              pictureUrl: programRole.member && programRole.member.picture_url,
            },
          })),
          plans: data.program_by_pk.program_plans.map(programPlan => ({
            id: programPlan.id,
            type: programPlan.type,
            title: programPlan.title,
            description: programPlan.description,
            gains: programPlan.gains,
            salePrice: programPlan.sale_price,
            listPrice: programPlan.list_price,
            discountDownPrice: programPlan.discount_down_price,
            periodType: programPlan.period_type,
            soldAt: programPlan.sold_at,
          })),
          categories: data.program_by_pk.program_categories.map(programCategory => ({
            position: programCategory.position,
            category: {
              id: programCategory.category.id,
              name: programCategory.category.name,
            },
          })),
        }

  return {
    program,
    refetch,
    loading,
  }
}

export const useProgramContent = (programContentId: string) => {
  const { loading, data, refetch } = useQuery<types.GET_PROGRAM_CONTENT, types.GET_PROGRAM_CONTENTVariables>(
    gql`
      query GET_PROGRAM_CONTENT($programContentId: uuid!) {
        program_content_by_pk(id: $programContentId) {
          id
          title
          abstract
          created_at
          published_at
          list_price
          sale_price
          sold_at
          metadata
          duration
          program_content_plans {
            id
            program_plan {
              id
              title
            }
          }
          program_content_body {
            id
            description
            data
            type
          }
          program_content_progress {
            id
            progress
          }
        }
      }
    `,
    {
      variables: {
        programContentId,
      },
    },
  )
  return {
    loadingProgramContent: loading,
    programContent: object({
      programContentByPk: programContentSchema,
    })
      .camelCase()
      .cast(data).programContentByPk,
    refetchProgramContent: refetch,
  }
}

export const useOwnedPrograms = () => {
  const { id: appId } = useContext(AppContext)
  const { loading, error, data, refetch } = useQuery<types.GET_OWNED_PROGRAMS, types.GET_OWNED_PROGRAMSVariables>(
    gql`
      query GET_OWNED_PROGRAMS($appId: String!) {
        program(where: { app_id: { _eq: $appId }, published_at: { _is_null: false } }) {
          id
          title
        }
      }
    `,
    { variables: { appId } },
  )

  const programs: {
    id: string
    title: string
  }[] =
    loading || !!error || !data
      ? []
      : data.program.map(program => ({
          id: program.id,
          title: program.title,
        }))

  return {
    loadingPrograms: loading,
    errorPrograms: error,
    programs,
    refetchPrograms: refetch,
  }
}

export const useEditablePrograms = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<types.GET_EDITABLE_PROGRAMS, types.GET_EDITABLE_PROGRAMSVariables>(
    gql`
      query GET_EDITABLE_PROGRAMS($memberId: String!) {
        program(where: { editors: { member_id: { _eq: $memberId } } }) {
          id
          title
        }
      }
    `,
    {
      variables: { memberId },
    },
  )

  return {
    programs: object({ program: array(programSchema).default([]) }).cast(data).program,
    error,
    loadingPrograms: loading,
    refetchPrograms: refetch,
  }
}

export const useEnrolledProgramIds = (memberId: string, noFunding?: boolean) => {
  const { loading, data, error, refetch } = useQuery<
    types.GET_ENROLLED_PROGRAM_IDS,
    types.GET_ENROLLED_PROGRAM_IDSVariables
  >(
    gql`
      query GET_ENROLLED_PROGRAM_IDS($memberId: String!, $noFunding: Boolean) {
        program_enrollment(
          where: { member_id: { _eq: $memberId }, program: { funding_id: { _is_null: $noFunding } } }
          distinct_on: program_id
        ) {
          program_id
        }
        program_plan_enrollment(
          where: { member_id: { _eq: $memberId }, program_plan: { program: { funding_id: { _is_null: $noFunding } } } }
        ) {
          program_plan {
            id
            program_id
          }
        }
        program_content_enrollment(
          where: { member_id: { _eq: $memberId }, program: { funding_id: { _is_null: $noFunding } } }
          distinct_on: program_id
        ) {
          program_id
        }
      }
    `,
    {
      variables: { memberId, noFunding },
      fetchPolicy: 'no-cache',
    },
  )

  const castData = object({
    programEnrollment: array(
      object({
        programId: string(),
      }).camelCase(),
    ).default([]),
    programPlanEnrollment: array(
      object({
        programPlan: object({
          id: string(),
          programId: string(),
        }).camelCase(),
      }).camelCase(),
    ).default([]),
    programContentEnrollment: array(
      object({
        programId: string(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  const enrolledProgramIds = uniq(
    unnest([
      castData.programEnrollment.map(value => value.programId),
      castData.programPlanEnrollment.map(value => value.programPlan.programId),
      castData.programContentEnrollment.map(value => value.programId),
    ]),
  )

  return {
    enrolledProgramIds: loading || error ? [] : enrolledProgramIds,
    errorProgramIds: error,
    loadingProgramIds: loading,
    refetchProgramIds: refetch,
  }
}

export const useEnrolledPlanIds = (memberId: string, noFunding?: boolean) => {
  const { loading, data, error, refetch } = useQuery<
    types.GET_ENROLLED_PROGRAM_PLANS,
    types.GET_ENROLLED_PROGRAM_PLANSVariables
  >(
    gql`
      query GET_ENROLLED_PROGRAM_PLANS($memberId: String!, $noFunding: Boolean) {
        program_plan_enrollment(
          where: { member_id: { _eq: $memberId }, program_plan: { program: { funding_id: { _is_null: $noFunding } } } }
        ) {
          program_plan_id
        }
      }
    `,
    { variables: { memberId, noFunding } },
  )

  const programPlanIds: string[] =
    loading || error || !data ? [] : data.program_plan_enrollment.map((value: any) => value.program_plan_id)

  return {
    programPlanIds,
    loadingProgramPlanIds: loading,
    refetchProgramPlanIds: refetch,
  }
}

export const useProgramDuration = (programId: string) => {
  const { loading, error, data } = useQuery<types.GET_PROGRAM_DURATION, types.GET_PROGRAM_DURATIONVariables>(
    gql`
      query GET_PROGRAM_DURATION($programId: uuid!) {
        program_content_aggregate(where: { program_content_section: { program_id: { _eq: $programId } } }) {
          aggregate {
            sum {
              duration
            }
          }
        }
      }
    `,
    { variables: { programId } },
  )

  return loading ||
    error ||
    !data ||
    !data.program_content_aggregate.aggregate ||
    !data.program_content_aggregate.aggregate.sum
    ? null
    : data.program_content_aggregate.aggregate.sum.duration
}

export const useProgramPlanEnrollment = (programPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_PLAN_ENROLLMENT,
    types.GET_PROGRAM_PLAN_ENROLLMENTVariables
  >(
    gql`
      query GET_PROGRAM_PLAN_ENROLLMENT($programPlanId: uuid!) {
        program_plan_enrollment_aggregate(where: { program_plan_id: { _eq: $programPlanId } }) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { programPlanId } },
  )

  return {
    numProgramPlanEnrollments:
      loading || error || !data || !data.program_plan_enrollment_aggregate.aggregate
        ? 0
        : data.program_plan_enrollment_aggregate.aggregate.count || 0,
    loadingProgramPlanEnrollments: loading,
    refetchProgramPlanEnrollments: refetch,
  }
}
