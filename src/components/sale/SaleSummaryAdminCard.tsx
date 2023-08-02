import { useApolloClient } from '@apollo/client'
import { Statistic } from 'antd'
import { gql } from '@apollo/client'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { promotionMessages } from '../../helpers/translation'
import AdminCard from '../admin/AdminCard'
import UnAuthCover from '../common/UnAuthCover'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'

type SalesStatus = 'Admin' | 'Creator' | 'None'

const messages = defineMessages({
  totalSales: { id: 'common.label.totalSales', defaultMessage: '銷售總額' },
})

const SaleSummaryAdminCard: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { isAuthenticating, permissions, currentMemberId: memberId } = useAuth()
  const [loading, setLoading] = useState<boolean>(true)
  const apolloClient = useApolloClient()
  const [totalOrderAmountResult, setTotalOrderAmountResult] = useState<hasura.GET_TOTAL_ORDER_AMOUNT>()
  const [selfOrderAmountResult, setSelfOrderAmountResult] = useState<hasura.GET_SELF_ORDER_AMOUNT>()

  const grossSalesPermission: SalesStatus = permissions.GROSS_SALES_ADMIN
    ? 'Admin'
    : permissions.GROSS_SALES_NORMAL
    ? 'Creator'
    : 'None'

  useEffect(() => {
    if (grossSalesPermission !== 'None') {
      apolloClient
        .query<hasura.GET_TOTAL_ORDER_AMOUNT>({
          query: GET_TOTAL_ORDER_AMOUNT,
          variables: { appId },
        })
        .then(({ data }) => {
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
  }, [grossSalesPermission])

  useEffect(() => {
    if (grossSalesPermission === 'Creator' && memberId) {
      apolloClient
        .query<hasura.GET_SELF_ORDER_AMOUNT, hasura.GET_SELF_ORDER_AMOUNTVariables>({
          query: GET_SELF_ORDER_AMOUNT,
          variables: {
            memberId,
            appId,
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
  }, [grossSalesPermission])

  const totalSales =
    (totalOrderAmountResult?.order_product_aggregate.aggregate?.sum?.price || 0) -
    (totalOrderAmountResult?.order_discount_aggregate.aggregate?.sum?.price || 0) -
    (selfOrderAmountResult?.order_product_aggregate.aggregate?.sum?.price || 0) +
    (selfOrderAmountResult?.order_discount_aggregate.aggregate?.sum?.price || 0)

  return (
    <>
      {!isAuthenticating && grossSalesPermission === 'None' ? <UnAuthCover /> : null}
      <AdminCard loading={loading || isAuthenticating}>
        <Statistic
          title={formatMessage(messages.totalSales)}
          value={grossSalesPermission !== 'None' && totalSales >= 0 ? totalSales : '- -'}
          suffix={formatMessage(promotionMessages.label.dollar)}
        />
      </AdminCard>
    </>
  )
}

const GET_TOTAL_ORDER_AMOUNT = gql`
  query GET_TOTAL_ORDER_AMOUNT($appId: String!) {
    order_product_aggregate(where: { order_log: { status: { _eq: "SUCCESS" }, member: { app_id: { _eq: $appId } } } }) {
      aggregate {
        sum {
          price
        }
      }
    }
    order_discount_aggregate(
      where: { order_log: { status: { _eq: "SUCCESS" }, member: { app_id: { _eq: $appId } } } }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
  }
`

const GET_SELF_ORDER_AMOUNT = gql`
  query GET_SELF_ORDER_AMOUNT($memberId: String!, $appId: String!) {
    order_product_aggregate(
      where: {
        order_log: { status: { _eq: "SUCCESS" }, member_id: { _eq: $memberId }, member: { app_id: { _eq: $appId } } }
        product: { product_owner: { member_id: { _neq: $memberId } } }
      }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
    order_discount_aggregate(
      where: {
        order_log: {
          status: { _eq: "SUCCESS" }
          member_id: { _eq: $memberId }
          member: { app_id: { _eq: $appId } }
          order_products: { product: { product_owner: { member_id: { _neq: $memberId } } } }
        }
      }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
  }
`

export default SaleSummaryAdminCard
