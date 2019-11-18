import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
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
  const orderProducts: types.GET_PRODUCT_OWNER_ORDERS_order_product[] = (data && data.order_product) || []
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
      order_log {
        id
        member_id
        created_at
      }
    }
  }
`

export default SaleCollectionCreatorCard
