import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { flatten, sum } from 'ramda'
import hasura from '../hasura'
import { PeriodType } from '../types/general'
import { MemberBriefProps } from '../types/member'
import { ProgramPackageProps } from '../types/programPackage'

export const useProgramPackageCollection = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PROGRAM_PACKAGE_COLLECTION>(
    gql`
      query GET_PROGRAM_PACKAGE_COLLECTION {
        program_package(order_by: { published_at: desc_nulls_last }) {
          id
          title
          cover_url
          published_at
          is_private
          program_package_plans(where: { published_at: { _lte: "now()" } }, order_by: [{ position: asc }, { created_at: asc }]) {
            id
            list_price
            sale_price
            sold_at
            period_amount
            period_type
          }
        }
      }
    `,
    { fetchPolicy: 'cache-and-network' },
  )

  const { data: enrollmentData } = useQuery<hasura.GET_PROGRAM_PACKAGE_ENROLLMENT>(
    gql`
      query GET_PROGRAM_PACKAGE_ENROLLMENT {
        program_package {
          id
          program_package_plans {
            program_package_plan_enrollments_aggregate {
              aggregate {
                count
              }
            }
          }
        }
      }
    `,
    { fetchPolicy: 'no-cache' },
  )

  const programPackages: {
    id: string
    title: string
    coverUrl?: string | null
    publishedAt: string
    programPackageEnrollment: number
    isPrivate: boolean
    listPrice: number | null
    salePrice: number | null
    periodAmount: number | null
    periodType: string | null
  }[] =
    loading || error || !data
      ? []
      : data.program_package.map(v => {
          const now = Date.now()
          // 優先找有有效特價的方案（sale_price 可以是 0，所以用 !== null 檢查）
          const planWithSale = v.program_package_plans?.find(
            (p: any) => p.sale_price !== null && p.sold_at && new Date(p.sold_at).getTime() > now
          )
          // 如果沒有有效特價，取排序第一個（已按 position → created_at 排序）
          const plan = planWithSale || v.program_package_plans?.[0]

          return {
            id: v.id,
            title: v.title || '',
            coverUrl: v?.cover_url || '',
            publishedAt: v.published_at,
            programPackageEnrollment: 0,
            isPrivate: v.is_private,
            listPrice: plan?.list_price ?? null,
            salePrice: plan?.sale_price !== null && plan?.sold_at && new Date(plan.sold_at).getTime() > now ? plan.sale_price : null,
            periodAmount: plan?.period_amount || null,
            periodType: plan?.period_type || null,
          }
        })

  if (enrollmentData) {
    programPackages.forEach(v => {
      const enrollmentAmount =
        enrollmentData.program_package
          .filter(w => w.id === v.id)
          .map(x =>
            sum(x.program_package_plans.map(y => y.program_package_plan_enrollments_aggregate.aggregate?.count || 0)),
          )[0] || 0
      v.programPackageEnrollment = enrollmentAmount
    })
  }

  return {
    loading,
    error,
    programPackages,
    refetch,
  }
}

export const useProgramPackagePlanCollection = (programPackageId: string | null, isTempoDelivery?: boolean) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAM_PACKAGE_PLAN_COLLECTION,
    hasura.GET_PROGRAM_PACKAGE_PLAN_COLLECTIONVariables
  >(
    gql`
      query GET_PROGRAM_PACKAGE_PLAN_COLLECTION($programPackageIds: [uuid!], $isTempoDelivery: Boolean) {
        program_package_plan(
          where: { program_package_id: { _in: $programPackageIds }, is_tempo_delivery: { _eq: $isTempoDelivery } }
          order_by: [{ position: asc }, { published_at: desc }]
        ) {
          id
          title
        }
      }
    `,
    { variables: { programPackageIds: programPackageId ? [programPackageId] : [], isTempoDelivery } },
  )

  const programPackagePlans: {
    id: string
    title: string
  }[] =
    loading || error || !data || !programPackageId
      ? []
      : data.program_package_plan.map(programPackagePlan => ({
          id: programPackagePlan.id,
          title: programPackagePlan.title || '',
        }))

  return {
    loadingProgramPackagePlans: loading,
    errorProgramPackagePlans: error,
    programPackagePlans,
    refetchProgramPackagePlans: refetch,
  }
}

