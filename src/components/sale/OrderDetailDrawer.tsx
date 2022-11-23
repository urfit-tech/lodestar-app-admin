import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import { HStack, CloseButton, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody } from '@chakra-ui/react'
import { useOrderLogs, usePaymentLogs, useSharingCodes } from '../../hooks/order'
import saleMessages from './translation'
import styled from 'styled-components'
import OrderCard from './OrderCard'
import OrderOtherInfoCard from './OrderOtherInfoCard'
import InvoiceCard from './InvoiceCard'
import PaymentCard from './PaymentCard'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { currencyFormatter } from '../../helpers'
import gql from 'graphql-tag'
import { useCallback } from 'preact/hooks'

dayjs.extend(timezone)
dayjs.extend(utc)

const currentTimeZone = dayjs.tz.guess()

const StyledDrawerTitle = styled.p`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`

const StyledTitle = styled.p`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 38px;
  letter-spacing: 0.8px;
  margin: 32px 0px;
`

const OrderDetailDrawer: React.FC<{
  orderLogId: string | null
  onClose: () => void
}> = ({ orderLogId, onClose }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()
  const { orderLogs } = useOrderLogs(
    currentMemberId || '',
    permissions.SALES_RECORDS_ADMIN ? 'Admin' : permissions.SALES_RECORDS_NORMAL ? 'Personal' : 'None',
    { orderId: orderLogId },
  )
  const { paymentLogs } = usePaymentLogs({ orderLogId })
  const orderLog = orderLogs[0]
  const { sharingCodes } = useSharingCodes(
    orderLog?.orderProducts.map(orderProduct => orderProduct.options.from).filter(path => path !== '') || [],
  )
  const isOpen = Boolean(orderLogId)
  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack>
              <CloseButton onClick={onClose} />
              <StyledDrawerTitle>{formatMessage(saleMessages.OrderDetailDrawer.orderInfo)}</StyledDrawerTitle>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            {orderLog && (
              <OrderCard
                orderId={orderLogId || ''}
                status={orderLog.status}
                createdAt={dayjs(orderLog.createdAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm')}
                name={orderLog.name}
                email={orderLog.email}
                totalPrice={currencyFormatter(orderLog.totalPrice) || ''}
                orderProducts={orderLog.orderProducts}
                orderDiscounts={orderLog.orderDiscounts}
              />
            )}
            <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.otherInfo)}</StyledTitle>
            {orderLog && (
              <OrderOtherInfoCard
                country={orderLog.options?.country || ''}
                referrer={orderLog.invoiceOptions?.referrerEmail || ''}
                sharingCode={sharingCodes?.map(c => c.code).join(', ') || ''}
                sharingNote={sharingCodes?.map(c => c.note).join(', ') || ''}
                orderLogExecutor={orderLog.orderExecutors.map(v => `${v.name} - ${v.ratio}`).join('\\') || ''}
                giftPlan={orderLog.orderProducts.reduce(
                  (accu, orderProduct) => (orderProduct.options.type === 'gift' ? accu + orderProduct.name : accu),
                  '',
                )}
                recipientName={orderLog.shipping?.isOutsideTaiwanIsland === 'false' ? orderLog.shipping?.name : ''}
                recipientPhone={orderLog.shipping?.isOutsideTaiwanIsland === 'false' ? orderLog.shipping?.phone : ''}
                recipientAddress={
                  orderLog.shipping?.isOutsideTaiwanIsland === 'false'
                    ? `${orderLog.shipping?.zipCode || ''}${orderLog.shipping?.city || ''}${
                        orderLog.shipping?.district || ''
                      }${orderLog.shipping?.address || ''}`
                    : ''
                }
              />
            )}
            <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.invoiceInfo)}</StyledTitle>
            {orderLog && (
              <InvoiceCard
                status={orderLog.invoiceOptions?.status || ''}
                invoiceIssuedAt={
                  orderLog.invoiceIssuedAt
                    ? dayjs(orderLog.invoiceIssuedAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm:ss')
                    : ''
                }
                invoiceNumber={orderLog.invoiceOptions?.invoiceNumber || ''}
                invoiceName={orderLog.invoiceOptions?.name || ''}
                invoicePhone={orderLog.invoiceOptions?.phone || ''}
                invoiceEmail={orderLog.invoiceOptions?.email || ''}
                invoiceTarget={
                  orderLog.invoiceOptions?.donationCode
                    ? '捐贈'
                    : orderLog.invoiceOptions?.uniformNumber
                    ? '公司'
                    : '個人'
                }
                donationCode={orderLog.invoiceOptions?.donationCode || ''}
                invoiceCarrier={
                  orderLog.invoiceOptions?.phoneBarCode
                    ? '手機'
                    : orderLog.invoiceOptions?.citizenCode
                    ? '自然人憑證'
                    : ''
                }
                uniformNumber={orderLog.invoiceOptions?.uniformNumber || ''}
                uniformTitle={orderLog.invoiceOptions?.uniformTitle || ''}
                invoiceAddress={`${orderLog.invoiceOptions?.postCode || ''} ${orderLog.invoiceOptions?.address || ''}`}
              />
            )}
            <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.paymentInfo)}</StyledTitle>
            <PaymentCard payments={paymentLogs} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default OrderDetailDrawer
