import { Tag } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'

const OrderStatusTag: React.FC<{
  status: string
}> = ({ status }) => {
  const { formatMessage } = useIntl()

  switch (status) {
    case 'UNPAID':
      return <Tag color="#ffbe1e">{formatMessage(commonMessages.status.orderUnpaid)}</Tag>
    case 'EXPIRED':
      return <Tag color="#ec9e8f">{formatMessage(commonMessages.status.orderExpired)}</Tag>
    case 'PARTIAL_PAID':
      return <Tag color="#8fd5b5">{formatMessage(commonMessages.status.orderPartialPaid)}</Tag>
    case 'SUCCESS':
      return <Tag color="#4ed1b3">{formatMessage(commonMessages.status.orderSuccess)}</Tag>
    case 'PARTIAL_REFUND':
      return <Tag color="#cdcdcd">{formatMessage(commonMessages.status.orderPartialRefund)}</Tag>
    case 'REFUND':
      return <Tag color="#9b9b9b">{formatMessage(commonMessages.status.orderRefund)}</Tag>
    case 'DELETED':
      return <Tag color="#72a7c1">{formatMessage(commonMessages.status.deleted)}</Tag>
    default:
      return <Tag color="#ff7d62">{formatMessage(commonMessages.status.orderFailed)}</Tag>
  }
}

export default OrderStatusTag
