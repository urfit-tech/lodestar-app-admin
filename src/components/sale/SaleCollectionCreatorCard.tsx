import { gql, useQuery } from '@apollo/client'
import { List, Skeleton, Typography } from 'antd'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { usePublicMember } from '../../hooks/member'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  purchasedAt: { id: 'common.text.purchasedAt', defaultMessage: '{name} 於 {date} 購買' },
  withSharingCode: { id: 'common.text.withSharingCode', defaultMessage: '推廣網址：{code}' },
})

const ListItemWrapper = styled.div`
  height: 50px;
  width: 100%;

  .info {
    overflow: hidden;

    p {
      margin-bottom: 0;
      letter-spacing: 0.4px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: 500;
      color: #9b9b9b;
    }
  }

  .price {
    color: ${props => props.theme['@primary-color']};
  }
`
const StyledTitle = styled.div`
  overflow: hidden;
  letter-spacing: 0.2px;
  font-size: 16px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const SharingCodeLabel = styled.span`
  padding-left: 0.5rem;
  border-left: 1px solid var(--gray);
`

type SaleOrderProductProps = {
  id: string
  name: string
  price: number
  endedAt: Date | null
  options: any
  orderLog: {
    id: string
    createdAt: Date
    memberId: string
  }
}

const SaleCollectionCreatorCard: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const { loadingOrderProducts, errorOrderProducts, orderProducts } = useProductOwnerOrders(memberId)

  if (loadingOrderProducts) {
    return (
      <AdminCard>
        <Skeleton active />
      </AdminCard>
    )
  }

  if (errorOrderProducts) {
    return <AdminCard>{formatMessage(errorMessages.data.fetch)}</AdminCard>
  }

  return (
    <AdminCard className="mb-5">
      <div className="d-flex justify-content-end">
        <Typography.Text type="secondary">
          {formatMessage(commonMessages.text.totalCount, { count: orderProducts.length })}
        </Typography.Text>
      </div>

      <List<SaleOrderProductProps>
        dataSource={orderProducts}
        renderItem={orderProduct => <ListItem orderProduct={orderProduct} />}
      />
    </AdminCard>
  )
}

const ListItem: React.FC<{
  orderProduct: SaleOrderProductProps
}> = ({ orderProduct }) => {
  const { formatMessage } = useIntl()
  const { member } = usePublicMember(orderProduct.orderLog.memberId)

  return (
    <List.Item className="py-4">
      <ListItemWrapper className="d-flex align-items-center justify-content-between">
        <div className="info mr-3">
          <StyledTitle>
            {orderProduct.name}
            {orderProduct.endedAt && (
              <span className="ml-2">
                ({moment(orderProduct.endedAt).format('YYYY-MM-DD')}{' '}
                {formatMessage(commonMessages.status.productExpired)})
              </span>
            )}
          </StyledTitle>
          <p>
            <span>
              {formatMessage(messages.purchasedAt, {
                name: member.name,
                date: dateFormatter(orderProduct.orderLog.createdAt),
              })}
            </span>
            {orderProduct.options?.sharingCode && (
              <SharingCodeLabel className="ml-2">
                {formatMessage(messages.withSharingCode, { code: orderProduct.options.sharingCode })}
              </SharingCodeLabel>
            )}
          </p>
        </div>
        <div className="flex-shrink-0 price">{currencyFormatter(orderProduct.price)}</div>
      </ListItemWrapper>
    </List.Item>
  )
}

const useProductOwnerOrders = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<
    hasura.GET_PRODUCT_OWNER_ORDERS,
    hasura.GET_PRODUCT_OWNER_ORDERSVariables
  >(
    gql`
      query GET_PRODUCT_OWNER_ORDERS($memberId: String!) {
        order_product(
          where: {
            order_log: {
              status: { _eq: "SUCCESS" }
              order_products: { product: { product_owner: { member_id: { _eq: $memberId } } } }
            }
          }
          order_by: { created_at: desc }
        ) {
          id
          name
          price
          ended_at
          options
          order_log {
            id
            created_at
            member_id
          }
        }
      }
    `,
    { variables: { memberId } },
  )

  const orderProducts: SaleOrderProductProps[] =
    data?.order_product.map(v => ({
      id: v.id,
      name: v.name,
      price: v.price,
      endedAt: v.ended_at,
      options: v.options,
      orderLog: {
        id: v.order_log.id,
        createdAt: v.order_log.created_at,
        memberId: v.order_log.member_id,
      },
    })) || []

  return {
    loadingOrderProducts: loading,
    errorOrderProducts: error,
    orderProducts,
    refetchOrderProducts: refetch,
  }
}

export default SaleCollectionCreatorCard
