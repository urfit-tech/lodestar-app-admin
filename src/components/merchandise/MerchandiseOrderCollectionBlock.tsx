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
import MerchandiseShippingNoticeModal from './MerchandiseShippingNoticeModal'

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
export const StyledDate = styled.div`
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
    <div className="container">
      {merchandiseOrderLogs.length ? (
        merchandiseOrderLogs.map(orderLog => (
          <AdminCard key={orderLog.id} className="mb-4">
            <StyledShippingInfo className="d-flex">
              <div>
                <StyledOrderTitle className="mb-2">{`${formatMessage(commonMessages.label.orderLogId)} ${
                  orderLog.id
                }`}</StyledOrderTitle>

                {orderLog.createdAt && (
                  <StyledDate className="mb-4 d-flex align-items-center">
                    <CalendarOIcon className="mr-2" />
                    {`${moment(orderLog.createdAt).format('YYYY-MM-DD HH:mm')}
                    ${formatMessage(messages.purchase)}`}
                  </StyledDate>
                )}

                <StyledSpcification className="mb-2">{orderLog.shipping.specification}</StyledSpcification>
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
              ></MerchandiseItem>
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
