import { gql, useQuery } from '@apollo/client'
import { CloseButton, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, HStack } from '@chakra-ui/react'
import { Skeleton } from 'antd'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { sum } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, paymentMethodFormatter } from '../../helpers'
import { useOrderReceivableStatusQuery } from '../../hooks/orderReceivable'
import { PaymentCompany } from '../../pages/NewMemberContractCreationPage/MemberContractCreationForm'
import { OrderDiscount, OrderLog, OrderProduct, PaymentLog } from '../../types/general'
import InvoiceCard from './InvoiceCard'
import OrderCard from './OrderCard'
import OrderOtherInfoCard from './OrderOtherInfoCard'
import PaymentCard from './PaymentCard'
import saleMessages from './translation'

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
  renderTrigger?: React.FC
  onRefetch?: () => void
}> = ({ orderLogId, onClose, renderTrigger, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const isOpen = Boolean(orderLogId)
  const {
    loadingOrderDetail,
    loadingSharingCode,
    orderLog,
    sharingCodes,
    orderProducts,
    orderDiscounts,
    totalPrice,
    orderExecutors,
    paymentLogs,
    orderDetailRefetch,
    invoices,
    paymentMethod,
  } = useOrderDetail(orderLogId)
  const paymentCompanies: { paymentCompanies: PaymentCompany[] } = JSON.parse(settings['custom'] || '{}')
  const company = paymentCompanies?.paymentCompanies
    ?.find(c => orderLog.options?.company && c.companies.map(c => c.name).includes(orderLog.options?.company))
    ?.companies.find(company => company.name === orderLog.options?.company)

  const [shownInvoices, setShownInvoices] = useState(invoices)

  const { loading: accountReceivableLoading, isAccountReceivable } = useOrderReceivableStatusQuery(orderLogId)

  useEffect(() => setShownInvoices(invoices), [JSON.stringify(invoices)])

  return (
    <>
      {renderTrigger?.({})}
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
            {settings['payment.v2'] === '1' ? (
              <>
                {loadingOrderDetail ? (
                  <Skeleton />
                ) : (
                  <OrderCard
                    orderId={orderLogId || ''}
                    status={orderLog.status}
                    createdAt={dayjs(orderLog.createdAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm')}
                    name={orderLog.name}
                    email={orderLog.email}
                    totalPrice={currencyFormatter(totalPrice) || ''}
                    orderProducts={orderProducts}
                    orderDiscounts={orderDiscounts}
                    isManuallyIssueInvoice={orderLog.invoiceOptions?.skipIssueInvoice}
                  />
                )}
                <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.paymentInfo)}</StyledTitle>
                {loadingOrderDetail ? (
                  <Skeleton />
                ) : (
                  <PaymentCard
                    payments={paymentLogs}
                    paymentMethod={paymentMethod}
                    order={orderLog}
                    onRefetch={() => {
                      onRefetch?.()
                      orderDetailRefetch()
                    }}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.invoiceInfo)}</StyledTitle>
                </div>
                {loadingOrderDetail && accountReceivableLoading ? (
                  <Skeleton />
                ) : shownInvoices.length === 0 ? (
                  <InvoiceCard
                    status={''}
                    invoiceIssuedAt={''}
                    invoiceNumber={''}
                    invoiceName={orderLog.invoiceOptions?.name || ''}
                    invoicePhone={orderLog.invoiceOptions?.phone || ''}
                    invoiceEmail={orderLog.invoiceOptions?.email || ''}
                    invoiceTarget={
                      orderLog.invoiceOptions?.donationCode
                        ? formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetDonation)
                        : orderLog.invoiceOptions?.uniformNumber
                        ? formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetCompany)
                        : formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetIndividual)
                    }
                    donationCode={orderLog.invoiceOptions?.donationCode || ''}
                    invoiceCarrier={
                      orderLog.invoiceOptions?.phoneBarCode
                        ? formatMessage(saleMessages.OrderDetailDrawer.phoneBarCode)
                        : orderLog.invoiceOptions?.citizenCode
                        ? formatMessage(saleMessages.OrderDetailDrawer.citizenCode)
                        : ''
                    }
                    uniformNumber={orderLog.invoiceOptions?.uniformNumber || ''}
                    uniformTitle={orderLog.invoiceOptions?.uniformTitle || ''}
                    invoiceAddress={`${orderLog.invoiceOptions?.postCode || ''} ${
                      orderLog.invoiceOptions?.address || ''
                    }`}
                    invoiceComment={orderLog.invoiceOptions?.invoiceComment}
                    invoiceGatewayId={company?.invoiceGatewayId}
                    companyUniformNumber={company?.companyUniformNumber}
                    executorName={orderLog.options?.executor?.name}
                    memberId={orderLog.memberId}
                    paymentMethod={paymentMethod}
                    invoiceCompanyName={company?.invoiceCompanyName}
                    companyAddress={company?.companyAddress}
                    companyPhone={company?.companyPhone}
                    isAccountReceivable={isAccountReceivable}
                    isMemberZeroTaxProperty={orderLog.invoiceOptions?.isMemberZeroTaxProperty}
                  />
                ) : (
                  shownInvoices.map(i => (
                    <InvoiceCard
                      key={i.no}
                      status={!!i.revokedAt ? 'REVOKED' : 'SUCCESS'}
                      invoiceIssuedAt={
                        i.createdAt ? dayjs(i.createdAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm:ss') : ''
                      }
                      invoiceNumber={i.no}
                      invoiceName={i.options?.Result?.['BuyerName'] || ''}
                      invoicePhone={orderLog.invoiceOptions?.phone || ''}
                      invoiceEmail={i.options?.Result?.['BuyerEmail'] || ''}
                      invoiceTarget={
                        orderLog.invoiceOptions?.donationCode
                          ? formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetDonation)
                          : orderLog.invoiceOptions?.uniformNumber
                          ? formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetCompany)
                          : formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetIndividual)
                      }
                      donationCode={orderLog.invoiceOptions?.donationCode || ''}
                      invoiceCarrier={
                        orderLog.invoiceOptions?.phoneBarCode
                          ? formatMessage(saleMessages.OrderDetailDrawer.phoneBarCode)
                          : orderLog.invoiceOptions?.citizenCode
                          ? formatMessage(saleMessages.OrderDetailDrawer.citizenCode)
                          : ''
                      }
                      uniformNumber={i.options?.Result?.['BuyerUBN'] || ''}
                      uniformTitle={i.options?.Result?.['BuyerName'] || ''}
                      invoiceAddress={`${orderLog.invoiceOptions?.postCode || ''} ${
                        orderLog.invoiceOptions?.address || ''
                      }`}
                      invoiceComment={i.options?.Result?.Comment}
                      invoicePrice={i.price}
                      invoiceRandomNumber={i.options?.Result?.RandomNum || ''}
                      onClose={() => {
                        onClose()
                        orderDetailRefetch()
                      }}
                      invoiceGatewayId={company?.invoiceGatewayId}
                      companyUniformNumber={company?.companyUniformNumber}
                      executorName={orderLog.options?.executor?.name}
                      memberId={orderLog.memberId}
                      paymentMethod={paymentMethod}
                      invoiceCompanyName={company?.invoiceCompanyName}
                      companyAddress={company?.companyAddress}
                      companyPhone={company?.companyPhone}
                      isAccountReceivable={isAccountReceivable}
                      isMemberZeroTaxProperty={orderLog.invoiceOptions?.isMemberZeroTaxProperty}
                    />
                  ))
                )}

                <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.otherInfo)}</StyledTitle>
                {loadingOrderDetail && loadingSharingCode ? (
                  <Skeleton />
                ) : (
                  <OrderOtherInfoCard
                    country={`${orderLog.options?.country || ''}${
                      (orderLog.options?.countryCode && `(${orderLog.options?.countryCode})`) || ''
                    }`}
                    referrer={orderLog.invoiceOptions?.referrerEmail || ''}
                    sharingCode={sharingCodes.sharingCode}
                    sharingNote={sharingCodes.sharingNote}
                    orderLogExecutor={orderExecutors.map(v => `${v.name} - ${v.ratio}`).join('\\') || ''}
                    giftPlan={orderProducts.reduce(
                      (accu, orderProduct) => (orderProduct.options?.type === 'gift' ? accu + orderProduct.name : accu),
                      '',
                    )}
                    recipientName={
                      orderLog.shipping?.isOutsideTaiwanIsland === 'true' ? '' : orderLog.shipping?.name || ''
                    }
                    recipientPhone={
                      orderLog.shipping?.isOutsideTaiwanIsland === 'true' ? '' : orderLog.shipping?.phone || ''
                    }
                    recipientAddress={
                      orderLog.shipping?.isOutsideTaiwanIsland === 'true'
                        ? ''
                        : `${orderLog.shipping?.zipCode || ''}${orderLog.shipping?.city || ''}${
                            orderLog.shipping?.district || ''
                          }${orderLog.shipping?.address || ''}`
                    }
                  />
                )}
              </>
            ) : (
              <>
                {loadingOrderDetail ? (
                  <Skeleton />
                ) : (
                  <OrderCard
                    orderId={orderLogId || ''}
                    status={orderLog.status}
                    createdAt={dayjs(orderLog.createdAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm')}
                    name={orderLog.name}
                    email={orderLog.email}
                    totalPrice={currencyFormatter(totalPrice) || ''}
                    orderProducts={orderProducts}
                    orderDiscounts={orderDiscounts}
                    isManuallyIssueInvoice={orderLog.invoiceOptions?.skipIssueInvoice}
                  />
                )}
                <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.otherInfo)}</StyledTitle>
                {loadingOrderDetail && loadingSharingCode ? (
                  <Skeleton />
                ) : (
                  <OrderOtherInfoCard
                    country={`${orderLog.options?.country || ''}${
                      (orderLog.options?.countryCode && `(${orderLog.options?.countryCode})`) || ''
                    }`}
                    referrer={orderLog.invoiceOptions?.referrerEmail || ''}
                    sharingCode={sharingCodes.sharingCode}
                    sharingNote={sharingCodes.sharingNote}
                    orderLogExecutor={orderExecutors.map(v => `${v.name} - ${v.ratio}`).join('\\') || ''}
                    giftPlan={orderProducts.reduce(
                      (accu, orderProduct) => (orderProduct.options?.type === 'gift' ? accu + orderProduct.name : accu),
                      '',
                    )}
                    recipientName={
                      orderLog.shipping?.isOutsideTaiwanIsland === 'true' ? '' : orderLog.shipping?.name || ''
                    }
                    recipientPhone={
                      orderLog.shipping?.isOutsideTaiwanIsland === 'true' ? '' : orderLog.shipping?.phone || ''
                    }
                    recipientAddress={
                      orderLog.shipping?.isOutsideTaiwanIsland === 'true'
                        ? ''
                        : `${orderLog.shipping?.zipCode || ''}${orderLog.shipping?.city || ''}${
                            orderLog.shipping?.district || ''
                          }${orderLog.shipping?.address || ''}`
                    }
                  />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.invoiceInfo)}</StyledTitle>
                </div>
                {loadingOrderDetail ? (
                  <Skeleton />
                ) : (
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
                        ? formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetDonation)
                        : orderLog.invoiceOptions?.uniformNumber
                        ? formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetCompany)
                        : formatMessage(saleMessages.OrderDetailDrawer.invoiceTargetIndividual)
                    }
                    donationCode={orderLog.invoiceOptions?.donationCode || ''}
                    invoiceCarrier={
                      orderLog.invoiceOptions?.phoneBarCode
                        ? formatMessage(saleMessages.OrderDetailDrawer.phoneBarCode)
                        : orderLog.invoiceOptions?.citizenCode
                        ? formatMessage(saleMessages.OrderDetailDrawer.citizenCode)
                        : ''
                    }
                    uniformNumber={orderLog.invoiceOptions?.uniformNumber || ''}
                    uniformTitle={orderLog.invoiceOptions?.uniformTitle || ''}
                    invoiceAddress={`${orderLog.invoiceOptions?.postCode || ''} ${
                      orderLog.invoiceOptions?.address || ''
                    }`}
                    invoiceComment={orderLog.invoiceOptions?.invoiceComment}
                    invoiceGatewayId={company?.invoiceGatewayId}
                    isAccountReceivable={isAccountReceivable}
                  />
                )}
                <StyledTitle>{formatMessage(saleMessages.OrderDetailDrawer.paymentInfo)}</StyledTitle>
                {loadingOrderDetail ? (
                  <Skeleton />
                ) : (
                  <PaymentCard
                    payments={paymentLogs}
                    paymentMethod={paymentMethod}
                    order={orderLog}
                    onRefetch={() => {
                      onRefetch?.()
                      orderDetailRefetch()
                    }}
                  />
                )}
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

