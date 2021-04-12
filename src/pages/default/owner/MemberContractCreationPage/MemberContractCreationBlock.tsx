import { useMutation } from '@apollo/react-hooks'
import { Alert, Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import { pick, range, sum } from 'ramda'
import { useState } from 'react'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { ContractInfo, FieldProps } from '.'
import { useApp } from '../../../../contexts/AppContext'
import { useAuth } from '../../../../contexts/AuthContext'
import hasura from '../../../../hasura'
import { currencyFormatter, notEmpty } from '../../../../helpers'

type OrderItem = {
  id: string
  type: 'mainProduct' | 'addonProduct' | 'referralDiscount' | 'promotionDiscount' | 'depositDiscount'
  name: string
  price: number
  appointments: number
  coins: number
  amount: number
}

const StyledOrder = styled.div`
  border: 1px solid var(--gray-darker);
  padding: 1rem;
`
const StyledTotal = styled.div`
  margin-bottom: 0.5rem;
  color: ${props => props.theme['@primary-color']};
  font-size: 20px;
  text-align: right;
`

const MemberContractCreationBlock: React.FC<{
  member: NonNullable<ContractInfo['member']>
  products: ContractInfo['products']
  contracts: ContractInfo['contracts']
  selectedProjectPlan: ContractInfo['projectPlans'][number] | null
  endedAt: Date | null
  isAppointmentOnly: boolean
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  contractProducts: NonNullable<FieldProps['contractProducts']>
  form: FormInstance<FieldProps>
}> = ({
  member,
  products,
  selectedProjectPlan,
  endedAt,
  isAppointmentOnly,
  memberBlockRef,
  form,
  contractProducts,
  contracts,
}) => {
  const fieldValue = form.getFieldsValue()
  const { id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const [memberContractUrl, setMemberContractUrl] = useState('')

  // calculate order products
  const orderProducts: OrderItem[] = contractProducts
    .map(contractProduct => {
      const product = products.find(product => product.id === contractProduct.id)
      if (!product) {
        return null
      }
      const productType: 'mainProduct' | 'addonProduct' =
        product.name === '業師諮詢' && isAppointmentOnly
          ? 'mainProduct'
          : product.addonPrice
          ? 'addonProduct'
          : 'mainProduct'

      return {
        id: contractProduct.id,
        name: product.name,
        type: productType,
        price: productType === 'mainProduct' ? product.price : product.addonPrice || 0,
        appointments:
          productType === 'mainProduct' && fieldValue?.identity === 'student'
            ? product.appointments / 2
            : product.appointments,
        coins: product.coins,
        amount: contractProduct.amount,
      }
    })
    .filter(notEmpty)
  const mainProducts = orderProducts.filter(selectedProduct => selectedProduct.type === 'mainProduct')
  const totalAppointments = sum(orderProducts.map(product => product.appointments * product.amount))
  const totalCoins = sum(orderProducts.map(product => product.coins * product.amount))
  const contractsOptions = contracts.find(v => v.id === fieldValue.contractId)?.options
  if (fieldValue.withCreatorId && totalAppointments > 0) {
    orderProducts.push({
      id: contractsOptions.projectPlanId['designatedIndustryTeacher'],
      type: 'addonProduct',
      name: '指定業師',
      price: 1000,
      appointments: 0,
      coins: 0,
      amount: totalAppointments,
    })
  }

  // calculate order discounts
  const orderDiscounts: OrderItem[] = []
  const discountPrice = {
    referral: 0,
    student: 0,
    group: 0,
    deposit: -1000,
  }

  if (fieldValue.referralMemberId) {
    discountPrice.referral = 2000 * -1
  }
  if (fieldValue.identity === 'student' && fieldValue?.certification?.file.name) {
    discountPrice.student =
      (sum(mainProducts.map(mainProduct => mainProduct.price)) + discountPrice.referral * mainProducts.length) * -0.1
  }
  discountPrice.group =
    (sum(mainProducts.map(mainProduct => mainProduct.price)) +
      discountPrice.referral * mainProducts.length +
      discountPrice.student) *
    (mainProducts.length < 2 ? 0 : mainProducts.length === 2 ? -0.1 : mainProducts.length === 3 ? -0.15 : -0.2)

  if (discountPrice.referral) {
    orderDiscounts.push({
      id: contractsOptions.couponCodeId['referral'],
      type: 'referralDiscount',
      name: '被介紹人折抵',
      price: discountPrice.referral,
      appointments: 0,
      coins: 0,
      amount: mainProducts.length,
    })
  }
  if (discountPrice.student) {
    orderDiscounts.push({
      id: contractsOptions.couponCodeId['student'],
      type: 'promotionDiscount',
      name: '學生方案',
      price: discountPrice.student,
      appointments: 0,
      coins: 0,
      amount: 1,
    })
  }
  if (Math.ceil(discountPrice.group)) {
    const promotionDiscount: Omit<OrderItem, 'id' | 'name'> = {
      price: Math.ceil(discountPrice.group),
      type: 'promotionDiscount',
      appointments: 0,
      coins: 0,
      amount: 1,
    }

    if (mainProducts.length === 2) {
      orderDiscounts.push({
        id: contractsOptions.couponCodeId['tenPercentOff'],
        name: '任選兩件折抵',
        ...promotionDiscount,
      })
    }
    if (mainProducts.length === 3) {
      orderDiscounts.push({
        id: contractsOptions.couponCodeId['fifteenPercentOff'],
        name: '任選三件折抵',
        ...promotionDiscount,
      })
    }
    if (mainProducts.length >= 4) {
      orderDiscounts.push({
        id: contractsOptions.couponCodeId['twentyPercentOff'],
        name: '任選四件折抵',
        ...promotionDiscount,
      })
    }
  }
  if (fieldValue.hasDeposit?.length) {
    orderDiscounts.push({
      id: contractsOptions.couponCodeId['deposit'],
      type: 'depositDiscount',
      name: '扣除訂金',
      price: discountPrice.deposit,
      appointments: 0,
      coins: 0,
      amount: 1,
    })
  }

  const orderItems = [...orderProducts, ...orderDiscounts]
  const totalPrice = sum(orderItems.map(orderItem => orderItem.price * orderItem.amount))

  const [addMemberContract] = useMutation<hasura.ADD_MEMBER_CONTRACT, hasura.ADD_MEMBER_CONTRACTVariables>(
    ADD_MEMBER_CONTRACT,
  )

  const handleMemberContractCreate = async () => {
    const alert = document.getElementsByClassName('ant-alert')[0]

    if (memberBlockRef.current?.contains(alert)) {
      message.warning('學員資料請填寫完整')
      return
    }
    if (fieldValue.identity === 'student' && !fieldValue?.certification?.file.name) {
      message.warn('需上傳證明')
      return
    }

    try {
      await form.validateFields()
    } catch (error) {
      process.env.NODE_ENV === 'development' && console.error(error)
    }

    const orderExecutors: {
      member_id: string
      ratio: number
    }[] = [
      {
        member_id: fieldValue?.orderExecutorId || '',
        ratio: fieldValue.orderExecutorRatio,
      },
      ...(fieldValue?.orderExecutors?.map(orderExecutor => ({
        member_id: orderExecutor.memberId || '',
        ratio: orderExecutor.ratio || 0,
      })) || []),
    ].filter(v => v.member_id && v.ratio)

    if (sum(orderExecutors.map(v => v.ratio)) !== 1) {
      message.warn('承辦人分潤比例加總必須為 1')
      return
    }

    if (!window.confirm('請確認合約是否正確？')) {
      return
    }

    // generate coupons
    const couponPlanId = v4()
    const coupons = range(0, totalAppointments).map((v, index) => ({
      member_id: member.id,
      coupon_code: {
        data: {
          code: moment().format('x') + v,
          count: 1,
          remaining: 0,
          app_id: 'xuemi',
          coupon_plan_id: index !== 0 ? couponPlanId : undefined,
          coupon_plan:
            index === 0
              ? {
                  on_conflict: {
                    constraint: 'coupon_plan_pkey',
                    update_columns: ['title'],
                  },
                  data: {
                    id: couponPlanId,
                    type: 2,
                    amount: 100,
                    title: `學米諮詢券`,
                    description: `學員編號：${member.id}, 合約編號：${fieldValue.contractId}`,
                    started_at: fieldValue.startedAt,
                    ended_at: endedAt,
                    scope: ['AppointmentPlan'],
                  },
                }
              : undefined,
        },
      },
    }))

    const times = '0'
    const orderId = moment().format('YYYYMMDDHHmmssSSS') + times.padStart(2, '0')

    const contractCoupons = orderDiscounts.map(v => ({
      id: v4(),
      name: v.name,
      price: v.price,
      coupon_code_id: v.id,
      member_id: member.id,
      type: 'Coupon',
    }))

    addMemberContract({
      variables: {
        memberId: member.id,
        contractId: fieldValue.contractId,
        startedAt: fieldValue.startedAt,
        endedAt,
        authorId: currentMemberId || '',
        values: {
          startedAt: fieldValue.startedAt,
          endedAt,
          memberId: member.id,
          invoice: {
            name: member.name,
            phone: member.phones,
            email: member.email,
          },
          price: totalPrice,
          coinName: `${selectedProjectPlan?.title}`,
          coinAmount: totalCoins,
          orderId,
          orderProducts: [
            {
              product_id: `ProjectPlan_${fieldValue.selectedProjectPlanId}`,
              name: selectedProjectPlan?.title,
              price: 0,
              started_at: fieldValue.startedAt,
              ended_at: endedAt,
            },
            ...orderProducts.map(v => ({
              product_id: `ProjectPlan_${v.id}`,
              name: v.name,
              price: v.price,
              started_at: fieldValue.startedAt,
              ended_at: endedAt,
            })),
            {
              product_id: 'Card_1af57db9-1af3-4bfd-b4a1-0c8f781ffe96',
              name: '學米 VIP 會員卡',
              price: 0,
              started_at: fieldValue.startedAt,
              ended_at: endedAt,
            },
          ],
          coupons: [...coupons, ...contractCoupons.map(coupon => pick(['id', 'member_id', 'coupon_code_id'], coupon))],
          orderDiscounts: [
            ...contractCoupons.map(v => ({
              name: v.name,
              price: v.price,
              type: 'Coupon',
              target: v.id,
            })),
          ],
          orderExecutors,
          paymentNo: moment().format('YYYYMMDDHHmmss'),
          paymentOptions: {
            paymentMethod: fieldValue.paymentMethod,
            installmentPlan: fieldValue.installmentPlan,
            paymentNumber: fieldValue.paymentNumber,
          },
        },
        options: {
          appointmentCreatorId: fieldValue.withCreatorId ? fieldValue.creatorId : null,
          studentCertification: fieldValue.identity === 'student' ? fieldValue?.certification?.file.name : null,
          referralMemberId: fieldValue.referralMemberId,
        },
      },
    })
      .then(({ data }) => {
        const contractId = data?.insert_member_contract_one?.id
        setMemberContractUrl(`https://www.xuemi.co/members/${member.id}/contracts/${contractId}`)
        message.success('成功產生合約')
      })
      .catch(err => message.error(`產生合約失敗，請確認資料是否正確。錯誤代碼：${err}`))
  }

  return (
    <>
      <StyledOrder className="mb-5">
        {orderItems.map(orderItem => (
          <div key={orderItem.id} className="row mb-2">
            <div className="col-6 text-right">
              {orderItem.type === 'addonProduct' && '【加購項目】'}
              {orderItem.type === 'referralDiscount' && '【介紹折抵】'}
              {orderItem.type === 'promotionDiscount' && '【促銷折抵】'}
            </div>
            <div className="col-3">
              <span>{orderItem.name}</span>
              {orderItem.amount > 1 ? <span>x{orderItem.amount}</span> : ''}
            </div>
            <div className="col-3 text-right">{currencyFormatter(orderItem.price * orderItem.amount)}</div>
          </div>
        ))}

        <div className="row mb-2">
          <strong className="col-6 text-right">合計</strong>

          <div className="col-6 text-right">
            <StyledTotal>{currencyFormatter(totalPrice)}</StyledTotal>
            <StyledTotal>{totalAppointments} 次諮詢</StyledTotal>
            <StyledTotal>{totalCoins} XP</StyledTotal>
          </div>
        </div>
      </StyledOrder>

      {memberContractUrl ? (
        <Alert message="合約連結" description={memberContractUrl} type="success" showIcon />
      ) : (
        <Button size="large" block type="primary" onClick={handleMemberContractCreate}>
          產生合約
        </Button>
      )}
    </>
  )
}

const ADD_MEMBER_CONTRACT = gql`
  mutation ADD_MEMBER_CONTRACT(
    $memberId: String!
    $authorId: String!
    $contractId: uuid!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $values: jsonb!
    $options: jsonb
  ) {
    insert_member_contract_one(
      object: {
        member_id: $memberId
        contract_id: $contractId
        author_id: $authorId
        started_at: $startedAt
        ended_at: $endedAt
        values: $values
        options: $options
      }
    ) {
      id
    }
  }
`

export default MemberContractCreationBlock
