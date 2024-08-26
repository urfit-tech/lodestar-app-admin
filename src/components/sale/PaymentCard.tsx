import { Button } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
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
  order: Pick<
    OrderLog,
    'id' | 'status' | 'createdAt' | 'name' | 'email' | 'shipping' | 'options' | 'invoiceOptions' | 'invoiceIssuedAt'
  >
  onRefetch?: () => void
  onClose: () => void
}> = ({ payments, order, onRefetch, onClose }) => {
  const { formatMessage } = useIntl()
  const { settings, id: appId, enabledModules } = useApp()
  const { permissions } = useAuth()
  const [loading, setLoading] = useState(false)
  const [cardReaderResponse, setCardReaderResponse] = useState<{
    status: 'success' | 'failed'
    message: string
  } | null>(null)

  const handleCardReaderSerialport = async (price: number, orderId: string, paymentNo: string) => {
    if (!settings['pos_serialport.target_url'] || !settings['pos_serialport.target_path']) {
      return alert('target url or path not found')
    }
    setLoading(true)
    axios
      .post(`${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/payment/${appId}/card-reader`, {
        price,
        orderId,
        paymentNo,
      })
      .then(res => {
        if (res.data.message === 'success') {
          setCardReaderResponse({ status: 'success', message: '付款成功，請重整確認訂單狀態' })
        }
      })
      .catch(err => {
        console.log({ err })
        setCardReaderResponse({
          status: 'failed',
          message: `付款失敗，原因：${
            err.response.data.message.split('Internal Server Error: ')[1] || err.response.data.message
          }`,
        })
      })
      .finally(() => {
        setLoading(false)
        onRefetch?.()
      })
  }
  return (
    <>
      {payments
        .sort((a, b) => Number(a.no[a.no.length - 1]) - Number(b.no[b.no.length - 1]))
        .map((payment, index) => {
          const contentList = [
            { title: formatMessage(saleMessages.PaymentCard.paymentStatus), message: payment.status, isRender: true },
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
              title: '結帳管道',
              message:
                payment.gateway === 'spgateway'
                  ? '藍新'
                  : payment.gateway === 'physical'
                  ? '實體'
                  : payment.gateway || '',
              isRender: true,
            },
            {
              title: '付款方式',
              message:
                payment.method === 'cash'
                  ? '現金'
                  : payment.method === 'bankTransfer'
                  ? '銀行匯款'
                  : payment.method === 'physicalCredit'
                  ? '實體刷卡'
                  : payment.method || '',
              isRender: true,
            },
            {
              title: '付款模式',
              message: order.options?.paymentMode || '',
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
                    <StyledInfoTitle className="column">款項</StyledInfoTitle>
                    <StyledInfoMessage className="column">
                      {order.options?.paymentMode === '訂金+尾款'
                        ? order.options?.installmentPlans?.filter(plan => plan.price === payment.price)[0]?.index === 1
                          ? '訂金'
                          : '尾款'
                        : order.options?.installmentPlans?.filter(plan => plan.price === payment.price)[0]?.index === 1
                        ? '頭期'
                        : `${
                            order.options?.installmentPlans?.filter(plan => plan.price === payment.price)[0]?.index
                          } 期`}
                    </StyledInfoMessage>
                  </div>
                )}
                {!!payment.options?.bankCode && (
                  <div className="row mb-2 justify-content-between">
                    <StyledInfoTitle className="column">銀行後五碼</StyledInfoTitle>
                    <StyledInfoMessage className="column">{payment.options?.bankCode}</StyledInfoMessage>
                  </div>
                )}
                {permissions['MODIFY_MEMBER_PAYMENT_STATUS'] &&
                  ['UNPAID', 'FAILED'].includes(payment.status) &&
                  payment.gateway !== 'spgateway' &&
                  payment.method !== 'physicalCredit' && (
                    <ModifyOrderStatusModal
                      renderTrigger={({ setVisible }) => (
                        <Button size="middle" className="mr-2" onClick={() => setVisible(true)}>
                          變更訂單狀態
                        </Button>
                      )}
                      orderLogId={order.id}
                      defaultOrderStatus={order.status}
                      paymentLogs={payments}
                      defaultPrice={payment.price}
                      minPrice={payment.price}
                      onRefetch={onRefetch}
                      hideRefund
                      targetPaymentNo={payment.no}
                    />
                  )}
                {enabledModules.card_reader &&
                  ['UNPAID', 'FAILED'].includes(payment.status) &&
                  payment.gateway === 'physical' &&
                  payment.method === 'physicalCredit' && (
                    <Button
                      disabled={loading}
                      loading={loading}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => handleCardReaderSerialport(payment.price, order.id, payment.no)}
                    >
                      <div>實體刷卡</div>
                    </Button>
                  )}
              </div>
            </StyledCard>
          )
        })}
      <AdminModal
        visible={!!cardReaderResponse}
        title="實體刷卡結果"
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
