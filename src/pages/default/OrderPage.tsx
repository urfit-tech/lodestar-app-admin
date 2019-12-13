import { useQuery } from '@apollo/react-hooks'
import { Button, Icon, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import ReactPixel from 'react-facebook-pixel'
import { Link } from 'react-router-dom'
import useRouter from 'use-react-router'
import AdminCard from '../../components/admin/AdminCard'
import DefaultLayout from '../../components/layout/DefaultLayout'
import settings from '../../settings'
import * as types from '../../types'

const OrderPage = () => {
  // TODO: get orderId and show items
  const { match } = useRouter<{ orderId: string }>()
  const { loading, data } = useQuery<types.GET_ORDERS_PRODUCT, types.GET_ORDERS_PRODUCTVariables>(GET_ORDERS_PRODUCT, {
    variables: { orderId: match.params.orderId },
  })
  const order = data && data.order_log_by_pk
  useEffect(() => {
    if (order) {
      const productPrice =
        (order.order_products_aggregate.aggregate &&
          order.order_products_aggregate.aggregate.sum &&
          order.order_products_aggregate.aggregate.sum.price) ||
        0
      const discountPrice =
        (order.order_discounts_aggregate.aggregate &&
          order.order_discounts_aggregate.aggregate.sum &&
          order.order_discounts_aggregate.aggregate.sum.price) ||
        0
      settings.trackingId.fbPixel &&
        order.status === 'SUCCESS' &&
        ReactPixel.track('Purchase', {
          value: productPrice - discountPrice,
          currency: 'TWD',
        })
    }
  }, [order])
  return (
    <DefaultLayout noFooter>
      <div
        className="container d-flex align-items-center justify-content-center"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <AdminCard style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="d-flex flex-column align-items-center justify-content-center px-sm-5">
            {!loading &&
              (data && data.order_log_by_pk && data.order_log_by_pk.status === 'SUCCESS' ? (
                <>
                  <Icon
                    className="mb-5"
                    type="check-circle"
                    theme="twoTone"
                    twoToneColor="#4ed1b3"
                    style={{ fontSize: '4rem' }}
                  />
                  <Typography.Title level={4} className="mb-3">
                    購買的項目已開通
                  </Typography.Title>
                  <Typography.Text className="mb-4">
                    若你選擇「ATM轉帳」或「超商付款」需於付款完成後，等待 1-2 個工作日才會開通。
                  </Typography.Text>
                </>
              ) : (
                <>
                  <Icon
                    className="mb-5"
                    type="close-circle"
                    theme="twoTone"
                    twoToneColor="#ff7d62"
                    style={{ fontSize: '4rem' }}
                  />
                  <Typography.Title level={4} className="mb-3">
                    付款失敗
                  </Typography.Title>
                  <Typography.Title level={4} className="mb-3">
                    請確認您的信用卡資料正確後，再付款一次。
                  </Typography.Title>
                </>
              ))}
            <Link to="/">
              <Button>回首頁</Button>
            </Link>
          </div>
        </AdminCard>
      </div>
    </DefaultLayout>
  )
}

export default OrderPage

const GET_ORDERS_PRODUCT = gql`
  query GET_ORDERS_PRODUCT($orderId: String!) {
    order_log_by_pk(id: $orderId) {
      message
      status
      order_discounts_aggregate {
        aggregate {
          sum {
            price
          }
        }
      }
      order_products_aggregate {
        aggregate {
          sum {
            price
          }
        }
      }
    }
  }
`
