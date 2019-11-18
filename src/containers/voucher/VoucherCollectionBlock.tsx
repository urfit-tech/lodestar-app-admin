import { message } from 'antd'
import axios from 'axios'
import gql from 'graphql-tag'
import { reverse } from 'ramda'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { useAuth } from '../../components/auth/AuthContext'
import VoucherCollectionBlockComponent from '../../components/voucher/VoucherCollectionBlock'
import types from '../../types'

const VoucherCollectionBlock = () => {
  const { currentMemberId } = useAuth()
  const { loading, error, data, refetch } = useQuery<types.GET_VOUCHER_COLLECTION>(GET_VOUCHER_COLLECTION)

  const voucherCollection =
    loading || error || !data
      ? []
      : reverse(data.voucher).map(voucher => ({
          ...voucher,
          title: voucher.voucher_code.voucher_plan.title,
          startedAt: voucher.voucher_code.voucher_plan.started_at
            ? new Date(voucher.voucher_code.voucher_plan.started_at)
            : undefined,
          endedAt: voucher.voucher_code.voucher_plan.ended_at
            ? new Date(voucher.voucher_code.voucher_plan.ended_at)
            : undefined,
          productQuantityLimit: voucher.voucher_code.voucher_plan.product_quantity_limit,
          available: !voucher.status || voucher.status.outdated || voucher.status.used ? false : true,
          productIds: voucher.voucher_code.voucher_plan.voucher_plan_products.map(product => product.product_id),
          description: decodeURI(voucher.voucher_code.voucher_plan.description || ''),
        }))

  const handleInsert = (setLoading: React.Dispatch<React.SetStateAction<boolean>>, code: string) => {
    if (!currentMemberId) {
      return
    }

    setLoading(true)

    insertVoucherCode(currentMemberId, code)
      .then(data => {
        message.success('成功加入兌換券')
        refetch()
      })
      .catch(error => {
        try {
          message.error(error.response.data.message)
        } catch (error) {
          message.error('無法加入兌換券')
        }
      })
      .finally(() => setLoading(false))
  }

  const handleExchange = (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    selectedProductIds: string[],
    voucherId: string,
  ) => {
    if (!currentMemberId) {
      return
    }

    setLoading(true)

    exchangeVoucherCode(currentMemberId, voucherId, selectedProductIds)
      .then(data => {
        setVisible(false)
        message.success('兌換成功，請到「我的主頁」查看')
        refetch()
      })
      .catch(error => {
        try {
          message.error(error.response.data.message)
        } catch (error) {
          message.error('無法使用兌換券')
        }
      })
      .finally(() => setLoading(false))
  }

  return (
    <VoucherCollectionBlockComponent
      memberId={currentMemberId}
      loading={loading}
      error={error}
      voucherCollection={voucherCollection}
      onInsert={handleInsert}
      onExchange={handleExchange}
    />
  )
}

const insertVoucherCode = (memberId: string, code: string) => {
  return axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/insertVoucherCode`, {
    appId: process.env.REACT_APP_ID,
    memberId,
    code,
  })
}

const exchangeVoucherCode = (memberId: string, voucherId: string, selectedProductIds: string[]) => {
  return axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/placeOrder`, {
    appId: process.env.REACT_APP_ID,
    memberId,
    discount: {
      type: 'Voucher',
      target: voucherId,
    },
    productIds: selectedProductIds,
  })
}

const GET_VOUCHER_COLLECTION = gql`
  query GET_VOUCHER_COLLECTION {
    voucher {
      id
      status {
        outdated
        used
      }
      voucher_code {
        id
        code
        voucher_plan {
          id
          title
          description
          started_at
          ended_at
          product_quantity_limit
          voucher_plan_products {
            id
            product_id
          }
        }
      }
    }
  }
`

export default VoucherCollectionBlock
