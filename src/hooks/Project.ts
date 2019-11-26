import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { fundingSchema } from '../schemas/funding'
import types from '../types'

export const useEnrolledProjectPlanIds = (memberId: string) => {
  const GET_ENROLLED_PROJECT_PLAN_IDS = gql`
    query GET_ENROLLED_PROJECT_PLAN_IDS($memberId: String!) {
      project_plan_enrollment(where: { member_id: { _eq: $memberId } }) {
        project_plan_id
      }
    }
  `

  const { loading, error, data, refetch } = useQuery<
    types.GET_ENROLLED_PROJECT_PLAN_IDS,
    types.GET_ENROLLED_PROJECT_PLAN_IDSVariables
  >(GET_ENROLLED_PROJECT_PLAN_IDS, { variables: { memberId }, fetchPolicy: 'no-cache' })

  return {
    loadingProjectPlanIds: loading,
    errorProjectPlanIds: error,
    enrolledProjectPlanIds:
      data && data.project_plan_enrollment
        ? data.project_plan_enrollment.map(projectPlan => projectPlan.project_plan_id)
        : [],
    refetchProjectPlanIds: refetch,
  }
}

export const useFunding = (fundingId: string) => {
  const { data, loading, error, refetch } = useQuery<types.GET_FUNDING, types.GET_FUNDINGVariables>(
    gql`
      query GET_FUNDING($fundingId: uuid!) {
        funding_by_pk(id: $fundingId) {
          id
          app_id
          cover_type
          cover_url
          title
          subtitle
          description
          target_amount
          expired_at
          introduction
          contents
          updates
          comments
          type
          programs(order_by: { published_at: asc }) {
            id
            cover_url
            title
            abstract
            description
            list_price
            sale_price
            sold_at
            is_subscription
            program_plans {
              id
              title
              description
              period_type
              list_price
              sale_price
              sold_at
              discount_down_price
            }
          }
        }
      }
    `,
    {
      variables: { fundingId },
    },
  )

  return {
    loadingFunding: loading,
    errorFunding: error,
    funding: loading || error || !data || !data.funding_by_pk ? null : fundingSchema.cast(data.funding_by_pk),
    refetchFunding: refetch,
  }
}
