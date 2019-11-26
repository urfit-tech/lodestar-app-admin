import { useMutation, useQuery } from '@apollo/react-hooks'
import { message } from 'antd'
import { generate } from 'coupon-code'
import gql from 'graphql-tag'
import { reverse, times } from 'ramda'
import React from 'react'
import { VoucherPlanFields } from '../../components/voucher/VoucherPlanAdminModal'
import VoucherPlanCollectionBlockComponent from '../../components/voucher/VoucherPlanCollectionBlock'
import types from '../../types'

const VoucherPlanCollectionBlock = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_VOUCHER_PLAN_COLLECTION>(GET_VOUCHER_PLAN_COLLECTION)
  const [insertVoucherPlan] = useMutation<types.INSERT_VOUCHER_PLAN, types.INSERT_VOUCHER_PLANVariables>(
    INSERT_VOUCHER_PLAN,
  )
  const [updateVoucherPlan] = useMutation<types.UPDATE_VOUCHER_PLAN, types.UPDATE_VOUCHER_PLANVariables>(
    UPDATE_VOUCHER_PLAN,
  )

  const voucherPlanCollection =
    loading || error || !data
      ? []
      : reverse(data.voucher_plan).map(voucherPlan => {
          const [count, remaining] =
            voucherPlan.voucher_codes_aggregate.aggregate && voucherPlan.voucher_codes_aggregate.aggregate.sum
              ? [
                  voucherPlan.voucher_codes_aggregate.aggregate.sum.count || 0,
                  voucherPlan.voucher_codes_aggregate.aggregate.sum.remaining || 0,
                ]
              : [0, 0]

          return {
            ...voucherPlan,
            description: decodeURI(voucherPlan.description || ''),
            startedAt: voucherPlan.started_at,
            endedAt: voucherPlan.ended_at,
            productQuantityLimit: voucherPlan.product_quantity_limit,
            available:
              remaining > 0 && (voucherPlan.ended_at ? new Date(voucherPlan.ended_at).getTime() > Date.now() : true),
            voucherCodes: voucherPlan.voucher_codes,
            count: count,
            remaining: remaining,
            productIds: voucherPlan.voucher_plan_products.map(product => product.product_id),
          }
        })

  const handleInsert = (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    values: VoucherPlanFields,
  ) => {
    setLoading(true)

    insertVoucherPlan({
      variables: {
        ...values,
        appId: process.env.REACT_APP_ID || '',
        voucherCodes: values.voucherCodes.flatMap(voucherCode =>
          voucherCode.type === 'random'
            ? times(
                () => ({
                  code: generate(),
                  count: 1,
                  remaining: 1,
                }),
                voucherCode.count,
              )
            : {
                code: voucherCode.code,
                count: voucherCode.count,
                remaining: voucherCode.count,
              },
        ),
        voucherPlanProducts: values.voucherPlanProducts.flatMap(productId => ({
          product_id: productId,
        })),
      },
    })
      .then(() => {
        setVisible(false)
        message.success('已建立兌換方案')
        refetch()
      })
      .catch(() => {
        message.error(`建立兌換方案失敗`)
      })
      .finally(() => setLoading(false))
  }

  const handleUpdate = (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    values: VoucherPlanFields,
    voucherPlanId: string,
  ) => {
    setLoading(true)

    updateVoucherPlan({
      variables: {
        ...values,
        voucherPlanId,
        appId: process.env.REACT_APP_ID || '',
        description: encodeURI(values.description || ''),
        voucherPlanProducts: values.voucherPlanProducts.flatMap(productId => ({
          voucher_plan_id: voucherPlanId,
          product_id: productId,
        })),
      },
    })
      .then(() => {
        setVisible(false)
        message.success('已更新兌換方案')
        refetch()
      })
      .catch(() => {
        message.error(`更新兌換方案失敗`)
      })
      .finally(() => setLoading(false))
  }

  return (
    <VoucherPlanCollectionBlockComponent
      loading={loading}
      error={error}
      voucherPlanCollection={voucherPlanCollection}
      onInsert={handleInsert}
      onUpdate={handleUpdate}
    />
  )
}

const GET_VOUCHER_PLAN_COLLECTION = gql`
  query GET_VOUCHER_PLAN_COLLECTION {
    voucher_plan {
      id
      title
      description
      started_at
      ended_at
      product_quantity_limit
      voucher_codes {
        id
        code
        count
        remaining
      }
      voucher_codes_aggregate {
        aggregate {
          sum {
            count
            remaining
          }
        }
      }
      voucher_plan_products {
        id
        product_id
      }
    }
  }
`

const INSERT_VOUCHER_PLAN = gql`
  mutation INSERT_VOUCHER_PLAN(
    $title: String!
    $description: String
    $appId: String!
    $startedAt: timestamptz
    $endedAt: timestamptz
    $productQuantityLimit: Int!
    $voucherCodes: [voucher_code_insert_input!]!
    $voucherPlanProducts: [voucher_plan_product_insert_input!]!
  ) {
    insert_voucher_plan(
      objects: {
        title: $title
        description: $description
        app_id: $appId
        started_at: $startedAt
        ended_at: $endedAt
        product_quantity_limit: $productQuantityLimit
        voucher_codes: { data: $voucherCodes }
        voucher_plan_products: { data: $voucherPlanProducts }
      }
    ) {
      affected_rows
    }
  }
`
const UPDATE_VOUCHER_PLAN = gql`
  mutation UPDATE_VOUCHER_PLAN(
    $voucherPlanId: uuid!
    $title: String!
    $description: String
    $appId: String!
    $startedAt: timestamptz
    $endedAt: timestamptz
    $productQuantityLimit: Int!
    $voucherPlanProducts: [voucher_plan_product_insert_input!]!
  ) {
    update_voucher_plan(
      where: { id: { _eq: $voucherPlanId } }
      _set: {
        title: $title
        description: $description
        app_id: $appId
        started_at: $startedAt
        ended_at: $endedAt
        product_quantity_limit: $productQuantityLimit
      }
    ) {
      affected_rows
    }
    delete_voucher_plan_product(where: { voucher_plan_id: { _eq: $voucherPlanId } }) {
      affected_rows
    }
    insert_voucher_plan_product(objects: $voucherPlanProducts) {
      affected_rows
    }
  }
`

export default VoucherPlanCollectionBlock