const useOrderDetail = (orderLogId: string | null) => {
  const {
    loading: loadingOrderDetail,
    error: errorOrderDetail,
    data: orderDetailData,
    refetch: orderDetailRefetch,
  } = useQuery<hasura.GetOrderDetail, hasura.GetOrderDetailVariables>(
    gql`
      query GetOrderDetail($orderLogId: String!) {
        order_log_by_pk(id: $orderLogId) {
          id
          status
          created_at
          expired_at
          member {
            id
            name
            email
            member_properties(where: { property: { name: { _eq: "會員類型" } } }) {
              value
            }
          }
          options
          invoice_options
          invoice_issued_at
          shipping
          invoice {
            no
            price
            created_at
            revoked_at
            options
          }
        }
        order_product(where: { order_id: { _eq: $orderLogId } }) {
          id
          price
          name
          options
        }
        order_discount(where: { order_id: { _eq: $orderLogId } }) {
          id
          price
          name
        }
        payment_log(where: { order_id: { _eq: $orderLogId } }) {
          no
          created_at
          status
          price
          gateway
          paid_at
          method
          custom_no
          options
          updated_at
        }
        order_executor(where: { order_id: { _eq: $orderLogId } }) {
          id
          ratio
          member {
            id
            name
          }
        }
      }
    `,
    { variables: { orderLogId: orderLogId || '' } },
  )

  const {
    loading: loadingSharingCode,
    error: errorSharingCode,
    data: sharingCodeData,
  } = useQuery<hasura.GetSharingCode, hasura.GetSharingCodeVariables>(
    gql`
      query GetSharingCode($paths: [String!]) {
        sharing_code(where: { path: { _in: $paths } }) {
          id
          code
          note
        }
      }
    `,
    {
      variables: {
        paths: orderDetailData?.order_product.map(v => v.options?.from).filter(path => path !== '') || [],
      },
    },
  )

  const orderLog: { memberId: string; memberType?: string } & Pick<
    OrderLog,
    | 'id'
    | 'status'
    | 'createdAt'
    | 'name'
    | 'email'
    | 'shipping'
    | 'options'
    | 'invoiceOptions'
    | 'invoiceIssuedAt'
    | 'expiredAt'
  > = {
    id: orderDetailData?.order_log_by_pk?.id || '',
    status: orderDetailData?.order_log_by_pk?.status || '',
    createdAt: orderDetailData?.order_log_by_pk?.created_at,
    name: orderDetailData?.order_log_by_pk?.member?.name || '',
    email: orderDetailData?.order_log_by_pk?.member?.email || '',
    shipping: orderDetailData?.order_log_by_pk?.shipping,
    options: orderDetailData?.order_log_by_pk?.options,
    invoiceOptions: orderDetailData?.order_log_by_pk?.invoice_options,
    invoiceIssuedAt: orderDetailData?.order_log_by_pk?.invoice_issued_at,
    expiredAt: orderDetailData?.order_log_by_pk?.expired_at,
    memberId: orderDetailData?.order_log_by_pk?.member?.id || '',
    memberType: orderDetailData?.order_log_by_pk?.member?.member_properties?.[0]?.value,
  }

  const orderProducts: Pick<OrderProduct, 'id' | 'name' | 'price' | 'options'>[] =
    orderDetailData?.order_product.map(v => ({
      id: v.id,
      name: v.name,
      price: v.price,
      options: v.options,
    })) || []

  const orderDiscounts: Pick<OrderDiscount, 'id' | 'price' | 'name'>[] =
    orderDetailData?.order_discount.map(v => ({
      id: v.id,
      price: v.price,
      name: v.name,
    })) || []

  const productPrice = sum(orderProducts.map(v => v.price))
  const discountPrice = sum(orderDiscounts.map(orderDiscount => orderDiscount.price))
  const shippingFee = orderLog.shipping?.fee || 0
  const totalPrice = Math.max(productPrice - discountPrice + shippingFee)

  const orderExecutors: {
    id: string
    ratio: number
    name: string
  }[] =
    orderDetailData?.order_executor.map(v => ({
      id: v.id,
      ratio: v.ratio,
      name: v.member.name,
    })) || []

  const sharingCodes: { sharingCode: string; sharingNote: string } = {
    sharingCode: sharingCodeData?.sharing_code?.map(v => v.code).join(', ') || '',
    sharingNote: sharingCodeData?.sharing_code?.map(v => v.code).join(', ') || '',
  }

  const paymentLogs: Pick<
    PaymentLog,
    'no' | 'status' | 'price' | 'gateway' | 'paidAt' | 'options' | 'method' | 'updatedAt'
  >[] =
    orderDetailData?.payment_log
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      .map(v => ({
        no: v.no,
        status: v.status || '',
        price: v.price,
        gateway: v.gateway || '',
        paidAt: v.paid_at,
        options: v.options,
        method: v.method || '',
        updatedAt: new Date(v.updated_at),
      })) || []

  const invoices =
    orderDetailData?.order_log_by_pk?.invoice.map(i => ({
      no: i.no,
      price: i.price,
      createdAt: i.created_at,
      revokedAt: i.revoked_at,
      options: i.options,
    })) || []

  const paymentMethod: string = !loadingOrderDetail
    ? paymentMethodFormatter(paymentLogs[0]?.method) || orderLog.options?.paymentMethod || ''
    : ''

  return {
    loadingOrderDetail,
    loadingSharingCode,
    errorOrderDetail,
    errorSharingCode,
    orderLog,
    sharingCodes,
    orderProducts,
    orderDiscounts,
    totalPrice,
    orderExecutors,
    paymentLogs,
    invoices,
    orderDetailRefetch,
    paymentMethod,
  }
}

export default OrderDetailDrawer
