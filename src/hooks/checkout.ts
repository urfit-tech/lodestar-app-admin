import { useMutation, useQuery } from '@apollo/react-hooks'
import { generate } from 'coupon-code'
import gql from 'graphql-tag'
import { reverse, times } from 'ramda'
import { VoucherPlanFields } from '../components/voucher/VoucherPlanAdminModal'
import { useApp } from '../contexts/AppContext'
import types from '../types'
import {
  CouponCodeProps,
  CouponPlanProps,
  CouponProps,
  VoucherCodeProps,
  VoucherPlanProps,
  VoucherProps,
} from '../types/checkout'

export const useCouponPlanCollection = () => {
  const app = useApp()

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
          coupon_codes {
            coupons_aggregate(where: { status: { used: { _eq: true } } }) {
              aggregate {
                count
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

          const used =
            couponPlan.coupon_codes?.reduce(
              (count, coupon) => count + (coupon.coupons_aggregate.aggregate?.count || 0),
              0,
            ) || 0
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

export const useVoucherPlanCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_VOUCHER_PLAN_COLLECTION>(GET_VOUCHER_PLAN_COLLECTION)
  const voucherPlanCollection: (VoucherPlanProps & {
    voucherCodes: (VoucherCodeProps & { vouchers: (VoucherProps & { member: { email: string } })[] })[]
  })[] =
    loading || error || !data
      ? []
      : reverse(data.voucher_plan).map(voucherPlan => {
          const [count, remaining] =
            voucherPlan.voucher_codes_aggregate.aggregate && voucherPlan.voucher_codes_aggregate.aggregate.sum
              ? [
                  voucherPlan.voucher_codes_aggregate.aggregate.sum.count || 0,
                  voucherPlan.voucher_codes_aggregate.aggregate.sum.remaining || 0,
                ]
              : [0, 0]

          return {
            ...voucherPlan,
            startedAt: voucherPlan?.started_at || null,
            endedAt: voucherPlan?.ended_at || null,
            productQuantityLimit: voucherPlan.product_quantity_limit,
            available:
              remaining > 0 && (voucherPlan.ended_at ? new Date(voucherPlan.ended_at).getTime() > Date.now() : true),
            description: decodeURI(voucherPlan.description || ''),
            count: count,
            remaining,
            productIds: voucherPlan.voucher_plan_products.map(product => product.product_id),
            voucherCodes: voucherPlan.voucher_codes.map(voucherCode => ({
              id: voucherCode.id,
              code: voucherCode.code,
              count: voucherCode.count,
              remaining: voucherCode.remaining,
              vouchers: voucherCode.vouchers.map(voucher => ({
                id: voucher.id,
                member: {
                  email: voucher.member?.email || '',
                },
                used: !!voucher.status?.used,
              })),
            })),
          }
        })

  return {
    loading,
    error,
    voucherPlanCollection,
    refetch,
  }
}

const GET_VOUCHER_PLAN_COLLECTION = gql`
  query GET_VOUCHER_PLAN_COLLECTION {
    voucher_plan {
      id
      title
      description
      started_at
      ended_at
      product_quantity_limit
      voucher_codes {
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
`

export const useMutateVoucherPlan = () => {
  const { id: appId } = useApp()

  const [insertVoucherPlanHandler] = useMutation<types.INSERT_VOUCHER_PLAN, types.INSERT_VOUCHER_PLANVariables>(
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

  const [updateVoucherPlanHandler] = useMutation<types.UPDATE_VOUCHER_PLAN, types.UPDATE_VOUCHER_PLANVariables>(
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
