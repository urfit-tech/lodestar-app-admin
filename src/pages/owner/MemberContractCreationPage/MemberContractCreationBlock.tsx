import { useMutation } from '@apollo/react-hooks'
import { Alert, Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import { project, range, sum } from 'ramda'
import { useState } from 'react'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { ContractInfo, FieldProps } from '.'
import { useApp } from '../../../contexts/AppContext'
import { useAuth } from '../../../contexts/AuthContext'
import hasura from '../../../hasura'
import { notEmpty } from '../../../helpers'
import { useCurrency } from '../../../hooks/currency'

type ContractItem = {
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
  selectedProducts: NonNullable<FieldProps['contractProducts']>
  form: FormInstance<FieldProps>
}> = ({
  member,
  products,
  selectedProjectPlan,
  endedAt,
  isAppointmentOnly,
  memberBlockRef,
  form,
  selectedProducts,
  contracts,
}) => {
  const fieldValue = form.getFieldsValue()
  const { id: appId, settings } = useApp()
  const { currentMemberId } = useAuth()
  const [memberContractUrl, setMemberContractUrl] = useState('')
  const { formatCurrency } = useCurrency()

  // calculate contract products
  const contractProducts: ContractItem[] = selectedProducts
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
  const mainProducts = contractProducts.filter(selectedProduct => selectedProduct.type === 'mainProduct')
  const totalAppointments = sum(contractProducts.map(product => product.appointments * product.amount))
  const totalCoins = sum(contractProducts.map(product => product.coins * product.amount))
  const contractsOptions = contracts.find(v => v.id === fieldValue.contractId)?.options

  // calculate contract discounts
  const contractDiscounts: ContractItem[] = []
  const discountAmount = {
    referral: 0,
    deposit: -1000,
    studentPromotion: 0,
    groupPromotion: 0,
  }

  if (fieldValue.referralMemberId) {
    discountAmount['referral'] = 2000 * -1
  }
  if (fieldValue.identity === 'student' && fieldValue?.certification?.file.name) {
    discountAmount['studentPromotion'] =
      (sum(mainProducts.map(mainProduct => mainProduct.price)) + discountAmount['referral'] * mainProducts.length) *
      -0.1
  }
  discountAmount['groupPromotion'] =
    (sum(mainProducts.map(mainProduct => mainProduct.price)) +
      discountAmount['referral'] * mainProducts.length +
      discountAmount['studentPromotion']) *
    (mainProducts.length < 2 ? 0 : mainProducts.length === 2 ? -0.1 : mainProducts.length === 3 ? -0.15 : -0.2)

  if (discountAmount['referral']) {
    contractDiscounts.push({
      id: contractsOptions.couponPlanId['referral'],
      type: 'referralDiscount',
      name: '被介紹人折抵',
      price: discountAmount['referral'],
      appointments: 0,
      coins: 0,
      amount: mainProducts.length,
    })
  }
  if (discountAmount['studentPromotion']) {
    contractDiscounts.push({
      id: contractsOptions.couponPlanId['student'],
      type: 'promotionDiscount',
      name: '學生方案',
      price: discountAmount['studentPromotion'],
      appointments: 0,
      coins: 0,
      amount: 1,
    })
  }
  if (Math.ceil(discountAmount['groupPromotion'])) {
    const promotionDiscount: Omit<ContractItem, 'id' | 'name'> = {
      price: Math.ceil(discountAmount['groupPromotion']),
      type: 'promotionDiscount',
      appointments: 0,
      coins: 0,
      amount: 1,
    }

    if (mainProducts.length === 2) {
      contractDiscounts.push({
        id: contractsOptions.couponPlanId['tenPercentOff'],
        name: '任選兩件折抵',
        ...promotionDiscount,
      })
    }
    if (mainProducts.length === 3) {
      contractDiscounts.push({
        id: contractsOptions.couponPlanId['fifteenPercentOff'],
        name: '任選三件折抵',
        ...promotionDiscount,
      })
    }
    if (mainProducts.length >= 4) {
      contractDiscounts.push({
        id: contractsOptions.couponPlanId['twentyPercentOff'],
        name: '任選四件折抵',
        ...promotionDiscount,
      })
    }
  }
  if (fieldValue.hasDeposit) {
    contractDiscounts.push({
      id: contractsOptions.couponPlanId['deposit'],
      type: 'depositDiscount',
      name: '扣除訂金',
      price: discountAmount['deposit'],
      appointments: 0,
      coins: 0,
      amount: 1,
    })
  }

  const contractItems = [...contractProducts, ...contractDiscounts]
  const totalPrice = sum(contractItems.map(v => v.price * v.amount))

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
          app_id: appId,
          coupon_plan_id: index !== 0 ? couponPlanId : undefined,
          coupon_plan: undefined,
        },
      },
    }))

    const times = '0'
    const orderId = moment().format('YYYYMMDDHHmmssSSS') + times.padStart(2, '0')

    const contractCoupons = contractDiscounts.map(v => ({
      id: v4(),
      name: v.name,
      price: Math.abs(v.price) * v.amount,
      member_id: member.id,
      coupon_code: {
        data: {
          coupon_plan_id: v.id,
          code: v4(),
          app_id: appId,
          count: 0,
          remaining: 0,
        },
      },
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
            ...contractProducts.map(v => ({
              product_id: `ProjectPlan_${v.id}`,
              name: v.name,
              price: v.price * v.amount,
              started_at: fieldValue.startedAt,
              ended_at: endedAt,
            })),
          ],
          coupons: [...coupons, ...project(['id', 'member_id', 'coupon_code'], contractCoupons)],
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
        setMemberContractUrl(`${window.origin}/members/${member.id}/contracts/${contractId}`)
        message.success('成功產生合約')
      })
      .catch(err => message.error(`產生合約失敗，請確認資料是否正確。錯誤代碼：${err}`))
  }

  return (
    <>
      <StyledOrder className="mb-5">
        {contractItems.map(item => (
          <div key={item.id} className="row mb-2">
            <div className="col-6 text-right">
              {item.type === 'addonProduct' && '【加購項目】'}
              {item.type === 'referralDiscount' && '【介紹折抵】'}
              {item.type === 'promotionDiscount' && '【促銷折抵】'}
            </div>
            <div className="col-3">
              <span>{item.name}</span>
              {item.amount > 1 ? <span>x{item.amount}</span> : ''}
            </div>
            <div className="col-3 text-right">{formatCurrency(item.price * item.amount)}</div>
          </div>
        ))}

        <div className="row mb-2">
          <strong className="col-6 text-right">合計</strong>

          <div className="col-6 text-right">
            <StyledTotal>{formatCurrency(totalPrice)}</StyledTotal>
            {totalCoins ? (
              <StyledTotal>
                {totalCoins} {settings['coin.unit']}
              </StyledTotal>
            ) : (
              ''
            )}
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
