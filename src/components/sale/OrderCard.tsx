import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { OrderDiscount, OrderProduct } from '../../types/general'
import OrderStatusTag from './OrderStatusTag'
import saleMessages from './translation'

const StyledCard = styled.div`
  padding: 16px;
  border-radius: 4px;
  border: solid 1px #ececec;
`

const StyledInfoTitle = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.6px;
`

const StyledInfoContent = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: 500;
  line-height: 32px;
  letter-spacing: 0.2px;
`

const OrderCard: React.FC<{
  orderId: string
  status: string
  createdAt: string
  name: string
  email: string
  totalPrice: string
  orderProducts: Pick<OrderProduct, 'id' | 'name' | 'price' | 'options'>[]
  orderDiscounts: Pick<OrderDiscount, 'id' | 'price' | 'name'>[]
  isManuallyIssueInvoice?: boolean
}> = ({
  orderId,
  status,
  createdAt,
  name,
  email,
  totalPrice,
  orderProducts,
  orderDiscounts,
  isManuallyIssueInvoice,
}) => {
  const { settings } = useApp()
  const { formatMessage } = useIntl()
  const manuallyIssueInvoiceEnableSetting = settings['feature.manually_issue_invoice.enable'] === '1'

  const contentList = [
    { title: formatMessage(saleMessages.OrderCard.orderCreatedAt), message: createdAt, isRender: true },
    { title: formatMessage(saleMessages.OrderCard.nameAndEmail), message: `${name} / ${email}`, isRender: true },
    { title: formatMessage(saleMessages.OrderCard.totalPrice), message: totalPrice, isRender: true },
  ]
  return (
    <StyledCard>
      <div className="container mb-2">
        <div className="row justify-content-between">
          <StyledInfoTitle className="column">{formatMessage(saleMessages.OrderCard.orderId)}</StyledInfoTitle>
          <div className="column">
            <OrderStatusTag status={status} />
          </div>
        </div>
        <StyledInfoContent className="row">{orderId}</StyledInfoContent>
      </div>

      {contentList.map((row, idx) =>
        row.isRender ? (
          <div className="container mb-2" key={idx}>
            <StyledInfoTitle className="row">{row.title}</StyledInfoTitle>
            <StyledInfoContent className="row">{row.message}</StyledInfoContent>
          </div>
        ) : null,
      )}

      <div className="container mb-2">
        <StyledInfoTitle className="row">{formatMessage(saleMessages.OrderCard.orderProductItem)}</StyledInfoTitle>
        {orderProducts.map(orderProduct => (
          <div className="row justify-content-between" key={orderProduct.id}>
            <StyledInfoContent className="column">{orderProduct.name}</StyledInfoContent>
            <StyledInfoContent className="column">{currencyFormatter(orderProduct.price) || ''}</StyledInfoContent>
          </div>
        ))}
      </div>
      <div className="container mb-2">
        <StyledInfoTitle className="row">{formatMessage(saleMessages.OrderCard.orderDiscountItem)}</StyledInfoTitle>
        {orderDiscounts.map(orderDiscount => (
          <div className="row justify-content-between" key={orderDiscount.id}>
            <StyledInfoContent className="column">{orderDiscount.name}</StyledInfoContent>
            <StyledInfoContent className="column">{currencyFormatter(orderDiscount.price) || ''}</StyledInfoContent>
          </div>
        ))}
      </div>
      {!!manuallyIssueInvoiceEnableSetting && (
        <div className="container mb-2">
          <StyledInfoTitle className="row">
            {formatMessage(saleMessages.OrderCard.manuallyIssueInvoice)}
          </StyledInfoTitle>
          <StyledInfoContent className="row">
            {isManuallyIssueInvoice ? formatMessage(commonMessages.ui.yes) : formatMessage(commonMessages.ui.no)}
          </StyledInfoContent>
        </div>
      )}
    </StyledCard>
  )
}

export default OrderCard
