import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Divider, Input, Table, Tooltip, Typography } from 'antd'
import { ColumnProps, TablePaginationConfig } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { prop, sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { currencyFormatter, dateFormatter, dateRangeFormatter, desktopViewMixin } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import AdminCard from '../admin/AdminCard'
import ProductTypeLabel from '../common/ProductTypeLabel'
import ShippingMethodLabel from '../common/ShippingMethodLabel'
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

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_PAGE_CURRENT = 1

type OrderProduct = {
  id: string
  name: string
  price: number
  startedAt: Date | null
  endedAt: Date | null
  product: {
    id: string
    type: string
  }
  quantity: number
  options: any
}

type OrderDiscount = {
  id: string
  name: string
  description: string | null
  price: number
}

type OrderRow = {
  id: string
  createdAt: Date
  status: string
  orderDiscounts: OrderDiscount[]
  orderProducts: OrderProduct[]
  shipping: any
  name: string
  email: string
  totalPrice: number
  expiredAt: Date
  paymentMethod: string | null
  orderExecutors: string[]
}
const SaleCollectionAdminCard: React.FC<{ memberId?: string }> = ({ memberId }) => {
  const { formatMessage } = useIntl()

  const [status, setStatus] = useState()
  const [orderIdLike, setOrderIdLike] = useState<string | null>(null)
  const [memberNameAndEmailLike, setMemberNameAndEmailLike] = useState<string | null>(null)
  const [pagination, setPagination] = useState<TablePaginationConfig>({})

  const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE
  const { loadingOrderLog, dataSource, totalCount, refetchUseDataSource } = useDataSource(
    pageSize,
    pagination,
    status,
    orderIdLike,
    memberNameAndEmailLike,
    { memberId },
  )

  const columns: ColumnProps<any>[] = [
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
          setOrderIdLike(null)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm && confirm()
          selectedKeys && setOrderIdLike(`%${selectedKeys[0]}%`)
        },
      }),
    },
    {
      title: formatMessage(commonMessages.label.orderLogPaymentDate),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: Date, record: OrderRow) => {
        const orderLogPaymentDate = moment(value || record.createdAt)

        return (
          <StyledCell>
            <div>{orderLogPaymentDate.format('YYYY-MM-DD')}</div>
            <div>{orderLogPaymentDate.format('HH:mm')}</div>
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
          setMemberNameAndEmailLike(null)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm && confirm()
          selectedKeys && setMemberNameAndEmailLike(`%${selectedKeys[0]}%`)
        },
      }),
      render: (text, record, index) => (
        <StyledCell>
          <div>
            {record.name}
            <span className="ml-2">/</span>
          </div>
          <div>{record.email}</div>
        </StyledCell>
      ),
    },
    {
      title: formatMessage(commonMessages.label.orderLogStatus),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <OrderStatusTag status={status} />,
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

  const expandedRow = (record: OrderRow) => {
    return (
      <div>
        {record.orderProducts.map(orderProduct => (
          <React.Fragment key={orderProduct.id}>
            <div className="row">
              <div className="col-2">
                <ProductTypeLabel productType={orderProduct.product.type} />
              </div>
              <div className="col-8">
                {orderProduct.name}
                {orderProduct.endedAt && orderProduct.product.type !== 'AppointmentPlan' && (
                  <span className="ml-2">
                    {`(${moment(orderProduct.endedAt).format('YYYY-MM-DD')} ${formatMessage(
                      commonMessages.status.productExpired,
                    )})`}
                  </span>
                )}
                {orderProduct.startedAt && orderProduct.endedAt && orderProduct.product.type === 'AppointmentPlan' && (
                  <span>
                    (
                    {dateRangeFormatter({
                      startedAt: orderProduct.startedAt,
                      endedAt: orderProduct.endedAt,
                      dateFormat: 'YYYY-MM-DD',
                    })}
                    )
                  </span>
                )}
                {orderProduct.quantity && <span>{` X ${orderProduct.quantity} `}</span>}
              </div>
              <div className="col-2 text-right">{currencyFormatter(orderProduct.price)}</div>
            </div>
            <Divider />
          </React.Fragment>
        ))}
        <div className="row">
          <div className="col-3" style={{ fontSize: '14px' }}>
            {record.orderExecutors.length !== 0 && <div>承辦人：{record.orderExecutors.join('、')}</div>}
            {record.paymentMethod && <div>付款方式：{record.paymentMethod}</div>}
            {record.expiredAt && <div>付款期限：{moment(record.expiredAt).format('YYYY-MM-DD')}</div>}
          </div>
          <div className="col-9">
            {record.shipping?.shippingMethod && typeof record.shipping?.fee === 'number' && (
              <div className="row text-right">
                <div className="col-9">
                  <ShippingMethodLabel shippingMethodId={record.shipping.shippingMethod} />
                </div>
                <div className="col-3">{currencyFormatter(record.shipping.fee || 0)}</div>
              </div>
            )}
            {record.orderDiscounts.map(orderDiscount => {
              return (
                <div className="row text-right">
                  <div className="col-9">{orderDiscount.name}</div>
                  <div className="col-3">- {currencyFormatter(orderDiscount.price)}</div>
                </div>
              )
            })}
            <div className="row align-items-center">
              <div className="col-9 text-right">{formatMessage(commonMessages.label.totalPrice)}</div>
              <div className="col-3 text-right">{currencyFormatter(record.totalPrice)}</div>
            </div>
          </div>
        </div>

        {record.orderProducts.some(
          orderProduct =>
            (orderProduct.endedAt?.getTime() || 0) > Date.now() &&
            ['ProgramPlan', 'ProjectPlan', 'PodcastPlan', 'ProgramPackagePlan'].includes(orderProduct.product.type),
        ) &&
          (record.orderProducts.some(orderProduct => orderProduct.options?.unsubscribedAt) ? (
            <div className="row col-12 align-items-center pt-3">
              <span style={{ color: '#9b9b9b', fontSize: '14px' }}>
                {formatMessage(commonMessages.text.cancelSubscriptionDate, {
                  date: dateFormatter(
                    record.orderProducts.find(orderProduct => orderProduct.options?.unsubscribedAt)?.options
                      ?.unsubscribedAt,
                  ),
                })}
              </span>
            </div>
          ) : (
            <div className="row col-12 align-items-center pt-3">
              <SubscriptionCancelModal
                orderProducts={record.orderProducts.map(orderProduct => ({
                  id: orderProduct.id,
                  options: orderProduct.options,
                }))}
                onRefetch={refetchUseDataSource}
              />
            </div>
          ))}
      </div>
    )
  }

  const handleTableChange = ({ current }: TablePaginationConfig, filters: any) => {
    setPagination({ ...pagination, current })
    filters.status && setStatus(filters.status[0])
  }

  return (
    <AdminCard>
      <StyledContainer>
        <div className="d-flex justify-content-end">
          <Typography.Text type="secondary">
            {formatMessage(commonMessages.text.totalCount, { count: `${totalCount}` })}
          </Typography.Text>
        </div>

        <Table
          loading={loadingOrderLog}
          rowKey="id"
          dataSource={dataSource}
          columns={columns}
          onChange={handleTableChange}
          pagination={{
            defaultPageSize: DEFAULT_PAGE_SIZE,
            total: totalCount || undefined,
            ...pagination,
          }}
          expandedRowRender={expandedRow}
        />
      </StyledContainer>
    </AdminCard>
  )
}

