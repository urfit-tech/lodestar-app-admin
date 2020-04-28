import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'

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
      query GET_PROGRAM_PACKAGE_PLAN_COLLECTION($programPackageId: uuid) {
        program_package_plan(
          where: { program_package_id: { _eq: $programPackageId }, published_at: { _is_null: false } }
          order_by: { position: asc, published_at: desc }
        ) {
          id
          title
        }
      }
    `,
    { variables: { programPackageId: programPackageId || undefined } },
  )

  const programPackagePlans: {
    id: string
    title: string
  }[] =
    loading || error || !data
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
