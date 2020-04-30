import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { MemberBrief } from '../types/general'
import { flatten } from 'ramda'

export const useProgramPackageCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROGRAM_PACKAGE>(gql`
    query GET_PROGRAM_PACKAGE {
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

export const useProgramPackagePlanCollection = (programPackageId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_PACKAGE_PLAN_COLLECTION,
    types.GET_PROGRAM_PACKAGE_PLAN_COLLECTIONVariables
  >(
    gql`
      query GET_PROGRAM_PACKAGE_PLAN_COLLECTION($programPackageIds: [uuid!]) {
        program_package_plan(
          where: { program_package_id: { _in: $programPackageIds }, published_at: { _is_null: false } }
          order_by: { position: asc, published_at: desc }
        ) {
          id
          title
        }
      }
    `,
    { variables: { programPackageIds: programPackageId ? [programPackageId] : [] } },
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
        program_package_program(where: { program_package_id: { _in: $programPackageIds } }) {
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

export const useProgramPackageEnrollment = (programPackagePlanId: string | null) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_PACKAGE_PLAN_ENROLLMENT,
    types.GET_PROGRAM_PACKAGE_PLAN_ENROLLMENTVariables
  >(
    gql`
      query GET_PROGRAM_PACKAGE_PLAN_ENROLLMENT($programPackagePlanId: uuid) {
        program_package_plan_enrollment(
          where: { program_package_plan_id: { _eq: $programPackagePlanId } }
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
    { variables: { programPackagePlanId } },
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
      : Object.keys(deliveredMemberCount).filter(
          programId => deliveredMemberCount[programId] === memberIds.length,
        )

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
