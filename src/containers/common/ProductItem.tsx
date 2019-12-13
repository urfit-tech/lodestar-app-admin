import { useQuery } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import ProductItemComponent, { ProductItemProps } from '../../components/common/ProductItem'
import { ProgramPlanPeriodType } from '../../schemas/program'
import types from '../../types'

const ProductItem: React.FC<{
  id: string
  variant?: 'default' | 'simple' | 'cartItem' | 'checkout'
}> = ({ id, variant }) => {
  const [productType, targetId] = id.split('_')
  const { loading, error, data } = useQuery<types.GET_PROGRAM_SIMPLE, types.GET_PROGRAM_SIMPLEVariables>(
    GET_PRODUCT_SIMPLE,
    { variables: { id: targetId } },
  )

  if (loading || error || !data) {
    return <Skeleton active avatar />
  }

  let target: ProductItemProps

  if (data.program_by_pk) {
    // Program
    target = {
      id: data.program_by_pk.id,
      title: data.program_by_pk.title,
      coverUrl: data.program_by_pk.cover_url || undefined,
      listPrice: data.program_by_pk.list_price,
      salePrice:
        data.program_by_pk.sold_at && new Date(data.program_by_pk.sold_at).getTime() > Date.now()
          ? data.program_by_pk.sale_price
          : undefined,
    }
  } else if (data.program_plan_by_pk) {
    // Program Plan
    target = {
      id: data.program_plan_by_pk.id,
      title: `${data.program_plan_by_pk.program.title} - ${data.program_plan_by_pk.title || ''}`,
      coverUrl: data.program_plan_by_pk.program.cover_url || undefined,
      listPrice: data.program_plan_by_pk.list_price,
      salePrice:
        data.program_plan_by_pk.sold_at && new Date(data.program_plan_by_pk.sold_at).getTime() > Date.now()
          ? data.program_plan_by_pk.sale_price
          : undefined,
      discountDownPrice: data.program_plan_by_pk.discount_down_price || undefined,
      periodType: data.program_plan_by_pk.period_type as ProgramPlanPeriodType,
    }
  } else if (data.program_package_plan_by_pk) {
    target = {
      id: data.program_package_plan_by_pk.id,
      title: data.program_package_plan_by_pk.title,
      coverUrl: data.program_package_plan_by_pk.program_package.cover_url || undefined,
      listPrice: data.program_package_plan_by_pk.list_price,
      salePrice:
        data.program_package_plan_by_pk.sold_at &&
        new Date(data.program_package_plan_by_pk.sold_at).getTime() > Date.now()
          ? data.program_package_plan_by_pk.sale_price
          : undefined,
      discountDownPrice: data.program_package_plan_by_pk.discount_down_price,
      periodAmount: data.program_package_plan_by_pk.period_amount,
      periodType: data.program_package_plan_by_pk.period_type as ProgramPlanPeriodType,
    }
  } else if (data.card_by_pk) {
    // Card
    target = {
      id: data.card_by_pk.id,
      title: data.card_by_pk.title,
      listPrice: 0,
    }
  } else if (data.activity_ticket_by_pk) {
    // Activity Ticket
    target = {
      id: data.activity_ticket_by_pk.id,
      title: `${data.activity_ticket_by_pk.activity.title} - ${data.activity_ticket_by_pk.title}`,
      coverUrl: data.activity_ticket_by_pk.activity.cover_url || undefined,
      listPrice: data.activity_ticket_by_pk.price,
    }
  } else if (data.project_plan_by_pk) {
    // Project Plan
    target = {
      id: data.project_plan_by_pk.id,
      title: `${data.project_plan_by_pk.project.title} - ${data.project_plan_by_pk.title}`,
      coverUrl: data.project_plan_by_pk.cover_url || undefined,
      listPrice: data.project_plan_by_pk.list_price,
      salePrice:
        data.project_plan_by_pk.sold_at && new Date(data.project_plan_by_pk.sold_at).getTime() > Date.now()
          ? data.project_plan_by_pk.sale_price
          : undefined,
      discountDownPrice: data.project_plan_by_pk.discount_down_price || undefined,
      periodAmount: data.project_plan_by_pk.period_amount,
      periodType: data.project_plan_by_pk.period_type as ProgramPlanPeriodType,
    }
  } else {
    return <>{targetId}</>
  }

  return <ProductItemComponent productType={productType} variant={variant} {...target} />
}

const GET_PRODUCT_SIMPLE = gql`
  query GET_PROGRAM_SIMPLE($id: uuid!) {
    program_by_pk(id: $id) {
      id
      title
      cover_url
      is_subscription
      list_price
      sale_price
      sold_at
    }

    program_plan_by_pk(id: $id) {
      id
      title
      list_price
      sale_price
      sold_at
      discount_down_price
      period_type
      program {
        id
        title
        cover_url
      }
    }

    program_package_plan_by_pk(id: $id) {
      id
      title
      list_price
      sale_price
      sold_at
      discount_down_price
      period_amount
      period_type
      program_package {
        id
        title
        cover_url
      }
    }

    card_by_pk(id: $id) {
      id
      title
    }

    activity_ticket_by_pk(id: $id) {
      id
      title
      price
      activity {
        id
        title
        cover_url
      }
    }

    project_plan_by_pk(id: $id) {
      id
      title
      cover_url
      list_price
      sale_price
      sold_at
      discount_down_price
      period_amount
      period_type
      project {
        id
        title
      }
    }
  }
`

export default ProductItem
