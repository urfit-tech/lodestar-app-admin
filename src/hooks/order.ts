import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import hasura from '../hasura'
import { sum, uniq } from 'ramda'
import { OrderLog } from '../types/general'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useUserPermissionGroupMembers } from '../hooks/permission'
import { useMemo } from 'react'

export const useOrderStatuses = () => {
  const { loading, error, data } = useQuery<hasura.GET_ORDER_LOG_STATUS>(gql`
    query GET_ORDER_LOG_STATUS {
      order_log(distinct_on: status) {
        status
      }
    }
  `)

  return {
    loading,
    error,
    data:
      data?.order_log?.reduce(
        (accumulator, value) =>
          value.status && !accumulator.includes(value.status) ? [...accumulator, value.status] : accumulator,
        [] as string[],
      ) || [],
  }
}

export const useOrderLogPreviewCollection = (
  memberId: string,
  authStatus: 'Admin' | 'Group' | 'Personal' | 'None',
  filters?: {
    statuses?: string[] | null
    orderId?: string | null
    memberNameAndEmail?: string | null
    memberId?: string
  },
) => {
  const { id: appId } = useApp()
  const limit = 20
  const conditionBase: hasura.GetOrderLogPreviewCollectionVariables['condition'] = {
    id: filters?.orderId ? { _ilike: `%${filters.orderId}%` } : undefined,
    app_id: appId ? { _eq: appId } : undefined,
    status: filters?.statuses ? { _in: filters.statuses } : undefined,
  }

  const { permissionGroupsMembersOrderId } = useUserPermissionGroupMembers(memberId)

  let condition: hasura.GetOrderLogPreviewCollectionVariables['condition']
  switch (authStatus) {
    case 'Admin':
      condition = {
        ...conditionBase,
        member: filters?.memberId
          ? { id: { _eq: filters.memberId } }
          : filters?.memberNameAndEmail
          ? {
              _or: filters?.memberNameAndEmail
                ? [
                    { name: { _ilike: `%${filters.memberNameAndEmail}%` } },
                    { username: { _ilike: `%${filters.memberNameAndEmail}%` } },
                    { email: { _ilike: `%${filters.memberNameAndEmail}%` } },
                  ]
                : undefined,
            }
          : undefined,
      }
      break

    case 'Personal':
      condition = {
        ...conditionBase,
        order_products:
          authStatus === 'Personal'
            ? {
                product: {
                  product_owner: {
                    member_id: { _eq: memberId },
                  },
                },
              }
            : undefined,
      }
      break

    case 'Group':
      condition = { ...conditionBase, id: { _in: permissionGroupsMembersOrderId } }
      break

    default:
      condition = {
        ...conditionBase,
        member: {
          id: { _eq: memberId },
        },
      }
  }

  const {
    loading: loadingOrderLogPreviewCollection,
    error: errorOrderLogPreviewCollection,
    data: orderLogPreviewCollectionData,
    refetch: refetchOrderLogPreviewCollection,
    fetchMore,
  } = useQuery<hasura.GetOrderLogPreviewCollection, hasura.GetOrderLogPreviewCollectionVariables>(
    gql`
      query GetOrderLogPreviewCollection($condition: order_log_bool_exp, $limit: Int) {
        order_log(where: $condition, order_by: { created_at: desc }, limit: $limit) {
          id
          created_at
          status
          shipping
          member_id
          options
          parent_order_id
        }
      }
    `,
    {
      variables: {
        condition,
        limit,
      },
    },
  )

  const {
    loading: loadingOrderLogAggregate,
    error: errorOrderLogAggregate,
    data: orderLogAggregateData,
    refetch: refetchOrderLogAggregate,
  } = useQuery<hasura.GetOrderLogAggregate, hasura.GetOrderLogAggregateVariables>(
    gql`
      query GetOrderLogAggregate($condition: order_log_bool_exp) {
        order_log_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        condition,
      },
    },
  )
  const totalCount = orderLogAggregateData?.order_log_aggregate.aggregate?.count

  const loadMoreOrderLogPreviewCollection =
    totalCount && totalCount > limit
      ? () => {
          const lastOrderLog =
            orderLogPreviewCollectionData?.order_log[orderLogPreviewCollectionData.order_log.length - 1]
          return fetchMore({
            variables: {
              condition: {
                _and: [
                  condition,
                  {
                    created_at: {
                      _lte: lastOrderLog?.created_at,
                    },
                    id: {
                      _nin:
                        orderLogPreviewCollectionData?.order_log
                          .filter(v => v.created_at === lastOrderLog?.created_at)
                          .map(v => v.id) || [],
                    },
                  },
                ],
              },
              limit,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev
              return {
                order_log: [...prev.order_log, ...fetchMoreResult.order_log],
              }
            },
          })
        }
      : undefined

  const orderIdList = orderLogPreviewCollectionData?.order_log.map(v => v.id) || []
  const memberIds = uniq(orderLogPreviewCollectionData?.order_log.map(v => v.member_id) || [])

  const {
    loading: loadingOrderLogsMember,
    error: errorOrderLogsMember,
    data: orderLogsMemberData,
    refetch: refetchOrderLogsMember,
  } = useQuery<hasura.GetOrderLogsMember, hasura.GetOrderLogsMemberVariables>(
    gql`
      query GetOrderLogsMember($memberIds: [String!]) {
        member(where: { id: { _in: $memberIds } }) {
          id
          name
          email
        }
      }
    `,
    { variables: { memberIds } },
  )

  const {
    loading: loadingOrderProductsByOrderIdList,
    error: errorOrderProductsByOrderIdList,
    data: orderProductsByOrderIdListData,
    refetch: refetchOrderProductsByOrderIdList,
  } = useQuery<hasura.GetOrderProductsByOrderIdList, hasura.GetOrderProductsByOrderIdListVariables>(
    gql`
      query GetOrderProductsByOrderIdList($orderIdList: [String!]) {
        order_product(where: { order_id: { _in: $orderIdList } }) {
          id
          order_id
          price
        }
      }
    `,
    { variables: { orderIdList } },
  )

  const {
    loading: loadingOrderDiscountsByOrderIdList,
    error: errorOrderDiscountsByOrderIdList,
    data: orderDiscountsByOrderIdListData,
    refetch: refetchOrderDiscountsByOrderIdList,
  } = useQuery<hasura.GetOrderDiscountsByOrderIdList, hasura.GetOrderDiscountsByOrderIdListVariables>(
    gql`
      query GetOrderDiscountsByOrderIdList($orderIdList: [String!]) {
        order_discount(where: { order_id: { _in: $orderIdList } }) {
          id
          order_id
          price
        }
      }
    `,
    { variables: { orderIdList } },
  )

  type OrderLogPreview = Pick<
    OrderLog,
    'id' | 'createdAt' | 'status' | 'name' | 'email' | 'shipping' | 'totalPrice' | 'options' | 'parentOrderId'
  >

  const orderLogPreviewCollection: OrderLogPreview[] = useMemo(
    () =>
      orderLogPreviewCollectionData?.order_log.map(orderLogPreview => {
        const productPrice = sum(
          orderProductsByOrderIdListData?.order_product
            .filter(orderProduct => orderProduct.order_id === orderLogPreview.id)
            .map(orderProduct => orderProduct.price) || [],
        )
        const discountPrice = sum(
          orderDiscountsByOrderIdListData?.order_discount
            .filter(orderDiscount => orderDiscount.order_id === orderLogPreview.id)
            .map(orderDiscount => orderDiscount.price) || [],
        )
        const shippingFee = orderLogPreview.shipping?.fee || 0

        return {
          id: orderLogPreview.id,
          createdAt: orderLogPreview.created_at,
          status: orderLogPreview.status,
          name: orderLogsMemberData?.member.find(v => v.id === orderLogPreview.member_id)?.name || '',
          email: orderLogsMemberData?.member.find(v => v.id === orderLogPreview.member_id)?.email || '',
          shipping: orderLogPreview.shipping,
          totalPrice: Math.max(productPrice - discountPrice + shippingFee),
          options: orderLogPreview.options,
          parentOrderId: orderLogPreview.parent_order_id || null,
        }
      }) || [],
    [
      orderLogPreviewCollectionData?.order_log,
      orderProductsByOrderIdListData?.order_product,
      orderDiscountsByOrderIdListData?.order_discount,
      orderLogsMemberData?.member,
    ],
  )

  // 組織數據：分離父訂單和子訂單
  const { parentOrders, childOrdersMap } = useMemo(() => {
    const parents = orderLogPreviewCollection.filter(order => !order.parentOrderId)
    const childMap = new Map<string, OrderLogPreview[]>()
    
    orderLogPreviewCollection.forEach(order => {
      if (order.parentOrderId) {
        if (!childMap.has(order.parentOrderId)) {
          childMap.set(order.parentOrderId, [])
        }
        childMap.get(order.parentOrderId)!.push(order)
      }
    })
    
    return {
      parentOrders: parents,
      childOrdersMap: childMap,
    }
  }, [orderLogPreviewCollection])

  return {
    totalCount,
    loadingOrderLogPreviewCollection,
    loadingOrderLogAggregate,
    loadingOrderLogsMember,
    loadingOrderProductsByOrderIdList,
    loadingOrderDiscountsByOrderIdList,
    errorOrderLogPreviewCollection,
    errorOrderLogAggregate,
    errorOrderLogsMember,
    errorOrderProductsByOrderIdList,
    errorOrderDiscountsByOrderIdList,
    orderLogPreviewCollection,
    parentOrders,
    childOrdersMap,
    refetchOrderLogPreviewCollection,
    refetchOrderLogAggregate,
    refetchOrderLogsMember,
    refetchOrderProductsByOrderIdList,
    refetchOrderDiscountsByOrderIdList,
    loadMoreOrderLogPreviewCollection,
  }
}

export const useOrderLogExpandRow = (orderId: string) => {
  const {
    loading: loadingExpandRowOrderLog,
    data: expandRowOrderLog,
    error: errorExpandRowOrderLog,
    refetch: refetchExpandRowOrderLog,
  } = useQuery<hasura.GetExpandRowOrderLog, hasura.GetExpandRowOrderLogVariables>(
    gql`
      query GetExpandRowOrderLog($orderId: String!) {
        order_log_by_pk(id: $orderId) {
          id
          expired_at
          shipping
          invoice_options
          options
          invoice(where: { revoked_at: { _is_null: true } }) {
            no
            price
          }
        }
      }
    `,
    { variables: { orderId } },
  )

  const {
    loading: loadingExpandRowOrderProduct,
    data: expandRowOrderProduct,
    error: errorExpandRowOrderProduct,
    refetch: refetchExpandRowOrderProduct,
  } = useQuery<hasura.GetExpandRowOrderProduct, hasura.GetExpandRowOrderProductVariables>(
    gql`
      query GetExpandRowOrderProduct($orderId: String) {
        order_product(where: { order_id: { _eq: $orderId } }) {
          id
          delivered_at
          name
          started_at
          ended_at
          price
          options
          product {
            id
            type
          }
        }
      }
    `,
    { variables: { orderId } },
  )

  const {
    loading: loadingOrderExecutors,
    error: errorOrderExecutors,
    data: orderExecutorsData,
    refetch: refetchOrderExecutors,
  } = useQuery<hasura.GetOrderExecutors, hasura.GetOrderExecutorsVariables>(
    gql`
      query GetOrderExecutors($orderId: String!) {
        order_executor(where: { order_id: { _eq: $orderId } }) {
          id
          ratio
        }
      }
    `,
    {
      variables: { orderId },
    },
  )

  const {
    loading: loadingPaymentLogByOrderId,
    error: errorPaymentLogByOrderId,
    data: paymentLogByOrderIdData,
    refetch: refetchPaymentLogByOrderId,
  } = useQuery<hasura.GetPaymentLogByOrderId, hasura.GetPaymentLogByOrderIdVariables>(
    gql`
      query GetPaymentLogByOrderId($orderId: String!) {
        payment_log(where: { order_id: { _eq: $orderId } }) {
          no
          order_id
          gateway
          price
          status
          method
          invoice_issued_at
          invoice_options
        }
      }
    `,
    { variables: { orderId } },
  )

  const {
    loading: loadingOrderDiscountByOrderId,
    error: errorOrderDiscountByOrderId,
    data: orderDiscountByOrderIdData,
    refetch: refetchOrderDiscountByOrderId,
  } = useQuery<hasura.GetOrderDiscountByOrderId, hasura.GetOrderDiscountByOrderIdVariables>(
    gql`
      query GetOrderDiscountByOrderId($orderId: String!) {
        order_discount(where: { order_id: { _eq: $orderId } }) {
          id
          name
          type
          target
          price
          options
        }
      }
    `,
    { variables: { orderId } },
  )

  const {
    loading: loadingPaymentMethods,
    error: errorPaymentMethods,
    data: paymentMethodsData,
    refetch: refetchPaymentMethods,
  } = useQuery<hasura.GetPaymentMethods, hasura.GetPaymentMethodsVariables>(
    gql`
      query GetPaymentMethods {
        payment_method {
          name
          display_name
        }
      }
    `,
  )

  const paymentMethodMap =
    paymentMethodsData?.payment_method.reduce((acc, pm) => {
      if (pm.display_name) {
        acc[pm.name] = pm.display_name
      }
      return acc
    }, {} as Record<string, string>) || {}

  const orderLog = {
    id: expandRowOrderLog?.order_log_by_pk?.id,
    expiredAt: expandRowOrderLog?.order_log_by_pk?.expired_at,
    shipping: expandRowOrderLog?.order_log_by_pk?.shipping,
    invoiceOptions: expandRowOrderLog?.order_log_by_pk?.invoice_options,
    invoiceTotalPrice: sum(expandRowOrderLog?.order_log_by_pk?.invoice?.map(v => v.price) || []),
    options: expandRowOrderLog?.order_log_by_pk?.options,
  }

  const orderProducts =
    expandRowOrderProduct?.order_product.map(v => ({
      id: v.id,
      type: v.product.type,
      deliveredAt: v.delivered_at,
      name: v.name,
      endedAt: v.ended_at,
      startedAt: v.started_at,
      price: v.price,
      options: v.options,
      currencyId: v.options?.currencyId,
      currencyPrice: v.options?.currencyPrice,
      quantity: v.options?.quantity,
      unsubscribedAt: v.options?.unsubscribedAt,
    })) || []

  const orderExecutors =
    orderExecutorsData?.order_executor.map(v => ({
      id: v.id,
      ratio: v.ratio,
    })) || []

  const paymentGateway = paymentLogByOrderIdData?.payment_log[0]?.gateway || null
  const firstMethod = paymentLogByOrderIdData?.payment_log[0]?.method
  const paymentMethod = firstMethod ? paymentMethodMap[firstMethod] || firstMethod : null
  const paymentLogs =
    paymentLogByOrderIdData?.payment_log.map(p => ({
      status: p.status,
      price: p.price,
      no: p.no,
      gateway: p.gateway,
      method: p.method,
      methodDisplayName: p.method ? paymentMethodMap[p.method] : p.method,
      invoiceIssuedAt: p.invoice_issued_at,
      invoiceOptions: p.invoice_options,
    })) || []

  const orderDiscounts =
    orderDiscountByOrderIdData?.order_discount.map(v => ({
      id: v.id,
      name: v.name,
      type: v.type,
      target: v.target,
      price: v.price,
      coins: v.options?.coins || 0,
    })) || []

  return {
    loadingExpandRowOrderLog,
    loadingExpandRowOrderProduct,
    loadingOrderExecutors,
    loadingPaymentLogByOrderId,
    loadingOrderDiscountByOrderId,
    loadingPaymentMethods,
    errorExpandRowOrderLog,
    errorExpandRowOrderProduct,
    errorOrderExecutors,
    errorPaymentLogByOrderId,
    errorOrderDiscountByOrderId,
    errorPaymentMethods,
    orderLog,
    orderProducts,
    orderExecutors,
    paymentGateway,
    paymentMethod,
    paymentLogs,
    orderDiscounts,
    refetchOrderLogExpandRow: () => {
      refetchExpandRowOrderLog()
      refetchExpandRowOrderProduct()
      refetchOrderExecutors()
      refetchPaymentLogByOrderId()
      refetchOrderDiscountByOrderId()
      refetchPaymentMethods()
    },
  }
}