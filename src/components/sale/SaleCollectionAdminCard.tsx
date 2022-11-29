import { SearchOutlined } from '@ant-design/icons'
import { useApolloClient, useMutation } from '@apollo/react-hooks'
import { Button, Divider, Input, message, Switch, Table, Tooltip, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import TokenTypeLabel from 'lodestar-app-element/src/components/labels/TokenTypeLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter, dateRangeFormatter, desktopViewMixin, handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useOrderLogs } from '../../hooks/order'
import { OrderLog } from '../../types/general'
import AdminCard from '../admin/AdminCard'
import AdminModal from '../admin/AdminModal'
import ProductTypeLabel from '../common/ProductTypeLabel'
import ShippingMethodLabel from '../common/ShippingMethodLabel'
import ModifyOrderStatusModal from './ModifyOrderStatusModal'
import OrderDetailDrawer from './OrderDetailDrawer'
import OrderStatusTag from './OrderStatusTag'
import SubscriptionCancelModal from './SubscriptionCancelModal'
import saleMessages from './translation'

const StyledRowWrapper = styled.div<{ isDelivered: boolean }>`
  color: ${props => !props.isDelivered && '#CDCDCD'};
`

const StyledContainer = styled.div`
  overflow: auto;

  table th {
    white-space: nowrap;
  }
`
const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`

const StyledCell = styled.div`
  div {
    white-space: nowrap;
  }

  ${desktopViewMixin(css`
    display: flex;
    flex-wrap: wrap;

    div:first-child {
      margin-right: 0.5rem;
    }
  `)}
`

const SaleCollectionAdminCard: React.VFC<{
  memberId?: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()

  const { settings } = useApp()
  const { currentUserRole, currentMemberId, permissions } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [statuses, setStatuses] = useState<string[] | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [memberNameAndEmail, setMemberNameAndEmail] = useState<string | null>(null)
  const [tmpOrderLogStatus, setTmpOrderLogStatus] = useState<{ [OrderId in string]?: string }>({})
  const [currentOrderLogId, setCurrentOrderLogId] = useState<string | null>(null)

  const {
    totalCount,
    loading: loadingOrderLogs,
    error: errorOrderLogs,
    orderLogs,
    refetch: refetchOrderLogs,
    loadMoreOrderLogs,
  } = useOrderLogs(
    currentMemberId || '',
    permissions.SALES_RECORDS_ADMIN ? 'Admin' : permissions.SALES_RECORDS_NORMAL ? 'Personal' : 'None',
    { statuses, orderId, memberNameAndEmail, memberId },
  )

  // const {} = useOrderLogExpanded

  const [updateOrderProductDeliver] = useMutation<
    hasura.UPDATE_ORDER_PRODUCT_DELIVERED_AT,
    hasura.UPDATE_ORDER_PRODUCT_DELIVERED_ATVariables
  >(UPDATE_ORDER_PRODUCT_DELIVERED_AT)

  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <StyledFilterInput
          autoFocus
          value={selectedKeys && selectedKeys[0]}
          onChange={e => setSelectedKeys && setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => onSearch(selectedKeys, confirm)}
          className="mb-2 d-block"
        />
        <StyledFilterButton
          className="mr-2"
          type="primary"
          size="small"
          onClick={() => onSearch(selectedKeys, confirm)}
        >
          {formatMessage(commonMessages.ui.search)}
        </StyledFilterButton>
        <StyledFilterButton size="small" onClick={() => onReset(clearFilters)}>
          {formatMessage(commonMessages.ui.reset)}
        </StyledFilterButton>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  })

  const columns: ColumnProps<OrderLog>[] = [
    {
      title: formatMessage(commonMessages.label.orderLogId),
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => {
        const uuidRegexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi
        const orderNo = uuidRegexExp.test(text) ? text.split('-')[0] : text
        return (
          <Tooltip title={orderNo}>
            <span>{orderNo}</span>
          </Tooltip>
        )
      },
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setOrderId(null)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm?.()
          selectedKeys && setOrderId(`${selectedKeys[0]}`)
        },
      }),
    },
    {
      title: formatMessage(commonMessages.label.orderLogCreatedDate),
      key: 'createdAt',
      render: (_, record) => {
        const orderLogCreatedMoment = moment(record.createdAt)
        return (
          <StyledCell>
            <div>{orderLogCreatedMoment.format('YYYY-MM-DD')}</div>
            <div>{orderLogCreatedMoment.format('HH:mm')}</div>
          </StyledCell>
        )
      },
    },
    {
      title: formatMessage(
        permissions['SALES_RECORDS_DETAILS'] ? commonMessages.label.nameAndEmail : commonMessages.label.memberName,
      ),
      key: 'nameAndEmail',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setMemberNameAndEmail(null)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm?.()
          selectedKeys && setMemberNameAndEmail(`${selectedKeys[0]}`)
        },
      }),
      render: (_, record) => (
        <StyledCell>
          <div>{`${record.name}`}</div>
          {permissions['SALES_RECORDS_DETAILS'] && <div>{`/${record.email}`}</div>}
        </StyledCell>
      ),
    },
    {
      title: formatMessage(commonMessages.label.orderLogStatus),
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => <OrderStatusTag status={tmpOrderLogStatus[record.id] || record.status} />,
      filters: [
        {
          text: formatMessage(commonMessages.status.orderSuccess),
          value: 'SUCCESS',
        },
        {
          text: formatMessage(commonMessages.status.orderPaying),
          value: 'PAYING',
        },
        {
          text: formatMessage(commonMessages.status.orderUnpaid),
          value: 'UNPAID',
        },
        {
          text: formatMessage(commonMessages.status.orderPartialPaid),
          value: 'PARTIAL_PAID',
        },
        {
          text: formatMessage(commonMessages.status.orderFailed),
          value: 'FAILED',
        },
        {
          text: formatMessage(commonMessages.status.orderPartialRefund),
          value: 'PARTIAL_REFUND',
        },
        {
          text: formatMessage(commonMessages.status.orderRefund),
          value: 'REFUND',
        },
        {
          text: formatMessage(commonMessages.status.orderExpired),
          value: 'EXPIRED',
        },
        {
          text: formatMessage(commonMessages.status.deleted),
          value: 'DELETED',
        },
      ],
    },
    {
      title: formatMessage(commonMessages.label.orderLogPrice),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (_, record) => currencyFormatter(record.totalPrice),
    },
  ]

  const expandedRow = ({
    id: orderLogId,
    orderProducts,
    orderDiscounts,
    orderExecutors,
    paymentMethod,
    expiredAt,
    shipping,
    totalPrice,
  }: OrderLog) => (
    <div>
      {orderProducts
        .filter(orderProduct => orderProduct.product.type !== 'Token')
        .map(v => {
          const isDelivered: boolean = !!v.deliveredAt
          return (
            <StyledRowWrapper key={v.id} isDelivered={isDelivered}>
              <div className="row">
                <div className="col-2">
                  <ProductTypeLabel productType={v.product.type} />
                </div>
                <div className="col-7">
                  <span>{v.name}</span>

                  {v.endedAt && v.product.type !== 'AppointmentPlan' && (
                    <span className="ml-2">
                      {`(${moment(v.endedAt).format('YYYY-MM-DD')} ${formatMessage(
                        commonMessages.status.productExpired,
                      )})`}
                    </span>
                  )}

                  {v.startedAt && v.endedAt && v.product.type === 'AppointmentPlan' && (
                    <span>
                      {`(${dateRangeFormatter({
                        startedAt: v.startedAt,
                        endedAt: v.endedAt,
                        dateFormat: 'YYYY-MM-DD',
                      })})`}
                    </span>
                  )}
                  {v.quantity && <span>{` X ${v.quantity} `}</span>}
                </div>
                <div className="col-3 d-flex justify-content-between">
                  <div>
                    {currentUserRole === 'app-owner' && settings['feature.modify_order_status'] === 'enabled' && (
                      <AdminModal
                        title={
                          v.deliveredAt
                            ? formatMessage(saleMessages.SaleCollectionAdminCard.removeEquity)
                            : formatMessage(saleMessages.SaleCollectionAdminCard.openEquity)
                        }
                        renderTrigger={({ setVisible }) => (
                          <div className="d-flex align-items-center">
                            <span className="mr-2">{formatMessage(saleMessages.SaleCollectionAdminCard.deliver)}</span>
                            <Switch checked={isDelivered} onChange={() => setVisible(true)} />
                          </div>
                        )}
                        footer={null}
                        renderFooter={({ setVisible }) => (
                          <div className="mt-4">
                            <Button className="mr-2" onClick={() => setVisible(false)}>
                              {formatMessage(commonMessages.ui.cancel)}
                            </Button>
                            <Button
                              type="primary"
                              danger={isDelivered}
                              loading={loadingOrderLogs}
                              onClick={async () =>
                                await updateOrderProductDeliver({
                                  variables: { orderProductId: v.id, deliveredAt: v.deliveredAt ? null : new Date() },
                                })
                                  .then(() => {
                                    setVisible(false)
                                    refetchOrderLogs?.()
                                    message.success(
                                      formatMessage(saleMessages.SaleCollectionAdminCard.updateEquitySuccessfully),
                                    )
                                  })
                                  .catch(handleError)
                              }
                            >
                              {v.deliveredAt
                                ? formatMessage(saleMessages.SaleCollectionAdminCard.remove)
                                : formatMessage(saleMessages.SaleCollectionAdminCard.open)}
                            </Button>
                          </div>
                        )}
                      >
                        <div>
                          {v.deliveredAt
                            ? formatMessage(saleMessages.SaleCollectionAdminCard.removeEquityWarning, {
                                productName: v.name,
                              })
                            : formatMessage(saleMessages.SaleCollectionAdminCard.openEquityWarning, {
                                productName: v.name,
                              })}
                        </div>
                      </AdminModal>
                    )}
                  </div>
                  <div>
                    {currencyFormatter(
                      v.product.type === 'MerchandiseSpec' && v.options.currencyId === 'LSC'
                        ? v.options.currencyPrice
                        : v.price,
                      v.options?.currencyId,
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
        .filter(orderProduct => orderProduct.product.type === 'Token')
        .map(orderProduct => {
          const isDelivered: boolean = !!orderProduct.deliveredAt
          return (
            <StyledRowWrapper key={orderProduct.id} isDelivered={isDelivered}>
              <div className="row">
                <div className="col-2">
                  <TokenTypeLabel tokenType="GiftPlan" />
                </div>
                <div className="col-7">
                  <span>{orderProduct.name}</span>
                </div>
                <div className="col-3 d-flex justify-content-between">
                  <div>
                    {currentUserRole === 'app-owner' && settings['feature.modify_order_status'] === 'enabled' && (
                      <AdminModal
                        title={
                          orderProduct.deliveredAt
                            ? formatMessage(saleMessages.SaleCollectionAdminCard.removeEquity)
                            : formatMessage(saleMessages.SaleCollectionAdminCard.openEquity)
                        }
                        renderTrigger={({ setVisible }) => (
                          <div className="d-flex align-items-center">
                            <span className="mr-2">{formatMessage(saleMessages.SaleCollectionAdminCard.deliver)}</span>
                            <Switch checked={isDelivered} onChange={() => setVisible(true)} />
                          </div>
                        )}
                        footer={null}
                        renderFooter={({ setVisible }) => (
                          <div className="mt-4">
                            <Button className="mr-2" onClick={() => setVisible(false)}>
                              {formatMessage(commonMessages.ui.cancel)}
                            </Button>
                            <Button
                              type="primary"
                              danger={isDelivered}
                              loading={loadingOrderLogs}
                              onClick={async () =>
                                await updateOrderProductDeliver({
                                  variables: {
                                    orderProductId: orderProduct.id,
                                    deliveredAt: orderProduct.deliveredAt ? null : new Date(),
                                  },
                                })
                                  .then(() => {
                                    setVisible(false)
                                    refetchOrderLogs?.()
                                    message.success(
                                      formatMessage(saleMessages.SaleCollectionAdminCard.updateEquitySuccessfully),
                                    )
                                  })
                                  .catch(handleError)
                              }
                            >
                              {orderProduct.deliveredAt
                                ? formatMessage(saleMessages.SaleCollectionAdminCard.remove)
                                : formatMessage(saleMessages.SaleCollectionAdminCard.open)}
                            </Button>
                          </div>
                        )}
                      >
                        <div>
                          {orderProduct.deliveredAt
                            ? formatMessage(saleMessages.SaleCollectionAdminCard.removeEquityWarning, {
                                productName: orderProduct.name,
                              })
                            : formatMessage(saleMessages.SaleCollectionAdminCard.openEquityWarning, {
                                productName: orderProduct.name,
                              })}
                        </div>
                      </AdminModal>
                    )}
                  </div>
                  <div>{currencyFormatter(orderProduct.price, orderProduct.options?.currencyId)}</div>
                </div>
                <Divider />
              </div>
            </StyledRowWrapper>
          )
        })}

      <div className="row">
        <div className="col-3" style={{ fontSize: '14px' }}>
          {orderExecutors.length !== 0 && permissions['SALES_RECORDS_DETAILS'] && (
            <div>承辦人：{orderExecutors.map(v => v.ratio).join('、')}</div>
          )}
          {paymentMethod && permissions['SALES_RECORDS_DETAILS'] && <div>付款方式：{paymentMethod}</div>}
          {expiredAt && permissions['SALES_RECORDS_DETAILS'] && (
            <div>付款期限：{moment(expiredAt).format('YYYY-MM-DD')}</div>
          )}
        </div>

        <div className="col-9">
          {shipping?.shippingMethod && typeof shipping?.fee === 'number' && (
            <div className="row text-right">
              <div className="col-9">
                <ShippingMethodLabel shippingMethodId={shipping.shippingMethod} />
              </div>
              <div className="col-3">{currencyFormatter(shipping.fee || 0)}</div>
            </div>
          )}
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
                    orderProducts[0].product.type === 'MerchandiseSpec' &&
                    orderProducts[0].options.currencyId === 'LSC'
                    ? orderDiscount.options.coins
                    : orderDiscount.price,
                  orderProducts.length === 1 &&
                    orderProducts[0].product.type === 'MerchandiseSpec' &&
                    orderDiscount.type === 'Coin'
                    ? 'LSC'
                    : orderDiscount.type,
                  settings['coin.unit'],
                )}
              </div>
            </div>
          ))}

          <div className="row align-items-center">
            <div className="col-9 text-right">{formatMessage(commonMessages.label.totalPrice)}</div>
            <div className="col-3 text-right">{currencyFormatter(totalPrice)}</div>
          </div>
        </div>
      </div>

      <div className="row col-12 align-items-center pt-3">
        <OrderDetailDrawer
          orderLogId={currentOrderLogId}
          onClose={() => {
            setCurrentOrderLogId(null)
          }}
          renderTrigger={() => (
            <Button
              type="primary"
              size="middle"
              className="mr-2"
              onClick={() => {
                setCurrentOrderLogId(orderLogId)
              }}
            >
              {formatMessage(saleMessages.OrderDetailDrawer.orderDetail)}
            </Button>
          )}
        />

        {currentUserRole === 'app-owner' && settings['feature.modify_order_status'] === 'enabled' && (
          <ModifyOrderStatusModal
            orderLogId={orderLogId}
            defaultPrice={totalPrice}
            onRefetch={status =>
              setTmpOrderLogStatus(prev => ({
                ...prev,
                [orderLogId]: status,
              }))
            }
          />
        )}

        {currentUserRole === 'app-owner' &&
          orderProducts.some(v =>
            ['ProgramPlan', 'ProjectPlan', 'PodcastPlan', 'ProgramPackagePlan'].includes(v.product.type),
          ) &&
          (orderProducts.some(v => v.options?.unsubscribedAt) ? (
            <span style={{ color: '#9b9b9b', fontSize: '14px' }}>
              {formatMessage(commonMessages.text.cancelSubscriptionDate, {
                date: dateFormatter(orderProducts.find(v => v.options?.unsubscribedAt)?.options?.unsubscribedAt),
              })}
            </span>
          ) : (
            <SubscriptionCancelModal
              orderProducts={orderProducts.map(v => ({
                id: v.id,
                options: v.options,
              }))}
              onRefetch={refetchOrderLogs}
            />
          ))}
      </div>
    </div>
  )

  return (
    <AdminCard>
      <StyledContainer>
        <div className="d-flex justify-content-end">
          <Typography.Text type="secondary">
            {formatMessage(commonMessages.text.totalCount, { count: totalCount })}
          </Typography.Text>
        </div>

        <Table<OrderLog>
          rowKey="id"
          loading={!!(loadingOrderLogs || errorOrderLogs)}
          dataSource={orderLogs}
          columns={columns}
          expandedRowRender={expandedRow}
          pagination={false}
          onChange={(_, filters) => setStatuses(filters.status as string[])}
        />

        {loadMoreOrderLogs && (
          <div className="text-center mt-4">
            <Button
              loading={isLoading}
              onClick={() => {
                setIsLoading(true)
                loadMoreOrderLogs().then(() => setIsLoading(false))
              }}
            >
              {formatMessage(commonMessages.ui.showMore)}
            </Button>
          </div>
        )}
      </StyledContainer>
    </AdminCard>
  )
}
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
        query: GET_COUPON_CODE_BY_COUPON,
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
        query: GET_VOUCHER_CODE_BY_VOUCHER,
        variables: {
          id: target,
        },
        fetchPolicy: 'no-cache',
      })
      return voucher.voucher_by_pk?.voucher_code.code || ''
  }
}

const DiscountCode: React.VFC<{ type: 'Coupon' | 'Voucher'; target: string }> = ({ type, target }) => {
  const apolloClient = useApolloClient()
  const [code, setCode] = useState('')

  useEffect(() => {
    getDiscountCode(apolloClient, type, target).then(setCode)
  }, [type, target])

  return code ? <> - {code}</> : <></>
}

const GET_VOUCHER_CODE_BY_VOUCHER = gql`
  query GET_VOUCHER_CODE_BY_VOUCHER($id: uuid!) {
    voucher_by_pk(id: $id) {
      id
      voucher_code {
        id
        code
      }
    }
  }
`
const GET_COUPON_CODE_BY_COUPON = gql`
  query GET_COUPON_CODE_BY_COUPON($id: uuid!) {
    coupon_by_pk(id: $id) {
      id
      coupon_code {
        id
        code
      }
    }
  }
`
const UPDATE_ORDER_PRODUCT_DELIVERED_AT = gql`
  mutation UPDATE_ORDER_PRODUCT_DELIVERED_AT($orderProductId: uuid, $deliveredAt: timestamp) {
    update_order_product(_set: { delivered_at: $deliveredAt }, where: { id: { _eq: $orderProductId } }) {
      affected_rows
    }
  }
`

export default SaleCollectionAdminCard
