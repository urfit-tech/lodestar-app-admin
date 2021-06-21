import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Divider, Input, Table, Tooltip, Typography } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { prop, sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { currencyFormatter, dateFormatter, dateRangeFormatter, desktopViewMixin } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { OrderLogProps } from '../../types/general'
import AdminCard from '../admin/AdminCard'
import ProductTypeLabel from '../common/ProductTypeLabel'
import ShippingMethodLabel from '../common/ShippingMethodLabel'
import ModifyOrderStatusModal from './ModifyOrderStatusModal'
import OrderStatusTag from './OrderStatusTag'
import SubscriptionCancelModal from './SubscriptionCancelModal'

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
  const { currentUserRole } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [statuses, setStatuses] = useState<string[] | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [memberNameAndEmail, setMemberNameAndEmail] = useState<string | null>(null)
  const [tmpOrderLogStatus, setTmpOrderLogStatus] = useState<{ [OrderId in string]?: string }>({})

  const { loadingOrderLogs, errorOrderLogs, orderLogs, totalCount, refetchOrderLogs, loadMoreOrderLogs } = useOrderLog({
    statuses,
    orderId,
    memberNameAndEmail,
    memberId,
  })

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

  const columns: ColumnProps<OrderLogProps>[] = [
    {
      title: formatMessage(commonMessages.label.orderLogId),
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.split('-')[0]}</span>
        </Tooltip>
      ),
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
      title: formatMessage(commonMessages.label.nameAndEmail),
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
          <div>{`${record.name} /`}</div>
          <div>{record.email}</div>
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
          text: formatMessage(commonMessages.status.orderUnpaid),
          value: 'UNPAID',
        },
        {
          text: formatMessage(commonMessages.status.orderRefund),
          value: 'REFUND',
        },
        {
          text: formatMessage(commonMessages.status.orderExpired),
          value: 'EXPIRED',
        },
      ],
    },
    {
      title: formatMessage(commonMessages.label.orderLogPrice),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: currencyFormatter,
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
  }: OrderLogProps) => (
    <div>
      {orderProducts.map(v => (
        <>
          <div className="row" key={v.id}>
            <div className="col-2">
              <ProductTypeLabel productType={v.product.type} />
            </div>
            <div className="col-8">
              <span>{v.name}</span>

              {v.endedAt && v.product.type !== 'AppointmentPlan' && (
                <span className="ml-2">
                  {`(${moment(v.endedAt).format('YYYY-MM-DD')} ${formatMessage(commonMessages.status.productExpired)})`}
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
            <div className="col-2 text-right">{currencyFormatter(v.price)}</div>
          </div>
          <Divider />
        </>
      ))}

      <div className="row">
        <div className="col-3" style={{ fontSize: '14px' }}>
          {orderExecutors.length !== 0 && <div>承辦人：{orderExecutors.join('、')}</div>}
          {paymentMethod && <div>付款方式：{paymentMethod}</div>}
          {expiredAt && <div>付款期限：{moment(expiredAt).format('YYYY-MM-DD')}</div>}
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

          {orderDiscounts.map(v => (
            <div className="row text-right">
              <div className="col-9">{v.name}</div>
              <div className="col-3">- {currencyFormatter(v.price)}</div>
            </div>
          ))}

          <div className="row align-items-center">
            <div className="col-9 text-right">{formatMessage(commonMessages.label.totalPrice)}</div>
            <div className="col-3 text-right">{currencyFormatter(totalPrice)}</div>
          </div>
        </div>
      </div>

      <div className="row col-12 align-items-center pt-3">
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

        {orderProducts.some(v =>
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
            {formatMessage(commonMessages.text.totalCount, { count: `${totalCount}` })}
          </Typography.Text>
        </div>

        <Table<OrderLogProps>
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

const useOrderLog = (filters?: {
  statuses?: string[] | null
  orderId?: string | null
  memberNameAndEmail?: string | null
  memberId?: string
}) => {
  const condition: hasura.GET_ORDERSVariables['condition'] = {
    id: filters?.orderId ? { _ilike: `%${filters.orderId}%` } : undefined,
    status: filters?.statuses ? { _in: filters.statuses } : undefined,
    member: {
      id: filters?.memberId ? { _like: `%${filters.memberId}%` } : undefined,
      _or: filters?.memberNameAndEmail
        ? [
            { name: { _ilike: `%${filters.memberNameAndEmail}%` } },
            { username: { _ilike: `%${filters.memberNameAndEmail}%` } },
            { email: { _ilike: `%${filters.memberNameAndEmail}%` } },
          ]
        : undefined,
    },
  }

  const { data: allOrderLogs } = useQuery<hasura.GET_ALL_ORDER_LOG>(gql`
    query GET_ALL_ORDER_LOG {
      order_log_aggregate {
        aggregate {
          count
        }
      }
    }
  `)
  const totalCount = allOrderLogs?.order_log_aggregate.aggregate?.count || 0

  const { loading, error, data, refetch, fetchMore } = useQuery<hasura.GET_ORDERS, hasura.GET_ORDERSVariables>(
    GET_ORDERS,
    {
      variables: {
        condition,
        limit: 20,
      },
      context: {
        important: true,
      },
    },
  )

  const loadMoreOrderLogs =
    (data?.order_log_aggregate.aggregate?.count || 0) > 20
      ? () => {
          const lastOrderLog = data?.order_log[data.order_log.length - 1]
          return fetchMore({
            variables: {
              condition: {
                _and: [
                  condition,
                  {
                    created_at: {
                      _lte: lastOrderLog?.created_at,
                    },
                    id: {
                      _nin: data?.order_log.filter(v => v.created_at === lastOrderLog?.created_at).map(v => v.id) || [],
                    },
                  },
                ],
              },
              limit: 20,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return {
                order_log_aggregate: fetchMoreResult.order_log_aggregate,
                order_log: [...prev.order_log, ...fetchMoreResult.order_log],
              }
            },
          })
        }
      : undefined

  const orderLogs: OrderLogProps[] =
    data?.order_log.map(v => ({
      id: v.id,
      createdAt: v.created_at,
      status: v.status || '',
      shipping: v.shipping,
      name: v.member.name,
      email: v.member.email,

      orderProducts: v.order_products.map(w => ({
        id: w.id,
        name: w.name,
        price: w.price,
        startedAt: w.started_at && new Date(w.started_at),
        endedAt: w.ended_at && new Date(w.ended_at),
        product: w.product,
        quantity: w.options?.quantity,
        options: w.options,
      })),

      orderDiscounts: v.order_discounts.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        price: w.price,
      })),

      totalPrice:
        sum(v.order_products.map(prop('price'))) - sum(v.order_discounts.map(prop('price'))) + (v.shipping?.fee || 0),

      expiredAt: v.expired_at,
      paymentMethod: v.payment_logs[0]?.gateway,
      orderExecutors: v.order_executors.map(w => w.member.name),
    })) || []

  return {
    totalCount,
    loadingOrderLogs: loading,
    errorOrderLogs: error,
    orderLogs,
    refetchOrderLogs: refetch,
    loadMoreOrderLogs,
  }
}

const GET_ORDERS = gql`
  query GET_ORDERS($condition: order_log_bool_exp, $limit: Int) {
    order_log_aggregate(where: $condition) {
      aggregate {
        count
      }
    }

    order_log(where: $condition, order_by: { created_at: desc }, limit: $limit) {
      id
      created_at
      status
      shipping
      expired_at
      member {
        name
        email
      }

      payment_logs(order_by: { created_at: desc }, limit: 1) {
        gateway
      }

      order_products {
        id
        name
        price
        started_at
        ended_at
        product {
          id
          type
        }
        options
      }

      order_discounts {
        id
        name
        description
        price
      }

      order_executors {
        member {
          name
        }
      }
    }
  }
`

export default SaleCollectionAdminCard
