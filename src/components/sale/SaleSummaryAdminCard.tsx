import { useApolloClient } from '@apollo/react-hooks'
import { Statistic } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { promotionMessages } from '../../helpers/translation'
import { LockIcon } from '../../images/icon'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  totalSales: { id: 'common.label.totalSales', defaultMessage: '銷售總額' },
})

const StyledCover = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .unauth__label {
    display: flex;
    background-color: #f7f8f8;
    padding: 8px 12px;
    border-radius: 18px;

    span {
      font-size: 14px;
      font-family: NotoSans;
      font-weight: 500;
      color: var(--gray-dark);
    }
  }
`

const UnAuthCover: React.VFC<{}> = ({}) => {
  return (
    <StyledCover>
      <div className="unauth__label">
        <LockIcon className="mr-2" />
        <span>無此權限</span>
      </div>
    </StyledCover>
  )
}

const SaleSummaryAdminCard: React.FC<{ isAuth?: boolean }> = ({ isAuth }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState<boolean>(true)
  const apolloClient = useApolloClient()
  const [totalOrderAmountResult, setTotalOrderAmountResult] = useState<hasura.GET_TOTAL_ORDER_AMOUNT>()

  useEffect(() => {
    if (isAuth) {
      apolloClient
        .query<hasura.GET_TOTAL_ORDER_AMOUNT>({
          query: GET_TOTAL_ORDER_AMOUNT,
        })
        .then(({ data }: { data?: hasura.GET_TOTAL_ORDER_AMOUNT }) => {
          console.log(data)
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

  const totalSales =
    (totalOrderAmountResult?.order_product_aggregate.aggregate?.sum?.price || 0) -
    (totalOrderAmountResult?.order_discount_aggregate.aggregate?.sum?.price || 0)

  return (
    <>
      {!isAuth && <UnAuthCover />}
      <AdminCard loading={loading}>
        <Statistic
          title={formatMessage(messages.totalSales)}
          value={isAuth ? totalSales : '- -'}
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

export default SaleSummaryAdminCard
