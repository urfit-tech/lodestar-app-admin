import { Tag } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'

const OrderStatusTag: React.FC<{
  status: string
}> = ({ status }) => {
  const { formatMessage } = useIntl()

  switch (status) {
    case 'SUCCESS':
      return <Tag color="#4ed1b3">{formatMessage(commonMessages.status.orderSuccess)}</Tag>
    case 'UNPAID':
      return <Tag color="#ffbe1e">{formatMessage(commonMessages.status.orderUnpaid)}</Tag>
    case 'REFUND':
      return <Tag color="#9b9b9b">{formatMessage(commonMessages.status.orderRefund)}</Tag>
    default:
      return <Tag color="#ff7d62">{formatMessage(commonMessages.status.orderFailed)}</Tag>
  }
}

export default OrderStatusTag
