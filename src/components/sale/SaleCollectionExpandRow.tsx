import { ApolloClient, gql, useApolloClient, useMutation } from '@apollo/client'
import { Button, Divider, message, Skeleton, Switch } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import TokenTypeLabel from 'lodestar-app-element/src/components/labels/TokenTypeLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter, dateRangeFormatter, handleError } from '../../helpers'
import { useOrderLogExpandRow } from '../../hooks/order'
import AdminModal from '../admin/AdminModal'
import ProductTypeLabel from '../common/ProductTypeLabel'
import ShippingMethodLabel from '../common/ShippingMethodLabel'
import ModifyOrderStatusModal from './ModifyOrderStatusModal'
import OrderDetailDrawer from './OrderDetailDrawer'
import { OrderLogColumn } from './SaleCollectionAdminCard'
import SubscriptionCancelModal from './SubscriptionCancelModal'
import saleMessages from './translation'

dayjs.extend(utc)
dayjs.extend(timezone)
const currentTimeZone = dayjs.tz.guess()

const StyledRowWrapper = styled.div<{ isDelivered: boolean }>`
  color: ${props => !props.isDelivered && '#CDCDCD'};
`

const SaleCollectionExpandRow = ({
  record,
  onRefetchOrderLog,
}: {
  record: OrderLogColumn
  onRefetchOrderLog?: () => void
}) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const { currentUserRole, permissions } = useAuth()
  const [currentOrderLogId, setCurrentOrderLogId] = useState<string | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const receiptRef1 = useRef<HTMLDivElement | null>(null)
  const receiptRef2 = useRef<HTMLDivElement | null>(null)
  const receiptRef3 = useRef<HTMLDivElement | null>(null)
  const [posResponse, setPosResponse] = useState('')

  const orderLogId = record.id
  const orderStatus = record.status
  const totalPrice = record.totalPrice

  const {
    loadingExpandRowOrderLog,
    loadingExpandRowOrderProduct,
    loadingOrderExecutors,
    loadingPaymentLogByOrderId,
    loadingOrderDiscountByOrderId,
    orderLog,
    orderProducts,
    orderExecutors,
    paymentMethod,
    paymentLogs,
    orderDiscounts,
    refetchExpandRowOrderProduct,
  } = useOrderLogExpandRow(orderLogId)

  const handlePrint = () => {
    setShowInvoice(true)

    setTimeout(() => {
      const printContents = window.document.getElementById('print-content')?.innerHTML
      const WinPrint = window.open('', '', 'width=900,height=650')
      WinPrint?.document.write('<html><head><title>Print</title>')
      WinPrint?.document.write('<style>')
      WinPrint?.document.write(`
        body {
        margin:0;
        padding:0;}
      @media print {
        .page-break {
          page-break-before: always;
        }
      }
    `)
      WinPrint?.document.write('</style></head><body>')
      WinPrint?.document.write(printContents || '')
      WinPrint?.document.write('</body></html>')

      WinPrint?.document.close()
      WinPrint?.focus()
      WinPrint?.print()
      WinPrint?.close()
      setShowInvoice(false)
    }, 500)
  }

  // 計算LRC（異或所有數據字節和ETX，STX不包括）
  const calculateLRC = (data: any) => {
    let lrc = 0
    for (let i = 0; i < data.length; i++) {
      lrc ^= data.charCodeAt(i)
    }
    return String.fromCharCode(lrc)
  }
  // 構建消息
  const createMessage = (data: any) => {
    const STX = String.fromCharCode(0x02)
    const ETX = String.fromCharCode(0x03)
    const lrc = calculateLRC(data + ETX)
    return `${STX}${data}${ETX}${lrc}`
  }

  const handleCardReaderSerialport = async () => {
    if (settings['pos_serialport.browser.enable'] === '1') {
      let port: any
      let writer: any
      let reader
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      // 發送消息並等待回應
      const sendMessage = async (message: string) => {
        if (!writer) {
          writer = port.writable.getWriter()
        }
        await writer.write(encoder.encode(message))
        console.log('Message sent: ', message)
      }

      // 讀取循環
      const readLoop = async () => {
        reader = port.readable.getReader()
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) {
              console.log('Reader has been canceled')
              break
            }
            const decodedValue = decoder.decode(value)
            console.log('Received data: ', decodedValue)
            if (decodedValue.length >= 400) {
              setPosResponse(decodedValue)
              break
            }
          }
        } catch (error) {
          console.error('Read error:', error)
        } finally {
          reader.releaseLock()
        }
      }

      // 連接到串口
      try {
        port = await (navigator as any).serial.requestPort()
        await port.open({ baudRate: 9600 })
        console.log('Serial port opened')
        readLoop()
        // 存儲連接狀態
      } catch (error) {
        console.error('Connection failed:', error)
      }

      try {
        const requestData =
          'I.......01N...............................000000000100200630124550.............................................' +
          '....SN0001PN0001000001.................................................................................................' +
          '...........................................................................................................................................' +
          '...............................'
        const requestMessage = createMessage(requestData)
        await sendMessage(requestMessage)
      } catch (error) {
        console.error('Send Message failed:', error)
      }
    } else {
      if (!settings['pos_serialport.target_url'] || !settings['pos_serialport.target_path']) {
        return alert('target url or path not found')
      }
      axios
        .post(settings['pos_serialport.target_url'], {
          message:
            'I160407.01N03000002493817******1213.......000000000100200630124550093224....' +
            '00006601000081.....13995512..........................................................................................' +
            '...................02000002....................................493817YqcxU1MBel2x/jPwK3M+9P03' +
            'vgABsTGUeVLYDsm/vSM=........123.........................................................................' +
            '..........0',
          path: settings['pos_serialport.target_path'],
        })
        .then(res => {
          console.log(res.data)
          setPosResponse(res.data)
        })
    }
  }
  return (
    <div>
      {loadingExpandRowOrderProduct ? (
        <Skeleton />
      ) : (
        <div>
          {orderProducts
            .filter(orderProduct => orderProduct.type !== 'Token')
            .map(orderProduct => {
              const isDelivered: boolean = !!orderProduct.deliveredAt
              return (
                <StyledRowWrapper key={orderProduct.id} isDelivered={isDelivered}>
                  <div className="row">
                    <div className="col-2">
                      <ProductTypeLabel productType={orderProduct.type} />
                    </div>
                    <div className="col-7">
                      <span>{orderProduct.name}</span>
                      {orderProduct.endedAt && orderProduct.type !== 'AppointmentPlan' ? (
                        <span className="ml-2">
                          {`(${dayjs(orderProduct.endedAt)
                            .tz(currentTimeZone)
                            .format('YYYY-MM-DD HH:mm:ss')} ${formatMessage(
                            saleMessages.SaleCollectionExpandRow.productExpired,
                          )})`}
                        </span>
                      ) : null}
                      {orderProduct.startedAt && orderProduct.endedAt && orderProduct.type === 'AppointmentPlan' ? (
                        <span>
                          {`(${dateRangeFormatter({
                            startedAt: orderProduct.startedAt,
                            endedAt: orderProduct.endedAt,
                            dateFormat: 'YYYY-MM-DD',
                          })})`}
                        </span>
                      ) : null}
                      {orderProduct.quantity ? <span>{` X ${orderProduct.quantity} `}</span> : null}
                    </div>
                    <div className="col-3 d-flex justify-content-between">
                      <div>
                        {(currentUserRole === 'app-owner' || Boolean(permissions.MODIFY_MEMBER_ORDER_EQUITY)) &&
                        settings['feature.modify_order_status.enabled'] === '1' ? (
                          <ModifyOrderDeliveredModal
                            orderProduct={orderProduct}
                            loading={loadingExpandRowOrderProduct}
                            onRefetch={refetchExpandRowOrderProduct}
                          />
                        ) : null}
                      </div>
                      <div>
                        {currencyFormatter(
                          orderProduct.type === 'MerchandiseSpec' && orderProduct?.currencyId === 'LSC'
                            ? orderProduct.currencyPrice
                            : orderProduct.price,
                          orderProduct?.currencyId,
                          settings['coin.unit'],
                        )}
                      </div>
                    </div>
                  </div>
                  <Divider />
                </StyledRowWrapper>
              )
            })}

          {orderProducts
            .filter(orderProduct => orderProduct.type === 'Token')
            .map(orderProduct => {
              return (
                <StyledRowWrapper key={orderProduct.id} isDelivered={!!orderProduct.deliveredAt}>
                  <div className="row">
                    <div className="col-2">
                      <TokenTypeLabel tokenType="GiftPlan" />
                    </div>
                    <div className="col-7">
                      <span>{orderProduct.name}</span>
                    </div>
                    <div className="col-3 d-flex justify-content-between">
                      <div>
                        {(currentUserRole === 'app-owner' || Boolean(permissions.MODIFY_MEMBER_ORDER_EQUITY)) &&
                        settings['feature.modify_order_status.enabled'] === '1' ? (
                          <ModifyOrderDeliveredModal
                            orderProduct={orderProduct}
                            loading={loadingExpandRowOrderProduct}
                            onRefetch={refetchExpandRowOrderProduct}
                          />
                        ) : null}
                      </div>
                      <div>{currencyFormatter(orderProduct.price, orderProduct.currencyId)}</div>
                    </div>
                    <Divider />
                  </div>
                </StyledRowWrapper>
              )
            })}
        </div>
      )}

      <div className="row">
        {loadingOrderExecutors ||
        loadingExpandRowOrderLog ||
        loadingPaymentLogByOrderId ||
        loadingExpandRowOrderProduct ||
        loadingOrderDiscountByOrderId ? (
          <Skeleton />
        ) : (
          <>
            <div className="col-3" style={{ fontSize: '14px' }}>
              {orderExecutors.length !== 0 && permissions['SALES_RECORDS_DETAILS'] ? (
                <div>承辦人：{orderExecutors.map(orderExecutor => orderExecutor.ratio).join('、')}</div>
              ) : null}
              {paymentMethod && permissions['SALES_RECORDS_DETAILS'] ? <div>付款方式：{paymentMethod}</div> : null}
              {orderLog.expiredAt && permissions['SALES_RECORDS_DETAILS'] && (
                <div>付款期限：{dayjs(orderLog.expiredAt).tz(currentTimeZone).format('YYYY-MM-DD')}</div>
              )}
            </div>

            <div className="col-9">
              {orderLog.shipping?.shippingMethod && typeof orderLog.shipping?.fee === 'number' ? (
                <div className="row text-right">
                  <div className="col-9">
                    <ShippingMethodLabel shippingMethodId={orderLog.shipping.shippingMethod} />
                  </div>
                  <div className="col-3">{currencyFormatter(orderLog.shipping.fee || 0)}</div>
                </div>
              ) : null}
              {orderDiscounts.map(orderDiscount => (
                <div className="row text-right">
                  <div className="col-9">
                    {orderDiscount.name}
                    {(orderDiscount.type === 'Coupon' || orderDiscount.type === 'Voucher') && (
                      <DiscountCode type={orderDiscount.type} target={orderDiscount.target} />
                    )}
                  </div>
                  <div className="col-3">
                    -{' '}
                    {currencyFormatter(
                      orderProducts.length === 1 &&
                        orderProducts[0].type === 'MerchandiseSpec' &&
                        orderProducts[0]?.currencyId === 'LSC'
                        ? orderDiscount?.coins
                        : orderDiscount.price,
                      orderProducts.length === 1 &&
                        orderProducts[0].type === 'MerchandiseSpec' &&
                        orderDiscount.type === 'Coin'
                        ? 'LSC'
                        : orderDiscount.type,
                      settings['coin.unit'],
                    )}
                  </div>
                </div>
              ))}

              <div className="row align-items-center">
                <div className="col-9 text-right">{formatMessage(saleMessages.SaleCollectionExpandRow.totalPrice)}</div>
                <div className="col-3 text-right">{currencyFormatter(totalPrice)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="row col-12 align-items-center pt-3">
        <OrderDetailDrawer
          orderLogId={currentOrderLogId}
          onClose={() => setCurrentOrderLogId(null)}
          renderTrigger={() => (
            <Button type="primary" size="middle" className="mr-2" onClick={() => setCurrentOrderLogId(orderLogId)}>
              {formatMessage(saleMessages.OrderDetailDrawer.orderDetail)}
            </Button>
          )}
        />
        {currentUserRole === 'app-owner' && settings['feature.modify_order_status.enabled'] === '1' && (
          <ModifyOrderStatusModal
            orderLogId={orderLogId}
            defaultOrderStatus={orderStatus}
            paymentLogs={paymentLogs}
            defaultPrice={totalPrice}
            onRefetch={onRefetchOrderLog}
          />
        )}
        {currentUserRole === 'app-owner' &&
          orderProducts.some(v =>
            ['ProgramPlan', 'ProjectPlan', 'PodcastPlan', 'ProgramPackagePlan'].includes(v.type),
          ) &&
          (orderProducts.some(v => v?.unsubscribedAt) ? (
            <span style={{ color: '#9b9b9b', fontSize: '14px' }}>
              {formatMessage(saleMessages.SaleCollectionExpandRow.cancelSubscriptionDate, {
                date: dateFormatter(orderProducts.find(v => v?.unsubscribedAt)?.unsubscribedAt),
              })}
            </span>
          ) : (
            <SubscriptionCancelModal
              orderProducts={orderProducts.map(orderProduct => ({
                id: orderProduct.id,
                options: orderProduct.options,
              }))}
              onRefetch={refetchExpandRowOrderProduct}
            />
          ))}

        <Button
          onClick={() => {
            handlePrint()
          }}
        >
          列印發票
        </Button>
        {showInvoice && (
          <div id="print-content" style={{ display: 'none' }}>
            <div className="no-break">
              <Receipt ref={receiptRef1} template={JSON.parse(settings['invoice.template'])?.main || ''} />
            </div>
            <div className="page-break"></div>
            <div className="no-break">
              <Receipt ref={receiptRef2} template={JSON.parse(settings['invoice.template'])?.detail1 || ''} />
            </div>
            <div className="page-break"></div>
            <div className="no-break">
              <Receipt ref={receiptRef3} template={JSON.parse(settings['invoice.template'])?.detail2 || ''} />
            </div>
          </div>
        )}

        <Button
          className="ml-2"
          onClick={() => {
            handleCardReaderSerialport()
          }}
        >
          實體刷卡
        </Button>
      </div>
    </div>
  )
}
const Receipt = React.forwardRef<HTMLDivElement, { template: string }>((props, ref) => {
  const { template } = props
  return (
    <div className="receipt" ref={ref as any}>
      <div
        dangerouslySetInnerHTML={{
          __html: template,
        }}
      />
    </div>
  )
})

const ModifyOrderDeliveredModal: React.VFC<{
  orderProduct: {
    id: string
    type: string
    deliveredAt: Date | null
    name: string
    startedAt: Date | null
    endedAt: Date | null
    price: number
    currencyId: string
    currencyPrice: number
    quantity: number
  }
  loading: boolean
  onRefetch?: () => void
}> = ({ orderProduct, loading, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateOrderProductDeliver] = useMutation<
    hasura.UPDATE_ORDER_PRODUCT_DELIVERED_AT,
    hasura.UPDATE_ORDER_PRODUCT_DELIVERED_ATVariables
  >(UPDATE_ORDER_PRODUCT_DELIVERED_AT)

  return (
    <AdminModal
      title={
        orderProduct.deliveredAt
          ? formatMessage(saleMessages.SaleCollectionExpandRow.removeEquity)
          : formatMessage(saleMessages.SaleCollectionExpandRow.openEquity)
      }
      renderTrigger={({ setVisible }) => (
        <div className="d-flex align-items-center">
          <span className="mr-2">{formatMessage(saleMessages.SaleCollectionExpandRow.deliver)}</span>
          <Switch checked={!!orderProduct.deliveredAt} onChange={() => setVisible(true)} />
        </div>
      )}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div className="mt-4">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(saleMessages['*'].cancel)}
          </Button>
          <Button
            type="primary"
            danger={!!orderProduct.deliveredAt}
            loading={loading}
            onClick={async () =>
              await updateOrderProductDeliver({
                variables: {
                  orderProductId: orderProduct.id,
                  deliveredAt: orderProduct.deliveredAt ? null : new Date(),
                },
              })
                .then(() => {
                  setVisible(false)
                  onRefetch?.()
                  message.success(formatMessage(saleMessages.SaleCollectionExpandRow.updateEquitySuccessfully))
                })
                .catch(handleError)
            }
          >
            {orderProduct.deliveredAt
              ? formatMessage(saleMessages.SaleCollectionExpandRow.remove)
              : formatMessage(saleMessages.SaleCollectionExpandRow.open)}
          </Button>
        </div>
      )}
    >
      <div>
        {orderProduct.deliveredAt
          ? formatMessage(saleMessages.SaleCollectionExpandRow.removeEquityWarning, {
              productName: orderProduct.name,
            })
          : formatMessage(saleMessages.SaleCollectionExpandRow.openEquityWarning, {
              productName: orderProduct.name,
            })}
      </div>
    </AdminModal>
  )
}

