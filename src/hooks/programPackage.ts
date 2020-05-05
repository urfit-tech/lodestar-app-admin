import { useMutation, useQuery } from '@apollo/react-hooks'
import { ApolloError, ApolloQueryResult } from 'apollo-client'
import { ExecutionResult } from 'graphql'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import types from '../types'
import { ProgramPackage, ProgramPackageCollection } from '../types/programPackage'
import { PeriodType } from '../types/general'

export const useGetProgramPackageCollection: (
  appId: string,
) => {
  loading: boolean
  error?: ApolloError
  programPackages: ProgramPackageCollection
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

  const programPackages: ProgramPackageCollection =
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

export const useGetProgramPackage: (
  id: string,
) => {
  loading: boolean
  error?: ApolloError
  programPackage: ProgramPackage
  refetch: (variables?: types.GET_PROGRAM_PACKAGEVariables) => Promise<ApolloQueryResult<types.GET_PROGRAM_PACKAGE>>
} = id => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROGRAM_PACKAGE, types.GET_PROGRAM_PACKAGEVariables>(
    gql`
      query GET_PROGRAM_PACKAGE($id: uuid!) {
        program_package_by_pk(id: $id) {
          title
          cover_url
          published_at
          description
          program_package_programs {
            program_id
            program {
              id
              title
              cover_url
              position
            }
          }
          program_package_plans {
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

  const programPackage: ProgramPackage =
    loading || error || !data
      ? {
          title: '',
          coverUrl: null,
          publishedAt: null,
          description: null,
          programs: [],
          plans: [],
        }
      : {
          title: data?.program_package_by_pk?.title ?? null,
          coverUrl: data?.program_package_by_pk?.cover_url ?? null,
          publishedAt: data?.program_package_by_pk?.published_at ?? null,
          description: data?.program_package_by_pk?.description ?? null,
          programs:
            data?.program_package_by_pk?.program_package_programs.map(program => ({
              id: program.program_id,
              title: program.program.title ?? '',
              coverUrl: program.program.cover_url ?? '',
              position: program.program.position ?? -1,
            })) ?? [],
          plans:
            data?.program_package_by_pk?.program_package_plans.map(plan => ({
              id: plan.id,
              title: plan.title,
              listPrice: plan.list_price ?? 0,
              salePrice: plan.sale_price ?? 0,
              soldAt: plan.sold_at,
              periodType: plan.period_type as PeriodType,
              periodAmount: plan.period_amount,
              description: plan.description,
              isSubscription: plan.is_subscription,
              discountDownPrice: plan.discount_down_price,
              publishedAt: plan.published_at,
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

export const useInsertProgramPackage: (
  appId: string,
) => (title: string) => Promise<ExecutionResult<types.INSERT_PROGRAM_PACKAGE>> = appId => {
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
