import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, notification, Select } from 'antd'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment-timezone'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AllMemberSelector } from '../../components/form/MemberSelector'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import pageMessages from '../../pages/translation'

const StyledCheckbox = styled(Checkbox)`
  padding: 12px;
`

const SelectMember = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    align-items: center;
    a {
      margin-left: 16px;
    }
  }
`

type MemberContract = {
  id: string
  orderId: string
  coinLogs: Array<CoinLog>
  couponPlans: Array<string>
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

type CoinLog = Object & {
  id: string
  orderId: string
  coinLogs: Array<object>
  couponPlans: Array<string>
  expireDate: string
}

type Coupon = {
  coupon_code: {
    data: {
      coupon_plan: {
        data: {
          id: string
        }
      }
    }
  }
}

const errorNotification = (msg: string) => {
  notification.error({
    message: `${msg}`,
    placement: 'topRight',
    duration: 3,
  })
}

const successNotification = (msg: string) => {
  notification.success({
    message: `${msg}`,
    placement: 'topRight',
    duration: 3,
  })
}

const TraineesDayOffBlock: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [memberId, setMemberId] = useState<string>('')
  const [contract, setContract] = useState<MemberContract>()
  const [orderId, setOrderId] = useState<string>('')
  const [memberCardProductId, setMemberCardProductId] = useState<string>('')
  const [checkedOrderProductIds, setCheckedOrderProductIds] = useState<string[]>([])
  const [startedAt, setStartedAt] = useState<Moment | null>()
  const [endedAt, setEndedAt] = useState<Moment | null>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [updateOrderProducts] = useMutation<hasura.UPDATE_ORDER_PRODUCTS, hasura.UPDATE_ORDER_PRODUCTSVariables>(
    UPDATE_ORDER_PRODUCTS,
  )
  const [updateCoinLogs] = useMutation<hasura.UPDATE_COIN_LOGS, hasura.UPDATE_COIN_LOGSVariables>(UPDATE_COIN_LOGS)
  const [updateCouponPlans] = useMutation<hasura.UPDATE_COUPON_PLANS, hasura.UPDATE_COUPON_PLANSVariables>(
    UPDATE_COUPON_PLANS,
  )

  const handleSubmit = (setLoading: (isLoading: boolean) => void) => {
    setLoading(true)

    if (memberId === '') {
      errorNotification('請選擇學員')
      setLoading(false)
      return
    }

    if (contract === undefined) {
      errorNotification('請選擇一個合約')
      setLoading(false)
      return
    }

    const coinLogIds = contract.coinLogs?.map((v: CoinLog) => v.id) || null

    if (coinLogIds === null) {
      errorNotification('請檢查此合約是否有coin_log')
      setLoading(false)
      return
    }

    if (contract.couponPlans === undefined) {
      errorNotification('請檢查此合約是否有coupon_plan')
      setLoading(false)
      return
    }

    if (!checkedOrderProductIds.includes(memberCardProductId)) {
      errorNotification('請勾選會員卡')
      setLoading(false)
      return
    }

    if (checkedOrderProductIds.length === 0) {
      errorNotification('請勾選至少一項')
      setLoading(false)
      return
    }

    if (!startedAt || !endedAt) {
      errorNotification('開始/結束時間為必填')
      setLoading(false)
      return
    }

    const updatedStartedAt = moment(startedAt.format('YYYY-MM-DD')).toISOString()
    const updatedEndedAt = endedAt.endOf('day').toISOString()

    const orderProductsInput: hasura.UPDATE_ORDER_PRODUCTSVariables = {
      orderProductIds: checkedOrderProductIds,
      startedAt: updatedStartedAt,
      endedAt: updatedEndedAt,
    }

    const coinLogsInput: hasura.UPDATE_COIN_LOGSVariables = {
      coinLogIds: coinLogIds,
      startedAt: updatedStartedAt,
      endedAt: updatedEndedAt,
    }

    const couponPlansInput: hasura.UPDATE_COUPON_PLANSVariables = {
      couponPlanIds: contract.couponPlans,
      startedAt: updatedStartedAt,
      endedAt: updatedEndedAt,
    }

    Promise.all([
      updateOrderProducts({ variables: orderProductsInput }),
      updateCoinLogs({ variables: coinLogsInput }),
      updateCouponPlans({ variables: couponPlansInput }),
    ])
      .then(() => {
        successNotification('更新成功')
        setLoading(false)
      })
      .catch(e => {
        errorNotification('更新學員資訊錯誤，請聯繫工程師')
        alert(e)
        setLoading(false)
      })
  }

  return (
    <>
      <Form layout="horizontal">
        <SelectMember label="選擇學員">
          <AllMemberSelector
            className="col-6"
            placeholder={formatMessage(pageMessages['*'].chooseMember)}
            onChange={memberId => {
              if (typeof memberId === 'string') {
                setMemberId(memberId)
              }
            }}
          ></AllMemberSelector>
          {memberId && (
            <Link to={location => ({ ...location, pathname: `/members/${memberId}` })} target="_blank" rel="noopener">
              查看學員
            </Link>
          )}
        </SelectMember>
        <Form.Item label="選擇合約">
          <ContractSelect
            memberId={memberId}
            setContract={setContract}
            setOrderId={setOrderId}
            setMemberCardProductId={setMemberCardProductId}
            setCheckedOrderProductIds={setCheckedOrderProductIds}
          />
        </Form.Item>
        <Form.Item label="勾選訂單產品">
          <OrderProductCheckBoxes
            orderId={orderId}
            checkedOrderProductIds={checkedOrderProductIds}
            startedAt={startedAt}
            endedAt={endedAt}
            setMemberCardProductId={setMemberCardProductId}
            setCheckedOrderProductIds={setCheckedOrderProductIds}
            setStartedAt={setStartedAt}
            setEndedAt={setEndedAt}
          />
        </Form.Item>
        <Form.Item label="合約(會員卡)開始時間">
          <DatePicker value={startedAt} onChange={v => setStartedAt(v)} />
        </Form.Item>
        <Form.Item label="合約(會員卡)結束時間">
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
  setMemberCardProductId: (memberCardProductId: string) => void
  setCheckedOrderProductIds: (checkedOrderProductIds: Array<string>) => void
}> = ({ memberId, setContract, setOrderId, setMemberCardProductId, setCheckedOrderProductIds }) => {
  const { contractsLoading, contractsError, memberContracts } = useMemberContractExpirationDate(memberId)
  if (contractsError) {
    alert(contractsError)
    return <h1>合約讀取錯誤，請聯繫工程師</h1>
  }
  return (
    <Select
      onChange={idx => {
        if (typeof idx === 'number') {
          setContract(memberContracts[idx])
          setOrderId(memberContracts[idx].orderId)
          setMemberCardProductId('')
          setCheckedOrderProductIds([])
        }
      }}
    >
      {!contractsLoading &&
        memberContracts.map((contract, idx) => (
          <Select.Option
            key={contract.id}
            value={idx}
          >{`${contract.id} (到期日：${contract.expireDate})`}</Select.Option>
        ))}
    </Select>
  )
}

const OrderProductCheckBoxes: React.VFC<{
  orderId: string
  checkedOrderProductIds: Array<string>
  startedAt?: Moment | null
  endedAt?: Moment | null
  setMemberCardProductId: (memberCardProductId: string) => void
  setCheckedOrderProductIds: (checkedOrderProductIds: Array<string>) => void
  setStartedAt: (startDate: Moment) => void
  setEndedAt: (endDate: Moment) => void
}> = ({
  orderId,
  checkedOrderProductIds,
  startedAt,
  endedAt,
  setMemberCardProductId,
  setCheckedOrderProductIds,
  setStartedAt,
  setEndedAt,
}) => {
  const { orderProductsLoading, orderProductsError, orderProducts } = useContractOrderProduct(orderId)
  if (orderProductsError) {
    alert(orderProductsError)
    return <h1>訂單產品讀取錯誤，請聯繫工程師</h1>
  }

  if (orderProductsLoading) {
    return <h1>Loading...</h1>
  }

  const orderProductOptions = orderProducts.map(product => {
    if (product.productId.includes('Card_')) {
      if (!startedAt && !endedAt) {
        setStartedAt(moment(product.startedAt).tz('Asia/Taipei'))
        setEndedAt(moment(product.endedAt).tz('Asia/Taipei'))
      }
      setMemberCardProductId(product.id)
      return { id: product.id, name: `${product.name} (${product.price}元)` }
    }
    return { id: product.id, name: `${product.name} (${product.price}元)` }
  })

  return (
    <Checkbox.Group
      value={checkedOrderProductIds}
      onChange={v => {
        const checkedOrderProducts = orderProducts.filter(product => {
          let checkedId = ''
          v.forEach(checkedOrderProductId => {
            if (typeof checkedOrderProductId === 'string' && product.id === checkedOrderProductId) {
              checkedId = product.id
            }
          })
          return checkedId
        })
        setCheckedOrderProductIds(checkedOrderProducts.map(product => product.id))
      }}
    >
      {orderProductOptions.map(option => {
        return (
          <StyledCheckbox key={option.id} value={option.id}>
            {option.name}
          </StyledCheckbox>
        )
      })}
    </Checkbox.Group>
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
      const couponPlans = v.values.coupons.filter((coupon: Coupon) => {
        return coupon.coupon_code.data.coupon_plan?.data.id !== undefined
      })
      return {
        id: v.id,
        orderId: v.values.orderId,
        coinLogs: v.values.coinLogs,
        couponPlans: couponPlans.map((couponPlan: Coupon) => {
          return couponPlan.coupon_code.data.coupon_plan.data.id
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

const UPDATE_ORDER_PRODUCTS = gql`
  mutation UPDATE_ORDER_PRODUCTS($orderProductIds: [uuid!]!, $startedAt: timestamptz!, $endedAt: timestamptz!) {
    update_order_product(
      where: { id: { _in: $orderProductIds } }
      _set: { started_at: $startedAt, ended_at: $endedAt }
    ) {
      affected_rows
    }
  }
`

const UPDATE_COIN_LOGS = gql`
  mutation UPDATE_COIN_LOGS($coinLogIds: [uuid!]!, $startedAt: timestamptz!, $endedAt: timestamptz!) {
    update_coin_log(where: { id: { _in: $coinLogIds } }, _set: { started_at: $startedAt, ended_at: $endedAt }) {
      affected_rows
    }
  }
`

const UPDATE_COUPON_PLANS = gql`
  mutation UPDATE_COUPON_PLANS($couponPlanIds: [uuid!]!, $startedAt: timestamptz!, $endedAt: timestamptz!) {
    update_coupon_plan(where: { id: { _in: $couponPlanIds } }, _set: { started_at: $startedAt, ended_at: $endedAt }) {
      affected_rows
    }
  }
`

export default TraineesDayOffBlock
