import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { array, date, object, string } from 'yup'
import { couponSchema } from '../schemas/coupon'
import types from '../types'

type AppProps = {
  id: string
  name: string
  title: string | null
  description: string | null
  ogTitle: string | null
  ogUrl: string | null
  ogImage: string | null
  ogDescription: string | null
  pointExchangeRate: number
  pointDiscountRatio: number
  pointValidityPeriod: number | null
}
export const useApp = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_APP, types.GET_APPVariables>(
    gql`
      query GET_APP($appId: String!) {
        app_by_pk(id: $appId) {
          id
          name
          title
          description
          og_title
          og_url
          og_image
          og_description
          point_exchange_rate
          point_discount_ratio
          point_validity_period
        }
      }
    `,
    { variables: { appId: localStorage.getItem('kolable.app.id') || 'default' } },
  )

  const app: AppProps =
    loading || error || !data || !data.app_by_pk
      ? {
          id: '',
          name: '',
          title: null,
          description: null,
          ogTitle: null,
          ogUrl: null,
          ogImage: null,
          ogDescription: null,
          pointExchangeRate: 0,
          pointDiscountRatio: 0,
          pointValidityPeriod: null,
        }
      : {
          id: data.app_by_pk.id,
          name: data.app_by_pk.name,
          title: data.app_by_pk.title,
          description: data.app_by_pk.description,
          ogTitle: data.app_by_pk.og_title,
          ogUrl: data.app_by_pk.og_url,
          ogImage: data.app_by_pk.og_image,
          ogDescription: data.app_by_pk.og_description,
          pointExchangeRate: data.app_by_pk.point_exchange_rate,
          pointDiscountRatio: data.app_by_pk.point_discount_ratio,
          pointValidityPeriod: data.app_by_pk.point_validity_period,
        }

  return {
    loadingApp: loading,
    errorApp: error,
    app,
    refetchApp: refetch,
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
