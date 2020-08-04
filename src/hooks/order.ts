import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'

export const useOrderStatuses = () => {
  const { loading, error, data } = useQuery<types.GET_ORDER_LOG_STATUS>(gql`
    query GET_ORDER_LOG_STATUS {
      order_log(distinct_on: status) {
        status
      }
    }
  `)

  return {
    loading,
    error,
    data: data?.order_log?.map(log => log.status) || [],
  }
}

export const GET_ORDER_LOG_COLLECTION = gql`
  query GET_ORDER_LOG_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    order_log(
      where: {
        member: { app_id: { _eq: $appId } }
        status: { _in: $orderStatuses }
        _or: [
          { updated_at: { _gte: $startedAt, _lte: $endedAt } }
          { updated_at: { _is_null: true }, created_at: { _gte: $startedAt, _lte: $endedAt } }
        ]
      }
    ) {
      id
      status
      member {
        id
        name
        email
      }
      created_at
      updated_at
      invoice

      order_products_aggregate {
        aggregate {
          sum {
            price
          }
        }
      }

      order_discounts_aggregate {
        aggregate {
          sum {
            price
          }
        }
      }
    }
  }
`
export const GET_ORDER_PRODUCT_COLLECTION = gql`
  query GET_ORDER_PRODUCT_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    order_product(
      where: {
        order_log: {
          member: { app_id: { _eq: $appId } }
          status: { _in: $orderStatuses }
          _or: [
            { updated_at: { _gte: $startedAt, _lte: $endedAt } }
            { updated_at: { _is_null: true }, created_at: { _gte: $startedAt, _lte: $endedAt } }
          ]
        }
      }
      order_by: { order_log: { updated_at: desc } }
    ) {
      id
      order_log {
        id
        name: invoice(path: "$.name")
        phone: invoice(path: "$.phone")
      }
      product {
        id
        type
      }
      name
      price
      started_at
      ended_at
      auto_renewed
    }
  }
`
export const GET_ORDER_DISCOUNT_COLLECTION = gql`
  query GET_ORDER_DISCOUNT_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    order_discount(
      where: {
        order_log: {
          member: { app_id: { _eq: $appId } }
          status: { _in: $orderStatuses }
          _or: [
            { updated_at: { _gte: $startedAt, _lte: $endedAt } }
            { updated_at: { _is_null: true }, created_at: { _gte: $startedAt, _lte: $endedAt } }
          ]
        }
      }
      order_by: { order_log: { updated_at: desc } }
    ) {
      id
      order_log {
        id
        invoice
      }
      type
      target
      name
      price
    }
  }
`
export const GET_PAYMENT_LOG_COLLECTION = gql`
  query GET_PAYMENT_LOG_COLLECTION(
    $appId: String!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $orderStatuses: [String!]
  ) {
    payment_log(
      where: {
        status: { _in: $orderStatuses }
        order_log: { member: { app_id: { _eq: $appId } } }
        _or: [
          { paid_at: { _gte: $startedAt, _lte: $endedAt } }
          { paid_at: { _is_null: true }, created_at: { _gte: $startedAt, _lte: $endedAt } }
          {
            order_log: {
              _or: [
                { updated_at: { _gte: $startedAt, _lte: $endedAt } }
                { updated_at: { _is_null: true }, created_at: { _gte: $startedAt, _lte: $endedAt } }
              ]
            }
          }
        ]
      }
      order_by: { created_at: asc, paid_at: asc }
    ) {
      order_log {
        id
        member {
          id
          name
          email
        }
        status
        order_products_aggregate {
          aggregate {
            sum {
              price
            }
          }
        }
      }
      no
      status
      created_at
      paid_at
      price
    }
  }
`
