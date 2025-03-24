import { gql, useQuery } from '@apollo/client'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useCallback, useEffect, useState } from 'react'
import { CouponProps } from '../types/checkout'
import { CouponFromLodestarAPI } from '../types/coupon'
import hasura from '../hasura'

export const useCouponCollection = (memberId: string) => {
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const [data, setData] = useState<CouponProps[]>([])

  const fetch = useCallback(async () => {
    if (authToken) {
      const route = '/coupons'
      try {
        setLoading(true)
        const { data } = await axios.get(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}${route}`, {
          params: { memberId, includeDeleted: false },
          headers: { authorization: `Bearer ${authToken}` },
        })
        setData(
          data.map((coupon: CouponFromLodestarAPI) => ({
            id: coupon.id,
            status: coupon.status,
            couponCode: {
              code: coupon.couponCode.code,
              couponPlan: {
                id: coupon.couponCode.couponPlan.id,
                startedAt: coupon.couponCode.couponPlan.startedAt
                  ? new Date(coupon.couponCode.couponPlan.startedAt)
                  : null,
                endedAt: coupon.couponCode.couponPlan.endedAt ? new Date(coupon.couponCode.couponPlan.endedAt) : null,
                type: coupon.couponCode.couponPlan.type === 1 ? 'cash' : 'percent',
                constraint: coupon.couponCode.couponPlan.constraint,
                amount: coupon.couponCode.couponPlan.amount,
                title: coupon.couponCode.couponPlan.title,
                description: coupon.couponCode.couponPlan.description || '',
                scope: coupon.couponCode.couponPlan.scope,
                productIds: coupon.couponCode.couponPlan.couponPlanProducts.map(
                  couponPlanProduct => couponPlanProduct.productId,
                ),
              },
            },
          })) || [],
        )
      } catch (err) {
        console.log(err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
  }, [authToken])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    loading,
    error,
    data,
    fetch,
  }
}

export const useCouponListInfo = (couponIds: string[]) => {
  const { loading, data, error } = useQuery<hasura.GetCouponListInfo, hasura.GetCouponListInfoVariables>(gql`
    query GetCouponListInfo($couponIds: [uuid!]) {
      coupon(where: { id: { _in: $couponIds } }) {
        id
        coupon_code {
          code
          coupon_plan {
            id
            title
          }
        }
      }
    }
  `)
  const coupons: { id: string; code: string; planTitle: string }[] =
    data?.coupon.map(coupon => ({
      id: coupon.id,
      code: coupon.coupon_code.code,
      planTitle: coupon.coupon_code.coupon_plan.title,
    })) || []

  return {
    loading,
    error,
    coupons,
  }
}
