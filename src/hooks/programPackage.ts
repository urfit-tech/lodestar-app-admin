import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { flatten, sum } from 'ramda'
import types from '../types'
import { MemberBrief, PeriodType } from '../types/general'
import { ProgramPackageProps } from '../types/programPackage'

export const useProgramPackageCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROGRAM_PACKAGE_COLLECTION>(gql`
    query GET_PROGRAM_PACKAGE_COLLECTION {
      program_package(where: { published_at: { _is_null: false } }, order_by: { published_at: desc }) {
        id
        title
      }
    }
  `)

  const programPackages: {
    id: string
    title: string
  }[] =
    loading || error || !data
      ? []
      : data.program_package.map(programPackage => ({
          id: programPackage.id,
          title: programPackage.title,
        }))

  return {
    loadingProgramPackage: loading,
    errorProgramPackage: error,
    programPackages,
    refetchProgramPackage: refetch,
  }
}

export const useProgramPackagePlanCollection = (programPackageId: string | null, isTempoDelivery?: boolean) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_PACKAGE_PLAN_COLLECTION,
    types.GET_PROGRAM_PACKAGE_PLAN_COLLECTIONVariables
  >(
    gql`
      query GET_PROGRAM_PACKAGE_PLAN_COLLECTION($programPackageIds: [uuid!], $isTempoDelivery: Boolean) {
        program_package_plan(
          where: {
            program_package_id: { _in: $programPackageIds }
            is_tempo_delivery: { _eq: $isTempoDelivery }
            published_at: { _is_null: false }
          }
          order_by: { position: asc, published_at: desc }
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
          title: programPackagePlan.title,
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
    types.GET_PROGRAM_PACKAGE_PROGRAM_COLLECTION,
    types.GET_PROGRAM_PACKAGE_PROGRAM_COLLECTIONVariables
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
          title: programPackageProgram.program.title,
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
    types.GET_PROGRAM_PACKAGE_PLAN_ENROLLMENT,
    types.GET_PROGRAM_PACKAGE_PLAN_ENROLLMENTVariables
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

  const members: MemberBrief[] =
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
    types.GET_PROGRAM_TEMPO_DELIVERY,
    types.GET_PROGRAM_TEMPO_DELIVERYVariables
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
    types.DELIVER_PROGRAM_COLLECTION,
    types.DELIVER_PROGRAM_COLLECTIONVariables
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

export const useGetProgramPackageCollection = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROGRAM_PACKAGES, types.GET_PROGRAM_PACKAGESVariables>(
    gql`
      query GET_PROGRAM_PACKAGES($appId: String!) {
        program_package(where: { app: { id: { _eq: $appId } } }) {
          id
          cover_url
          title
          published_at
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
    {
      variables: {
        appId,
      },
    },
  )

  const programPackages: {
    id: string
    coverUrl?: string | null
    title: string
    publishedAt: Date
    soldQuantity: number
  }[] =
    loading || error || !data
      ? []
      : data?.program_package.map(programPackage => ({
          id: programPackage.id,
          coverUrl: programPackage.cover_url,
          title: programPackage.title,
          publishedAt: programPackage.published_at,
          soldQuantity: sum(
            programPackage.program_package_plans.map(
              programPackagePlan =>
                programPackagePlan?.program_package_plan_enrollments_aggregate?.aggregate?.count ?? 0,
            ),
          ),
        }))

  return {
    loading,
    error,
    programPackages,
    refetch,
  }
}

export const useGetProgramPackage = (id: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROGRAM_PACKAGE, types.GET_PROGRAM_PACKAGEVariables>(
    gql`
      query GET_PROGRAM_PACKAGE($id: uuid!) {
        program_package_by_pk(id: $id) {
          title
          cover_url
          published_at
          description
          program_package_programs(order_by: { position: asc }) {
            id
            program {
              id
              title
              cover_url
            }
            position
          }
          program_package_plans(order_by: { position: asc, created_at: desc }) {
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
            position
            program_package_plan_enrollments_aggregate {
              aggregate {
                count
              }
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

  const programPackage: ProgramPackageProps =
    loading || error || !data || !data.program_package_by_pk
      ? {
          id: '',
          title: '',
          coverUrl: null,
          publishedAt: null,
          description: null,
          programs: [],
          plans: [],
        }
      : {
          id,
          title: data.program_package_by_pk.title || null,
          coverUrl: data.program_package_by_pk.cover_url || null,
          publishedAt: data.program_package_by_pk.published_at || null,
          description: data.program_package_by_pk.description || null,
          programs: data.program_package_by_pk.program_package_programs.map(programPackageProgram => ({
            id: programPackageProgram.id,
            program: {
              id: programPackageProgram.program.id,
              title: programPackageProgram.program.title,
              coverUrl: programPackageProgram.program.cover_url,
            },
            position: programPackageProgram.position,
          })),
          plans:
            data.program_package_by_pk.program_package_plans.map(plan => ({
              id: plan.id,
              title: plan.title,
              listPrice: plan.list_price || 0,
              salePrice: plan.sale_price || null,
              soldAt: plan.sold_at ? new Date(plan.sold_at) : null,
              periodType: plan.period_type as PeriodType,
              periodAmount: plan.period_amount,
              description: plan.description,
              isSubscription: plan.is_subscription,
              discountDownPrice: plan.discount_down_price,
              publishedAt: plan.published_at ? new Date(plan.published_at) : null,
              isTempoDelivery: plan.is_tempo_delivery,
              position: plan.position,
              soldQuantity: plan.program_package_plan_enrollments_aggregate.aggregate?.count ?? 0,
            })) ?? [],
        }

  return {
    loading,
    programPackage,
    error,
    refetch,
  }
}

export const useInsertProgramPackage = (appId: string) => {
  const [createProgramPackageHandler] = useMutation<
    types.INSERT_PROGRAM_PACKAGE,
    types.INSERT_PROGRAM_PACKAGEVariables
  >(gql`
    mutation INSERT_PROGRAM_PACKAGE($title: String!, $appId: String!) {
      insert_program_package(objects: { app_id: $appId, title: $title }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  const createProgramPackage = (title: string) => {
    return createProgramPackageHandler({
      variables: {
        appId,
        title,
      },
    })
  }

  return createProgramPackage
}
