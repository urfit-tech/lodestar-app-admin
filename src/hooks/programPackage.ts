import { useMutation, useQuery } from '@apollo/react-hooks'
import { ApolloError, ApolloQueryResult } from 'apollo-client'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import types from '../types'
import { PeriodType } from '../types/general'
import { ProgramPackageProps } from '../types/programPackage'

export const useGetProgramPackageCollection: (
  appId: string,
) => {
  loading: boolean
  error?: ApolloError
  programPackages: {
    id: string
    coverUrl?: string | null
    title: string
    publishedAt: Date
    soldQuantity: number
  }[]
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
          }
          program_package_plans(order_by: { position: asc }) {
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
            position: -1,
          })),
          plans:
            data.program_package_by_pk.program_package_plans.map(plan => ({
              id: plan.id,
              title: plan.title,
              listPrice: plan.list_price || 0,
              salePrice: plan.sale_price || null,
              soldAt: plan.sold_at,
              periodType: plan.period_type as PeriodType,
              periodAmount: plan.period_amount,
              description: plan.description,
              isSubscription: plan.is_subscription,
              discountDownPrice: plan.discount_down_price,
              publishedAt: plan.published_at,
              isTempoDelivery: plan.is_tempo_delivery,
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
