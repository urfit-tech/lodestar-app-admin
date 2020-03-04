import { List, Skeleton, Typography } from 'antd'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { usePublicMember } from '../../hooks/member'
import AdminCard from '../admin/AdminCard'

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

const messages = defineMessages({
  purchasedAt: { id: 'common.text.purchasedAt', defaultMessage: '{name} 於 {date} 購買' },
})

type SaleCollectionCreatorCardProps = {
  loading?: boolean
  error?: Error
  orderProducts?: {
    id: string
    name: string
    price: number
    endedAt: Date | null
    orderLog: {
      id: string
      memberId: string
      createdAt: Date
    }
  }[]
}
const SaleCollectionCreatorCard: React.FC<SaleCollectionCreatorCardProps> = ({ loading, error, orderProducts }) => {
  const { formatMessage } = useIntl()
  if (loading) {
    return (
      <AdminCard>
        <Skeleton active />
      </AdminCard>
    )
  }
  if (error || !orderProducts) {
    return <StyledCard>{formatMessage(errorMessages.data.fetch)}</StyledCard>
  }
  return (
    <StyledCard loading={loading}>
      <StyledWrapper>
        <div className="d-flex justify-content-end">
          <Typography.Text type="secondary">
            {formatMessage(commonMessages.text.totalCount, { count: orderProducts.length })}
          </Typography.Text>
        </div>
        <List loading={loading} dataSource={orderProducts} renderItem={item => <ListItem {...item} />} />
      </StyledWrapper>
    </StyledCard>
  )
}

const ListItem: React.FC<{
  name: string
  price: number
  endedAt: Date | null
  orderLog: {
    id: string
    memberId: string
    createdAt: Date
  }
}> = ({ name, price, orderLog, endedAt }) => {
  const { formatMessage } = useIntl()
  const { member } = usePublicMember(orderLog.memberId)

  if (!member) {
    return null
  }

  return (
    <List.Item className="py-4">
      <ListItemWrapper className="d-flex align-items-center justify-content-between">
        <div className="info mr-3">
          <StyledTitle>
            {name}
            {endedAt && (
              <span className="ml-2">
                ({moment(endedAt).format('YYYY-MM-DD')} {formatMessage(commonMessages.status.productExpired)})
              </span>
            )}
          </StyledTitle>
          <p>{formatMessage(messages.purchasedAt, { name: member.name, date: dateFormatter(orderLog.createdAt) })}</p>
        </div>
        <div className="flex-shrink-0 price">{currencyFormatter(price)}</div>
      </ListItemWrapper>
    </List.Item>
  )
}

export default SaleCollectionCreatorCard
