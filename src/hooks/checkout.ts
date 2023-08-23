import { useMutation, useQuery } from '@apollo/client'
import { generate } from 'coupon-code'
import { gql } from '@apollo/client'
import { times } from 'ramda'
import { VoucherPlanFields } from '../components/voucher/VoucherPlanAdminModal'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import hasura from '../hasura'
import { CouponCodeProps, CouponPlanProps, VoucherCodeProps, VoucherPlanProps, VoucherProps } from '../types/checkout'
import Axios from 'axios'

import axios from 'axios'
import { prop, sum } from 'ramda'
import { useEffect, useState } from 'react'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { InvoiceProps } from '../types/merchandise'
import { ShippingProps } from '../types/merchandise'
import { CheckProps, OrderDiscountProps, OrderProductProps, shippingOptionProps } from '../types/checkout'
import { uuidv4 } from '@antv/xflow-core'

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
            title: couponPlan.title || '',
            description: couponPlan.description || '',
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

  const couponCodes: Pick<CouponCodeProps, 'id' | 'code' | 'count' | 'used'>[] =
    loading || error || !data
      ? []
      : data.coupon_code.map(couponCode => ({
          id: couponCode.id,
          code: couponCode.code,
          count: couponCode.count,
          used: couponCode.coupons_aggregate.aggregate?.count || 0,
        }))

  return {
    loadingCouponCodes: loading,
    errorCouponCodes: error,
    couponCodes,
    refetchCouponCodes: refetch,
  }
}

export const useCouponCode = (couponPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_COUPON_CODE, hasura.GET_COUPON_CODEVariables>(
    GET_COUPON_CODE,
    {
      variables: {
        couponPlanId,
      },
    },
  )

  const couponCodes: (Pick<CouponCodeProps, 'id' | 'code' | 'count' | 'remaining'> & {
    coupons: { id: string; memberEmail: string }[]
  })[] =
    data?.coupon_code.map(couponCode => ({
      id: couponCode.id,
      code: couponCode.code,
      count: couponCode.count,
      remaining: couponCode.remaining,
      coupons: couponCode.coupons.map(couponCode => ({
        id: couponCode.id,
        memberEmail: couponCode.member?.email || '',
      })),
    })) || []

  return {
    loadingCouponCodes: loading,
    errorCouponCodes: error,
    couponCodes: couponCodes,
    refetchCouponCodes: refetch,
  }
}

export const useCouponsStatus = (couponPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_COUPON_STATUS, hasura.GET_COUPON_STATUSVariables>(
    gql`
      query GET_COUPON_STATUS($couponPlanId: uuid!) {
        coupon_status(where: { coupon: { coupon_code: { coupon_plan_id: { _eq: $couponPlanId } } } }) {
          used
          coupon_id
        }
      }
    `,
    {
      variables: {
        couponPlanId,
      },
    },
  )

  const couponsStatus: { id: string; used: boolean }[] =
    data?.coupon_status.map(couponStatus => ({
      id: couponStatus.coupon_id,
      used: !!couponStatus?.used,
    })) || []

  return {
    loading,
    error,
    data: couponsStatus,
    refetch,
  }
}

