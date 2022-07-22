import { useQuery } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, Select } from 'antd'
import gql from 'graphql-tag'
import { AllMemberSelector } from 'lodestar-app-admin/src/components/form/MemberSelector'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import pageMessages from 'lodestar-app-admin/src/pages/translation'
import moment, { Moment } from 'moment-timezone'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'

const StyledCheckboxGroup = styled(Checkbox.Group)`
  .ant-checkbox-wrapper.ant-checkbox-group-item {
    padding: 12px;
  }
`

type MemberContract = {
  id: string
  orderId: string
  coinLogs: Array<object>
  couponPlans: Array<object>
  expireDate: string
}

type OrderProduct = {
  id: string
  productId: string
  name: string
  price: number
  startedAt: string
  endedAt: string
}

type Coupon = {
  coupon_code: {
    data: {
      coupon_plan_id: string
      coupon_plan: {
        data: {
          id: string
        }
      }
    }
  }
}

const TraineesDayOffBlock: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [memberId, setMemberId] = useState('')
  const [contract, setContract] = useState({})
  const [orderId, setOrderId] = useState('')
  const [checkedOrderProductIds, setCheckedOrderProductIds] = useState<string[]>([])
  const [startedAt, setStartedAt] = useState<Moment | null>()
  const [endedAt, setEndedAt] = useState<Moment | null>()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (setLoading: (isLoading: boolean) => void) => {
    setLoading(false)
  }

  return (
    <>
      <Form layout="horizontal">
        <Form.Item label="選擇學員">
          <AllMemberSelector
            style={{ width: '100%' }}
            placeholder={formatMessage(pageMessages['*'].chooseMember)}
            onChange={memberId => {
              if (typeof memberId === 'string') {
                setMemberId(memberId)
              }
            }}
          ></AllMemberSelector>
        </Form.Item>
        <Form.Item label="選擇合約">
          <ContractSelect memberId={memberId} setContract={setContract} setOrderId={setOrderId} />
        </Form.Item>
        <Form.Item label="勾選訂單產品">
          <OrderProductCheckBoxes
            orderId={orderId}
            startedAt={startedAt}
            endedAt={endedAt}
            setCheckedOrderProductIds={setCheckedOrderProductIds}
            setStartedAt={setStartedAt}
            setEndedAt={setEndedAt}
          />
        </Form.Item>
        <Form.Item label="開始時間">
          <DatePicker value={startedAt} onChange={v => setStartedAt(v)} />
        </Form.Item>
        <Form.Item label="結束時間">
          <DatePicker value={endedAt} onChange={v => setEndedAt(v)} />
        </Form.Item>
        <Button type="primary" loading={isLoading} onClick={() => handleSubmit(setIsLoading)}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form>
    </>
  )
}

const ContractSelect: React.VFC<{
  memberId: string
  setContract: (contract: MemberContract) => void
  setOrderId: (orderId: string) => void
}> = ({ memberId, setContract, setOrderId }) => {
  const { contractsLoading, contractsError, memberContracts } = useMemberContractExpirationDate(memberId)
  if (contractsError) {
    console.log(contractsError)
    return <h1>合約讀取錯誤，請查看console</h1>
  }
  return (
    <Select
      onChange={idx => {
        if (typeof idx === 'number') {
          setContract(memberContracts[idx])
          setOrderId(memberContracts[idx].orderId)
        }
      }}
    >
      {!contractsLoading &&
        memberContracts.map((contract, idx) => (
          <Select.Option value={idx}>{`${contract.id} (到期日：${contract.expireDate})`}</Select.Option>
        ))}
    </Select>
  )
}

const OrderProductCheckBoxes: React.VFC<{
  orderId: string
  startedAt?: Moment | null
  endedAt?: Moment | null
  setCheckedOrderProductIds: (checkedOrderProductIds: Array<string>) => void
  setStartedAt: (startDate: Moment) => void
  setEndedAt: (endDate: Moment) => void
}> = ({ orderId, startedAt, endedAt, setCheckedOrderProductIds, setStartedAt, setEndedAt }) => {
  const { orderProductsLoading, orderProductsError, orderProducts } = useContractOrderProduct(orderId)
  if (orderProductsError) {
    console.log(orderProductsError)
    return <h1>訂單產品讀取錯誤，請查看console</h1>
  }
  let orderProductOptions: string[] = []
  if (!orderProductsLoading) {
    orderProductOptions = orderProducts.map(product => {
      if (!startedAt && !endedAt && product.productId.includes('Card_')) {
        setStartedAt(moment(product.startedAt).tz('Asia/Taipei'))
        setEndedAt(moment(product.endedAt).tz('Asia/Taipei'))
      }
      return `${product.name} (${product.price}元)`
    })
  }
  return (
    <StyledCheckboxGroup
      options={orderProductOptions}
      onChange={v => {
        const checkedOrderProducts = orderProducts.filter(product => {
          let checkedId = ''
          v.forEach(productName => {
            if (product.name === productName) {
              checkedId = product.id
            }
          })
          return checkedId
        })
        setCheckedOrderProductIds(checkedOrderProducts.map(product => product.id))
      }}
    />
  )
}

const useMemberContractExpirationDate = (memberId: string) => {
  const { loading, error, data } = useQuery<
    hasura.GET_MEMBER_CONTRACTS_EXPIRATION_DATE,
    hasura.GET_MEMBER_CONTRACTS_EXPIRATION_DATEVariables
  >(
    gql`
      query GET_MEMBER_CONTRACTS_EXPIRATION_DATE($memberId: String!) {
        member_contract(where: { member_id: { _eq: $memberId } }) {
          id
          values
          ended_at
        }
      }
    `,
    {
      variables: {
        memberId,
      },
    },
  )
  const memberContracts: MemberContract[] =
    data?.member_contract.map(v => {
      const couponPlans = v.values.coupons.map((coupon: Coupon) => {
        if (coupon.coupon_code.data.coupon_plan_id !== undefined) {
          return coupon.coupon_code.data.coupon_plan_id
        } else if (coupon.coupon_code.data.coupon_plan.data.id !== undefined) {
          return coupon.coupon_code.data.coupon_plan.data.id
        }
      })
      return {
        id: v.id,
        orderId: v.values.orderId,
        coinLogs: v.values.coinLogs,
        couponPlans: couponPlans.filter((couponPlan: string, idx: number, arr: Array<string>) => {
          return arr.indexOf(couponPlan) === idx
        }),
        expireDate: moment(v.ended_at).tz('Asia/Taipei').format('YYYY-MM-DD'),
      }
    }) || []
  return {
    contractsLoading: loading,
    contractsError: error,
    memberContracts,
  }
}

const useContractOrderProduct = (orderId: string) => {
  const { loading, error, data } = useQuery<
    hasura.GET_CONTRACT_ORDER_PRODUCTS,
    hasura.GET_CONTRACT_ORDER_PRODUCTSVariables
  >(
    gql`
      query GET_CONTRACT_ORDER_PRODUCTS($orderId: String!) {
        order_product(where: { order_id: { _eq: $orderId } }) {
          id
          product_id
          name
          price
          started_at
          ended_at
        }
      }
    `,
    {
      variables: {
        orderId,
      },
    },
  )
  const orderProducts: OrderProduct[] =
    data?.order_product.map(product => {
      return {
        id: product.id,
        productId: product.product_id,
        name: product.name,
        price: product.price,
        startedAt: product.started_at,
        endedAt: product.ended_at,
      }
    }) || []
  return { orderProductsLoading: loading, orderProductsError: error, orderProducts }
}

export default TraineesDayOffBlock
