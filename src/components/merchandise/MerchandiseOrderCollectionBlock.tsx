import moment from 'moment-timezone'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import { InvoiceProps, ShippingProps } from '../../types/merchandise'
import AdminCard from '../admin/AdminCard'
import MerchandiseItem from './MerchandiseItem'
import MerchandiseShippingInfoModal from './MerchandiseShippingInfoModal'
import MerchandiseShippingNoticeModal from './MerchandiseShippingNoticeModal'

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

const MerchandiseOrderCollectionBlock: React.FC<{
  merchandiseOrderLogs: {
    id: string
    createdAt: Date
    updatedAt: Date
    deliveredAt: Date
    deliverMessage: string | null
    shipping: ShippingProps
    invoice: InvoiceProps
    orderMerchandises: {
      key: string
      id: string
      name: string
      merchandiseId: string
      quantity: number
    }[]
  }[]
  searchText: string
  onRefetch?: () => void
}> = ({ merchandiseOrderLogs, searchText, onRefetch }) => {
  const { formatMessage } = useIntl()

  merchandiseOrderLogs = merchandiseOrderLogs.filter(merchandiseOrderLog =>
    merchandiseOrderLog.orderMerchandises
      .map(orderMerchandise => !searchText || orderMerchandise.key.toLowerCase().includes(searchText))
      .includes(true),
  )

  return (
    <div className="pt-4">
      {merchandiseOrderLogs.length ? (
        merchandiseOrderLogs.map(orderLog => (
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
                  <MerchandiseShippingInfoModal shipping={orderLog.shipping} invoice={orderLog.invoice} />
                </span>
                <span>
                  <MerchandiseShippingNoticeModal
                    orderLogId={orderLog.id}
                    deliveredAt={orderLog.deliveredAt}
                    deliverMessage={orderLog.deliverMessage}
                    onRefetch={onRefetch}
                  />
                </span>
              </div>
            </StyledShippingInfo>

            {orderLog.orderMerchandises.map(orderMerchandise => (
              <MerchandiseItem
                key={orderMerchandise.id}
                merchandiseId={orderMerchandise.merchandiseId}
                quantity={orderMerchandise.quantity}
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

export default MerchandiseOrderCollectionBlock
