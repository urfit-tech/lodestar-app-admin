import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useCallback, useEffect, useState } from 'react'
import { CouponProps } from '../types/checkout'
import { CouponFromLodestarAPI } from '../types/coupon'

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
