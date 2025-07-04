import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, Select } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { memberAccountReceivableAvailable, paymentMethodFormatter } from '../../helpers'
import { useMutateOrderProduct } from '../../hooks/orderProduct'
import { useOrderReceivableStatusQuery } from '../../hooks/orderReceivable'
import { PaymentCompany } from '../../pages/NewMemberContractCreationPage/MemberContractCreationForm'
import { OrderLog, PaymentLog } from '../../types/general'
import AdminModal from '../admin/AdminModal'
import ModifyOrderStatusModal from './ModifyOrderStatusModal'
import saleMessages from './translation'

dayjs.extend(timezone)
dayjs.extend(utc)

const currentTimeZone = dayjs.tz.guess()

const StyledCard = styled.div`
  padding: 16px;
  border-radius: 4px;
  border: solid 1px #ececec;
  margin-bottom: 16px;
`

const StyledInfoTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.2px;
  width: 35%;
`

const StyledInfoMessage = styled.div`
  width: 65%;
`

const PaymentCard: React.FC<{
  payments: Pick<PaymentLog, 'no' | 'status' | 'price' | 'gateway' | 'paidAt' | 'options' | 'method'>[]
  paymentMethod: string
  order: Pick<
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
  > & { memberType?: string }
  onRefetch?: () => void
}> = ({ payments, paymentMethod: checkoutMethod, order, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { settings, id: appId, enabledModules } = useApp()
  const paymentCompanies: { paymentCompanies: PaymentCompany[] } = JSON.parse(settings['custom'] || '{}')
  const permissionGroupId = paymentCompanies?.paymentCompanies?.find(
    c => order.options?.company && c.companies.map(c => c.name).includes(order.options?.company),
  )?.permissionGroupId
  const paymentGateway = paymentCompanies?.paymentCompanies
    ?.find(c => order.options?.company && c.companies.map(c => c.name).includes(order.options?.company))
    ?.companies?.find(c => c.name === order.options?.company)?.paymentGateway

  const { permissions } = useAuth()
  const [loading, setLoading] = useState(false)
  const [cardReaderResponse, setCardReaderResponse] = useState<{
    status: 'success' | 'failed'
    message: string
  } | null>(null)
  const [isOpenChangePaymentMethodModal, setIsOpenChangePaymentMethodModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [updatePaymentMethod] = useMutation<hasura.UpdatePaymentMethod, hasura.UpdatePaymentMethodVariables>(gql`
    mutation UpdatePaymentMethod($paymentNo: String!, $method: String, $gateway: String!) {
      update_payment_log(where: { no: { _eq: $paymentNo } }, _set: { method: $method, gateway: $gateway }) {
        affected_rows
      }
    }
  `)
  const { loading: loadingOrderReceivableStatus, isAccountReceivable } = useOrderReceivableStatusQuery(order.id)
  const [isAccountsReceivableChecked, setAccountsReceivableChecked] = useState(
    loadingOrderReceivableStatus ? false : isAccountReceivable,
  )
  const { deliverOrderProductForOrder } = useMutateOrderProduct()

  const isAccountReceivableAvailable = order?.memberType ? memberAccountReceivableAvailable(order.memberType) : false

  const handleCardReaderSerialport = async (price: number, orderId: string, paymentNo: string, method: string) => {
    if (!settings['pos_serialport.config']) {
      return alert(formatMessage(saleMessages.PaymentCard.posCardError))
    }

    const parseConfigs: { permissionGroupId: string; type: string; targetUrl: string; targetPath: string }[] =
      JSON.parse(settings['pos_serialport.config'])
    const config = parseConfigs.find(c => c.permissionGroupId === permissionGroupId && c.type === method)

    if (!config || !config.targetUrl || !config.targetPath) {
      return alert(formatMessage(saleMessages.PaymentCard.posCardErrorDetail))
    }
    setLoading(true)
    axios
      .post(`${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/payment/${appId}/card-reader`, {
        price,
        orderId,
        paymentNo,
        targetUrl: config.targetUrl,
        targetPath: config.targetPath,
      })
      .then(res => {
        if (res.data.message === 'success') {
          setCardReaderResponse({ status: 'success', message: formatMessage(saleMessages.PaymentCard.paymentSuccess) })
        }
      })
      .catch(err => {
        console.log({ err })
        setCardReaderResponse({
          status: 'failed',
          message: `${formatMessage(saleMessages.PaymentCard.paymentFailure)}${
            err.response.data.message.split('Internal Server Error: ')[1] || err.response.data.message
          }`,
        })
      })
      .finally(() => {
        setLoading(false)
        onRefetch?.()
      })
  }

  const changeCheckoutMethod = async (paymentNo: string, gateway: string, method?: string) => {
    try {
      await updatePaymentMethod({ variables: { paymentNo, gateway, method } })
      if (isAccountsReceivableChecked) {
        await deliverOrderProductForOrder({ variables: { orderId: order.id } })
        setAccountsReceivableChecked(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsOpenChangePaymentMethodModal(false)
      onRefetch?.()
    }
  }
  const paymentCheck = payments.map(payment => payment.options?.bankAccountInfo)
  const bankAccountMessage =
    paymentCheck && paymentCheck.filter(Boolean).length > 0 ? paymentCheck.filter(Boolean)[0] : ''

  return (
    <>
      {payments
        .sort((a, b) => Number(a.no[a.no.length - 1]) - Number(b.no[b.no.length - 1]))
        .map((payment, index) => {
          const contentList =
            settings['payment.v2'] === '1'
              ? [
                  {
                    title: formatMessage(saleMessages.PaymentCard.paymentStatus),
                    message: payment.status,
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.paidAt),
                    message: payment.paidAt ? dayjs(payment.paidAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm') : '',
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.paymentNo),
                    message: payment.no,
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.price),
                    message: payment.price.toLocaleString(),
                    isRender: true,
                  },

                  {
                    title: formatMessage(saleMessages.PaymentCard.checkoutMethod),
                    message: payment.gateway.includes('spgateway')
                      ? '藍新'
                      : paymentMethodFormatter(payment.method || payment.gateway),
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.paymentMode),
                    message: order.options?.paymentMode || '',
                    isRender: true,
                  },
                  ...(checkoutMethod === '銀行匯款'
                    ? [
                        {
                          title: formatMessage(saleMessages.PaymentCard.receivingAccount),
                          message: bankAccountMessage,
                          isRender: true,
                        },
                      ]
                    : []),
                  ...(enabledModules.account_receivable
                    ? [
                        {
                          title: formatMessage(saleMessages.PaymentCard.accountsReceivable),
                          message: isAccountReceivable ? '是' : '否',
                          isRender: true,
                        },
                      ]
                    : []),
                ]
              : [
                  {
                    title: formatMessage(saleMessages.PaymentCard.paymentStatus),
                    message: payment.status,
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.paidAt),
                    message: payment.paidAt ? dayjs(payment.paidAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm') : '',
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.paymentNo),
                    message: payment.no,
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.price),
                    message: payment.price.toLocaleString(),
                    isRender: true,
                  },
                  {
                    title: formatMessage(saleMessages.PaymentCard.gateway),
                    message: payment.gateway,
                    isRender: true,
                  },
                ]
          return (
            <StyledCard key={payment.no}>
              <div className="container">
                {contentList.map((row, idx) =>
                  row.isRender ? (
                    <div className="row mb-2 justify-content-between" key={idx}>
                      <StyledInfoTitle className="column">{row.title}</StyledInfoTitle>
                      <StyledInfoMessage className="column">{row.message}</StyledInfoMessage>
                    </div>
                  ) : null,
                )}

                {!!order.options?.installmentPlans && (
                  <div className="row mb-2 justify-content-between">
                    <StyledInfoTitle className="column">
                      {formatMessage(saleMessages.PaymentCard.amount)}
                    </StyledInfoTitle>
                    <StyledInfoMessage className="column">
                      {order.options?.paymentMode === '訂金+尾款'
                        ? order.options?.installmentPlans?.filter(plan => plan.price === payment.price)[0]?.index === 1
                          ? '訂金'
                          : `尾款`
                        : order.options?.installmentPlans?.filter(plan => plan.price === payment.price)[0]?.index === 1
                        ? '頭期'
                        : `${
                            order.options?.installmentPlans?.filter(plan => plan.price === payment.price)[0]?.index
                          } 期`}
                    </StyledInfoMessage>
                  </div>
                )}
                {!!order.options?.installmentPlans && (
                  <div className="row mb-2 justify-content-between">
                    <StyledInfoTitle className="column">
                      {formatMessage(saleMessages.PaymentCard.paymentDeadline)}
                    </StyledInfoTitle>
                    <StyledInfoMessage className="column">
                      {order.options?.paymentMode === '訂金+尾款' &&
                      order.options?.installmentPlans?.filter(plan => plan.price === payment.price)[0]?.index === 2
                        ? dayjs(order.expiredAt).format('YYYY-MM-DD HH:mm')
                        : order.options?.installmentPlans?.find(plan => plan.price === payment.price)?.endedAt &&
                          dayjs(
                            order.options?.installmentPlans?.find(plan => plan.price === payment.price)?.endedAt,
                          ).format('YYYY-MM-DD HH:mm')}
                    </StyledInfoMessage>
                  </div>
                )}
                {!!payment.options?.bankCode && (
                  <div className="row mb-2 justify-content-between">
                    <StyledInfoTitle className="column">
                      {formatMessage(saleMessages.PaymentCard.bankLastFiveDigits)}
                    </StyledInfoTitle>
                    <StyledInfoMessage className="column">{payment.options?.bankCode}</StyledInfoMessage>
                  </div>
                )}

                {settings['payment.v2'] === '1' &&
                  permissions['MODIFY_MEMBER_PAYMENT_STATUS'] &&
                  ['UNPAID', 'FAILED'].includes(payment.status) &&
                  !payment.gateway.includes('spgateway') &&
                  payment.method !== 'physicalCredit' &&
                  payment.method !== 'physicalRemoteCredit' && (
                    <ModifyOrderStatusModal
                      renderTrigger={({ setVisible }) => (
                        <Button size="middle" className="mr-2" onClick={() => setVisible(true)}>
                          {formatMessage(saleMessages.PaymentCard.changeTransactionStatus)}
                        </Button>
                      )}
                      orderLogId={order.id}
                      defaultOrderStatus={order.status}
                      paymentLogs={payments}
                      totalPrice={payment.price}
                      minPrice={payment.price}
                      onRefetch={onRefetch}
                      canModifyOperations={['paid']}
                      targetPaymentNo={payment.no}
                      showBankAccountSelect={true}
                    />
                  )}

                {enabledModules.card_reader &&
                  ['UNPAID', 'FAILED'].includes(payment.status) &&
                  payment.gateway === 'physical' &&
                  (payment.method === 'physicalCredit' || payment.method === 'physicalRemoteCredit') && (
                    <Button
                      disabled={loading}
                      loading={loading}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => handleCardReaderSerialport(payment.price, order.id, payment.no, payment.method)}
                    >
                      <div>{payment.method === 'physicalCredit' ? '實體刷卡' : '遠端輸入卡號'}</div>
                    </Button>
                  )}

                {settings['payment.v2'] === '1' && (
                  <Button
                    disabled={loading}
                    loading={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => {
                      setIsOpenChangePaymentMethodModal(true)
                      setPaymentMethod(paymentMethodFormatter(payment.method, payment.gateway)) // 傳入 gateway
                    }}
                  >
                    <div>{formatMessage(saleMessages.PaymentCard.changeCheckoutMethod)}</div>
                  </Button>
                )}
              </div>
              <AdminModal
                visible={isOpenChangePaymentMethodModal}
                title={formatMessage(saleMessages.PaymentCard.changeCheckoutMethod)}
                footer={
                  <div>
                    <Button
                      onClick={async () => {
                        const gateway = paymentMethod === '藍新' ? paymentGateway || '' : 'physical'
                        const method =
                          paymentMethod === '現金'
                            ? 'cash'
                            : paymentMethod === '銀行匯款'
                            ? 'bankTransfer'
                            : paymentMethod === '實體刷卡'
                            ? 'physicalCredit'
                            : paymentMethod === '遠端輸入卡號'
                            ? 'physicalRemoteCredit'
                            : undefined

                        changeCheckoutMethod(payment.no, gateway, method)
                      }}
                    >
                      {formatMessage(saleMessages.PaymentCard.change)}
                    </Button>
                  </div>
                }
                onCancel={() => {
                  setIsOpenChangePaymentMethodModal(false)
                }}
              >
                {formatMessage(saleMessages.PaymentCard.checkoutMethod)}
                <Select
                  defaultValue={paymentMethod || ''}
                  onChange={e => {
                    setPaymentMethod(e)
                  }}
                  style={{ width: '100%' }}
                >
                  {[
                    { value: '藍新' },
                    { value: '現金' },
                    { value: '銀行匯款' },
                    { value: '實體刷卡' },
                    { value: '遠端輸入卡號' },
                  ].map(payment => (
                    <Select.Option value={payment.value} key={payment.value}>
                      {payment.value}
                    </Select.Option>
                  ))}
                </Select>
                {enabledModules.account_receivable && (
                  <Checkbox
                    style={{ marginTop: '1rem' }}
                    checked={isAccountsReceivableChecked}
                    disabled={!isAccountReceivableAvailable || isAccountReceivable}
                    onChange={e => {
                      const isChecked = e.target.checked
                      setAccountsReceivableChecked(isChecked)
                    }}
                  >
                    {formatMessage(saleMessages.PaymentCard.accountsReceivable)}
                  </Checkbox>
                )}
              </AdminModal>
            </StyledCard>
          )
        })}
      <AdminModal
        visible={!!cardReaderResponse}
        title={formatMessage(saleMessages.PaymentCard.cardResult)}
        footer={null}
        onCancel={() => {
          setCardReaderResponse(null)
        }}
      >
        <div>
          <div>{cardReaderResponse?.message}</div>
        </div>
      </AdminModal>
    </>
  )
}
export default PaymentCard
