import { useApolloClient } from '@apollo/react-hooks'
import { Statistic } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { promotionMessages } from '../../helpers/translation'
import AdminCard from '../admin/AdminCard'
import UnAuthCover from '../common/UnAuthCover'

const messages = defineMessages({
  totalSales: { id: 'common.label.totalSales', defaultMessage: '銷售總額' },
})

const SaleSummaryAdminCard: React.FC<{ authStatus: 'Admin' | 'Creator' | 'None'; memberId: string | null }> = ({
  authStatus,
  memberId,
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState<boolean>(true)
  const apolloClient = useApolloClient()
  const [totalOrderAmountResult, setTotalOrderAmountResult] = useState<hasura.GET_TOTAL_ORDER_AMOUNT>()
  const [selfOrderAmountResult, setSelfOrderAmountResult] = useState<hasura.GET_SELF_ORDER_AMOUNT>()

  const isAuth = authStatus && authStatus !== 'None'

  useEffect(() => {
    if (isAuth) {
      apolloClient
        .query<hasura.GET_TOTAL_ORDER_AMOUNT>({
          query: GET_TOTAL_ORDER_AMOUNT,
        })
        .then(({ data }: { data?: hasura.GET_TOTAL_ORDER_AMOUNT }) => {
          setTotalOrderAmountResult(data)
          setLoading(false)
        })
        .catch(error => {
          setLoading(loading)
          console.log(error)
        })
    } else {
      setLoading(false)
    }
  }, [isAuth])

  useEffect(() => {
    if (authStatus === 'Creator' && memberId) {
      apolloClient
        .query<hasura.GET_SELF_ORDER_AMOUNT, hasura.GET_SELF_ORDER_AMOUNTVariables>({
          query: GET_SELF_ORDER_AMOUNT,
          variables: {
            memberId,
          },
        })
        .then(({ data }: { data?: hasura.GET_SELF_ORDER_AMOUNT }) => {
          setSelfOrderAmountResult(data)
          setLoading(false)
        })
        .catch(error => {
          setLoading(loading)
          console.log(error)
        })
    }
  }, [authStatus])

  const totalSales =
    (totalOrderAmountResult?.order_product_aggregate.aggregate?.sum?.price || 0) -
    (totalOrderAmountResult?.order_discount_aggregate.aggregate?.sum?.price || 0) -
    (selfOrderAmountResult?.order_product_aggregate.aggregate?.sum?.price || 0) +
    (selfOrderAmountResult?.order_discount_aggregate.aggregate?.sum?.price || 0)

  return (
    <>
      {!isAuth && <UnAuthCover />}
      <AdminCard loading={loading}>
        <Statistic
          title={formatMessage(messages.totalSales)}
          value={isAuth && totalSales >= 0 ? totalSales : '- -'}
          suffix={formatMessage(promotionMessages.label.dollar)}
        />
      </AdminCard>
    </>
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

const GET_SELF_ORDER_AMOUNT = gql`
  query GET_SELF_ORDER_AMOUNT($memberId: String!) {
    order_product_aggregate(where: { order_log: { status: { _eq: "SUCCESS" }, member_id: { _eq: $memberId } } }) {
      aggregate {
        sum {
          price
        }
      }
    }
    order_discount_aggregate(where: { order_log: { status: { _eq: "SUCCESS" }, member_id: { _eq: $memberId } } }) {
      aggregate {
        sum {
          price
        }
      }
    }
  }
`

export default SaleSummaryAdminCard
