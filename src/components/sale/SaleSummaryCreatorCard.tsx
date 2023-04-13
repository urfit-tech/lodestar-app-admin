import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Tooltip } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commaFormatter } from '../../helpers'
import { useMember } from '../../hooks/member'
import AdminCard from '../admin/AdminCard'
import { AvatarImage } from '../common/Image'

const SaleSummaryWrapper = styled.div`
  display: flex;
  align-items: center;
`
const SaleSummaryInfo = styled.div`
  h3 {
    line-height: 1.3;
    letter-spacing: 0.77px;
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: bold;
  }

  p {
    line-height: 1.5;
    letter-spacing: 0.2px;
    margin-bottom: 0px;
    font-family: Roboto;
    font-size: 16px;
  }
`
const TipsText = styled.span`
  font-size: 12px;
`

const messages = defineMessages({
  totalActualSales: { id: 'common.text.totalActualSales', defaultMessage: '實際銷售總額 {dollars} 元' },
  totalActualSalesNotation: {
    id: 'common.text.totalActualSalesNotation',
    defaultMessage: '銷售總額 - 訂閱首期折扣 = 實際銷售總額',
  },
})

const SaleSummaryCreatorCard: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { member } = useMember(memberId)
  const { loading, data, error } = useQuery<
    hasura.GET_PRODUCT_OWNER_TOTAL_AMOUNT,
    hasura.GET_PRODUCT_OWNER_TOTAL_AMOUNTVariables
  >(
    gql`
      query GET_PRODUCT_OWNER_TOTAL_AMOUNT($memberId: String!) {
        order_product_aggregate(
          where: {
            order_log: {
              status: { _eq: "SUCCESS" }
              order_products: { product: { product_owner: { member_id: { _eq: $memberId } } } }
            }
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
              order_products: { product: { product_owner: { member_id: { _eq: $memberId } } } }
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
    `,
    { variables: { memberId } },
  )

  const [totalPrice, totalDiscount] =
    loading || error || !data
      ? [0, 0]
      : [
          data.order_product_aggregate.aggregate?.sum?.price || 0,
          data.order_discount_aggregate.aggregate?.sum?.price || 0,
        ]

  return (
    <AdminCard loading={loading}>
      <SaleSummaryWrapper className="d-flex align-items-center justify-content-start">
        <AvatarImage size="80px" src={member?.pictureUrl} className="flex-shrink-0" />
        <SaleSummaryInfo className="ml-4">
          <h3>{member?.name}</h3>
          <p>
            <span className="mr-2">
              {formatMessage(messages.totalActualSales, { dollars: commaFormatter(totalPrice - totalDiscount) })}
            </span>
            {totalDiscount > 0 && (
              <Tooltip placement="top" title={<TipsText>{formatMessage(messages.totalActualSalesNotation)}</TipsText>}>
                <QuestionCircleFilled />
              </Tooltip>
            )}
          </p>
        </SaleSummaryInfo>
      </SaleSummaryWrapper>
    </AdminCard>
  )
}

export default SaleSummaryCreatorCard
