import { ApolloClient, gql, useApolloClient, useMutation } from '@apollo/client'
import bwipjs from '@bwip-js/browser'
import { Button, Divider, Form, Input, InputNumber, message, Select, Skeleton, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { sum } from 'lodash'
import TokenTypeLabel from 'lodestar-app-element/src/components/labels/TokenTypeLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { render } from 'mustache'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter, dateRangeFormatter, handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
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

type FieldProps = {
  priceWithoutTax: number
  tax: number
  totalPrice: number
  type: 'issue'
  itemName: string
  itemCount: number
  itemAmt: number
  comment: string
  taxType: '1' | '2' | '3' | '9'
}
type InvoiceResponse = {
  MerchantID: string
  InvoiceTransNo: string
  MerchantOrderNo: string
  InvoiceNumber: string
  RandomNum: string
  BuyerName: string
  BuyerUBN?: string
  BuyerAddress?: string
  BuyerPhone?: string
  BuyerEmail: string
  InvoiceType: string
  Category: string
  TaxType: string
  TaxRate: string
  Amt: string
  TaxAmt: string
  TotalAmt: string
  LoveCode?: string
  PrintFlag: string
  CreateTime: string
  ItemDetail: string
  InvoiceStatus: string
  CreateStatusTime: string
  UploadStatus: string
  CheckCode: string
  CarrierType?: string
  CarrierNum?: string
  BarCode: string
  QRcodeL: string
  QRcodeR: string
  KioskPrintFlag?: string
}

const StyledRowWrapper = styled.div<{ isDelivered: boolean }>`
  color: ${props => !props.isDelivered && '#CDCDCD'};
`

const generateBarcodeAndQRcode = (type: 'barcode' | 'qrCode', text: string) => {
  try {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement
    canvasElement.style.display = 'none'
    document.body.appendChild(canvasElement)

    canvasElement && type === 'barcode'
      ? bwipjs.toCanvas(canvasElement, {
          bcid: 'code39',
          text: text,
          scale: 1,
        })
      : bwipjs.toCanvas(canvasElement, {
          bcid: 'qrcode',
          text: text,
          scale: 1,
        })

    return (canvasElement as HTMLCanvasElement | null)?.toDataURL('image/png')
  } catch (error) {
    console.log(error)
  }
}

const SaleCollectionExpandRow = ({
  record,
  onRefetchOrderLog,
}: {
  record: OrderLogColumn
  onRefetchOrderLog?: () => void
}) => {
  const { formatMessage } = useIntl()
  const { settings, enabledModules, id: appId } = useApp()
  const { currentUserRole, permissions, authToken } = useAuth()
  const [currentOrderLogId, setCurrentOrderLogId] = useState<string | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const receiptRef1 = useRef<HTMLDivElement | null>(null)
  const receiptRef2 = useRef<HTMLDivElement | null>(null)
  const receiptRef3 = useRef<HTMLDivElement | null>(null)

  const [loading, setLoading] = useState(false)
  const [form] = useForm<FieldProps>()
  const [invoiceResponse, setInvoiceResponse] = useState<InvoiceResponse>()

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
    paymentLogs,
    orderDiscounts,
    paymentMethod,
    refetchOrderLogExpandRow,
  } = useOrderLogExpandRow(orderLogId)

  const handlePrint = async () => {
    try {
      setLoading(true)

      const result: {
        data: {
          code: string
          message: string
          result: {
            Status: string
            Message: string
            Result: InvoiceResponse
          }
        }
      } = await axios.post(
        `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/invoice/search`,
        {
          invoiceGatewayId: 'd9bd90af-6662-409b-92ee-9e9c198d196c',
          invoiceNumber: orderLog.invoiceOptions?.invoiceNumber,
          invoiceRandomNumber: orderLog.invoiceOptions?.invoiceRandomNumber,
          appId,
        },
        { headers: { Authorization: `Bearer ${authToken}` } },
      )

      if (result.data.code === 'SUCCESS') {
        setInvoiceResponse(result.data.result.Result)
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
        }, 1500)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
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
                            onRefetch={refetchOrderLogExpandRow}
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
                      <TokenTypeLabel tokenType="contract" />
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
                            onRefetch={refetchOrderLogExpandRow}
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
              {settings['payment.v2'] !== '1' && (
                <>
                  {orderExecutors.length !== 0 && permissions['SALES_RECORDS_DETAILS'] ? (
                    <div>承辦人：{orderExecutors.map(orderExecutor => orderExecutor.ratio).join('、')}</div>
                  ) : null}
                  {paymentMethod && permissions['SALES_RECORDS_DETAILS'] ? <div>付款方式：{paymentMethod}</div> : null}
                  {orderLog.expiredAt && permissions['SALES_RECORDS_DETAILS'] && (
                    <div>付款期限：{dayjs(orderLog.expiredAt).tz(currentTimeZone).format('YYYY-MM-DD')}</div>
                  )}
                </>
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
          onRefetch={() => {
            onRefetchOrderLog?.()
            refetchOrderLogExpandRow()
          }}
        />
        {Boolean(permissions.MODIFY_MEMBER_ORDER_STATUS) && settings['feature.modify_order_status.enabled'] === '1' && (
          <ModifyOrderStatusModal
            renderTrigger={({ setVisible }) => (
              <Button size="middle" className="mr-2" onClick={() => setVisible(true)}>
                變更訂單狀態
              </Button>
            )}
            orderLogId={orderLogId}
            defaultOrderStatus={orderStatus}
            paymentLogs={paymentLogs}
            defaultPrice={
              totalPrice -
              sum(paymentLogs.filter(p => p.status === 'SUCCESS').map(p => p.price)) +
              -sum(paymentLogs.filter(p => p.status === 'REFUND').map(p => p.price))
            }
            onRefetch={() => {
              onRefetchOrderLog?.()
              refetchOrderLogExpandRow()
            }}
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
              onRefetch={refetchOrderLogExpandRow}
            />
          ))}
        {enabledModules.invoice_printer &&
          (orderStatus === 'SUCCESS' || orderStatus === 'PARTIAL_PAID') &&
          paymentLogs.length > 0 &&
          paymentLogs.filter(p => !!p.invoiceIssuedAt).length > 0 && (
            <>
              <Button onClick={handlePrint}>列印發票</Button>
              {showInvoice && (
                <div id="print-content" style={{ display: 'none' }}>
                  <div className="no-break">
                    <Receipt
                      ref={receiptRef1}
                      template={JSON.parse(settings['invoice.template'])?.main || ''}
                      templateVariables={{
                        year: new Date().getFullYear() - 1911,
                        month: `${(new Date().getMonth() + (1 % 2) === 0
                          ? new Date().getMonth() + 1 - 1
                          : new Date().getMonth() + 1
                        )
                          .toString()
                          .padStart(2, '0')}-${(
                          (new Date().getMonth() + (1 % 2) === 0
                            ? new Date().getMonth() + 1 - 1
                            : new Date().getMonth() + 1) + 1
                        )
                          .toString()
                          .padStart(2, '0')}`,
                        createdAt: invoiceResponse?.CreateTime,
                        randomNumber: invoiceResponse?.RandomNum,
                        sellerUniformNumber: '70560259',
                        totalPrice: invoiceResponse?.TotalAmt,
                        uniformTitle: invoiceResponse?.BuyerUBN && `賣方 ${invoiceResponse.BuyerUBN}`,
                        invoiceNo: `${invoiceResponse?.InvoiceNumber.substring(
                          0,
                          2,
                        )}-${invoiceResponse?.InvoiceNumber.substring(2, 10)}`,
                        barcode: generateBarcodeAndQRcode('barcode', invoiceResponse?.BarCode || ''),
                        qrCodeL: generateBarcodeAndQRcode('qrCode', invoiceResponse?.QRcodeL || ''),
                        qrCodeR: generateBarcodeAndQRcode('qrCode', invoiceResponse?.QRcodeR || ''),
                      }}
                    />
                  </div>
                  <div className="page-break"></div>
                  <div className="no-break">
                    <Receipt
                      ref={receiptRef2}
                      template={JSON.parse(settings['invoice.template'])?.detail1 || ''}
                      templateVariables={{
                        createdAt: invoiceResponse?.CreateTime,
                        invoiceNo: invoiceResponse?.InvoiceNumber,
                        ItemCount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemCount,
                        ItemPrice: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemPrice,
                        ItemName: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemName,
                        ItemNum: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemNum,
                        ItemWord: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemWord,
                        ItemAmount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemAmount,
                      }}
                    />
                  </div>
                  <div className="page-break"></div>
                  <div className="no-break">
                    <Receipt
                      ref={receiptRef3}
                      template={JSON.parse(settings['invoice.template'])?.detail2 || ''}
                      templateVariables={{
                        createdAt: invoiceResponse?.CreateTime,
                        invoiceNo: invoiceResponse?.InvoiceNumber,
                        ItemCount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemCount,
                        ItemPrice: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemPrice,
                        ItemName: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemName,
                        ItemNum: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemNum,
                        ItemWord: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemWord,
                        ItemAmount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemAmount,
                        month: new Date().getMonth() + 1,
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

        {settings['payment.v2'] === '1' &&
          !!paymentLogs.filter(p => p.status === 'SUCCESS')[0]?.invoiceOptions?.skipIssueInvoice && (
            <AdminModal
              renderTrigger={({ setVisible }) => (
                <Button
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => {
                    setVisible(true)
                  }}
                >
                  <div>補開發票</div>
                </Button>
              )}
              title={'補開發票'}
              footer={null}
              renderFooter={({ setVisible }) => (
                <>
                  <Button onClick={() => setVisible(false)} className="mr-2">
                    {formatMessage(commonMessages.ui.back)}
                  </Button>
                  <Button
                    type="primary"
                    disabled={loading}
                    loading={loading}
                    onClick={async () => {
                      try {
                        setLoading(true)
                        const values = await form.validateFields()
                        axios
                          .post(
                            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/invoice/issue`,
                            {
                              appId,
                              invoiceGatewayId: 'd9bd90af-6662-409b-92ee-9e9c198d196c',
                              invoiceInfo: {
                                MerchantOrderNo: new Date().getTime().toString(),
                                BuyerEmail: orderLog.invoiceOptions?.email || '',
                                BuyerName: orderLog.invoiceOptions?.uniformTitle || orderLog.invoiceOptions?.name,
                                BuyerUBN: orderLog.invoiceOptions?.uniformNumber || '',
                                Category: orderLog.invoiceOptions?.uniformNumber ? 'B2B' : 'B2C',
                                TaxType: values.taxType,
                                TaxRate: 5,
                                Amt: values.priceWithoutTax,
                                TaxAmt: values.tax,
                                TotalAmt: values.totalPrice,
                                PrintFlag: 'Y',
                                ItemName: values.itemName,
                                ItemCount: values.itemCount,
                                ItemUnit: '個',
                                ItemPrice: values.itemAmt,
                                ItemAmt: values.itemAmt * values.itemCount,
                                Comment: orderLog.invoiceOptions?.invoiceComment || '',
                              },
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${authToken}`,
                              },
                            },
                          )
                          .then(r => {
                            if (r.data.code === 'SUCCESS') {
                              message.success('發票開立成功')
                            }
                          })
                          .catch(handleError)
                          .finally(() => {
                            setLoading(false)
                            refetchOrderLogExpandRow()
                            setVisible(false)
                          })
                      } catch (error) {
                        console.error(error)
                      }
                    }}
                  >
                    {formatMessage(commonMessages.ui.save)}
                  </Button>
                </>
              )}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ totalPrice, type: 'issue', taxType: '1', itemCount: 1 }}
              >
                <div className="row">
                  <div className="col-6">
                    <Form.Item label={'處理方式'} name="type">
                      <Select<string>>
                        <Select.Option value="issue">開立發票</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-6">
                    <Form.Item label={'課稅別'} name="taxType">
                      <Select<string>>
                        <Select.Option value="1">應稅</Select.Option>
                        <Select.Option value="2">零稅</Select.Option>
                        <Select.Option value="3">免稅</Select.Option>
                        <Select.Option value="9">混合稅</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-4">
                    <Form.Item
                      label={'未稅'}
                      name="priceWithoutTax"
                      rules={[
                        formInstance => ({
                          message: `金額不能超過 ${totalPrice}`,
                          validator() {
                            const price = formInstance.getFieldValue('price')
                            if (price > totalPrice) {
                              return Promise.reject(new Error())
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={totalPrice}
                        formatter={value => `NT$ ${value}`}
                        parser={value => value?.replace(/\D/g, '') || ''}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-4">
                    <Form.Item
                      label={'稅額'}
                      name="tax"
                      rules={[
                        formInstance => ({
                          message: `金額不能超過 ${totalPrice}`,
                          validator() {
                            const price = formInstance.getFieldValue('price')
                            if (price > totalPrice) {
                              return Promise.reject(new Error())
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={totalPrice}
                        formatter={value => `NT$ ${value}`}
                        parser={value => value?.replace(/\D/g, '') || ''}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-4">
                    <Form.Item
                      label={'總金額(含稅)'}
                      name="totalPrice"
                      rules={[
                        formInstance => ({
                          message: `金額不能超過 ${totalPrice}`,
                          validator() {
                            const price = formInstance.getFieldValue('price')
                            if (price > totalPrice) {
                              return Promise.reject(new Error())
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={totalPrice}
                        formatter={value => `NT$ ${value}`}
                        parser={value => value?.replace(/\D/g, '') || ''}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-3">
                    <Form.Item label={'商品數量'} name="itemCount">
                      <InputNumber min={1} />
                    </Form.Item>
                  </div>
                  <div className="col-3">
                    <Form.Item label={'商品單價'} name="itemAmt">
                      <InputNumber
                        min={0}
                        max={totalPrice}
                        formatter={value => `NT$ ${value}`}
                        parser={value => value?.replace(/\D/g, '') || ''}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-6">
                    <Form.Item label={'產品名'} name="itemName">
                      <Input placeholder="請輸入產品名" />
                    </Form.Item>
                  </div>
                  <div className="col-12">
                    <Form.Item label={'備註'} name="comment">
                      <Input placeholder="請輸入備註" />
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </AdminModal>
          )}
      </div>
    </div>
  )
}
const Receipt = React.forwardRef<HTMLDivElement, { template: string; templateVariables?: { [key: string]: any } }>(
  (props, ref) => {
    const { template, templateVariables } = props
    return (
      <div className="receipt" ref={ref as any}>
        <div
          dangerouslySetInnerHTML={{
            __html: render(template, templateVariables),
          }}
        />
      </div>
    )
  },
)

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
