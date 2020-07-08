import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useContext } from 'react'
import AppContext from '../contexts/AppContext'
import types from '../types'
import { CouponCodeProps, CouponPlanProps, CouponProps } from '../types/checkout'

export const useCouponPlanCollection = () => {
  const app = useContext(AppContext)

  const { loading, error, data, refetch } = useQuery<
    types.GET_COUPON_PLAN_COLLECTION,
    types.GET_COUPON_PLAN_COLLECTIONVariables
  >(
    gql`
      query GET_COUPON_PLAN_COLLECTION($appId: String!) {
        coupon_plan(where: { coupon_codes: { app_id: { _eq: $appId } } }, order_by: { updated_at: desc }) {
          id
          title
          amount
          scope
          type
          constraint
          started_at
          ended_at
          description
          coupon_codes_aggregate {
            aggregate {
              sum {
                count
                remaining
              }
            }
          }
          coupon_plan_products {
            id
            product_id
          }
        }
      }
    `,
    { variables: { appId: app.id } },
  )

  const couponPlans: CouponPlanProps[] =
    loading || error || !data
      ? []
      : data.coupon_plan.map(couponPlan => {
          const remaining = couponPlan.coupon_codes_aggregate.aggregate?.sum?.remaining || 0
          const available =
            remaining > 0 &&
            (!couponPlan.started_at || new Date(couponPlan.started_at).getTime() < Date.now()) &&
            (!couponPlan.ended_at || new Date(couponPlan.ended_at).getTime() > Date.now())

          return {
            id: couponPlan.id,
            title: couponPlan.title,
            description: couponPlan.description,
            scope: couponPlan.scope,
            type: couponPlan.type === 1 ? 'cash' : couponPlan.type === 2 ? 'percent' : null,
            amount: couponPlan.amount,
            constraint: couponPlan.constraint,
            startedAt: couponPlan.started_at ? new Date(couponPlan.started_at) : null,
            endedAt: couponPlan.ended_at ? new Date(couponPlan.ended_at) : null,
            count: couponPlan.coupon_codes_aggregate.aggregate?.sum?.count || 0,
            remaining,
            available,
            productIds: couponPlan.coupon_plan_products.map(couponPlanProduct => couponPlanProduct.product_id),
          }
        })

  return {
    loadingCouponPlans: loading,
    errorCouponPlans: error,
    couponPlans,
    refetchCouponPlans: refetch,
  }
}

export const useCouponCodeCollection = (couponPlanId: string) => {
  const { loading, data, error, refetch } = useQuery<
    types.GET_COUPON__CODE_COLLECTION,
    types.GET_COUPON__CODE_COLLECTIONVariables
  >(
    gql`
      query GET_COUPON__CODE_COLLECTION($couponPlanId: uuid!) {
        coupon_code(where: { coupon_plan: { id: { _eq: $couponPlanId } } }) {
          id
          code
          count
          remaining
          coupons {
            id
            member {
              id
              email
            }
            status {
              used
            }
          }
          coupons_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
    { variables: { couponPlanId } },
  )

  const couponCodes: (CouponCodeProps & {
    coupons: CouponProps[]
  })[] =
    loading || error || !data
      ? []
      : data.coupon_code.map(couponCode => ({
          id: couponCode.id,
          code: couponCode.code,
          count: couponCode.count,
          remaining: couponCode.remaining,
          used: couponCode.coupons_aggregate.aggregate?.count || 0,
          coupons: couponCode.coupons.map(coupon => ({
            id: coupon.id,
            member: {
              id: coupon.member.id,
              email: coupon.member.email,
            },
            used: !!coupon.status?.used,
          })),
        }))

  return {
    loadingCouponCodes: loading,
    errorCouponCodes: error,
    couponCodes,
    refetchCouponCodes: refetch,
  }
}
