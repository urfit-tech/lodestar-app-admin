import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import hasura from '../hasura'
import { prop, sum } from 'ramda'
import { OrderLog, PaymentLog } from '../types/general'

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

export const usePaymentLogs = (filters?: { orderLogId?: string | null; status?: string | null }) => {
  const condition: hasura.GET_PAYMENT_LOGSVariables['condition'] = {
    order_id: filters?.orderLogId ? { _eq: filters.orderLogId } : undefined,
    status: filters?.status ? { _eq: filters.status } : undefined,
  }
  const limit = 20
  const { loading, error, data } = useQuery<hasura.GET_PAYMENT_LOGS, hasura.GET_PAYMENT_LOGSVariables>(
    gql`
      query GET_PAYMENT_LOGS($condition: payment_log_bool_exp, $limit: Int) {
        payment_log(where: $condition, limit: $limit) {
          no
          created_at
          status
          price
          gateway
          paid_at
          method
          custom_no
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
  const paymentLogs: PaymentLog[] =
    data?.payment_log.map(v => ({
      no: v.no,
      createdAt: v.created_at && new Date(v.created_at),
      status: v.status || '',
      price: v.price,
      gateway: v.gateway || '',
      paidAt: v.paid_at && new Date(v.paid_at),
      method: v.method || '',
      customNo: v.custom_no,
    })) || []

  return {
    loading,
    error,
    paymentLogs,
  }
}

export const useOrderLogs = (
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
  const condition: hasura.GET_ORDER_LOGSVariables['condition'] = {
    id: filters?.orderId ? { _ilike: `%${filters.orderId}%` } : undefined,
    status: filters?.statuses ? { _in: filters.statuses } : undefined,
    member:
      authStatus !== 'None'
        ? filters?.memberId || filters?.memberNameAndEmail
          ? {
              id: filters?.memberId ? { _like: `%${filters.memberId}%` } : undefined,
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

  const { loading, error, data, refetch, fetchMore } = useQuery<hasura.GET_ORDER_LOGS, hasura.GET_ORDER_LOGSVariables>(
    gql`
      query GET_ORDER_LOGS($condition: order_log_bool_exp, $limit: Int) {
        order_log_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        order_log(where: $condition, order_by: { created_at: desc }, limit: $limit) {
          id
          created_at
          status
          shipping
          expired_at
          options
          invoice_options
          invoice_issued_at

          member {
            name
            email
          }

          payment_logs(order_by: { created_at: desc }, limit: 1) {
            gateway
          }
          order_products {
            id
            name
            price
            started_at
            ended_at
            delivered_at
            product {
              id
              type
            }
            options
          }

          order_discounts {
            id
            name
            description
            price
            type
            target
            options
          }
          order_executors {
            ratio
            member {
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        condition,
        limit,
      },
      context: {
        important: true,
      },
    },
  )

  const loadMoreOrderLogs =
    (data?.order_log_aggregate.aggregate?.count || 0) > limit
      ? () => {
          const lastOrderLog = data?.order_log[data.order_log.length - 1]
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
                      _nin: data?.order_log.filter(v => v.created_at === lastOrderLog?.created_at).map(v => v.id) || [],
                    },
                  },
                ],
              },
              limit,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                order_log_aggregate: fetchMoreResult.order_log_aggregate,
                order_log: [...prev.order_log, ...fetchMoreResult.order_log],
              }
            },
          })
        }
      : undefined

  const orderLogs: OrderLog[] =
    data?.order_log.map(v => ({
      id: v.id,
      createdAt: v.created_at,
      status: v.status || '',
      shipping: v.shipping,
      expiredAt: v.expired_at,
      name: v.member.name,
      email: v.member.email,
      paymentMethod: v.payment_logs[0]?.gateway,
      options: v.options,
      invoiceOptions: v.invoice_options,
      invoiceIssuedAt: v.invoice_issued_at,
      orderExecutors: v.order_executors.map(w => ({ ratio: w.ratio, name: w.member.name })),

      orderProducts: v.order_products.map(w => ({
        id: w.id,
        name: w.name,
        price: w.price,
        startedAt: w.started_at && new Date(w.started_at),
        endedAt: w.ended_at && new Date(w.ended_at),
        deliveredAt: w.delivered_at && new Date(w.delivered_at),
        product: w.product,
        quantity: w.options?.quantity,
        options: w.options,
      })),

      orderDiscounts: v.order_discounts.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        price: w.price,
        type: w.type,
        target: w.target,
        options: w.options,
      })),

      totalPrice: Math.max(
        sum(v.order_products.map(prop('price'))) - sum(v.order_discounts.map(prop('price'))) + (v.shipping?.fee || 0),
        0,
      ),
    })) || []

  return {
    totalCount: data?.order_log_aggregate.aggregate?.count,
    loading,
    error,
    orderLogs,
    refetch,
    loadMoreOrderLogs,
  }
}

export const useSharingCodes = (paths: string[]) => {
  const { loading, error, data } = useQuery<hasura.GET_SHARING_CODE, hasura.GET_SHARING_CODEVariables>(
    gql`
      query GET_SHARING_CODE($paths: [String!]) {
        sharing_code(where: { path: { _in: $paths } }) {
          id
          path
          code
          note
        }
      }
    `,
    { variables: { paths } },
  )
  const sharingCodes = data?.sharing_code
  return {
    loading,
    error,
    sharingCodes,
  }
}
