import moment from 'moment-timezone'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import { InvoiceProps, ShippingProps } from '../../types/merchandise'
import AdminCard from '../admin/AdminCard'
import { BREAK_POINT } from '../common/Responsive'
import MerchandiseItem from './MerchandiseItem'
import MerchandiseShippingInfoModal from './MerchandiseShippingInfoModal'

const messages = defineMessages({
  purchase: { id: 'merchandise.text.purchase', defaultMessage: '購買' },
  seller: { id: 'merchandise.ui.seller', defaultMessage: '賣家通知' },
  noMatchingItems: { id: 'merchandise.text.noMatchingItems', defaultMessage: '沒有任何符合項目' },
})

const StyledOrderTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
  color: var(--gray-darker);
`
const StyledPurchaseDate = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`
const StyledSpcification = styled.div`
  font-family: NotoSansCJKtc
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
const StyledShippingInfo = styled.div`
  justify-content: space-between;
  flex-flow: column;

  @media (min-width: ${BREAK_POINT}px) {
    flex-flow: row;
  }
`
const StyledMerchandiseDiliverMessage = styled.div`
  padding: 24px;
  background-color: var(--gray-lighter);

  h4.seller {
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 0.2px;
    color: var(--gray-darker);
  }

  .delivered-at {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.4px;
    color: var(--gray-dark);
  }

  .deliver-message {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0.2px;
    text-align: justify;
    color: var(--gray-darker);
  }
`

const MerchandiseOrderCollectionBlock: React.FC<{
  merchandiseOrderLogs: {
    id: string
    updatedAt: Date
    deliveredAt: Date
    deliverMessage: string | null
    shipping: ShippingProps
    invoice: InvoiceProps
    orderMerchandises: {
      id: string
      merchandiseId: string
    }[]
  }[]
  searchText: string
}> = ({ merchandiseOrderLogs, searchText }) => {
  const { formatMessage } = useIntl()
  merchandiseOrderLogs = merchandiseOrderLogs.filter(
    merchandise => !searchText || merchandise.id.toLowerCase().includes(searchText),
  )

  return (
    <div className="container">
      {merchandiseOrderLogs.length ? (
        merchandiseOrderLogs.map(orderLog => (
          <AdminCard key={orderLog.id} className="mb-4">
            <StyledShippingInfo className="d-flex">
              <div>
                <StyledOrderTitle className="mb-2">{`${formatMessage(commonMessages.label.orderLogId)} ${
                  orderLog.id
                }`}</StyledOrderTitle>

                {orderLog.updatedAt && (
                  <StyledPurchaseDate className="mb-4 d-flex align-items-center">
                    <CalendarOIcon className="mr-2" /> {moment(orderLog.updatedAt).format('YYYY-MM-DD hh:mm')}
                    {formatMessage(messages.purchase)}
                  </StyledPurchaseDate>
                )}

                <StyledSpcification className="mb-2">{orderLog.shipping.specification}</StyledSpcification>
              </div>

              <div>
                <MerchandiseShippingInfoModal shipping={orderLog.shipping} invoice={orderLog.invoice} />
              </div>
            </StyledShippingInfo>

            {orderLog.orderMerchandises.map(orderMerchandise => (
              <MerchandiseItem
                key={orderMerchandise.id}
                merchandiseId={orderMerchandise.merchandiseId}
              ></MerchandiseItem>
            ))}

            {orderLog.deliveredAt && (
              <StyledMerchandiseDiliverMessage className="mt-4">
                <div className="d-flex justify-content-between">
                  <h4 className="seller">{formatMessage(messages.seller)}</h4>
                  <span className="delivered-at">{moment(orderLog.deliveredAt).format('YYYY-MM-DD hh:mm')}</span>
                </div>

                <div className="deliver-message">{orderLog.deliverMessage}</div>
              </StyledMerchandiseDiliverMessage>
            )}
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
