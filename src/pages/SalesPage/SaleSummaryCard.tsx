import { gql, useQuery } from '@apollo/client'
import { Statistic } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminCard from '../../components/admin/AdminCard'
import UnAuthCover from '../../components/common/UnAuthCover'
import hasura from '../../hasura'
import pageMessages from '../translation'

const SaleSummaryCard: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { isAuthenticating, permissions, currentMemberId: memberId } = useAuth()

  return (
    <>
      {!isAuthenticating && !permissions.GROSS_SALES_ADMIN && !permissions.GROSS_SALES_NORMAL ? <UnAuthCover /> : null}
      <AdminCard>
        {!isAuthenticating && appId && permissions.GROSS_SALES_ADMIN ? (
          <SalesSummaryAdminCard appId={appId} />
        ) : !isAuthenticating && appId && memberId && permissions.GROSS_SALES_NORMAL ? (
          <SalesSummaryNormalCard memberId={memberId} appId={appId} />
        ) : (
          <Statistic
            title={formatMessage(pageMessages['*'].totalSales)}
            suffix={formatMessage(pageMessages['*'].dollar)}
            value="- -"
          />
        )}
      </AdminCard>
    </>
  )
}

const SalesSummaryAdminCard: React.VFC<{ appId: string }> = ({ appId }) => {
  const { formatMessage } = useIntl()
  const { loading, totalOrderAmount } = useTotalOrderAmount(appId)

  return (
    <Statistic
      loading={loading}
      title={formatMessage(pageMessages['*'].totalSales)}
      suffix={formatMessage(pageMessages['*'].dollar)}
      value={totalOrderAmount >= 0 ? totalOrderAmount : '- -'}
    />
  )
}

const SalesSummaryNormalCard: React.VFC<{ memberId: string; appId: string }> = ({ memberId, appId }) => {
  const { formatMessage } = useIntl()
  const { loading: loadingTotalOrderAmount, totalOrderAmount } = useTotalOrderAmount(appId)
  const { loading: loadingSelfOrderAmount, selfOrderAmount } = useSelfOrderAmount(memberId, appId)

  return (
    <Statistic
      loading={loadingTotalOrderAmount || loadingSelfOrderAmount}
      title={formatMessage(pageMessages['*'].totalSales)}
      suffix={formatMessage(pageMessages['*'].dollar)}
      value={totalOrderAmount - selfOrderAmount >= 0 ? totalOrderAmount - selfOrderAmount : '- -'}
    />
  )
}

const useTotalOrderAmount = (appId: string) => {
  const { loading, data, error } = useQuery<hasura.GetTotalOrderAmount, hasura.GetTotalOrderAmountVariables>(
    GetTotalOrderAmount,
    { variables: { appId } },
  )
  const totalOrderAmount: number =
    (data?.order_product_aggregate.aggregate?.sum?.price || 0) -
    (data?.order_discount_aggregate.aggregate?.sum?.price || 0)

  return {
    loading,
    totalOrderAmount,
    error,
  }
}

const useSelfOrderAmount = (memberId: string, appId: string) => {
  const { loading, data, error } = useQuery<hasura.GetSelfOrderAmount, hasura.GetSelfOrderAmountVariables>(
    GetSelfOrderAmount,
    {
      variables: { memberId, appId },
    },
  )
  const selfOrderAmount: number =
    (data?.order_product_aggregate.aggregate?.sum?.price || 0) -
    (data?.order_discount_aggregate.aggregate?.sum?.price || 0)

  return {
    loading,
    selfOrderAmount,
    error,
  }
}

const GetTotalOrderAmount = gql`
  query GetTotalOrderAmount($appId: String!) {
    order_product_aggregate(where: { order_log: { status: { _eq: "SUCCESS" }, app_id: { _eq: $appId } } }) {
      aggregate {
        sum {
          price
        }
      }
    }
    order_discount_aggregate(where: { order_log: { status: { _eq: "SUCCESS" }, app_id: { _eq: $appId } } }) {
      aggregate {
        sum {
          price
        }
      }
    }
  }
`

const GetSelfOrderAmount = gql`
  query GetSelfOrderAmount($memberId: String!, $appId: String!) {
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

export default SaleSummaryCard
