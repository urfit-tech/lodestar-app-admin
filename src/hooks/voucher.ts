import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useCallback, useEffect, useState } from 'react'
import { VoucherFromLodestarAPI, VoucherProps } from '../types/voucher'

export const useEnrolledVoucherCollection = (memberId: string) => {
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const [data, setData] = useState<
    (VoucherProps & {
      productIds: string[]
    })[]
  >([])

  const fetch = useCallback(async () => {
    if (authToken) {
      const route = '/vouchers'
      try {
        setLoading(true)
        const { data } = await axios.get(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}${route}`, {
          params: { memberId, includeDeleted: false },
          headers: { authorization: `Bearer ${authToken}` },
        })
        setData(
          data.map((voucher: VoucherFromLodestarAPI) => ({
            id: voucher.id,
            title: voucher.voucherCode.voucherPlan.title,
            description: decodeURI(voucher.voucherCode.voucherPlan.description || ''),
            productQuantityLimit: voucher.voucherCode.voucherPlan.productQuantityLimit,
            startedAt: voucher.voucherCode.voucherPlan.startedAt
              ? new Date(voucher.voucherCode.voucherPlan.startedAt)
              : undefined,
            endedAt: voucher.voucherCode.voucherPlan.endedAt
              ? new Date(voucher.voucherCode.voucherPlan.endedAt)
              : undefined,
            available: !!voucher.status && !voucher.status.outdated && !voucher.status.used,
            productIds: voucher.voucherCode.voucherPlan.voucherPlanProducts.map(
              voucherPlanProduct => voucherPlanProduct.productId,
            ),
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