const getColumnSearchProps = ({
  onReset,
  onSearch,
}: {
  // dataIndex: string,
  onReset: (clearFilters: any) => void
  onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
}): ColumnProps<any> => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div className="p-2">
      <Input
        autoFocus
        value={selectedKeys && selectedKeys[0]}
        onChange={e => setSelectedKeys && setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => onSearch(selectedKeys, confirm)}
        style={{ width: 188, marginBottom: 8, display: 'block' }}
      />
      <StyledFilterButton
        type="primary"
        icon="search"
        size="small"
        onClick={() => onSearch(selectedKeys, confirm)}
        className="mr-2"
      >
        Search
      </StyledFilterButton>
      <StyledFilterButton size="small" onClick={() => onReset(clearFilters)}>
        Reset
      </StyledFilterButton>
    </div>
  ),
  filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
})

const useDataSource = (
  pageSize: number,
  pagination: TablePaginationConfig,
  status: any,
  orderIdLike: string | null,
  memberNameAndEmailLike: string | null,
  options?: { memberId?: string },
) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ORDERS, types.GET_ORDERSVariables>(GET_ORDERS, {
    variables: {
      limit: pageSize,
      offset: pageSize * ((pagination.current || DEFAULT_PAGE_CURRENT) - 1),
      status,
      orderIdLike,
      memberNameAndEmailLike,
      memberId: options?.memberId,
    },
  })

  const dataSource: OrderRow[] =
    loading || error || !data
      ? []
      : data.order_log.map(log => ({
          id: log.id,
          createdAt: log.created_at,
          status: log.status,
          orderProducts: log.order_products.map(orderProduct => ({
            id: orderProduct.id,
            name: orderProduct.name,
            price: orderProduct.price,
            startedAt: orderProduct.started_at && new Date(orderProduct.started_at),
            endedAt: orderProduct.ended_at && new Date(orderProduct.ended_at),
            product: orderProduct.product,
            quantity: orderProduct.options?.quantity,
            options: orderProduct.options,
          })),
          orderDiscounts: log.order_discounts.map(orderDiscount => ({
            id: orderDiscount.id,
            name: orderDiscount.name,
            description: orderDiscount.description,
            price: orderDiscount.price,
          })),
          shipping: log.shipping,
          name: log.member.name,
          email: log.member.email,
          totalPrice:
            sum(log.order_products.map(prop('price'))) -
            sum(log.order_discounts.map(prop('price'))) +
            (log.shipping?.fee || 0),
          expiredAt: log.expired_at,
          paymentMethod: log.payment_logs[0]?.gateway,
          orderExecutors: log.order_executors.map(orderExecutor => orderExecutor.member.name),
        }))
  const totalCount = data?.order_log_aggregate.aggregate?.count || 0

  return {
    loadingOrderLog: loading,
    errorOrderLog: error,
    dataSource,
    totalCount,
    refetchUseDataSource: refetch,
  }
}

const GET_ORDERS = gql`
  query GET_ORDERS(
    $offset: Int
    $limit: Int
    $status: String
    $orderIdLike: String
    $memberNameAndEmailLike: String
    $memberId: String
  ) {
    order_log_aggregate(
      where: {
        id: { _like: $orderIdLike }
        status: { _eq: $status }
        member: {
          _or: [{ name: { _like: $memberNameAndEmailLike } }, { email: { _like: $memberNameAndEmailLike } }]
          id: { _eq: $memberId }
        }
      }
    ) {
      aggregate {
        count
      }
    }
    order_log(
      offset: $offset
      limit: $limit
      where: {
        id: { _like: $orderIdLike }
        status: { _eq: $status }
        member: {
          _or: [{ name: { _like: $memberNameAndEmailLike } }, { email: { _like: $memberNameAndEmailLike } }]
          id: { _eq: $memberId }
        }
      }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      status
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
      shipping
      member {
        name
        email
      }
      expired_at
      payment_logs(order_by: { created_at: desc }, limit: 1) {
        gateway
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
