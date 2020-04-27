import { useMutation, useQuery } from '@apollo/react-hooks'
import { ApolloError, ApolloQueryResult } from 'apollo-client'
import { ExecutionResult } from 'graphql'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import types from '../types'
import { ProgramPackage } from '../types/programPackage'

export const useGetProgramPackages: (
  appId: string,
) => {
  loading: boolean
  error?: ApolloError
  programPackages: ProgramPackage[]
  refetch: (variables?: types.GET_PROGRAM_PACKAGESVariables) => Promise<ApolloQueryResult<types.GET_PROGRAM_PACKAGES>>
} = appId => {
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

  const programPackages: ProgramPackage[] =
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

export const useInsertProgramPackage: (
  appId: string,
) => (title: string) => Promise<ExecutionResult<types.INSERT_PROGRAM_PACKAGE>> = appId => {
  const [createProgramPackageHandler] = useMutation<
    types.INSERT_PROGRAM_PACKAGE,
    types.INSERT_PROGRAM_PACKAGEVariables
  >(gql`
    mutation INSERT_PROGRAM_PACKAGE($title: String!, $appId: String!) {
      insert_program_package(objects: { title: $title, app_id: $appId }) {
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
        title,
        appId,
      },
    })
  }

  return createProgramPackage
}
