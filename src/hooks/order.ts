import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import hasura from '../hasura'
import { sum } from 'ramda'
import { OrderLog } from '../types/general'

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
  currentMemberId: string,
  authStatus: 'Admin' | 'Personal' | 'None',
  filters?: {
    statuses?: string[] | null
    orderId?: string | null
    memberNameAndEmail?: string | null
    memberId?: string
  },
) => {
  const limit = 20
  const condition: hasura.GetOrderLogPreviewCollectionVariables['condition'] = {
    id: filters?.orderId ? { _ilike: `%${filters.orderId}%` } : undefined,
    status: filters?.statuses ? { _in: filters.statuses } : undefined,
    member:
      authStatus !== 'None'
        ? filters?.memberId
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
          : undefined
        : {
            id: { _eq: currentMemberId },
          },
    order_products:
      authStatus === 'Personal'
        ? {
            product: {
              product_owner: {
                member_id: { _eq: currentMemberId },
              },
            },
          }
        : undefined,
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
  const memberIds = orderLogPreviewCollectionData?.order_log.map(v => v.member_id) || []

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

  const orderLogPreviewCollection: Pick<
    OrderLog,
    'id' | 'createdAt' | 'status' | 'name' | 'email' | 'shipping' | 'totalPrice'
  >[] =
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
      }
    }) || []

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
    refetchOrderLogPreviewCollection,
    refetchOrderLogAggregate,
    refetchOrderLogsMember,
    refetchOrderProductsByOrderIdList,
    refetchOrderDiscountsByOrderIdList,
    loadMoreOrderLogPreviewCollection,
  }
}
