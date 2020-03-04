import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import SaleCollectionCreatorCardComponent from '../../components/sale/SaleCollectionCreatorCard'
import * as types from '../../types'

type SaleCollectionCreatorCardProps = {
  memberId: string
}
const SaleCollectionCreatorCard: React.FC<SaleCollectionCreatorCardProps> = ({ memberId }) => {
  const { loading, data, error } = useQuery<types.GET_PRODUCT_OWNER_ORDERS, types.GET_PRODUCT_OWNER_ORDERSVariables>(
    GET_PRODUCT_OWNER_ORDERS,
    { variables: { memberId } },
  )
  const orderProducts = data?.order_product.map(orderProduct => ({
    id: orderProduct.id,
    name: orderProduct.name,
    price: orderProduct.price,
    endedAt: orderProduct.ended_at,
    orderLog: {
      id: orderProduct.order_log.id,
      memberId: orderProduct.order_log.member_id,
      createdAt: orderProduct.order_log.created_at,
    },
  }))
  return <SaleCollectionCreatorCardComponent loading={loading} orderProducts={orderProducts} error={error} />
}

const GET_PRODUCT_OWNER_ORDERS = gql`
  query GET_PRODUCT_OWNER_ORDERS($memberId: String!) {
    order_product(
      order_by: { created_at: desc }
      where: {
        order_log: {
          status: { _eq: "SUCCESS" }
          order_products: { product: { product_owner: { member_id: { _eq: $memberId } } } }
        }
      }
    ) {
      id
      name
      price
      ended_at
      order_log {
        id
        member_id
        created_at
      }
    }
  }
`

export default SaleCollectionCreatorCard
