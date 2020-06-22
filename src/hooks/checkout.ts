import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useContext } from 'react'
import AppContext from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import types from '../types'
import { CouponCodeProps, CouponPlanProps, CouponProps } from '../types/checkout'
import { ProductType } from '../types/general'
import { CartProduct } from '../types/payment'
import { useEnrolledProductIds } from './data'

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
            remaining > 0 && (couponPlan.ended_at ? new Date(couponPlan.ended_at).getTime() > Date.now() : true)

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

export const useCart = () => {
  const { id: appId } = useContext(AppContext)
  const { currentMemberId: memberId } = useAuth()
  const GET_CART_PRODUCT = gql`
    query GET_CART_PRODUCT($appId: String!, $memberId: String!) {
      cart_product(where: { app_id: { _eq: $appId }, member_id: { _eq: $memberId } }) {
        id
        product_id
        created_at
      }
    }
  `

  const INSERT_CART_PRODUCT = gql`
    mutation INSERT_CART_PRODUCT($appId: String!, $memberId: String!, $productId: String!) {
      insert_cart_product(objects: { app_id: $appId, member_id: $memberId, product_id: $productId }) {
        affected_rows
      }
    }
  `

  const DELETE_CART_PRODUCT = gql`
    mutation DELETE_CART_PRODUCT($cartProductId: uuid!) {
      delete_cart_product(where: { id: { _eq: $cartProductId } }) {
        affected_rows
      }
    }
  `
  const { enrolledProductIds, loadingProductIds } = useEnrolledProductIds(memberId || '')
  const { loading, error, data, refetch } = useQuery<types.GET_CART_PRODUCT, types.GET_CART_PRODUCTVariables>(
    GET_CART_PRODUCT,
    {
      variables: { appId, memberId: memberId || '' },
    },
  )
  const [addCartProduct] = useMutation<types.INSERT_CART_PRODUCT, types.INSERT_CART_PRODUCTVariables>(
    INSERT_CART_PRODUCT,
  )
  const [removeCartProduct] = useMutation<types.DELETE_CART_PRODUCT, types.DELETE_CART_PRODUCTVariables>(
    DELETE_CART_PRODUCT,
  )

  const cartProducts: CartProduct[] =
    loadingProductIds || loading || error || !data
      ? []
      : data.cart_product
          .filter(cartProduct => !!cartProduct.product_id && !enrolledProductIds.includes(cartProduct.product_id))
          .map(cartProduct => ({
            id: cartProduct.id,
            productId: cartProduct.product_id,
            createdAt: cartProduct.created_at,
          }))

  return {
    cartProducts,
    findCartProduct: (itemClass: ProductType, itemTarget: string) =>
      cartProducts.find(cartProduct => cartProduct.productId === `${itemClass}_${itemTarget}`),
    addCartProduct: (itemClass: ProductType, itemTarget: string) => {
      addCartProduct({
        variables: {
          appId,
          memberId: memberId || '',
          productId: `${itemClass}_${itemTarget}`,
        },
      }).then(() => refetch())
    },
    removeCartProduct: (cartProductId: string) => {
      removeCartProduct({ variables: { cartProductId } }).then(() => refetch())
    },
  }
}

export const useOrderProduct = (orderProductId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ORDER_PRODUCT, types.GET_ORDER_PRODUCTVariables>(
    gql`
      query GET_ORDER_PRODUCT($orderProductId: uuid!) {
        order_product_by_pk(id: $orderProductId) {
          id
          name
          description
          created_at
          product {
            id
            type
            target
          }
        }
      }
    `,
    { variables: { orderProductId } },
  )

  const orderProduct =
    loading || error || !data || !data.order_product_by_pk
      ? {
          id: '',
          name: '',
          description: '',
          createAt: null,
          product: {
            id: '',
            type: '',
            target: '',
          },
        }
      : {
          id: data.order_product_by_pk.id,
          name: data.order_product_by_pk.name,
          description: data.order_product_by_pk.description,
          createAt: new Date(data.order_product_by_pk.created_at),
          product: data.order_product_by_pk.product,
        }

  return {
    loadingOrderProduct: loading,
    errorOrderProduct: error,
    orderProduct,
    refetchOrderProduct: refetch,
  }
}
