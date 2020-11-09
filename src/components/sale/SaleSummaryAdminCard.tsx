import { useQuery } from '@apollo/react-hooks'
import { Statistic } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { promotionMessages } from '../../helpers/translation'
import types from '../../types'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  totalSales: { id: 'common.label.totalSales', defaultMessage: '銷售總額' },
})

const SaleSummaryAdminCard: React.FC = () => {
  const { formatMessage } = useIntl()

  const { loading, data } = useQuery<types.GET_TOTAL_ORDER_AMOUNT>(GET_TOTAL_ORDER_AMOUNT, {
    context: {
      important: true,
    },
  })

  const totalSales =
    (data?.order_product_aggregate.aggregate?.sum?.price || 0) -
    (data?.order_discount_aggregate.aggregate?.sum?.price || 0)

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

export default SaleSummaryAdminCard
