import { useQuery } from '@apollo/react-hooks'
import { Button, Divider, Icon, Input, Table, Tooltip, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { ColumnProps, PaginationConfig } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { prop, sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { currencyFormatter, desktopViewMixin } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import AdminCard from '../admin/AdminCard'
import ProductTypeLabel from '../common/ProductTypeLabel'
import OrderStatusTag from './OrderStatusTag'

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
  endedAt: Date | null
  product: {
    id: string
    type: string
  }
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
  name: string
  email: string
  totalPrice: number
}
const SaleCollectionAdminCard: React.FC<CardProps> = () => {
  const { formatMessage } = useIntl()

  const [status, setStatus] = useState()
  const [orderIdLike, setOrderIdLike] = useState<string | null>(null)
  const [memberNameAndEmailLike, setMemberNameAndEmailLike] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationConfig>({})

  const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE
  const { loading, dataSource, totalCount } = useDataSource(
    pageSize,
    pagination,
    status,
    orderIdLike,
    memberNameAndEmailLike,
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
      title: formatMessage(commonMessages.label.orderLogDate),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: Date) => {
        const orderLogDate = moment(value)

        return (
          <StyledCell>
            <div>{orderLogDate.format('YYYY-MM-DD')}</div>
            <div>{orderLogDate.format('HH:mm')}</div>
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

  const expandedRow = (record: OrderRow) => (
    <div>
      {record.orderProducts.map(orderProduct => (
        <div key={orderProduct.id}>
          <div className="row">
            <div className="col-2">
              <ProductTypeLabel productType={orderProduct.product.type} />
            </div>
            <div className="col-8">
              {orderProduct.name}
              {orderProduct.endedAt && (
                <span className="ml-2">
                  {`(${moment(orderProduct.endedAt).format('YYYY-MM-DD')} ${formatMessage(
                    commonMessages.status.productExpired,
                  )})`}
                </span>
              )}
            </div>
            <div className="col-2 text-right">{currencyFormatter(orderProduct.price)}</div>
          </div>
          <Divider />
        </div>
      ))}
      {record.orderDiscounts.map(orderDiscount => {
        return (
          <div className="row" style={{ textAlign: 'right' }}>
            <div className="col-9">
              <div>
                <span>{orderDiscount.name}</span>
              </div>
            </div>
            <div className="col-3">
              <span>- {currencyFormatter(orderDiscount.price)} </span>
            </div>
          </div>
        )
      })}
      <div className="row" style={{ textAlign: 'right' }}>
        <div className="col-9">
          <span>{formatMessage(commonMessages.label.totalPrice)}</span>

          {/* {record.status === 'UNPAID' && (
            <Button className="mr-2">{formatMessage(commonMessages.ui.cancelOrder)}</Button>
          )}
          {record.status === 'UNPAID' && (
            <Button className="mr-2" type="primary">
              {formatMessage(commonMessages.ui.retryPayment)}
            </Button>
          )}
          {record.status === 'SUCCESS' && (
            <Button className="mr-2">{formatMessage(commonMessages.ui.checkInvoice)}</Button>
          )} */}
        </div>
        <div className="col-3">
          <span>{currencyFormatter(record.totalPrice)} </span>
        </div>
      </div>
    </div>
  )

  const handleTableChange = ({ current }: PaginationConfig, filters: any) => {
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
          loading={loading}
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
  filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
})

const useDataSource = (
  pageSize: number,
  pagination: PaginationConfig,
  status: any,
  orderIdLike: string | null,
  memberNameAndEmailLike: string | null,
): {
  loading: boolean
  dataSource?: OrderRow[]
  totalCount?: number | null
} => {
  const { loading, data } = useQuery<types.GET_ORDERS, types.GET_ORDERSVariables>(GET_ORDERS, {
    variables: {
      limit: pageSize,
      offset: pageSize * ((pagination.current || DEFAULT_PAGE_CURRENT) - 1),
      status,
      orderIdLike,
      memberNameAndEmailLike,
    },
  })
  return {
    loading,
    dataSource: data?.order_log.map(log => ({
      id: log.id,
      createdAt: log.created_at,
      status: log.status,
      orderProducts: log.order_products.map(orderProduct => ({
        id: orderProduct.id,
        name: orderProduct.name,
        price: orderProduct.price,
        endedAt: orderProduct.ended_at,
        product: orderProduct.product,
      })),
      orderDiscounts: log.order_discounts.map(orderDiscount => ({
        id: orderDiscount.id,
        name: orderDiscount.name,
        description: orderDiscount.description,
        price: orderDiscount.price,
      })),
      name: log.member.name,
      email: log.member.email,
      totalPrice: sum(log.order_products.map(prop('price'))) - sum(log.order_discounts.map(prop('price'))),
    })),
    totalCount: data ? data?.order_log_aggregate?.aggregate?.count : 0,
  }
}

const GET_ORDERS = gql`
  query GET_ORDERS($offset: Int, $limit: Int, $status: String, $orderIdLike: String, $memberNameAndEmailLike: String) {
    order_log_aggregate(
      where: {
        id: { _like: $orderIdLike }
        status: { _eq: $status }
        member: { _or: [{ name: { _like: $memberNameAndEmailLike } }, { email: { _like: $memberNameAndEmailLike } }] }
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
        member: { _or: [{ name: { _like: $memberNameAndEmailLike } }, { email: { _like: $memberNameAndEmailLike } }] }
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
        ended_at
        product {
          id
          type
        }
      }
      order_discounts {
        id
        name
        description
        price
      }
      member {
        name
        email
      }
    }
  }
`

export default SaleCollectionAdminCard
