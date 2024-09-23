import { ApolloClient, gql, useApolloClient, useMutation } from '@apollo/client'
import { Button, Divider, Form, Input, InputNumber, message, Select, Skeleton, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import TokenTypeLabel from 'lodestar-app-element/src/components/labels/TokenTypeLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { sum } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter, dateRangeFormatter, handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useOrderLogExpandRow } from '../../hooks/order'
import { PlusIcon, TrashOIcon } from '../../images/icon'
import { PaymentCompany } from '../../pages/NewMemberContractCreationPage/MemberContractCreationForm'
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

type TaxType = '1' | '2' | '3' | '9'

type Invoice = {
  TaxType: TaxType
  MerchantOrderNo: string
  Amt: number
  TaxAmt: number
  TotalAmt: number
  TaxRate: number
  Category: 'B2B' | 'B2C'
  BuyerEmail: string
  BuyerName: string
  BuyerUBN?: string
  Comment?: string
  PrintFlag?: 'Y'
  CustomsClearance?: '1'
  AmtFree?: number
  AmtZero?: number
  AmtSales?: number
  Items: {
    ItemName: string
    ItemCount: number
    ItemPrice: number // 商品單價
    ItemUnit: string
    ItemAmt: number
    ItemTaxType?: TaxType
  }[]
}

type InvoiceFromAPI = Pick<
  Invoice,
  | 'TaxType'
  | 'Comment'
  | 'TaxType'
  | 'BuyerEmail'
  | 'MerchantOrderNo'
  | 'Amt'
  | 'BuyerName'
  | 'Category'
  | 'PrintFlag'
  | 'TaxAmt'
  | 'TotalAmt'
  | 'AmtFree'
  | 'AmtSales'
  | 'AmtZero'
  | 'BuyerUBN'
  | 'CustomsClearance'
> & {
  ItemName: string
  ItemCount: string
  ItemPrice: string
  ItemUnit: string
  ItemAmt: string
  ItemTaxType?: TaxType
}

type FieldProps = {
  invoices: (Pick<Invoice, 'Comment' | 'TaxType' | 'BuyerEmail' | 'BuyerName'> & { BuyerUBN?: string } & {
    Items: Array<Pick<Invoice['Items'][number], 'ItemName' | 'ItemCount' | 'ItemPrice' | 'ItemTaxType'>>
  })[]
}

type IssueInvoiceResult = {
  Status: string
  Message: string
  Result?: {
    InvoiceNumber: string
  }
}

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
  const [issueInvoiceResults, setIssueInvoiceResults] = useState<IssueInvoiceResult[] | null>(null)
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

  useEffect(() => {
    const style: any = document.createElement('style')
    style.type = 'text/css'

    const styles = `
      .ant-modal-wrap {
        z-index: 1500 !important;
      }
      .ant-picker-dropdown {
        z-index: 1500 !important;
      }
      .ant-select-dropdown {
        z-index: 1500 !important;
      }
    `

    if (style.styleSheet) {
      style.styleSheet.cssText = styles
    } else {
      style.appendChild(document.createTextNode(styles))
    }

    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div>
      {loadingExpandRowOrderProduct ? (
        <Skeleton />
      ) : (
        <div>
          {orderProducts
            .filter(orderProduct => orderProduct.type !== 'Token')
            .map((orderProduct, index) => {
              const isDelivered: boolean = !!orderProduct.deliveredAt
              return (
                <StyledRowWrapper key={orderProduct.id} isDelivered={isDelivered}>
                  <div className="row">
                    <div className="col-2">
                      {settings['payment.v2'] === '1' ? (
                        `#${index + 1}`
                      ) : (
                        <ProductTypeLabel productType={orderProduct.type} />
                      )}
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
            .map((orderProduct, index) => {
              return (
                <StyledRowWrapper key={orderProduct.id} isDelivered={!!orderProduct.deliveredAt}>
                  <div className="row">
                    <div className="col-2">
                      {settings['payment.v2'] === '1' ? (
                        `#${orderProducts.filter(orderProduct => orderProduct.type !== 'Token').length + index + 1}`
                      ) : (
                        <TokenTypeLabel tokenType="GiftPlan" />
                      )}
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
              {settings['payment.v2'] === '1' ? (
                <>
                  {record.options?.executor && record.options.executor.name ? (
                    <div>結帳人員：{`${record.options?.executor.name} (${record.options?.executor.email || ''})`}</div>
                  ) : null}
                  {record.options?.company && <div>結帳公司：{record.options.company}</div>}
                </>
              ) : (
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
            onRefetch={() => {
              onRefetchOrderLog?.()
              refetchOrderLogExpandRow()
            }}
            totalPrice={totalPrice}
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
        {!loadingExpandRowOrderLog && settings['payment.v2'] === '1' && orderLog.invoiceTotalPrice < record.totalPrice && (
          <ManualIssueInvoiceModal
            orderLog={orderLog}
            totalPrice={totalPrice}
            onRefetch={() => {
              onRefetchOrderLog?.()
              refetchOrderLogExpandRow()
            }}
            afterIssued={result => {
              setIssueInvoiceResults(prev => [...(prev || []), result])
            }}
          />
        )}
        <AdminModal
          visible={!!issueInvoiceResults}
          title="手動開立發票結果"
          footer={null}
          onCancel={() => {
            setIssueInvoiceResults(null)
          }}
        >
          <div>
            {issueInvoiceResults?.map(i => {
              return (
                <div>
                  {i?.Status === 'SUCCESS' ? '發票開立成功：' + i.Result?.InvoiceNumber : '發票開立失敗：' + i?.Message}
                </div>
              )
            })}
          </div>
        </AdminModal>
      </div>
    </div>
  )
}

const transformInvoice = (field: FieldProps, memberName?: string): Invoice[] => {
  return field.invoices.map(value => {
    const Items = value.Items.map(i => ({
      ItemName: i.ItemName,
      ItemCount: i.ItemCount,
      ItemPrice: i.ItemPrice,
      ItemTaxType: i.ItemTaxType,
      ItemUnit: '項',
      ItemAmt: Math.ceil(i.ItemCount * i.ItemPrice),
    }))
    const AmtFree =
      value.TaxType === '9' ? sum(Items.filter(i => i.ItemTaxType === '3').map(i => i.ItemAmt)) : undefined
    const AmtZero =
      value.TaxType === '9' ? sum(Items.filter(i => i.ItemTaxType === '2').map(i => i.ItemAmt)) : undefined
    const AmtSales =
      value.TaxType === '9'
        ? sum(Items.filter(i => i.ItemTaxType === '1').map(i => Math.round(i.ItemAmt / 1.05)))
        : undefined
    const TotalAmt = sum(Items.map(i => i.ItemAmt))
    const TaxRate = value.TaxType === '3' || value.TaxType === '2' ? 0 : 5
    const Amt =
      value.TaxType === '9'
        ? Number(AmtFree) + Number(AmtSales) + Number(AmtZero)
        : Math.round(TotalAmt / (1 + TaxRate / 100))
    const TaxAmt = TotalAmt - Amt
    return {
      MerchantOrderNo: new Date().getTime().toString(),
      BuyerEmail: value.BuyerEmail,
      BuyerName: value.BuyerName || value.BuyerUBN || memberName || value.BuyerEmail,
      BuyerUBN: value.BuyerUBN,
      Category: value.BuyerUBN ? 'B2B' : 'B2C',
      TaxType: value.TaxType as TaxType,
      Comment: value.Comment,
      PrintFlag: 'Y',
      CustomsClearance: value.TaxType === '2' || value.TaxType === '9' ? '1' : undefined,
      TaxRate,
      Amt,
      TaxAmt,
      TotalAmt,
      Items,
      AmtFree,
      AmtZero,
      AmtSales,
    }
  })
}

const ManualIssueInvoiceModal: React.VFC<{
  orderLog: {
    id: string | undefined
    expiredAt: any
    shipping: any
    invoiceOptions: any
    invoiceTotalPrice: number
    options: any
  }
  totalPrice: number
  onRefetch: () => void
  afterIssued: (result: IssueInvoiceResult) => void
}> = ({ orderLog, totalPrice, onRefetch, afterIssued }) => {
  const { id: appId, settings } = useApp()
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [form] = useForm<FieldProps>()
  const [invoices, setInvoices] = useState<Invoice[]>(
    orderLog.invoiceOptions?.invoices?.map((i: InvoiceFromAPI) => ({
      ...i,
      Items:
        i.ItemCount?.split('|').map((_item, idx) => ({
          ItemName: i.ItemName?.split('|')[idx],
          ItemCount: i.ItemCount?.split('|')[idx],
          ItemPrice:
            i.BuyerUBN && i.TaxType === '1'
              ? Math.round(Number(i.ItemPrice?.split('|')[idx]) * 1.05)
              : i.ItemPrice?.split('|')[idx],
          ItemAmt:
            i.BuyerUBN && i.TaxType === '1'
              ? Math.round(Number(i.ItemAmt?.split('|')[idx]) * 1.05)
              : i.ItemAmt?.split('|')[idx],
          ItemTaxType: i.ItemTaxType?.split('|')[idx],
        })) || [],
    })),
  )
  console.log(invoices)

  const paymentCompanies: { paymentCompanies: PaymentCompany[] } = JSON.parse(settings['custom'] || '{}')
  const invoiceGatewayId = paymentCompanies?.paymentCompanies
    ?.find(c => orderLog.options?.company && c.companies.map(c => c.name).includes(orderLog.options?.company))
    ?.companies.find(company => company.name === orderLog.options?.company)?.invoiceGatewayId

  const orderId = orderLog.id

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => {
            setVisible(true)
          }}
        >
          <div>手開發票</div>
        </Button>
      )}
      title={'手開發票'}
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
              setLoading(true)
              for (let i = 0; i < invoices.length; i++) {
                const invoice = invoices[i]
                axios
                  .post(
                    `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/invoice/issue`,
                    {
                      appId,
                      orderId,
                      invoiceGatewayId,
                      invoiceInfo: {
                        MerchantOrderNo: invoice.MerchantOrderNo,
                        BuyerEmail: invoice.BuyerEmail,
                        BuyerName: invoice.BuyerName,
                        BuyerUBN: invoice.BuyerUBN,
                        Category: invoice.Category,
                        TaxType: invoice.TaxType,
                        TaxRate: invoice.TaxRate,
                        Comment: invoice.Comment,
                        PrintFlag: invoice.PrintFlag,
                        CustomsClearance:
                          invoice.TaxType === '2' || invoice.TaxType === '9' ? '1' : invoice.CustomsClearance,
                        Amt: invoice.Amt,
                        TaxAmt: invoice.TaxAmt,
                        TotalAmt: invoice.TotalAmt,
                        AmtFree: invoice.AmtFree,
                        AmtZero: invoice.AmtZero,
                        AmtSales: invoice.AmtSales,
                        ItemName: invoice.Items.map(i => i.ItemName).join('|'),
                        ItemCount: invoice.Items.map(i => i.ItemCount).join('|'),
                        ItemPrice: invoice.Items.map(i =>
                          invoice.BuyerUBN && invoice.TaxType === '1' ? Math.round(i.ItemPrice / 1.05) : i.ItemPrice,
                        ).join('|'),
                        ItemTaxType: invoice.Items.map(i => i.ItemTaxType).join('|'),
                        ItemUnit: invoice.Items.map(i => '項').join('|'),
                        ItemAmt: invoice.Items.map(i =>
                          invoice.BuyerUBN && invoice.TaxType === '1' ? Math.round(i.ItemAmt / 1.05) : i.ItemAmt,
                        ).join('|'),
                      },
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${authToken}`,
                      },
                    },
                  )
                  .then(r => {
                    if (r.data?.result?.Status === 'SUCCESS') {
                      afterIssued(r.data?.result)
                    } else {
                      throw new Error(r.data?.result?.Message)
                    }
                  })
                  .catch(err => {
                    console.log(err)
                    afterIssued({
                      Status: 'ERROR',
                      Message: err.message,
                    })
                  })
                  .finally(() => {
                    setLoading(false)
                    setVisible(false)
                    onRefetch()
                  })
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
        initialValues={{
          invoices,
        }}
        onValuesChange={(_, values) => {
          setInvoices(transformInvoice(values, orderLog.invoiceOptions?.name))
        }}
      >
        <Form.List name="invoices">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <div
                  key={field.key}
                  className="d-flex mb-4"
                  style={{ border: '1px solid #4f4f4f', padding: '4px 12px' }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, padding: '4px 0' }}>發票{idx + 1}</div>
                    <div className="row">
                      <div className="col-6">
                        <Form.Item label={'課稅別'} name={[field.name, 'TaxType']}>
                          <Select<string>>
                            <Select.Option value="1">應稅</Select.Option>
                            <Select.Option value="2">零稅</Select.Option>
                            <Select.Option value="3">免稅</Select.Option>
                            <Select.Option value="9">混合稅</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                    <Form.List name={[field.name, 'Items']}>
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <div
                              key={field.key}
                              className="d-flex mb-1"
                              style={{ border: '1px solid #4f4f4f', padding: '4px 12px' }}
                            >
                              <div>
                                <div style={{ fontSize: 18, fontWeight: 500, padding: '4px 0' }}>商品{index + 1}</div>
                                <Form.Item className="flex-grow-1">
                                  <div className="row">
                                    <div className="col-4">
                                      <Form.Item label={'數量'} name={[field.name, 'ItemCount']}>
                                        <InputNumber min={1} />
                                      </Form.Item>
                                    </div>
                                    <div className="col-4">
                                      <Form.Item label={`單價`} name={[field.name, 'ItemPrice']}>
                                        <InputNumber
                                          min={0}
                                          max={totalPrice}
                                          formatter={value => `${Number(value).toLocaleString()}`}
                                          parser={value => value?.replace(/\D/g, '') || ''}
                                        />
                                      </Form.Item>
                                    </div>
                                    <div className="col-4">
                                      <Form.Item label={'小計'} name={[field.name, 'ItemAmt']}>
                                        {(
                                          invoices[idx].Items[index].ItemCount * invoices[idx].Items[index].ItemPrice
                                        ).toLocaleString()}
                                      </Form.Item>
                                    </div>
                                    <div className="col-6">
                                      <Form.Item label={'名稱'} name={[field.name, 'ItemName']}>
                                        <Input placeholder="請輸入名稱" />
                                      </Form.Item>
                                    </div>

                                    <div className="col-6">
                                      <Form.Item label={'課稅別(混合稅才需要填寫)'} name={[field.name, 'ItemTaxType']}>
                                        <Select<string>>
                                          <Select.Option value="1">應稅</Select.Option>
                                          <Select.Option value="2">零稅</Select.Option>
                                          <Select.Option value="3">免稅</Select.Option>
                                          <Select.Option value="9">混合稅</Select.Option>
                                        </Select>
                                      </Form.Item>
                                    </div>
                                  </div>
                                </Form.Item>
                              </div>
                              {fields.length > 0 && (
                                <Button
                                  type="link"
                                  onClick={() => remove(field.name)}
                                  className="flex-shrink-0 d-flex"
                                  icon={<TrashOIcon className="m-auto" />}
                                />
                              )}
                            </div>
                          ))}
                          <Form.Item>
                            <Button
                              type="link"
                              icon={<PlusIcon className="m-auto" />}
                              className="p-0"
                              onClick={() =>
                                add({
                                  ItemName: '',
                                  ItemCount: 1,
                                  ItemPrice: 0,
                                })
                              }
                            >
                              <span className="ml-2">新增商品</span>
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                    <Form.Item className="flex-grow-1" {...field}>
                      <div className="row">
                        <div className="col-4">
                          <Form.Item label={'銷售額'} name={[field.name, 'Amt']}>
                            {invoices[idx].Amt.toLocaleString()}
                          </Form.Item>
                        </div>
                        <div className="col-4">
                          <Form.Item label={'稅額'} name={[field.name, 'TaxAmt']}>
                            {invoices[idx].TaxAmt.toLocaleString()}
                          </Form.Item>
                        </div>
                        <div className="col-4">
                          <Form.Item label={'總計'} name={[field.name, 'TotalAmt']}>
                            {invoices[idx].TotalAmt.toLocaleString()}
                          </Form.Item>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-6">
                          <Form.Item label={'統一編號'} name={[field.name, 'BuyerUBN']}>
                            <Input placeholder="請輸入統一編號" />
                          </Form.Item>
                        </div>

                        <div className="col-6">
                          <Form.Item label={'發票抬頭'} name={[field.name, 'BuyerName']}>
                            <Input placeholder="請輸入發票抬頭" />
                          </Form.Item>
                        </div>
                        <div className="col-6">
                          <Form.Item label={'發票收件人信箱'} name={[field.name, 'BuyerEmail']}>
                            <Input placeholder="請輸入發票收件人信箱" />
                          </Form.Item>
                        </div>
                        <div className="col-12">
                          <Form.Item label={'備註'} name={[field.name, 'Comment']}>
                            <Input placeholder="請輸入備註" />
                          </Form.Item>
                        </div>
                      </div>
                    </Form.Item>
                  </div>
                  {fields.length > 0 && (
                    <Button
                      type="link"
                      onClick={() => remove(field.name)}
                      className="flex-shrink-0 d-flex"
                      icon={<TrashOIcon className="m-auto" />}
                    />
                  )}
                </div>
              ))}

              <Form.Item>
                <Button
                  type="link"
                  icon={<PlusIcon className="m-auto" />}
                  className="p-0"
                  onClick={() =>
                    add({
                      TaxType: '1',
                      BuyerEmail: orderLog.invoiceOptions?.email,
                      BuyerName: orderLog.invoiceOptions?.name,
                      Items: [{ ItemName: '', ItemCount: 1, ItemPrice: 0 }],
                    })
                  }
                >
                  <span className="ml-2">新增發票</span>
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </AdminModal>
  )
}

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
