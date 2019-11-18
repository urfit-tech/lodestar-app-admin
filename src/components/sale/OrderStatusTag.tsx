import { Tag } from 'antd'
import React from 'react'

type OrderStatusTagProps = {
  status: string
}
const OrderStatusTag: React.FC<OrderStatusTagProps> = ({ status }) => {
  switch (status) {
    case 'SUCCESS':
      return <Tag color="#4ed1b3">已完成</Tag>
    case 'UNPAID':
      return <Tag color="#ffbe1e">待付款</Tag>
    case 'REFUND':
      return <Tag color="#9b9b9b">已退款</Tag>
    default:
      return <Tag color="#ff7d62">付款失敗</Tag>
  }
}

export default OrderStatusTag
