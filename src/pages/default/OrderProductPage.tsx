import { Skeleton } from 'antd'
import React from 'react'
import useRouter from 'use-react-router'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { useOrderProduct } from '../../hooks/checkout'
import ActivityTicketPage from './ActivityTicketPage'

const OrderProductPage = () => {
  const { match } = useRouter<{ orderId: string; orderProductId: string }>()
  const { orderId, orderProductId } = match.params
  const { loadingOrderProduct, errorOrderProduct, orderProduct } = useOrderProduct(orderProductId)

  if (loadingOrderProduct) {
    return (
      <DefaultLayout noFooter>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (errorOrderProduct || !orderProduct) {
    return (
      <DefaultLayout noFooter>
        <div>讀取錯誤</div>
      </DefaultLayout>
    )
  }

  if (orderProduct.product.type === 'ActivityTicket') {
    return <ActivityTicketPage activityTicketId={orderProduct.product.target} />
  }

  return <DefaultLayout noFooter>this is an order product page of: {orderProductId}</DefaultLayout>
}

export default OrderProductPage
