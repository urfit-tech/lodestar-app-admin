import { ApolloClient, gql, useApolloClient, useMutation } from '@apollo/client'
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
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter, dateRangeFormatter, handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useOrderLogExpandRow } from '../../hooks/order'
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
  const { settings, id: appId } = useApp()
  const { currentUserRole, permissions, authToken } = useAuth()
  const [currentOrderLogId, setCurrentOrderLogId] = useState<string | null>(null)
  const paymentCompanies: { paymentCompanies: PaymentCompany[] } = JSON.parse(settings['custom'] || '{}')
  const invoiceGatewayId = paymentCompanies?.paymentCompanies
    ?.find(c => record.options?.company && c.companies.map(c => c.name).includes(record.options?.company))
    ?.companies.find(company => company.name === record.options?.company)?.invoiceGatewayId

  const [loading, setLoading] = useState(false)
  const [form] = useForm<FieldProps>()

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

        {settings['payment.v2'] === '1' && orderLog.invoiceTotalPrice < record.totalPrice && (
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
                            invoiceGatewayId,
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
