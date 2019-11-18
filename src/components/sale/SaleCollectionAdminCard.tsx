import { Button, Divider, Icon, Input, Table, Tooltip, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { ColumnProps, PaginationConfig } from 'antd/lib/table'
import gql from 'graphql-tag'
import { prop, sum } from 'ramda'
import React, { useState } from 'react'
import { useQuery } from 'react-apollo-hooks'
import styled from 'styled-components'
import { array, InferType, number, object, string } from 'yup'
import { currencyFormatter, productTypeFormatter } from '../../helpers'
import { ProductType } from '../../schemas/general'
import { orderProductSchema, orderSchema } from '../../schemas/order'
import AdminCard from '../common/AdminCard'
import OrderStatusTag from './OrderStatusTag'

const StyledContainer = styled.div`
  overflow: auto;
`
const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_PAGE_CURRENT = 1

const SaleCollectionAdminCard: React.FC<CardProps> = () => {
  const [status, setStatus] = useState()
  const [orderIdLike, setOrderIdLike] = useState()
  const [memberNameLike, setMemberNameLike] = useState()
  const [memberEmailLike, setMemberEmailLike] = useState()
  const [pagination, setPagination] = useState<PaginationConfig>({})

  const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE

  const { loading, data } = useQuery(GET_ORDERS, {
    variables: {
      limit: pageSize,
      offset: pageSize * ((pagination.current || DEFAULT_PAGE_CURRENT) - 1),
      status,
      orderIdLike,
      memberNameLike,
      memberEmailLike,
    },
  })
  const castData = gqlResultSchema.cast(data)
  const totalCount = castData.orderLogAggregate.aggregate.count

  const columns: ColumnProps<any>[] = [
    {
      title: '訂單編號',
      dataIndex: 'id',
      key: 'id',
      width: '150px',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.split('-')[0]}</span>
        </Tooltip>
      ),
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setOrderIdLike(undefined)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm && confirm()
          selectedKeys && setOrderIdLike(`%${selectedKeys[0]}%`)
        },
      }),
    },
    {
      title: '姓名',
      dataIndex: 'member.name',
      key: 'name',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setMemberNameLike(undefined)
        },
        onSearch: (selectedKeys, confirm) => {
          confirm && confirm()
          selectedKeys && setMemberNameLike(`%${selectedKeys[0]}%`)
        },
      }),
    },
    {
      title: 'Email',
      dataIndex: 'member.email',
      key: 'email',
      width: '260px',
      ...getColumnSearchProps({
        onReset: () => {
          setMemberEmailLike(undefined)
        },
        onSearch: (selectedKeys, confirm) => {
          selectedKeys && setMemberEmailLike(`%${selectedKeys[0]}%`)
        },
      }),
    },
    {
      title: '訂單狀態',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (status: string) => <OrderStatusTag status={status} />,
      filters: [
        {
          text: '已完成',
          value: 'SUCCESS',
        },
        {
          text: '待付款',
          value: 'UNPAID',
        },
      ],
    },
    {
      title: '訂單金額',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: currencyFormatter,
    },
  ]

  const dataSource = castData.orderLog.map(value => ({
    ...value,
    totalPrice: sum(value.orderProducts.map(prop('price'))) - sum(value.orderDiscounts.map(prop('price'))),
  }))

  const handleTableChange = ({ current }: PaginationConfig, filters: any) => {
    setPagination({ ...pagination, current })
    filters.status && setStatus(filters.status[0])
  }

  return (
    <AdminCard>
      <StyledContainer>
        <div className="d-flex justify-content-end">
          <Typography.Text type="secondary">共 {totalCount} 筆</Typography.Text>
        </div>

        <Table
          loading={loading}
          rowKey="id"
          dataSource={dataSource}
          columns={columns}
          onChange={handleTableChange}
          pagination={{
            defaultPageSize: DEFAULT_PAGE_SIZE,
            total: totalCount,
            ...pagination,
          }}
          expandedRowRender={record => (
            <div>
              {record.orderProducts.map((orderProduct: InferType<typeof orderProductSchema>) => (
                <div key={orderProduct.id}>
                  <div className="row">
                    <div className="col-2">{productTypeFormatter(orderProduct.product.type as ProductType)}</div>
                    <div className="col-8">{orderProduct.name}</div>
                    <div className="col-2 text-right">{currencyFormatter(orderProduct.price)}</div>
                  </div>
                  <Divider />
                </div>
              ))}
              {record.orderDiscounts.map((orderDiscount: { name: string; description: string; price: number }) => {
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
                  <div>
                    <span>總金額</span>
                  </div>

                  {/* {record.status === "UNPAID" && (
                      <Button className="mr-2">取消訂單</Button>
                    )}
                    {record.status === "UNPAID" && (
                      <Button className="mr-2" type="primary">
                        重新付款
                      </Button>
                    )}
                    {record.status === "SUCCESS" && (
                      <Button className="mr-2">查看收據</Button>
                    )} */}
                </div>
                <div className="col-3">
                  <span>{currencyFormatter(record.totalPrice)} </span>
                </div>
              </div>
            </div>
          )}
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
  onSearch: (selectedKeys?: string[], confirm?: () => void) => void
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
        <span>查 詢</span>
      </StyledFilterButton>
      <StyledFilterButton size="small" onClick={() => onReset(clearFilters)}>
        重置
      </StyledFilterButton>
    </div>
  ),
  filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
})

const GET_ORDERS = gql`
  query GET_ORDERS(
    $offset: Int
    $limit: Int
    $status: String
    $orderIdLike: String
    $memberNameLike: String
    $memberEmailLike: String
  ) {
    order_log_aggregate(
      where: {
        id: { _like: $orderIdLike }
        status: { _eq: $status }
        member: { name: { _like: $memberNameLike }, email: { _like: $memberEmailLike } }
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
        member: { name: { _like: $memberNameLike }, email: { _like: $memberEmailLike } }
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

const gqlResultSchema = object({
  orderLogAggregate: object({
    aggregate: object({
      count: number(),
    }),
  }),
  orderLog: array(
    orderSchema.concat(
      object({
        member: object({
          name: string(),
          email: string(),
        }),
      }),
    ),
  ).default([]),
}).camelCase()

export default SaleCollectionAdminCard