export const useVoucherPlanCollection = (condition: hasura.GET_VOUCHER_PLAN_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_VOUCHER_PLAN_COLLECTION,
    hasura.GET_VOUCHER_PLAN_COLLECTIONVariables
  >(
    gql`
      query GET_VOUCHER_PLAN_COLLECTION($condition: voucher_plan_bool_exp!, $limit: Int!) {
        voucher_plan(where: $condition, order_by: [{ updated_at: desc }, { id: desc }], limit: $limit) {
          id
          title
          description
          started_at
          ended_at
          updated_at
          product_quantity_limit
          is_transferable
          sale_amount
          sale_price
          pin_code
          bonus_coins
          voucher_plan_products {
            id
            product_id
          }
          voucher_plan_category {
            id
            category {
              id
              name
            }
          }
        }
        voucher_plan_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { condition: condition, limit: 50 } },
  )

  const voucherPlans: VoucherPlanProps[] =
    data?.voucher_plan.map(v => {
      return {
        id: v.id,
        title: v.title || '',
        startedAt: v?.started_at || null,
        endedAt: v?.ended_at || null,
        productQuantityLimit: v.product_quantity_limit,
        description: decodeURI(v.description || ''),
        count: 0,
        remaining: 0,
        productIds: v.voucher_plan_products.map(product => product.product_id),
        isTransferable: v.is_transferable,
        sale: v.sale_amount ? { amount: v.sale_amount, price: v.sale_price } : undefined,
        pinCode: v?.pin_code || null,
        bonusCoins: v?.bonus_coins || null,
        category: {
          id: v.voucher_plan_category?.category?.id || '',
          name: v.voucher_plan_category?.category?.name || '',
        },
      }
    }) || []

  const { data: voucherCodesAggregateData } = useQuery<
    hasura.GET_VOUCHER_CODES_AGGREGATE,
    hasura.GET_VOUCHER_CODES_AGGREGATEVariables
  >(
    gql`
      query GET_VOUCHER_CODES_AGGREGATE($condition: voucher_plan_bool_exp!, $limit: Int!) {
        voucher_plan(where: $condition, order_by: [{ updated_at: desc }, { id: desc }], limit: $limit) {
          id
          voucher_codes_aggregate {
            aggregate {
              sum {
                count
                remaining
              }
            }
          }
        }
      }
    `,
    { variables: { condition: condition, limit: 50 } },
  )

  if (voucherCodesAggregateData) {
    voucherPlans.forEach(v => {
      const data = voucherCodesAggregateData.voucher_plan.find(w => w.id === v.id)
      v.count = data?.voucher_codes_aggregate.aggregate?.sum?.count || 0
      v.remaining = data?.voucher_codes_aggregate.aggregate?.sum?.remaining || 0
    })
  }

  const loadMoreVoucherPlans =
    (data?.voucher_plan.length || 0) < (data?.voucher_plan_aggregate.aggregate?.count || 0)
      ? () =>
          fetchMore({
            variables: {
              condition: { ...condition, updated_at: { _lt: data?.voucher_plan.slice(-1)[0]?.updated_at } },
              limit: 50,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                voucher_plan_aggregate: prev.voucher_plan_aggregate,
                voucher_plan: [...prev.voucher_plan, ...fetchMoreResult.voucher_plan],
              }
            },
          })
      : undefined

  return {
    loading,
    error,
    voucherPlans,
    refetch,
    loadMoreVoucherPlans,
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
      })),
    })) || []

  return {
    loadingVoucherCodes: loading,
    errorVoucherCodes: error,
    voucherCodes,
    refetchVoucherCodes: refetch,
  }
}

export const useVouchersStatus = (voucherPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_VOUCHER_STATUS, hasura.GET_VOUCHER_STATUSVariables>(
    gql`
      query GET_VOUCHER_STATUS($voucherPlanId: uuid!) {
        voucher_status(where: { voucher: { voucher_code: { voucher_plan_id: { _eq: $voucherPlanId } } } }) {
          used
          voucher_id
        }
      }
    `,
    {
      variables: {
        voucherPlanId,
      },
    },
  )

  const vouchersStatus: VoucherProps[] =
    data?.voucher_status.map(voucherStatus => ({
      id: voucherStatus.voucher_id,
      used: !!voucherStatus?.used,
    })) || []

  return {
    loading,
    error,
    data: vouchersStatus,
    refetch,
  }
}

export const useMutateVoucherPlan = () => {
  const { id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const [insertVoucherPlanHandler] = useMutation<hasura.INSERT_VOUCHER_PLAN, hasura.INSERT_VOUCHER_PLANVariables>(
    gql`
      mutation INSERT_VOUCHER_PLAN(
        $voucherPlanId: uuid
        $title: String!
        $categoryId: String
        $description: String
        $appId: String!
        $startedAt: timestamptz
        $endedAt: timestamptz
        $productQuantityLimit: Int!
        $voucherCodes: [voucher_code_insert_input!]!
        $voucherPlanProducts: [voucher_plan_product_insert_input!]!
        $isTransferable: Boolean
        $saleAmount: Int
        $salePrice: numeric
        $editorId: String
        $pinCode: String
        $bonusCoins: jsonb
      ) {
        insert_voucher_plan(
          objects: {
            id: $voucherPlanId
            title: $title
            description: $description
            app_id: $appId
            started_at: $startedAt
            ended_at: $endedAt
            product_quantity_limit: $productQuantityLimit
            voucher_codes: { data: $voucherCodes }
            voucher_plan_products: { data: $voucherPlanProducts }
            is_transferable: $isTransferable
            sale_amount: $saleAmount
            sale_price: $salePrice
            editor_id: $editorId
            pin_code: $pinCode
            bonus_coins: $bonusCoins
          }
        ) {
          affected_rows
        }
        insert_voucher_plan_category(objects: { voucher_plan_id: $voucherPlanId, category_id: $categoryId }) {
          affected_rows
        }
      }
    `,
  )
  const insertVoucherPlan = (values: VoucherPlanFields) => {
    const { sale, categoryId, ...restValues } = values
    const voucherPlanId = uuidv4()
    return insertVoucherPlanHandler({
      variables: {
        ...restValues,
        voucherPlanId: voucherPlanId,
        appId,
        saleAmount: sale?.amount,
        salePrice: sale?.price,
        categoryId: categoryId || '',
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
        editorId: currentMemberId,
      },
    })
  }

  const [updateVoucherPlanHandler] = useMutation<hasura.UPDATE_VOUCHER_PLAN, hasura.UPDATE_VOUCHER_PLANVariables>(
    gql`
      mutation UPDATE_VOUCHER_PLAN(
        $voucherPlanId: uuid!
        $title: String!
        $categoryId: String
        $description: String
        $appId: String!
        $startedAt: timestamptz
        $endedAt: timestamptz
        $productQuantityLimit: Int!
        $voucherPlanProducts: [voucher_plan_product_insert_input!]!
        $isTransferable: Boolean
        $saleAmount: Int
        $salePrice: numeric
        $pinCode: String
        $bonusCoins: jsonb
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
            sale_amount: $saleAmount
            sale_price: $salePrice
            pin_code: $pinCode
            bonus_coins: $bonusCoins
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
        delete_voucher_plan_category(where: { voucher_plan_id: { _eq: $voucherPlanId } }) {
          affected_rows
        }
        insert_voucher_plan_category(objects: { voucher_plan_id: $voucherPlanId, category_id: $categoryId }) {
          affected_rows
        }
      }
    `,
  )
  const updateVoucherPlan = (values: VoucherPlanFields, voucherPlanId: string) => {
    const { sale, categoryId, ...restValues } = values
    return updateVoucherPlanHandler({
      variables: {
        ...restValues,
        categoryId: categoryId || '',
        voucherPlanId,
        appId,
        saleAmount: sale?.amount,
        salePrice: sale?.price,
        description: encodeURI(values.description || ''),
        voucherPlanProducts: values.voucherPlanProducts.flatMap(productId => ({
          voucher_plan_id: voucherPlanId,
          product_id: productId,
        })),
        pinCode: restValues?.pinCode || null,
        bonusCoins: restValues?.bonusCoins || null,
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

  const placeOrder = async (
    paymentType: 'perpetual' | 'subscription' | 'groupBuying',
    invoice: InvoiceProps,
  ) => {
    setOrderPlacing(true)
    const {
      data: { code, message, result },
    } = await Axios.post<{
      code: string
      message: string
      result: {
        orderId: string
        totalAmount: number
        paymentNo: string | null
        payToken: string | null
        products: { name: string; price: number }[]
        discounts: { name: string; price: number }[]
      }
    }>(
      `${process.env.REACT_APP_API_BASE_ROOT}/order/create`,
      {
        memberId,
        paymentModel: { type: paymentType },
        productIds,
        discountId,
        shipping,
        invoice,
        options,
      },
      {
        headers: { authorization: `Bearer ${authToken}` },
      },
    )
    if (code === 'SUCCESS') {
      return result
    } else {
      throw new Error('create order failed: ' + message)
    }
  }

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

const GET_COUPON_CODE = gql`
  query GET_COUPON_CODE($couponPlanId: uuid!) {
    coupon_code(where: { coupon_plan: { id: { _eq: $couponPlanId } }, deleted_at: { _is_null: true } }) {
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
      }
    }
  }
`

const GET_VOUCHER_CODE = gql`
  query GET_VOUCHER_CODE($voucherPlanId: uuid!) {
    voucher_code(where: { voucher_plan: { id: { _eq: $voucherPlanId } }, deleted_at: { _is_null: true } }) {
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
      }
    }
  }
`
