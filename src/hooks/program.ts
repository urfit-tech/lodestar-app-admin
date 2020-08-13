import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum, uniqBy } from 'ramda'
import { useContext } from 'react'
import AppContext from '../contexts/AppContext'
import types from '../types'
import {
  ProgramContentProps,
  ProgramPlanPeriodType,
  ProgramPreviewProps,
  ProgramProps,
  ProgramRoleName,
} from '../types/program'

export const useProgramPreviewCollection = (memberId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_PREVIEW_COLLECTION,
    types.GET_PROGRAM_PREVIEW_COLLECTIONVariables
  >(
    gql`
      query GET_PROGRAM_PREVIEW_COLLECTION($memberId: String) {
        program(
          where: { program_roles: { member_id: { _eq: $memberId } }, is_deleted: { _eq: false } }
          order_by: { position: asc, published_at: desc, updated_at: desc }
        ) {
          id
          cover_url
          title
          abstract
          program_roles(where: { name: { _eq: "instructor" } }, limit: 1) {
            id
            member {
              id
              picture_url
              name
              username
            }
          }
          is_subscription
          list_price
          sale_price
          sold_at
          program_plans {
            id
            list_price
            sale_price
            sold_at
            period_type
            program_plan_enrollments_aggregate {
              aggregate {
                count
              }
            }
          }
          program_enrollments_aggregate {
            aggregate {
              count
            }
          }
          published_at
          is_private
        }
      }
    `,
    { variables: { memberId } },
  )

  const programPreviews: ProgramPreviewProps[] =
    loading || error || !data
      ? []
      : data.program.map(program => {
          const plan = program.program_plans[0]

          return {
            id: program.id,
            coverUrl: program.cover_url,
            title: program.title,
            abstract: program.abstract,
            instructors: program.program_roles.map(programRole => ({
              id: programRole.member?.id || '',
              avatarUrl: programRole.member?.picture_url || null,
              name: programRole.member?.name || programRole.member?.username || '',
            })),
            isSubscription: program.is_subscription,
            listPrice: program.is_subscription ? (plan ? plan.list_price : null) : program.list_price,
            salePrice: program.is_subscription
              ? plan && plan.sold_at && new Date(plan.sold_at).getTime() > Date.now()
                ? plan.sale_price
                : null
              : program.sold_at && new Date(program.sold_at).getTime() > Date.now()
              ? program.sale_price
              : null,
            periodAmount: program.is_subscription && plan ? 1 : null,
            periodType: program.is_subscription && plan ? (plan.period_type as ProgramPlanPeriodType) : null,
            enrollment: program.is_subscription
              ? sum(program.program_plans.map(plan => plan.program_plan_enrollments_aggregate.aggregate?.count || 0))
              : program.program_enrollments_aggregate.aggregate?.count || 0,
            isDraft: !program.published_at,
            isPrivate: program.is_private,
          }
        })

  return {
    loadingProgramPreviews: loading,
    errorProgramPreviews: error,
    programPreviews,
    refetchProgramPreviews: refetch,
  }
}

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
          is_sold_out
          support_locales
          is_deleted
          is_private
          is_issues_open
          program_content_sections(order_by: { position: asc }) {
            id
            title
            program_contents(order_by: { position: asc }) {
              id
              title
              published_at
              list_price
              duration
              is_notify_update
              notified_at
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
            period_amount
            period_type
            sold_at
            currency_id
            auto_renewed
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
  const program: ProgramProps | null =
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
          isSoldOut: data.program_by_pk.is_sold_out,
          supportLocales: data.program_by_pk.support_locales || [],
          isDeleted: data.program_by_pk.is_deleted,
          isPrivate: data.program_by_pk.is_private,
          isIssuesOpen: data.program_by_pk.is_issues_open,
          contentSections: data.program_by_pk.program_content_sections.map(programContentSection => ({
            id: programContentSection.id,
            title: programContentSection.title,
            programContents: programContentSection.program_contents.map(programContent => ({
              id: programContent.id,
              title: programContent.title,
              publishedAt: programContent.published_at,
              listPrice: programContent.list_price,
              duration: programContent.duration,
              programContentType: programContent.program_content_type?.type || null,
              isNotifyUpdate: programContent.is_notify_update,
              notifiedAt: programContent.notified_at,
              programPlans: programContent.program_content_plans.map(programContentPlan => ({
                id: programContentPlan.program_plan.id,
                title: programContentPlan.program_plan.title,
              })),
            })),
          })),
          roles: data.program_by_pk.program_roles.map(programRole => ({
            id: programRole.id,
            name: programRole.name as ProgramRoleName,
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
            periodAmount: programPlan.period_amount,
            periodType: programPlan.period_type,
            soldAt: programPlan.sold_at,
            currencyId: programPlan.currency_id,
            autoRenewed: programPlan.auto_renewed,
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
  const { loading, error, data, refetch } = useQuery<types.GET_PROGRAM_CONTENT, types.GET_PROGRAM_CONTENTVariables>(
    gql`
      query GET_PROGRAM_CONTENT($programContentId: uuid!) {
        program_content_by_pk(id: $programContentId) {
          id
          title
          abstract
          created_at
          list_price
          sale_price
          sold_at
          metadata
          duration
          published_at
          is_notify_update
          notified_at
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
    { variables: { programContentId } },
  )

  const programContent:
    | (ProgramContentProps & {
        programContentBody: {
          id: string
          type: string | null
          description: string | null
          data: any
        }
      })
    | null =
    loading || error || !data || !data.program_content_by_pk
      ? null
      : {
          id: data.program_content_by_pk.id,
          title: data.program_content_by_pk.title,
          publishedAt: data.program_content_by_pk.published_at && new Date(data.program_content_by_pk.published_at),
          listPrice: data.program_content_by_pk.list_price,
          duration: data.program_content_by_pk.duration,
          programContentType: data.program_content_by_pk.program_content_body.type,
          isNotifyUpdate: data.program_content_by_pk.is_notify_update,
          notifiedAt: data.program_content_by_pk.notified_at && new Date(data.program_content_by_pk.notified_at),
          programContentBody: {
            id: data.program_content_by_pk.program_content_body.id,
            type: data.program_content_by_pk.program_content_body.type,
            description: data.program_content_by_pk.program_content_body.description,
            data: data.program_content_by_pk.program_content_body.data,
          },
        }

  return {
    loadingProgramContent: loading,
    programContent,
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
  const { loading, error, data, refetch } = useQuery<types.GET_EDITABLE_PROGRAMS, types.GET_EDITABLE_PROGRAMSVariables>(
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

  const programs: {
    id: string
    title: string
  }[] =
    loading || error || !data
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

export const useProgramContentEnrollment = () => {
  const { loading, error, data } = useQuery<types.GET_PROGRAM_CONTENT_ENROLLMENT>(GET_PROGRAM_CONTENT_ENROLLMENT)

  return {
    loading,
    error,
    data:
      data?.program_content_enrollment.map(programContentEnrollment => ({
        id: programContentEnrollment.program_id,
        title: programContentEnrollment?.program?.title || '',
      })) || [],
  }
}

const GET_PROGRAM_CONTENT_ENROLLMENT = gql`
  query GET_PROGRAM_CONTENT_ENROLLMENT {
    program_content_enrollment(where: { program: { published_at: { _is_null: false } } }, distinct_on: program_id) {
      program_id
      program {
        title
      }
    }
  }
`

export const useProgramProgressCollection = (programId?: string | null) => {
  const { loading, error, data } = useQuery<types.GET_PROGRAM_PROGRESS, types.GET_PROGRAM_PROGRESSVariables>(
    GET_PROGRAM_PROGRESS,
    { variables: { programId } },
  )

  const programEnrollments: {
    memberId: string
    name: string
    email: string
    pictureUrl: string | null
    programId: string
    programContentCount: number
    programContentDuration: number
  }[] = uniqBy(
    enrollment => `${enrollment.memberId}_${enrollment.programId}`,
    data?.program_content_enrollment.map(enrollment => ({
      memberId: enrollment.member?.id || '',
      name: enrollment.member?.name || enrollment.member?.username || '',
      email: enrollment.member?.email || '',
      pictureUrl: enrollment.member?.picture_url || '',

      programId: enrollment.program?.id || '',
      programContentCount: sum(
        enrollment.program?.program_content_sections.map(
          section => section.program_contents_aggregate.aggregate?.count || 0,
        ) || [],
      ),
      programContentDuration: sum(
        enrollment.program?.program_content_sections.map(
          section => section.program_contents_aggregate.aggregate?.sum?.duration || 0,
        ) || [],
      ),
    })) || [],
  )
  const programContentProgress = data?.program_content_progress.map(programContentProgress => ({
    memberId: programContentProgress.member_id,
    progress: programContentProgress.progress,
  }))

  return {
    loading,
    error,
    programEnrollments,
    programContentProgress,
  }
}

const GET_PROGRAM_PROGRESS = gql`
  query GET_PROGRAM_PROGRESS($programId: uuid) {
    program_content_enrollment(where: { program: { id: { _eq: $programId }, published_at: { _is_null: false } } }) {
      member {
        id
        username
        name
        email
        picture_url
      }
      program_id
      program {
        id
        program_content_sections {
          program_contents_aggregate(where: { published_at: { _is_null: false } }) {
            aggregate {
              count
              sum {
                duration
              }
            }
          }
        }
      }
    }
    program_content_progress(
      where: {
        program_content: {
          program_content_section: { program: { id: { _eq: $programId }, published_at: { _is_null: false } } }
        }
      }
    ) {
      id
      member_id
      progress
    }
  }
`
