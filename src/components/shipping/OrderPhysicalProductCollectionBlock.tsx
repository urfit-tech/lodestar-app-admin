import { Divider, Spin } from 'antd'
import moment from 'moment-timezone'
import { default as React } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { useSimpleProduct } from '../../hooks/data'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import EmptyCover from '../../images/default/empty-cover.png'
import { InvoiceProps, ShippingProps } from '../../types/merchandise'
import AdminCard from '../admin/AdminCard'
import { CustomRatioImage } from '../common/Image'
import ShippingInfoModal from './ShippingInfoModal'
import ShippingNoticeModal from './ShippingNoticeModal'

const messages = defineMessages({
  purchase: { id: 'merchandise.text.purchase', defaultMessage: '購買' },
  seller: { id: 'merchandise.ui.seller', defaultMessage: '賣家通知' },
  noMatchingItems: { id: 'merchandise.text.noMatchingItems', defaultMessage: '沒有任何符合項目' },
})

const StyledOrderTitle = styled.h3`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
export const StyledDate = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledSpecification = styled.div`
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`
const StyledShippingInfo = styled.div``

const OrderPhysicalProductCollectionBlock: React.FC<{
  orderPhysicalProductLogs: {
    id: string
    createdAt: Date
    updatedAt: Date
    deliveredAt: Date
    deliverMessage: string | null
    shipping: ShippingProps
    invoice: InvoiceProps
    orderPhysicalProducts: {
      key: string
      id: string
      name: string
      productId: string
      quantity: number
    }[]
  }[]
  searchText: string
  onRefetch?: () => void
}> = ({ orderPhysicalProductLogs, searchText, onRefetch }) => {
  const { formatMessage } = useIntl()

  orderPhysicalProductLogs = orderPhysicalProductLogs.filter(orderPhysicalProductLog =>
    orderPhysicalProductLog.orderPhysicalProducts
      .map(orderPhysicalProduct => !searchText || orderPhysicalProduct.key.toLowerCase().includes(searchText))
      .includes(true),
  )

  return (
    <div className="pt-4">
      {orderPhysicalProductLogs.length ? (
        orderPhysicalProductLogs.map(orderLog => (
          <AdminCard key={orderLog.id} className="mb-3">
            <StyledShippingInfo className="d-lg-flex justify-content-between">
              <div>
                <StyledOrderTitle className="mb-2">
                  {`${formatMessage(commonMessages.label.orderLogId)} ${orderLog.id}`}
                </StyledOrderTitle>

                {orderLog.createdAt && (
                  <StyledDate className="mb-4 d-flex align-items-center">
                    <CalendarOIcon className="mr-2" />
                    {`${moment(orderLog.createdAt).format('YYYY-MM-DD HH:mm')} ${formatMessage(messages.purchase)}`}
                  </StyledDate>
                )}

                {orderLog?.shipping?.specification ? (
                  <StyledSpecification className="mb-2">{orderLog.shipping.specification}</StyledSpecification>
                ) : null}
              </div>

              <div>
                <span className="mr-2">
                  <ShippingInfoModal shipping={orderLog.shipping} invoice={orderLog.invoice} />
                </span>
                <span>
                  <ShippingNoticeModal
                    orderLogId={orderLog.id}
                    deliveredAt={orderLog.deliveredAt}
                    deliverMessage={orderLog.deliverMessage}
                    onRefetch={onRefetch}
                  />
                </span>
              </div>
            </StyledShippingInfo>

            {orderLog.orderPhysicalProducts.map(orderPhysicalProduct => (
              <ShippingProductItem
                key={orderPhysicalProduct.id}
                productId={orderPhysicalProduct.productId}
                quantity={orderPhysicalProduct.quantity}
              />
            ))}
          </AdminCard>
        ))
      ) : (
        <div className="container d-flex align-items-center">
          <div>{formatMessage(messages.noMatchingItems)}</div>
        </div>
      )}
    </div>
  )
}

const StyledQuantity = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.71;
  letter-spacing: 0.4px;
`

const ShippingProductItem: React.FC<{
  productId: string
  quantity: number
}> = ({ productId, quantity }) => {
  const { loading, target } = useSimpleProduct(productId, {})

  if (loading || !target) {
    return <Spin />
  }

  return (
    <div>
      <Divider />

      <div className="d-flex align-items-center">
        <CustomRatioImage
          width="64px"
          ratio={1}
          src={target.coverUrl || EmptyCover}
          shape="rounded"
          className="mr-3 flex-shrink-0"
        />
        <div className="flex-grow-1">{target.title}</div>
        <StyledQuantity className="px-4">x{quantity}</StyledQuantity>
      </div>
    </div>
  )
}

export default OrderPhysicalProductCollectionBlock
