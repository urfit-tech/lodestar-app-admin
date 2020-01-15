import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { array, date, object, string } from 'yup'
import { couponSchema } from '../schemas/coupon'
import types from '../types'

export const useTags = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_TAGS>(
    gql`
      query GET_TAGS {
        tag {
          name
        }
      }
    `,
  )
  return {
    tags: data ? data.tag.map(tag => tag.name) : [],
    errorTags: error,
    loadingTags: loading,
    refetchTags: refetch,
  }
}

export const useCouponCollection = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_COUPON_COLLECTION, types.GET_COUPON_COLLECTIONVariables>(
    gql`
      query GET_COUPON_COLLECTION($memberId: String!) {
        coupon(where: { member_id: { _eq: $memberId } }) {
          id
          status {
            outdated
            used
          }
          coupon_code {
            code
            coupon_plan {
              title
              amount
              type
              constraint
              started_at
              ended_at
              description
            }
          }
        }
      }
    `,
    {
      variables: { memberId },
    },
  )
  return {
    coupons: object({ coupon: array(couponSchema).default([]) })
      .camelCase()
      .cast(data).coupon,
    errorCoupons: error,
    refetchCoupons: refetch,
    loadingCoupons: loading,
  }
}

export const useEnrolledProductIds = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<types.GET_ENROLLED_PRODUCTS, types.GET_ENROLLED_PRODUCTSVariables>(
    gql`
      query GET_ENROLLED_PRODUCTS($memberId: String!) {
        product_enrollment(where: { member_id: { _eq: $memberId } }) {
          product_id
        }
      }
    `,
    { variables: { memberId } },
  )

  const castData = object({
    productEnrollment: array(
      object({
        productId: string(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  const enrolledProductsIds = castData.productEnrollment.map(product => product.productId)

  return {
    enrolledProductIds: loading || error ? [] : enrolledProductsIds,
    errorProductIds: error,
    loadingProductIds: loading,
    refetchProgramIds: refetch,
  }
}

export const useEnrolledProgramPackagePlanIds = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<
    types.GET_ENROLLED_PROGRAM_PACKAGE_PLAN_IDS,
    types.GET_ENROLLED_PROGRAM_PACKAGE_PLAN_IDSVariables
  >(
    gql`
      query GET_ENROLLED_PROGRAM_PACKAGE_PLAN_IDS($memberId: String!) {
        program_package_plan_enrollment(where: { member_id: { _eq: $memberId } }) {
          program_package_plan_id
        }
      }
    `,
    { variables: { memberId } },
  )

  const enrolledProgramPackagePlanIds =
    loading || !!error || !data
      ? []
      : data.program_package_plan_enrollment.map(
          programPackagePlanEnrollment => programPackagePlanEnrollment.program_package_plan_id,
        )

  return {
    loadingProgramPackageIds: loading,
    enrolledProgramPackagePlanIds,
    errorProgramPackageIds: error,
    refetchProgramPackageIds: refetch,
  }
}

export const useNotifications = (memberId: string, limit?: number) => {
  const { data, loading, error, refetch, startPolling } = useQuery<
    types.GET_NOTIFICATIONS,
    types.GET_NOTIFICATIONSVariables
  >(
    gql`
      query GET_NOTIFICATIONS($memberId: String, $limit: Int) {
        notification(where: { target_member_id: { _eq: $memberId } }, order_by: { updated_at: desc }, limit: $limit) {
          id
          avatar
          description
          reference_url
          extra
          type
          read_at
          updated_at
        }
      }
    `,
    { variables: { memberId, limit } },
  )
  return {
    refetch,
    loading,
    error,
    startPolling,
    notifications: object({
      notification: array(
        object({
          id: string(),
          description: string(),
          type: string(),
          referenceUrl: string().nullable(),
          extra: string().nullable(),
          avatar: string().nullable(),
          readAt: date().nullable(),
          updatedAt: date(),
        }).camelCase(),
      ).default([]),
    }).cast(data).notification,
  }
}