export const useProgramPackageProgramCollection = (programPackageId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAM_PACKAGE_PROGRAM_COLLECTION,
    hasura.GET_PROGRAM_PACKAGE_PROGRAM_COLLECTIONVariables
  >(
    gql`
      query GET_PROGRAM_PACKAGE_PROGRAM_COLLECTION($programPackageIds: [uuid!]) {
        program_package_program(
          where: { program_package_id: { _in: $programPackageIds } }
          order_by: { position: asc }
        ) {
          id
          program {
            id
            title
          }
        }
      }
    `,
    { variables: { programPackageIds: programPackageId ? [programPackageId] : [] } },
  )

  const programs: {
    id: string
    title: string
    programPackageProgramId: string
  }[] =
    loading || error || !data
      ? []
      : data.program_package_program.map(programPackageProgram => ({
          id: programPackageProgram.program.id,
          title: programPackageProgram.program.title || '',
          programPackageProgramId: programPackageProgram.id,
        }))

  return {
    loadingPrograms: loading,
    errorPrograms: error,
    programs,
    refetchPrograms: refetch,
  }
}

export const useProgramPackagePlanEnrollment = (programPackagePlanId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAM_PACKAGE_PLAN_ENROLLMENT,
    hasura.GET_PROGRAM_PACKAGE_PLAN_ENROLLMENTVariables
  >(
    gql`
      query GET_PROGRAM_PACKAGE_PLAN_ENROLLMENT($programPackagePlanIds: [uuid!]) {
        program_package_plan_enrollment(
          where: { program_package_plan_id: { _in: $programPackagePlanIds } }
          distinct_on: member_id
          order_by: { member_id: asc }
        ) {
          member {
            id
            picture_url
            name
            username
            email
          }
        }
      }
    `,
    { variables: { programPackagePlanIds: programPackagePlanId ? [programPackagePlanId] : [] } },
  )

  const members: MemberBriefProps[] =
    loading || error || !data
      ? []
      : data.program_package_plan_enrollment.map(enrollment => ({
          id: enrollment.member?.id || '',
          avatarUrl: enrollment.member?.picture_url || null,
          name: enrollment.member?.name || enrollment.member?.username || '',
          email: enrollment.member?.email || '',
        }))

  return {
    loadingEnrollment: loading,
    errorEnrollment: error,
    members,
    refetchEnrollment: refetch,
  }
}

export const useProgramTempoDelivery = (programPackageId: string | null, memberIds: string[]) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAM_TEMPO_DELIVERY,
    hasura.GET_PROGRAM_TEMPO_DELIVERYVariables
  >(
    gql`
      query GET_PROGRAM_TEMPO_DELIVERY($programPackageIds: [uuid!], $memberIds: [String!]) {
        program_tempo_delivery(
          where: {
            member_id: { _in: $memberIds }
            program_package_program: { program_package_id: { _in: $programPackageIds } }
          }
        ) {
          member_id
          program_package_program {
            id
            program_id
          }
          delivered_at
        }
      }
    `,
    {
      variables: {
        programPackageIds: programPackageId ? [programPackageId] : [],
        memberIds,
      },
    },
  )

  const deliveredMemberCount: { [ProgramID: string]: number } = {}
  const tempoDelivery: { [MemberId: string]: { [ProgramId: string]: Date } } =
    loading || error || !data
      ? {}
      : data.program_tempo_delivery.reduce((accumulator, currentValue) => {
          const memberId = currentValue.member_id
          const programId = currentValue.program_package_program.program_id

          if (!accumulator[memberId]) {
            accumulator[memberId] = {}
          }
          accumulator[memberId][programId] = new Date(currentValue.delivered_at)

          if (!deliveredMemberCount[programId]) {
            deliveredMemberCount[programId] = 0
          }
          deliveredMemberCount[programId]++

          return accumulator
        }, {} as { [MemberId: string]: { [ProgramId: string]: Date } })

  const allDeliveredProgramIds: string[] =
    loading || error || !data
      ? []
      : Object.keys(deliveredMemberCount).filter(programId => deliveredMemberCount[programId] === memberIds.length)

  return {
    loadingTempoDelivery: loading,
    errorTempoDelivery: error,
    tempoDelivery,
    allDeliveredProgramIds,
    refetchTempoDelivery: refetch,
  }
}

export const useDeliverProgramCollection = () => {
  const [deliverProgramCollection] = useMutation<
    hasura.DELIVER_PROGRAM_COLLECTION,
    hasura.DELIVER_PROGRAM_COLLECTIONVariables
  >(
    gql`
      mutation DELIVER_PROGRAM_COLLECTION($data: [program_tempo_delivery_insert_input!]!) {
        insert_program_tempo_delivery(
          objects: $data
          on_conflict: {
            constraint: program_tempo_delivery_member_id_program_package_program_id_key
            update_columns: [delivered_at]
          }
        ) {
          affected_rows
        }
      }
    `,
  )

  const deliverPrograms = (memberIds: string[], programIds: string[], deliverAt: Date) =>
    deliverProgramCollection({
      variables: {
        data: flatten(
          memberIds.map(memberId =>
            programIds.map(programId => ({
              member_id: memberId,
              program_package_program_id: programId,
              delivered_at: deliverAt,
            })),
          ),
        ),
      },
    })

  return deliverPrograms
}

