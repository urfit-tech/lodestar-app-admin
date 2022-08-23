import Icon from '@ant-design/icons'
import { Button } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { merchandiseMessages } from '../../helpers/translation'
import { ReactComponent as IconList } from '../../images/icon/list-o.svg'
import { InvoiceProps, ShippingProps } from '../../types/merchandise'
import AdminModal from '../admin/AdminModal'
import ShippingMethodLabel from '../common/ShippingMethodLabel'

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
  shipping: ShippingProps | null
  invoice: InvoiceProps
}> = ({ shipping, invoice }) => {
  const { formatMessage } = useIntl()
  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon={<Icon component={() => <IconList />} />} type="text" onClick={() => setVisible(true)}>
          {formatMessage(merchandiseMessages.label.shippingInfo)}
        </Button>
      )}
      footer={null}
    >
      <div>
        <h3>{formatMessage(merchandiseMessages.label.shippingInfo)}</h3>
        <div className="row">
          <div className="col-4">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(merchandiseMessages.label.shippingName)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-2">{shipping?.name}</StyledShippingInfoContent>
          </div>
          <div className="col-8">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(merchandiseMessages.label.shippingMethod)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">
              <ShippingMethodLabel shippingMethodId={shipping?.shippingMethod || ''} />
            </StyledShippingInfoContent>
          </div>
          <div className="col-12">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(merchandiseMessages.label.shippingPhone)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">{shipping?.phone}</StyledShippingInfoContent>
          </div>
          <div className="col-12">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(merchandiseMessages.label.shippingAddress)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">
              {shipping?.address}
              {shipping?.storeName ? `（${shipping.storeName}）` : ''}
            </StyledShippingInfoContent>
          </div>
          <div className="col-12">
            <StyledShippingInfoSubtitle className="mb-1">
              {formatMessage(merchandiseMessages.label.shippingMail)}
            </StyledShippingInfoSubtitle>
            <StyledShippingInfoContent className="mb-3">{invoice?.email}</StyledShippingInfoContent>
          </div>
        </div>
      </div>
    </AdminModal>
  )
}

export default ShippingInfoModal
