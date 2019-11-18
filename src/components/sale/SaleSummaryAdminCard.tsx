import { Statistic } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { number, object } from 'yup'
import AdminCard from '../common/AdminCard'

const SaleSummaryAdminCard = () => {
  const { loading, data } = useQuery(GET_TOTAL_ORDER_AMOUNT)
  const castData = gqlResultSchema.cast(data)
  const totalSales =
    (castData.orderProductAggregate.aggregate.sum.price || 0) -
    (castData.orderDiscountAggregate.aggregate.sum.price || 0)

  return (
    <AdminCard loading={loading}>
      <Statistic title="銷售總額" value={totalSales} suffix="元" />
    </AdminCard>
  )
}

const GET_TOTAL_ORDER_AMOUNT = gql`
  query GET_TOTAL_ORDER_AMOUNT {
    order_product_aggregate(where: { order_log: { status: { _eq: "SUCCESS" } } }) {
      aggregate {
        sum {
          price
        }
      }
    }
    order_discount_aggregate(where: { order_log: { status: { _eq: "SUCCESS" } } }) {
      aggregate {
        sum {
          price
        }
      }
    }
  }
`

const gqlResultSchema = object({
  orderProductAggregate: object({
    aggregate: object({
      sum: object({
        price: number().nullable(),
      }),
    }),
  }),
  orderDiscountAggregate: object({
    aggregate: object({
      sum: object({
        price: number().nullable(),
      }),
    }),
  }),
}).camelCase()

export default SaleSummaryAdminCard
