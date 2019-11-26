import { List, Typography } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { usePublicMember } from '../../hooks/member'
import * as types from '../../types'
import AdminCard from '../common/AdminCard'

const StyledCard = styled(AdminCard)`
  .ant-card-body {
    padding: 16px;
  }
`
const StyledWrapper = styled.div`
  overflow: auto;
`
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

type SaleCollectionCreatorCardProps = {
  loading?: boolean
  error?: Error
  orderProducts: types.GET_PRODUCT_OWNER_ORDERS_order_product[]
}
const SaleCollectionCreatorCard: React.FC<SaleCollectionCreatorCardProps> = ({ loading, error, orderProducts }) => {
  if (error) {
    return <StyledCard>無法載入資料</StyledCard>
  }
  return (
    <StyledCard loading={loading}>
      <StyledWrapper>
        <div className="d-flex justify-content-end">
          <Typography.Text type="secondary">共 {orderProducts.length} 筆</Typography.Text>
        </div>
        <List loading={loading} dataSource={orderProducts} renderItem={item => <ListItem {...item} />} />
      </StyledWrapper>
    </StyledCard>
  )
}

const ListItem: React.FC<types.GET_PRODUCT_OWNER_ORDERS_order_product> = ({ name, price, order_log: orderLog }) => {
  const { member } = usePublicMember(orderLog.member_id)

  if (!member) {
    return null
  }

  return (
    <List.Item className="py-4">
      <ListItemWrapper className="d-flex align-items-center justify-content-between">
        <div className="info mr-3">
          <StyledTitle>{name}</StyledTitle>
          <p>
            {member.name} 於 {dateFormatter(orderLog.created_at)} 購買
          </p>
        </div>
        <div className="flex-shrink-0 price">{currencyFormatter(price)}</div>
      </ListItemWrapper>
    </List.Item>
  )
}

export default SaleCollectionCreatorCard
