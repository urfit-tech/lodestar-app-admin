import { useMutation, useQuery } from '@apollo/react-hooks'
import { generate } from 'coupon-code'
import gql from 'graphql-tag'
import { reverse, times } from 'ramda'
import { VoucherPlanFields } from '../components/voucher/VoucherPlanAdminModal'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import hasura from '../hasura'
import {
  CouponCodeProps,
  CouponPlanProps,
  CouponProps,
  VoucherCodeProps,
  VoucherPlanProps,
  VoucherProps,
} from '../types/checkout'

import axios from 'axios'
import { prop, sum } from 'ramda'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { InvoiceProps } from '../types/merchandise'
import { ShippingProps } from '../types/merchandise'
import { CheckProps, OrderDiscountProps, OrderProductProps, shippingOptionProps } from '../types/checkout'

export const useCouponPlanCollection = () => {
  const app = useApp()

  const { loading, error, data, refetch } = useQuery<
    hasura.GET_COUPON_PLAN_COLLECTION,
    hasura.GET_COUPON_PLAN_COLLECTIONVariables
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
          # FIXME: query too heavy
          # coupon_codes {
          #   coupons_aggregate(where: { status: { used: { _eq: true } } }) {
          #     aggregate {
          #       count
          #     }
          #   }
          # }
          coupon_plan_products {
            id
            product_id
          }
        }
      }
    `,
    { variables: { appId: app.id }, context: { important: true } },
  )

  const couponPlans: (CouponPlanProps & {
    count: number
    remaining: number
    available: boolean
    used: number
    productIds: string[]
  })[] =
    loading || error || !data
      ? []
      : data.coupon_plan.map(couponPlan => {
          const remaining = couponPlan.coupon_codes_aggregate.aggregate?.sum?.remaining || 0
          const available =
            remaining > 0 &&
            (!couponPlan.started_at || new Date(couponPlan.started_at).getTime() < Date.now()) &&
            (!couponPlan.ended_at || new Date(couponPlan.ended_at).getTime() > Date.now())

          const used = 0
          // FIXME: used coupon aggregate query too heavy
          // const used
          //   couponPlan.coupon_codes?.reduce(
          //     (count, coupon) => count + (coupon.coupons_aggregate.aggregate?.count || 0),
          //     0,
          //   ) || 0
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
            used,
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
    hasura.GET_COUPON__CODE_COLLECTION,
    hasura.GET_COUPON__CODE_COLLECTIONVariables
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
              outdated
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
            status: {
              used: !!coupon.status?.used,
              outdated: !!coupon.status?.outdated,
            },
          })),
        }))

  return {
    loadingCouponCodes: loading,
    errorCouponCodes: error,
    couponCodes,
    refetchCouponCodes: refetch,
  }
}

export const useVoucherPlanCollection = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_VOUCHER_PLAN_COLLECTION>(
    gql`
      query GET_VOUCHER_PLAN_COLLECTION($appId: String) {
        voucher_plan(where: { app_id: { _eq: $appId } }) {
          id
          title
          description
          started_at
          ended_at
          product_quantity_limit
          is_transferable
          voucher_codes_aggregate {
            aggregate {
              sum {
                count
                remaining
              }
            }
          }
          voucher_plan_products {
            id
            product_id
          }
        }
      }
    `,
    { variables: { appId } },
  )

  const voucherPlanCollection: VoucherPlanProps[] = reverse(data?.voucher_plan || []).map(v => {
    const remaining = v.voucher_codes_aggregate.aggregate?.sum?.remaining || 0

    return {
      id: v.id,
      title: v.title,
      startedAt: v?.started_at || null,
      endedAt: v?.ended_at || null,
      productQuantityLimit: v.product_quantity_limit,
      available: remaining > 0 && (v.ended_at ? new Date(v.ended_at).getTime() > Date.now() : true),
      description: decodeURI(v.description || ''),
      count: v.voucher_codes_aggregate.aggregate?.sum?.count || 0,
      remaining,
      productIds: v.voucher_plan_products.map(product => product.product_id),
      isTransferable: v.is_transferable,
    }
  })

  return {
    loading,
    error,
    voucherPlanCollection,
    refetch,
  }
}

export const useVoucherCode = (voucherPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_VOUCHER_CODE, hasura.GET_VOUCHER_CODEVariables>(
    GET_VOUCHER_CODE,
    {
      variables: {
        voucherPlanId,
      },
    },
  )

  const voucherCodes: (VoucherCodeProps & { vouchers: (VoucherProps & { memberEmail: string })[] })[] =
    data?.voucher_code.map(voucherCode => ({
      id: voucherCode.id,
      code: voucherCode.code,
      count: voucherCode.count,
      remaining: voucherCode.remaining,
      vouchers: voucherCode.vouchers.map(voucher => ({
        id: voucher.id,
        memberEmail: voucher.member?.email || '',
        used: !!voucher.status?.used,
      })),
    })) || []

  return {
    loadingVoucherCodes: loading,
    errorVoucherCodes: error,
    voucherCodes,
    refetchVoucherCodes: refetch,
  }
}

export const useMutateVoucherPlan = () => {
  const { id: appId } = useApp()

  const [insertVoucherPlanHandler] = useMutation<hasura.INSERT_VOUCHER_PLAN, hasura.INSERT_VOUCHER_PLANVariables>(
    gql`
      mutation INSERT_VOUCHER_PLAN(
        $title: String!
        $description: String
        $appId: String!
        $startedAt: timestamptz
        $endedAt: timestamptz
        $productQuantityLimit: Int!
        $voucherCodes: [voucher_code_insert_input!]!
        $voucherPlanProducts: [voucher_plan_product_insert_input!]!
        $isTransferable: Boolean
      ) {
        insert_voucher_plan(
          objects: {
            title: $title
            description: $description
            app_id: $appId
            started_at: $startedAt
            ended_at: $endedAt
            product_quantity_limit: $productQuantityLimit
            voucher_codes: { data: $voucherCodes }
            voucher_plan_products: { data: $voucherPlanProducts }
            is_transferable: $isTransferable
          }
        ) {
          affected_rows
        }
      }
    `,
  )
  const insertVoucherPlan = (values: VoucherPlanFields) => {
    return insertVoucherPlanHandler({
      variables: {
        ...values,
        appId,
        voucherCodes:
          values.voucherCodes?.flatMap(voucherCode =>
            voucherCode.type === 'random'
              ? times(
                  () => ({
                    code: generate(),
                    count: 1,
                    remaining: 1,
                  }),
                  voucherCode.count,
                )
              : {
                  code: voucherCode.code,
                  count: voucherCode.count,
                  remaining: voucherCode.count,
                },
          ) || [],
        voucherPlanProducts: values.voucherPlanProducts.flatMap(productId => ({
          product_id: productId,
        })),
      },
    })
  }

  const [updateVoucherPlanHandler] = useMutation<hasura.UPDATE_VOUCHER_PLAN, hasura.UPDATE_VOUCHER_PLANVariables>(
    gql`
      mutation UPDATE_VOUCHER_PLAN(
        $voucherPlanId: uuid!
        $title: String!
        $description: String
        $appId: String!
        $startedAt: timestamptz
        $endedAt: timestamptz
        $productQuantityLimit: Int!
        $voucherPlanProducts: [voucher_plan_product_insert_input!]!
        $isTransferable: Boolean
      ) {
        update_voucher_plan(
          where: { id: { _eq: $voucherPlanId } }
          _set: {
            title: $title
            description: $description
            app_id: $appId
            started_at: $startedAt
            ended_at: $endedAt
            product_quantity_limit: $productQuantityLimit
            is_transferable: $isTransferable
          }
        ) {
          affected_rows
        }
        delete_voucher_plan_product(where: { voucher_plan_id: { _eq: $voucherPlanId } }) {
          affected_rows
        }
        insert_voucher_plan_product(objects: $voucherPlanProducts) {
          affected_rows
        }
      }
    `,
  )
  const updateVoucherPlan = (values: VoucherPlanFields, voucherPlanId: string) => {
    return updateVoucherPlanHandler({
      variables: {
        ...values,
        voucherPlanId,
        appId,
        description: encodeURI(values.description || ''),
        voucherPlanProducts: values.voucherPlanProducts.flatMap(productId => ({
          voucher_plan_id: voucherPlanId,
          product_id: productId,
        })),
      },
    })
  }

  return {
    insertVoucherPlan,
    updateVoucherPlan,
  }
}

export const useCheck = (
  productIds: string[],
  discountId: string | null,
  memberId: string | null,
  shipping: ShippingProps | null,
  options: { [ProductId: string]: any },
) => {
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [check, setCheck] = useState<CheckProps>({ orderProducts: [], orderDiscounts: [], shippingOption: null })
  const [orderChecking, setOrderChecking] = useState(false)
  const [orderPlacing, setOrderPlacing] = useState(false)
  const [checkError, setCheckError] = useState<Error | null>(null)

  useEffect(() => {
    setOrderChecking(true)
    axios
      .post<{
        code: string
        message: string
        result: {
          orderProducts: OrderProductProps[]
          orderDiscounts: OrderDiscountProps[]
          shippingOption: shippingOptionProps
        }
      }>(
        `${process.env.REACT_APP_API_BASE_ROOT}/payment/checkout-order`,
        {
          appId,
          memberId,
          productIds,
          discountId,
          shipping,
          options,
        },
        {
          headers: { authorization: `Bearer ${authToken}` },
        },
      )
      .then(({ data: { code, message, result } }) => {
        if (code === 'SUCCESS') {
          setCheck(result)
        } else {
          setCheckError(new Error(message))
        }
      })
      .catch(setCheckError)
      .finally(() => setOrderChecking(false))
  }, [
    appId,
    memberId,
    authToken,
    discountId,
    JSON.stringify(options),
    JSON.stringify(productIds),
    JSON.stringify(shipping),
  ])

  const placeOrder = useCallback(
    async (paymentType: 'perpetual' | 'subscription' | 'groupBuying', invoice: InvoiceProps) => {
      setOrderPlacing(true)
      return axios
        .post<{ code: string; message: string; result: { id: string } }>(
          `${process.env.REACT_APP_API_BASE_ROOT}/tasks/order`,
          {
            paymentModel: { type: paymentType },
            productIds,
            discountId,
            memberId,
            shipping,
            invoice,
            options,
          },
          {
            headers: { authorization: `Bearer ${authToken}` },
          },
        )
        .then(({ data: { code, result, message } }) => {
          if (code === 'SUCCESS') {
            return result.id
          } else {
            throw new Error(message)
          }
        })
        .finally(() => setOrderPlacing(false))
    },
    [authToken, discountId, memberId, options, productIds, shipping],
  )

  return {
    check,
    checkError,
    orderPlacing,
    orderChecking,
    placeOrder,
    totalPrice:
      sum(check.orderProducts.map(prop('price'))) -
      sum(check.orderDiscounts.map(prop('price'))) +
      (check.shippingOption?.fee || 0),
  }
}

const GET_VOUCHER_CODE = gql`
  query GET_VOUCHER_CODE($voucherPlanId: uuid!) {
    voucher_code(where: { voucher_plan: { id: { _eq: $voucherPlanId } } }) {
      id
      code
      count
      remaining
      vouchers {
        id
        member {
          id
          email
        }
        status {
          used
        }
      }
    }
  }
`