export const useProgramPackage = (id: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GetProgramPackage, hasura.GetProgramPackageVariables>(
    gql`
      query GetProgramPackage($id: uuid!) {
        program_package_by_pk(id: $id) {
          id
          title
          cover_url
          published_at
          description
          is_private
          meta_tag
          program_package_programs(order_by: { position: asc }) {
            id
            program {
              id
              title
              cover_url
              cover_thumbnail_url
              published_at
            }
            position
          }
          program_package_plans(order_by: [{ position: asc }, { created_at: asc }]) {
            id
            title
            list_price
            sale_price
            sold_at
            period_type
            period_amount
            description
            is_subscription
            discount_down_price
            period_amount
            period_type
            published_at
            is_tempo_delivery
            is_participants_visible
            is_countdown_timer_visible
            position
            remind_period_amount
            remind_period_type
            program_package_plan_enrollments_aggregate {
              aggregate {
                count
              }
            }
          }
          program_package_categories(order_by: { position: asc }) {
            category {
              id
              name
            }
          }
          program_package_tags(order_by: { position: asc }) {
            id
            tag_name
            tag {
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        id,
      },
    },
  )

  const programPackage: ProgramPackageProps | null =
    loading || error || !data || !data.program_package_by_pk
      ? null
      : {
          id: data.program_package_by_pk.id,
          title: data.program_package_by_pk.title || null,
          coverUrl: data.program_package_by_pk.cover_url || null,
          publishedAt: data.program_package_by_pk.published_at || null,
          description: data.program_package_by_pk.description || null,
          metaTag: data.program_package_by_pk.meta_tag,
          isPrivate: data.program_package_by_pk.is_private,
          programs: data.program_package_by_pk.program_package_programs.map(programPackageProgram => ({
            id: programPackageProgram.id,
            program: {
              id: programPackageProgram.program.id,
              title: programPackageProgram.program.title || '',
              coverUrl: programPackageProgram.program.cover_url || null,
              coverThumbnailUrl: programPackageProgram.program.cover_thumbnail_url || null,
              publishedAt: programPackageProgram.program.published_at,
            },
            position: programPackageProgram.position,
          })),
          plans:
            data.program_package_by_pk.program_package_plans.map(plan => ({
              id: plan.id,
              title: plan.title || '',
              listPrice: plan.list_price,
              salePrice: plan.sale_price,
              soldAt: plan.sold_at ? new Date(plan.sold_at) : null,
              periodType: plan.period_type as PeriodType,
              periodAmount: plan.period_amount,
              description: plan.description || '',
              isSubscription: plan.is_subscription,
              discountDownPrice: plan.discount_down_price,
              publishedAt: plan.published_at ? new Date(plan.published_at) : null,
              isTempoDelivery: plan.is_tempo_delivery,
              isParticipantsVisible: plan.is_participants_visible,
              isCountdownTimerVisible: plan.is_countdown_timer_visible,
              position: plan.position,
              soldQuantity: plan.program_package_plan_enrollments_aggregate.aggregate?.count ?? 0,
              remindPeriodAmount: plan.remind_period_amount !== undefined ? plan.remind_period_amount : null,
              remindPeriodType: plan.remind_period_type !== undefined ? plan.remind_period_type : null,
            })) ?? [],
          categories: data.program_package_by_pk.program_package_categories.map(v => ({
            id: v.category.id,
            name: v.category.name,
          })),
          tags: data.program_package_by_pk.program_package_tags.map(
            programPackageTag => programPackageTag.tag?.name || programPackageTag.tag_name,
          ),
        }

  return {
    loading,
    programPackage,
    error,
    refetch,
  }
}

export const useMutateProgramPackage = () => {
  const [updateProgramPackageMetaTag] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_META_TAG,
    hasura.UPDATE_PROGRAM_PACKAGE_META_TAGVariables
  >(
    gql`
      mutation UPDATE_PROGRAM_PACKAGE_META_TAG($id: uuid!, $metaTag: jsonb) {
        update_program_package(where: { id: { _eq: $id } }, _set: { meta_tag: $metaTag }) {
          affected_rows
        }
      }
    `,
  )

  return {
    updateProgramPackageMetaTag,
  }
}
