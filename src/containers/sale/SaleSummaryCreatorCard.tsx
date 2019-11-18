import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import SaleSummaryCreatorCardComponent from '../../components/sale/SaleSummaryCreatorCard'
import { useMember } from '../../hooks/data'
import * as types from '../../types'

type SaleSummaryCreatorCardProps = {
  memberId: string
}

const SaleSummaryCreatorCard: React.FC<SaleSummaryCreatorCardProps> = ({ memberId }) => {
  const { member } = useMember(memberId)
  const { loading, data, error } = useQuery<
    types.GET_PRODUCT_OWNER_TOTAL_AMOUNT,
    types.GET_PRODUCT_OWNER_TOTAL_AMOUNTVariables
  >(GET_PRODUCT_OWNER_TOTAL_AMOUNT, {
    variables: { memberId },
  })

  const [totalPrice, totalDiscount] =
    loading || error || !data
      ? [0, 0]
      : [
          data.order_product_aggregate.aggregate && data.order_product_aggregate.aggregate.sum
            ? data.order_product_aggregate.aggregate.sum.price
            : 0,
          data.order_discount_aggregate.aggregate && data.order_discount_aggregate.aggregate.sum
            ? data.order_discount_aggregate.aggregate.sum.price
            : 0,
        ]

  return (
    <SaleSummaryCreatorCardComponent
      loading={loading}
      error={error}
      totalPrice={totalPrice}
      totalDiscount={totalDiscount}
      avatar={(member && member.pictureUrl) || ''}
      name={(member && member.name) || ''}
    />
  )
}

const GET_PRODUCT_OWNER_TOTAL_AMOUNT = gql`
  query GET_PRODUCT_OWNER_TOTAL_AMOUNT($memberId: String!) {
    order_product_aggregate(
      where: {
        order_log: {
          status: { _eq: "SUCCESS" }
          order_products: { product: { product_owner: { member_id: { _eq: $memberId } } } }
        }
      }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
    order_discount_aggregate(
      where: {
        order_log: {
          status: { _eq: "SUCCESS" }
          order_products: { product: { product_owner: { member_id: { _eq: $memberId } } } }
        }
      }
    ) {
      aggregate {
        sum {
          price
        }
      }
    }
  }
`

export default SaleSummaryCreatorCard
