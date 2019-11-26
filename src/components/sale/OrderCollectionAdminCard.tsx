import { useQuery } from '@apollo/react-hooks'
import { Divider, Skeleton, Table, Tooltip } from 'antd'
import { CardProps } from 'antd/lib/card'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import { prop, sum } from 'ramda'
import React from 'react'
import styled from 'styled-components'
import { array, InferType, object } from 'yup'
import { currencyFormatter, dateFormatter, productTypeFormatter } from '../../helpers'
import { ProductType } from '../../schemas/general'
import { orderProductSchema, orderSchema } from '../../schemas/order'
import types from '../../types'
import AdminCard from '../common/AdminCard'
import OrderStatusTag from './OrderStatusTag'

const StyledContainer = styled.div`
  overflow: auto;

  .ant-table {
    .ant-table-thead,
    .ant-table-row {
      white-space: nowrap;
    }
  }
`
const StyledDate = styled.span`
  color: #9b9b9b;
`
const StyledOrderItem = styled.div`
  overflow: hidden;
  white-space: nowrap;

  > div:first-child {
    width: 64px;
  }
`

type OrderCollectionAdminCardProps = CardProps & {
  memberId: string
}
const OrderCollectionAdminCard: React.FC<OrderCollectionAdminCardProps> = ({ memberId }) => {
  const { loading, error, data } = useQuery<types.GET_MEMBER_ORDERS, types.GET_MEMBER_ORDERSVariables>(
    GET_MEMBER_ORDERS,
    {
      variables: { memberId },
    },
  )

  if (loading) {
    return (
      <AdminCard>
        <Skeleton active />
      </AdminCard>
    )
  }

  if (error || !data) {
    return (
      <AdminCard>
        <Skeleton active />
      </AdminCard>
    )
  }

  const castData = gqlResultSchema.cast(data)
  const dataSource =
    castData.orderLog
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0))
      .map(value => ({
        ...value,
        key: value.id,
        totalPrice: sum(value.orderProducts.map(prop('price'))) - sum(value.orderDiscounts.map(prop('price'))),
      })) || []

  return (
    <AdminCard>
      <StyledContainer>
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          expandedRowRender={(record: InferType<typeof orderSchema> & { totalPrice: number }) => (
            <div className="pr-3">
              {record.orderProducts.map((orderProducts: InferType<typeof orderProductSchema>) => (
                <div key={orderProducts.id}>
                  <StyledOrderItem className="d-flex align-items-center justify-content-between">
                    <div className="flex-shrink-0 mr-4">
                      {productTypeFormatter(orderProducts.product.type as ProductType)}
                    </div>
                    <div className="flex-grow-1 mr-4">
                      {orderProducts.name}
                      {orderProducts.endedAt && (
                        <span className="ml-2">({moment(orderProducts.endedAt).format('YYYY-MM-DD')} 到期)</span>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">{currencyFormatter(orderProducts.price)}</div>
                  </StyledOrderItem>
                  <Divider />
                </div>
              ))}
              {record.orderDiscounts.map(orderDiscount => (
                <StyledOrderItem className="row text-right">
                  <div className="col-9">
                    <div>
                      <span>{orderDiscount.name}</span>
                    </div>
                  </div>
                  <div className="col-3">
                    <span>- {currencyFormatter(orderDiscount.price)} </span>
                  </div>
                </StyledOrderItem>
              ))}
              <div className="row text-right">
                <div className="col-9">
                  <span>總金額</span>

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

const columns: ColumnProps<any>[] = [
  {
    title: '訂單編號',
    dataIndex: 'id',
    key: 'id',
    width: '100px',
    render: (text: string) => (
      <Tooltip title={text}>
        <span>{text.split('-')[0]}</span>
      </Tooltip>
    ),
  },
  {
    title: '購買日期',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: '200px',
    render: text => <StyledDate>{dateFormatter(text)}</StyledDate>,
  },
  {
    title: '購買總額',
    dataIndex: 'totalPrice',
    key: 'totalPrice',
    align: 'right',
    render: text => currencyFormatter(text),
  },
  {
    title: '訂單狀態',
    dataIndex: 'status',
    key: 'status',
    width: '100px',
    render: (status: string) => <OrderStatusTag status={status} />,
  },
]

const GET_MEMBER_ORDERS = gql`
  query GET_MEMBER_ORDERS($memberId: String!) {
    order_log(where: { member_id: { _eq: $memberId } }) {
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
    }
  }
`

const gqlResultSchema = object({
  orderLog: array(orderSchema).default([]),
}).camelCase()

export default OrderCollectionAdminCard
