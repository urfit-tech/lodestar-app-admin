import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import hasura from '../hasura'
import { ProgramAdminProps, ProgramApprovalProps, ProgramContentBodyProps, ProgramRoleName } from '../types/program'

export const useProgram = (programId: string) => {
  const { loading, data, error, refetch } = useQuery<hasura.GET_PROGRAM, hasura.GET_PROGRAMVariables>(
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
          is_countdown_timer_visible
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
              metadata
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
              program_content_attachments {
                attachment_id
                data
                options
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
            is_countdown_timer_visible
            published_at
          }
          program_categories(order_by: { position: asc }) {
            category {
              id
              name
            }
          }
          program_tags(order_by: { position: asc }) {
            id
            tag {
              name
            }
          }
          program_approvals(order_by: { updated_at: desc }) {
            id
            created_at
            updated_at
            status
            description
            feedback
          }
        }
      }
    `,
    { variables: { programId }, fetchPolicy: 'network-only' },
  )
  const program: ProgramAdminProps | null =
    loading || error || !data || !data.program_by_pk
      ? null
      : {
          id: data.program_by_pk.id,
          appId: data.program_by_pk.app_id,
          title: data.program_by_pk.title,
          abstract: data.program_by_pk.abstract,
          description: data.program_by_pk.description,
          isSubscription: data.program_by_pk.is_subscription,
          soldAt: data.program_by_pk.sold_at && new Date(data.program_by_pk.sold_at),
          salePrice: data.program_by_pk.sale_price,
          listPrice: data.program_by_pk.list_price,
          coverUrl: data.program_by_pk.cover_url,
          coverVideoUrl: data.program_by_pk.cover_video_url,
          publishedAt: data.program_by_pk.published_at && new Date(data.program_by_pk.published_at),
          inAdvance: data.program_by_pk.in_advance,
          isSoldOut: data.program_by_pk.is_sold_out,
          supportLocales: data.program_by_pk.support_locales || [],
          isDeleted: data.program_by_pk.is_deleted,
          isPrivate: data.program_by_pk.is_private,
          isIssuesOpen: data.program_by_pk.is_issues_open,
          isCountdownTimerVisible: data.program_by_pk.is_countdown_timer_visible,
          contentSections: data.program_by_pk.program_content_sections.map(programContentSection => ({
            id: programContentSection.id,
            title: programContentSection.title,
            programContents: programContentSection.program_contents.map(programContent => ({
              id: programContent.id,
              title: programContent.title,
              publishedAt: programContent.published_at && new Date(programContent.published_at),
              listPrice: programContent.list_price,
              duration: programContent.duration,
              programContentType: programContent.program_content_type?.type || null,
              isNotifyUpdate: programContent.is_notify_update,
              notifiedAt: programContent.notified_at && new Date(programContent.notified_at),
              programPlans: programContent.program_content_plans.map(programContentPlan => ({
                id: programContentPlan.program_plan.id,
                title: programContentPlan.program_plan.title,
              })),
              metadata: programContent.metadata,
              attachments: programContent.program_content_attachments.map(v => ({
                id: v.attachment_id,
                data: v.data,
                options: v.options,
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
            soldAt: programPlan.sold_at && new Date(programPlan.sold_at),
            currencyId: programPlan.currency_id,
            autoRenewed: programPlan.auto_renewed,
            publishedAt: programPlan.published_at && new Date(programPlan.published_at),
            isCountdownTimerVisible: programPlan.is_countdown_timer_visible,
          })),
          categories: data.program_by_pk.program_categories.map(programCategory => ({
            id: programCategory.category.id,
            name: programCategory.category.name,
          })),
          tags: data.program_by_pk.program_tags.map(programTag => programTag.tag.name),
          approvals: data.program_by_pk.program_approvals.map(programApproval => ({
            id: programApproval.id,
            createdAt: new Date(programApproval.created_at),
            updatedAt: new Date(programApproval.updated_at),
            status: programApproval.status as ProgramApprovalProps['status'],
            description: programApproval.description,
            feedback: programApproval.feedback,
          })),
        }

  return {
    loadingProgram: loading,
    errorProgram: error,
    program,
    refetchProgram: refetch,
  }
}

export const useProgramContentBody = (programContentId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAM_CONTENT_BODY,
    hasura.GET_PROGRAM_CONTENT_BODYVariables
  >(
    gql`
      query GET_PROGRAM_CONTENT_BODY($programContentId: uuid!) {
        program_content_by_pk(id: $programContentId) {
          program_content_body {
            id
            type
            description
            data
          }
          program_content_materials {
            id
            data
          }
        }
      }
    `,
    { variables: { programContentId } },
  )

  const programContentBody: ProgramContentBodyProps =
    loading || error || !data || !data.program_content_by_pk
      ? {
          id: '',
          type: '',
          description: '',
          data: {},
          materials: [],
        }
      : {
          id: data.program_content_by_pk.program_content_body.id,
          type: data.program_content_by_pk.program_content_body.type,
          description: data.program_content_by_pk.program_content_body.description,
          data: data.program_content_by_pk.program_content_body.data,
          materials: data.program_content_by_pk.program_content_materials.map(v => ({
            id: v.id,
            data: v.data,
          })),
        }

  return {
    loadingProgramContentBody: loading,
    errorProgramContentBody: error,
    programContentBody,
    refetchProgramContentBody: refetch,
  }
}

export const useOwnedPrograms = () => {
  const { id: appId } = useApp()
  const { loading, error, data, refetch } = useQuery<hasura.GET_OWNED_PROGRAMS, hasura.GET_OWNED_PROGRAMSVariables>(
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
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_EDITABLE_PROGRAMS,
    hasura.GET_EDITABLE_PROGRAMSVariables
  >(
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
  const { loading, error, data } = useQuery<hasura.GET_PROGRAM_CONTENT_ENROLLMENT>(GET_PROGRAM_CONTENT_ENROLLMENT, {
    context: {
      important: true,
    },
  })

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
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_PROGRAM_PROGRESS,
    hasura.GET_PROGRAM_PROGRESSVariables
  >(GET_PROGRAM_PROGRESS, { variables: { programId }, context: { important: true } })
  const [isNoMore, setIsNoMore] = useState(false)

  useEffect(() => {
    setIsNoMore(false)
  }, [programId])

  const memberProgramProgress: {
    memberId: string
    name: string
    email: string
    pictureUrl: string | null
    programEnrollments: {
      programId: string
      programContentCount: number
      programContentDuration: number
    }[]
    programContentProgresses: {
      progress: number
    }[]
  }[] =
    data?.member.map(member => ({
      memberId: member.id,
      name: member.name || member.username || '',
      email: member.email || '',
      pictureUrl: member.picture_url || '',
      programEnrollments:
        member.program_content_enrollments.map(enrollment => ({
          programId: enrollment.program_id,
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
      programContentProgresses:
        member.program_content_progresses.map(programContentProgress => ({
          progress: programContentProgress.progress,
        })) || [],
    })) || []

  return {
    loadingProgramProgress: loading,
    errorProgramProgress: error,
    memberProgramProgress,
    refetchProgramProgress: () => {
      setIsNoMore(false)
      refetch()
    },
    fetchMoreProgramProgress: isNoMore
      ? undefined
      : () =>
          fetchMore({
            variables: {
              programId,
              offset: data?.member.length || 0,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              if (fetchMoreResult.member.length < 10) {
                setIsNoMore(true)
              }
              return {
                ...prev,
                member: [...prev.member, ...fetchMoreResult.member],
              }
            },
          }),
  }
}

const GET_PROGRAM_PROGRESS = gql`
  query GET_PROGRAM_PROGRESS($programId: uuid, $offset: Int) {
    member(where: { program_content_enrollments: { program_id: { _eq: $programId } } }, limit: 10, offset: $offset) {
      id
      username
      name
      email
      picture_url
      program_content_enrollments(
        where: { program: { id: { _eq: $programId }, published_at: { _is_null: false } } }
        distinct_on: program_id
      ) {
        program_id
        member_id
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
      program_content_progresses(
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
  }
`

export const useMutateProgramContent = () => {
  const [updateProgramContent] = useMutation<hasura.UPDATE_PROGRAM_CONTENT, hasura.UPDATE_PROGRAM_CONTENTVariables>(
    gql`
      mutation UPDATE_PROGRAM_CONTENT(
        $programContentId: uuid!
        $title: String
        $price: numeric
        $publishedAt: timestamptz
        $duration: numeric
        $isNotifyUpdate: Boolean
        $notifiedAt: timestamptz
      ) {
        update_program_content(
          where: { id: { _eq: $programContentId } }
          _set: {
            title: $title
            duration: $duration
            list_price: $price
            sale_price: $price
            published_at: $publishedAt
            is_notify_update: $isNotifyUpdate
            notified_at: $notifiedAt
          }
        ) {
          affected_rows
        }
      }
    `,
  )

  const [updateProgramContentBody] = useMutation<
    hasura.UPDATE_PROGRAM_CONTENT_BODY,
    hasura.UPDATE_PROGRAM_CONTENT_BODYVariables
  >(gql`
    mutation UPDATE_PROGRAM_CONTENT_BODY($programContentId: uuid!, $description: String, $type: String, $data: jsonb) {
      update_program_content_body(
        where: { program_contents: { id: { _eq: $programContentId } } }
        _set: { description: $description, type: $type }
        _append: { data: $data }
      ) {
        affected_rows
      }
    }
  `)

  const [deleteProgramContent] = useMutation<hasura.DELETE_PROGRAM_CONTENT, hasura.DELETE_PROGRAM_CONTENTVariables>(
    gql`
      mutation DELETE_PROGRAM_CONTENT($programContentId: uuid!) {
        delete_program_content_progress(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_body(where: { program_contents: { id: { _eq: $programContentId } } }) {
          affected_rows
        }
        delete_exercise(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_practice(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
      }
    `,
  )

  return {
    updateProgramContent,
    updateProgramContentBody,
    deleteProgramContent,
  }
}
