import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useAuth } from '../components/auth/AuthContext'
import { ProductType } from '../schemas/general'
import types from '../types'
import { CartProduct } from '../types/payment'
import { useEnrolledProductIds } from './data'

export const useCart = () => {
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
      variables: { appId: process.env.REACT_APP_ID || '', memberId: memberId || '' },
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
          appId: process.env.REACT_APP_ID || '',
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
