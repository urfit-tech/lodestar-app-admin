import { Button } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { shippingMethodFormatter } from '../../helpers'
import { InvoiceProps, ShippingProps } from '../../types/merchandise'
import AdminModal from '../admin/AdminModal'

const messages = defineMessages({
  shippingInfo: { id: 'merchandise.ui.shippingInfo', defaultMessage: '收件資訊' },
  shippingName: { id: 'merchandise.ui.shippingName', defaultMessage: '收件姓名' },
  shippingMethod: { id: 'merchandise.ui.shippingMethod', defaultMessage: '收件方式' },
  shippingPhone: { id: 'merchandise.ui.shippingPhone', defaultMessage: '收件人電話' },
  shippingAddress: { id: 'merchandise.ui.shippingAddress', defaultMessage: '收件地址' },
  shippingMail: { id: 'merchandise.ui.shippingMail', defaultMessage: '收件人信箱' },
})

const StyledShippingInfoSubtitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`
const StyledShippingInfoContent = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const ShippingInfoModal: React.FC<{
  shipping: ShippingProps
  invoice: InvoiceProps
}> = ({ shipping, invoice }) => {
  const { formatMessage } = useIntl()
  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon="" onClick={() => setVisible(true)}>
          {formatMessage(messages.shippingInfo)}
        </Button>
      )}
      footer={null}
    >
      <div>
        <h3>{formatMessage(messages.shippingInfo)}</h3>
        <div className="row">
          <div className="col-4">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(messages.shippingName)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-2">{shipping?.name}</StyledShippingInfoContent>
          </div>
          <div className="col-8">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(messages.shippingMethod)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">
              {shippingMethodFormatter(shipping?.shippingMethod)}
            </StyledShippingInfoContent>
          </div>
          <div className="col-12">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(messages.shippingPhone)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">{shipping?.phone}</StyledShippingInfoContent>
          </div>
          <div className="col-12">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(messages.shippingAddress)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">{shipping?.address}</StyledShippingInfoContent>
          </div>
          <div className="col-12">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(messages.shippingMail)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">{invoice?.email}</StyledShippingInfoContent>
          </div>
        </div>
      </div>
    </AdminModal>
  )
}

export default ShippingInfoModal
