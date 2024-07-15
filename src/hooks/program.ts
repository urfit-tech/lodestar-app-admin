import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { sum } from 'ramda'
import { useEffect, useState, useMemo } from 'react'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import hasura from '../hasura'
import {
  ProgramAdminProps,
  ProgramApprovalProps,
  ProgramContent,
  ProgramContentBody,
  ProgramRoleName,
} from '../types/program'
import { DeepPick } from 'ts-deep-pick'
import { DisplayMode } from '../components/program/DisplayModeSelector'

export const useProgram = (programId: string) => {
  const { loading, data, error, refetch } = useQuery<hasura.GET_PROGRAM_BY_ID, hasura.GET_PROGRAM_BY_IDVariables>(
    gql`
      query GET_PROGRAM_BY_ID($programId: uuid!) {
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
          cover_mobile_url
          cover_thumbnail_url
          cover_video_url
          published_at
          in_advance
          is_sold_out
          support_locales
          meta_tag
          is_deleted
          is_private
          is_issues_open
          is_countdown_timer_visible
          is_introduction_section_visible
          is_enrolled_count_visible
          display_header
          display_footer
          cover_type
          mobile_cover_type
          program_content_sections(order_by: { position: asc }) {
            id
            title
            collapsed_status
            program_contents(order_by: { position: asc }) {
              id
              title
              published_at
              list_price
              duration
              is_notify_update
              pinned_status
              notified_at
              metadata
              display_mode
              program_content_body {
                data
                target
              }
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
              program_content_attachments(where: { data: { _is_null: false } }) {
                attachment_id
                data
                options
              }
              program_content_videos {
                attachment {
                  id
                  size
                  options
                  duration
                }
              }
              program_content_audios {
                id
                data
              }
              program_content_ebook {
                id
                data
                trial_percentage
              }
            }
          }
          program_roles(order_by: [{ created_at: asc }, { id: desc }]) {
            id
            name
            member {
              id
              name
              picture_url
            }
          }
          program_plans(order_by: { position: asc }) {
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
            remind_period_amount
            remind_period_type
            sold_at
            currency_id
            auto_renewed
            is_countdown_timer_visible
            published_at
            group_buying_people
            is_participants_visible
            card_id
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
          program_layout_template_config{
            id
            program_id
            program_layout_template_id
            module_data
            is_active
            program_layout_template {
              id
              name
              module_name
            }
          }
        }
      }
    `,
    { variables: { programId }, fetchPolicy: 'network-only' },
  )

  const program: ProgramAdminProps | null = useMemo(() => {
    if (loading || error || !data || !data?.program_by_pk) {
      return null
    }

    return {
      id: data.program_by_pk.id,
      appId: data.program_by_pk.app_id,
      title: data.program_by_pk.title || '',
      abstract: data.program_by_pk.abstract || '',
      description: data.program_by_pk.description || '',
      coverUrl: data.program_by_pk.cover_url || null,
      coverMobileUrl: data.program_by_pk.cover_mobile_url || null,
      coverThumbnailUrl: data.program_by_pk.cover_thumbnail_url || null,
      coverVideoUrl: data.program_by_pk.cover_video_url || null,
      publishedAt: data.program_by_pk.published_at && new Date(data.program_by_pk.published_at),
      inAdvance: data.program_by_pk.in_advance,
      isSoldOut: data.program_by_pk.is_sold_out || false,
      supportLocales: data.program_by_pk.support_locales || [],
      metaTag: data.program_by_pk.meta_tag,
      isDeleted: data.program_by_pk.is_deleted,
      isPrivate: data.program_by_pk.is_private,
      isIssuesOpen: data.program_by_pk.is_issues_open,
      isCountdownTimerVisible: data.program_by_pk.is_countdown_timer_visible,
      isIntroductionSectionVisible: data.program_by_pk.is_introduction_section_visible,
      isEnrolledCountVisible: data.program_by_pk.is_enrolled_count_visible,
      displayHeader: data.program_by_pk.display_header ?? true,
      displayFooter: data.program_by_pk.display_footer ?? true,
      coverType: data.program_by_pk.cover_type,
      mobileCoverType: data.program_by_pk.mobile_cover_type,
      contentSections: data.program_by_pk.program_content_sections.map(pcs => ({
        id: pcs.id,
        title: pcs.title || '',
        programContents: pcs.program_contents.map(pc => ({
          id: pc.id,
          title: pc.title || '',
          publishedAt: pc.published_at && new Date(pc.published_at),
          displayMode: pc.display_mode as DisplayMode,
          listPrice: pc.list_price,
          duration: pc.duration,
          pinned_status: pc.pinned_status || false,
          programContentType: pc.program_content_type?.type || null,
          isNotifyUpdate: pc.is_notify_update,
          notifiedAt: pc.notified_at && new Date(pc.notified_at),
          programPlans: pc.program_content_plans.map(pcp => ({
            id: pcp.program_plan.id,
            title: pcp.program_plan.title || '',
          })),
          metadata: pc.metadata,
          programContentBodyData: pc.program_content_body?.data,
          programContentBodyTarget: pc.program_content_body?.target,
          attachments: pc.program_content_attachments.map(v => ({
            id: v.attachment_id,
            data: v.data,
            options: v.options,
          })),
          videos: pc.program_content_videos.map(pcv => ({
            id: pcv.attachment.id,
            size: pcv.attachment.size,
            options: pcv.attachment.options,
            duration: pcv.attachment.duration,
          })),
          audios: pc.program_content_audios.map(pca => ({
            id: pca.id,
            data: pca.data,
          })),
          ebook: pc.program_content_ebook
            ? {
                id: pc.program_content_ebook.id,
                data: pc.program_content_ebook.data,
                trialPercentage: pc.program_content_ebook.trial_percentage,
              }
            : null,
        })),
        collapsed_status: pcs.collapsed_status || false,
      })),
      roles: data.program_by_pk.program_roles.map(programRole => ({
        id: programRole.id,
        name: programRole.name as ProgramRoleName,
        member: {
          id: (programRole.member && programRole.member.id) || null,
          name: (programRole.member && programRole.member.name) || null,
          pictureUrl: (programRole.member && programRole.member.picture_url) || null,
        },
      })),
      plans: data.program_by_pk.program_plans.map(programPlan => ({
        id: programPlan.id,
        type: programPlan.type,
        title: programPlan.title || '',
        description: programPlan.description || '',
        gains: programPlan.gains,
        salePrice: programPlan.sale_price,
        listPrice: programPlan.list_price,
        discountDownPrice: programPlan.discount_down_price,
        periodAmount: programPlan.period_amount,
        periodType: programPlan.period_type || null,
        remindPeriodAmount: programPlan.remind_period_amount || null,
        remindPeriodType: programPlan.remind_period_type || null,
        soldAt: programPlan.sold_at && new Date(programPlan.sold_at),
        currencyId: programPlan.currency_id,
        autoRenewed: programPlan.auto_renewed,
        publishedAt: programPlan.published_at && new Date(programPlan.published_at),
        isCountdownTimerVisible: programPlan.is_countdown_timer_visible,
        groupBuyingPeople: programPlan.group_buying_people,
        isParticipantsVisible: programPlan.is_participants_visible,
        cardId: programPlan.card_id,
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
        description: programApproval.description || '',
        feedback: programApproval.feedback || '',
      })),
      programLayoutTemplateConfig: data?.program_by_pk?.program_layout_template_config?.id ? {
        id: data?.program_by_pk?.program_layout_template_config?.id,
        programId: data?.program_by_pk?.program_layout_template_config?.program_id,
        programLayoutTemplateId: data?.program_by_pk?.program_layout_template_config?.program_layout_template_id,
        moduleData: data?.program_by_pk?.program_layout_template_config?.module_data,
        ProgramLayoutTemplate: {
          id: data?.program_by_pk?.program_layout_template_config?.program_layout_template?.id,
          customAttribute: data?.program_by_pk?.program_layout_template_config?.program_layout_template?.module_name.map((value: {id:string, name: string, type: string}) => ({
            id: value?.id,
            name: value?.name,
            type: value?.type
          }))
        }
      } : null
    }
  }, [data, error, loading])
  return {
    loadingProgram: loading,
    errorProgram: error,
    program: program,
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
            target
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
  const programContentBody: ProgramContentBody = useMemo(() => {
    if (loading || error || !data || !data.program_content_by_pk) {
      return {
        id: '',
        type: '',
        description: '',
        data: {},
        materials: [],
        target: null,
      }
    }
    return {
      id: data.program_content_by_pk.program_content_body.id,
      type: data.program_content_by_pk.program_content_body.type || null,
      description: data.program_content_by_pk.program_content_body.description || '',
      data: data.program_content_by_pk.program_content_body.data,
      materials: data.program_content_by_pk.program_content_materials.map(v => ({
        id: v.id,
        data: v.data,
      })),
      target: data.program_content_by_pk.program_content_body.target,
    }
  }, [data, error, loading])

  return {
    loadingProgramContentBody: loading,
    errorProgramContentBody: error,
    programContentBody,
    refetchProgramContentBody: refetch,
  }
}

export const usePrograms = (options?: {
  allowContentTypes?: string[]
  memberId?: string
  isPublished?: boolean
  withContentSection?: boolean
  withContent?: boolean
}) => {
  const { id: appId } = useApp()

  const condition: hasura.GET_PROGRAMSVariables['condition'] = {
    app_id: { _eq: appId },
    published_at: options?.isPublished ? { _is_null: false } : undefined,
    program_content_sections: {
      program_contents: { program_content_type: { type: { _in: options?.allowContentTypes } } },
    },
    editors: { member_id: { _eq: options?.memberId } },
  }

  const { loading, error, data, refetch } = useQuery<hasura.GET_PROGRAMS, hasura.GET_PROGRAMSVariables>(
    gql`
      query GET_PROGRAMS(
        $condition: program_bool_exp!
        $contentSectionCondition: program_content_section_bool_exp
        $contentCondition: program_content_bool_exp
        $withContentSection: Boolean!
        $withContent: Boolean!
      ) {
        program(where: $condition) {
          id
          title
          program_content_sections(where: $contentSectionCondition, order_by: [{ position: asc }])
            @include(if: $withContentSection) {
            id
            title
            program_contents(where: $contentCondition, order_by: [{ position: asc }]) @include(if: $withContent) {
              id
              title
            }
          }
        }
      }
    `,
    {
      variables: {
        condition,
        contentSectionCondition: condition.program_content_sections,
        contentCondition: condition.program_content_sections?.program_contents,
        withContentSection: !!options?.withContentSection,
        withContent: !!options?.withContent,
      },
    },
  )

  const programs: {
    id: string
    title: string
    contentSections: {
      id: string
      title: string
      contents: {
        id: string
        title: string
      }[]
    }[]
  }[] =
    data?.program.map(program => ({
      id: program.id,
      title: program.title || '',
      contentSections:
        program.program_content_sections?.map(v => ({
          id: v.id,
          title: v.title || '',
          contents:
            v.program_contents?.map(w => ({
              id: w.id,
              title: w.title || '',
            })) || [],
        })) || [],
    })) || []

  return {
    loadingPrograms: loading,
    errorPrograms: error,
    programs,
    refetchPrograms: refetch,
  }
}

export const useMutateProgram = () => {
  const [updateProgramMetaTag] = useMutation<hasura.UPDATE_PROGRAM_META_TAG, hasura.UPDATE_PROGRAM_META_TAGVariables>(
    gql`
      mutation UPDATE_PROGRAM_META_TAG($id: uuid!, $metaTag: jsonb) {
        update_program(where: { id: { _eq: $id } }, _set: { meta_tag: $metaTag }) {
          affected_rows
        }
      }
    `,
  )

  return {
    updateProgramMetaTag,
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
  const [insertProgramContentBody] = useMutation<
    hasura.INSERT_PROGRAM_CONTENT_BODY,
    hasura.INSERT_PROGRAM_CONTENT_BODYVariables
  >(gql`
    mutation INSERT_PROGRAM_CONTENT_BODY($object: program_content_body_insert_input!) {
      insert_program_content_body_one(object: $object) {
        id
      }
    }
  `)
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
        $programContentBodyId: uuid!
        $displayMode: String
        $pinnedStatus: Boolean
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
            content_body_id: $programContentBodyId
            display_mode: $displayMode
            pinned_status: $pinnedStatus
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
        delete_program_content_plan(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_video(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_audio(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_material(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_practice(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_progress(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_log(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_body(where: { program_contents: { id: { _eq: $programContentId } } }) {
          affected_rows
        }
      }
    `,
  )

  const [deleteProgramContentExerciseAndExam] = useMutation<
    hasura.DELETE_PROGRAM_CONTENT_EXERCISE_AND_EXAM,
    hasura.DELETE_PROGRAM_CONTENT_EXERCISE_AND_EXAMVariables
  >(
    gql`
      mutation DELETE_PROGRAM_CONTENT_EXERCISE_AND_EXAM($programContentId: uuid!, $examId: uuid!) {
        delete_program_content_plan(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_video(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_audio(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_material(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_practice(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_progress(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_log(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_program_content_body(where: { program_contents: { id: { _eq: $programContentId } } }) {
          affected_rows
        }
        delete_exercise(where: { program_content_id: { _eq: $programContentId } }) {
          affected_rows
        }
        delete_exam(where: { id: { _eq: $examId } }) {
          affected_rows
        }
      }
    `,
  )

  return {
    updateProgramContent,
    updateProgramContentBody,
    deleteProgramContent,
    deleteProgramContentExerciseAndExam,
    insertProgramContentBody,
  }
}

export const useProgramContent = (programContentId: string) => {
  const { data, loading, refetch } = useQuery<
    hasura.GET_SPECIFIC_PROGRAM_CONTENT,
    hasura.GET_SPECIFIC_PROGRAM_CONTENTVariables
  >(
    gql`
      query GET_SPECIFIC_PROGRAM_CONTENT($programContentId: uuid!) {
        program_content_by_pk(id: $programContentId) {
          id
          title
          published_at
          list_price
          duration
          is_notify_update
          notified_at
          metadata
          pinned_status
          program_content_body {
            id
            data
          }
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
          program_content_attachments(where: { data: { _is_null: false } }) {
            attachment_id
            data
            options
          }
          program_content_videos {
            attachment {
              id
              size
              options
            }
          }
        }
      }
    `,
    { variables: { programContentId } },
  )

  const programContent:
    | (DeepPick<ProgramContent, '!videos'> &
        DeepPick<ProgramContent, 'videos.[].id' | 'videos.[].size' | 'videos.[].options'>)
    | null = data?.program_content_by_pk
    ? {
        id: data.program_content_by_pk.id,
        title: data.program_content_by_pk.title || '',
        publishedAt: data.program_content_by_pk.published_at && new Date(data.program_content_by_pk.published_at),
        listPrice: data.program_content_by_pk.list_price,
        duration: data.program_content_by_pk.duration,
        programContentType:
          data.program_content_by_pk.program_content_videos.length > 0
            ? 'video'
            : data.program_content_by_pk.program_content_type?.type || null,
        isNotifyUpdate: data.program_content_by_pk.is_notify_update,
        notifiedAt: data.program_content_by_pk.notified_at && new Date(data.program_content_by_pk.notified_at),
        pinned_status: data.program_content_by_pk.pinned_status,
        programPlans: data.program_content_by_pk.program_content_plans.map(pcp => ({
          id: pcp.program_plan.id,
          title: pcp.program_plan.title || '',
        })),
        metadata: data.program_content_by_pk.metadata,
        programContentBodyData: data.program_content_by_pk.program_content_body.data,
        attachments: data.program_content_by_pk.program_content_attachments.map(v => ({
          id: v.attachment_id,
          data: v.data,
          options: v.options,
        })),
        videos: data.program_content_by_pk.program_content_videos.map(pcv => ({
          id: pcv.attachment.id,
          size: pcv.attachment.size,
          options: pcv.attachment.options,
        })),
      }
    : null
  return { programContent, loading, refetch }
}

export const useProgramContentActions = (programContentId: string) => {
  const apolloClient = useApolloClient()
  return {
    updateContent: async () => {},
    updatePlans: async (programPlanIds: string[]) => {
      await apolloClient.mutate<hasura.UPDATE_PROGRAM_CONTENT_PLAN, hasura.UPDATE_PROGRAM_CONTENT_PLANVariables>({
        mutation: gql`
          mutation UPDATE_PROGRAM_CONTENT_PLAN(
            $programContentId: uuid!
            $programContentPlans: [program_content_plan_insert_input!]!
          ) {
            delete_program_content_plan(where: { program_content_id: { _eq: $programContentId } }) {
              affected_rows
            }
            insert_program_content_plan(objects: $programContentPlans) {
              affected_rows
            }
          }
        `,
        variables: {
          programContentId,
          programContentPlans: programPlanIds.map(programPlanId => ({
            program_content_id: programContentId,
            program_plan_id: programPlanId,
          })),
        },
      })
    },
    updateMaterials: async (files: File[]) => {
      await apolloClient.mutate<
        hasura.UPDATE_PROGRAM_CONTENT_MATERIALS,
        hasura.UPDATE_PROGRAM_CONTENT_MATERIALSVariables
      >({
        mutation: gql`
          mutation UPDATE_PROGRAM_CONTENT_MATERIALS(
            $programContentId: uuid!
            $materials: [program_content_material_insert_input!]!
          ) {
            delete_program_content_material(where: { program_content_id: { _eq: $programContentId } }) {
              affected_rows
            }
            insert_program_content_material(objects: $materials) {
              affected_rows
            }
          }
        `,
        variables: {
          programContentId,
          materials: files.map(file => ({
            program_content_id: programContentId,
            data: {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
            },
          })),
        },
      })
    },
    updateVideos: async (attachmentIds: string[]) => {
      await apolloClient.mutate<hasura.UPDATE_PROGRAM_CONTENT_VIDEOS, hasura.UPDATE_PROGRAM_CONTENT_VIDEOSVariables>({
        mutation: gql`
          mutation UPDATE_PROGRAM_CONTENT_VIDEOS(
            $programContentId: uuid!
            $programContentVideos: [program_content_video_insert_input!]!
          ) {
            delete_program_content_video(where: { program_content_id: { _eq: $programContentId } }) {
              affected_rows
            }
            insert_program_content_video(objects: $programContentVideos) {
              affected_rows
            }
          }
        `,
        variables: {
          programContentId,
          programContentVideos: attachmentIds.map(attachmentId => ({
            program_content_id: programContentId,
            attachment_id: attachmentId,
          })),
        },
      })
    },
    updateAudios: async (files: File[]) => {
      await apolloClient.mutate<hasura.UPDATE_PROGRAM_CONTENT_AUDIOS, hasura.UPDATE_PROGRAM_CONTENT_AUDIOSVariables>({
        mutation: gql`
          mutation UPDATE_PROGRAM_CONTENT_AUDIOS(
            $programContentId: uuid!
            $audios: [program_content_audio_insert_input!]!
          ) {
            delete_program_content_audio(where: { program_content_id: { _eq: $programContentId } }) {
              affected_rows
            }
            insert_program_content_audio(objects: $audios) {
              affected_rows
            }
          }
        `,
        variables: {
          programContentId,
          audios: files.map(file => ({
            program_content_id: programContentId,
            data: {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
            },
          })),
        },
      })
    },
  }
}

export const useProgramPlanSortCollection = (programId: string) => {
  const { data, refetch } = useQuery<hasura.GetProgramPlanSortCollection, hasura.GetProgramPlanSortCollectionVariables>(
    gql`
      query GetProgramPlanSortCollection($programId: uuid!) {
        program_plan(where: { program_id: { _eq: $programId } }, order_by: { position: asc }) {
          id
          title
          list_price
          program_id
        }
      }
    `,
    { variables: { programId }, skip: !programId },
  )

  const programPlanSorts =
    data?.program_plan.map(plan => ({
      id: plan.id,
      title: plan.title,
      listPrice: plan.list_price,
      programId: plan.program_id,
    })) || []

  return {
    programPlanSorts,
    refetchProgramPlanSorts: refetch,
  }
}

export const useUpdateProgramPlanSortCollection = () => {
  const [updatePositions] = useMutation(gql`
    mutation UpdateProgramPlanSortCollection($data: [program_plan_insert_input!]!) {
      insert_program_plan(objects: $data, on_conflict: { constraint: program_plan_pkey, update_columns: position }) {
        affected_rows
      }
    }
  `)
  return { updatePositions }
}
