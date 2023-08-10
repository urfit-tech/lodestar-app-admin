import { ApolloClient, gql, useApolloClient, useMutation } from '@apollo/client'
import { Button, Divider, message, Skeleton, Switch } from 'antd'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import TokenTypeLabel from 'lodestar-app-element/src/components/labels/TokenTypeLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'
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
                          {`(${dayjs(orderProduct.endedAt).tz(currentTimeZone).format('YYYY-MM-DD')} ${formatMessage(
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
                        {currentUserRole === 'app-owner' && settings['feature.modify_order_status.enabled'] === '1' ? (
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
                        {currentUserRole === 'app-owner' && settings['feature.modify_order_status.enabled'] === '1' ? (
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
