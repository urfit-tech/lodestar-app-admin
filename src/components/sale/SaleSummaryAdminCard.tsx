import { useQuery } from '@apollo/react-hooks'
import { Statistic } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { number, object } from 'yup'
import { promotionMessages } from '../../helpers/translation'
import types from '../../types'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  totalSales: { id: 'common.label.totalSales', defaultMessage: '銷售總額' },
})

const SaleSummaryAdminCard = () => {
  const { formatMessage } = useIntl()

  const { loading, data } = useQuery<types.GET_TOTAL_ORDER_AMOUNT>(GET_TOTAL_ORDER_AMOUNT)

  const castData = gqlResultSchema.cast(data)
  const totalSales =
    (castData.orderProductAggregate.aggregate.sum.price || 0) -
    (castData.orderDiscountAggregate.aggregate.sum.price || 0)

  return (
    <AdminCard loading={loading}>
      <Statistic
        title={formatMessage(messages.totalSales)}
        value={totalSales}
        suffix={formatMessage(promotionMessages.term.dollar)}
      />
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