const DiscountCode: React.VFC<{ type: 'Coupon' | 'Voucher'; target: string }> = ({ type, target }) => {
  const apolloClient = useApolloClient()
  const [code, setCode] = useState('')

  const getDiscountCode = async (
    apolloClient: ApolloClient<object>,
    type: 'Coupon' | 'Voucher',
    target: string,
  ): Promise<string> => {
    switch (type) {
      case 'Coupon':
        const { data: coupon } = await apolloClient.query<
          hasura.GET_COUPON_CODE_BY_COUPON,
          hasura.GET_COUPON_CODE_BY_COUPONVariables
        >({
          query: gql`
            query GET_COUPON_CODE_BY_COUPON($id: uuid!) {
              coupon_by_pk(id: $id) {
                id
                coupon_code {
                  id
                  code
                }
              }
            }
          `,
          variables: {
            id: target,
          },
          fetchPolicy: 'no-cache',
        })
        return coupon.coupon_by_pk?.coupon_code.code || ''
      case 'Voucher':
        const { data: voucher } = await apolloClient.query<
          hasura.GET_VOUCHER_CODE_BY_VOUCHER,
          hasura.GET_VOUCHER_CODE_BY_VOUCHERVariables
        >({
          query: gql`
            query GET_VOUCHER_CODE_BY_VOUCHER($id: uuid!) {
              voucher_by_pk(id: $id) {
                id
                voucher_code {
                  id
                  code
                }
              }
            }
          `,
          variables: {
            id: target,
          },
          fetchPolicy: 'no-cache',
        })
        return voucher.voucher_by_pk?.voucher_code.code || ''
    }
  }

  useEffect(() => {
    getDiscountCode(apolloClient, type, target).then(setCode)
  }, [type, target])

  return code ? <> - {code}</> : <></>
}

const UPDATE_ORDER_PRODUCT_DELIVERED_AT = gql`
  mutation UPDATE_ORDER_PRODUCT_DELIVERED_AT($orderProductId: uuid, $deliveredAt: timestamp) {
    update_order_product(_set: { delivered_at: $deliveredAt }, where: { id: { _eq: $orderProductId } }) {
      affected_rows
    }
  }
`

export default SaleCollectionExpandRow
