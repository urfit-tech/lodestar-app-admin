import { useApolloClient, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import hasura from '../hasura'
import { prop, sum } from 'ramda'
import { OrderLogProps } from '../types/general'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'

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

export const useOrderLog = (filters?: {
  statuses?: string[] | null
  orderId?: string | null
  memberNameAndEmail?: string | null
  memberId?: string
}) => {
  const { permissions, currentMemberId } = useAuth()
  const apolloClient = useApolloClient()
  const authStatus: 'Admin' | 'Creator' | 'None' = permissions.SALES_RECORDS_ADMIN
    ? 'Admin'
    : permissions.SALES_RECORDS_CREATOR
    ? 'Creator'
    : 'None'

  const [totalOrderLogCounts, setTotalOrderLogCounts] = useState<number>(0)

  const condition: hasura.GET_ORDERSVariables['condition'] = {
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
      authStatus === 'Creator'
        ? {
            product: {
              product_owner: {
                member_id: { _eq: currentMemberId },
              },
            },
          }
        : undefined,
  }

  useEffect(() => {
    if (currentMemberId) {
      apolloClient
        .query<hasura.GET_ALL_ORDER_LOG, hasura.GET_ALL_ORDER_LOGVariables>({
          query: GET_ALL_ORDER_LOG,
          variables: {
            allcondition: {
              member_id: authStatus === 'None' ? { _eq: currentMemberId } : undefined,
              order_products:
                authStatus === 'Creator'
                  ? {
                      product: {
                        product_owner: {
                          member_id: { _eq: currentMemberId },
                        },
                      },
                    }
                  : undefined,
            },
          },
        })
        .then(({ data }) => {
          const totalCount = data?.order_log_aggregate.aggregate?.count || 0
          setTotalOrderLogCounts(totalCount)
        })
        .catch(error => console.error(error.stack))
    }
  }, [currentMemberId, authStatus])

  const { loading, error, data, refetch, fetchMore } = useQuery<hasura.GET_ORDERS, hasura.GET_ORDERSVariables>(
    GET_ORDERS,
    {
      variables: {
        condition,
        limit: 20,
      },
      context: {
        important: true,
      },
    },
  )
  const loadMoreOrderLogs =
    (data?.order_log_aggregate.aggregate?.count || 0) > 20
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
              limit: 20,
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

  const orderLogs: OrderLogProps[] =
    data?.order_log.map(v => ({
      id: v.id,
      createdAt: v.created_at,
      status: v.status || '',
      shipping: v.shipping,
      name: v.member.name,
      email: v.member.email,

      orderProducts: v.order_products.map(w => ({
        id: w.id,
        name: w.name,
        price: w.price,
        startedAt: w.started_at && new Date(w.started_at),
        endedAt: w.ended_at && new Date(w.ended_at),
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
      })),

      totalPrice: Math.max(
        sum(v.order_products.map(prop('price'))) - sum(v.order_discounts.map(prop('price'))) + (v.shipping?.fee || 0),
        0,
      ),

      expiredAt: v.expired_at,
      paymentMethod: v.payment_logs[0]?.gateway,
      orderExecutors: v.order_executors.map(w => w.member.name),
    })) || []

  return {
    totalCount: totalOrderLogCounts,
    loadingOrderLogs: loading,
    errorOrderLogs: error,
    orderLogs,
    refetchOrderLogs: refetch,
    loadMoreOrderLogs,
  }
}

const GET_ALL_ORDER_LOG = gql`
  query GET_ALL_ORDER_LOG($allcondition: order_log_bool_exp) {
    order_log_aggregate(where: $allcondition) {
      aggregate {
        count
      }
    }
  }
`

const GET_ORDERS = gql`
  query GET_ORDERS($condition: order_log_bool_exp, $limit: Int) {
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
      }

      order_executors {
        member {
          name
        }
      }
    }
  }
`
