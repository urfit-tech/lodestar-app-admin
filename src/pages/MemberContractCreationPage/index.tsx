import { gql, useQuery } from '@apollo/client'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment, { Moment } from 'moment'
import { sum, uniqBy } from 'ramda'
import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminBlock } from '../../components/admin'
import DefaultLayout from '../../components/layout/DefaultLayout'
import hasura from '../../hasura'
import { notEmpty } from '../../helpers'
import { PeriodType } from 'lodestar-app-element/src/types/data'
import LoadingPage from '../LoadingPage'
import MemberContractCreationBlock from './MemberContractCreationBlock'
import MemberContractCreationForm from './MemberContractCreationForm'
import MemberDescriptionBlock from './MemberDescriptionBlock'

const paymentMethods = ['藍新', '歐付寶', '富比世', '新仲信', '舊仲信', '匯款', '現金', '裕富'] as const
const installmentPlans = [1, 3, 6, 8, 9, 12, 18, 24, 30] as const
const periodTypeByDay: { [key: string]: number } = { D: 1, W: 7, M: 30, Y: 365 }

type FieldProps = {
  contractId: string
  withCreatorId: boolean
  orderExecutorRatio: number
  identity: 'normal' | 'student'
  certification?: {
    file: {
      name: string
    }
  }
  selectedProjectPlanId?: string | null
  period: { type: PeriodType; amount: number }
  selectedGiftDays?: 0 | 7 | 14
  contractProducts?: {
    id: string
    amount: number
  }[]
  creatorId?: string | null
  referralMemberId?: string
  paymentMethod?: typeof paymentMethods[number]
  installmentPlan?: typeof installmentPlans[number]
  paymentNumber?: string
  orderExecutorId?: string
  orderExecutors?: {
    memberId?: string
    ratio?: number
  }[]
  hasDeposit?: boolean[]
  withProductStartedAt: boolean
  productStartedAt: Moment
}

type ContractInfo = {
  member: {
    id: string
    name: string
    email: string
    phone: string
    properties: {
      id: string
      propertyId: string
      value: string
      name: string
    }[]
  } | null
  properties: { id: string; name: string; placeholder: string | null }[]
  contracts: {
    id: string
    name: string
    options: any
    description: string
  }[]
  products: {
    id: string
    name: string
    price: number
    addonPrice: number | null
    appointments: number
    coins: number
    periodAmount: number
    periodType: PeriodType | null
  }[]
  appointmentPlanCreators: {
    id: string | null
    name: string | null
  }[]
  sales: {
    id: string
    name: string
    username: string
  }[]
}
type MomentPeriodType = 'd' | 'w' | 'M' | 'y'

export type ContractItem = {
  id: string
  type: 'mainProduct' | 'addonProduct' | 'referralDiscount' | 'promotionDiscount' | 'depositDiscount' | 'rebateDiscount'
  name: string
  price: number
  appointments: number
  coins: number
  amount: number
}

const MemberContractCreationPage: React.VFC = () => {
  const { memberId } = useParams<{ memberId: string }>()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const fieldValue = form.getFieldsValue()

  const { member, products, properties, contracts, appointmentPlanCreators, sales, ...contractInfoStatus } =
    useContractInfo(appId, memberId)

  const memberBlockRef = useRef<HTMLDivElement | null>(null)
  const [, setReRender] = useState(0)
  const [startedAt, setStartedAt] = useState(moment().add(1, 'days').startOf('day').toDate())
  const [period, setPeriod] = useState<{ type: PeriodType; amount: number }>({ type: 'Y', amount: 1 })

  if (contractInfoStatus.loading || !!contractInfoStatus.error || !member) {
    return <LoadingPage />
  }

  // calculate contract items results
  const selectedProducts = uniqBy(v => v.id, fieldValue.contractProducts || [])
  const selectedMainProducts = selectedProducts.filter(contractProduct =>
    products.find(product => product.id === contractProduct.id && product.price),
  )
  const isAppointmentOnly =
    selectedMainProducts.length === 1 &&
    products.find(product => product.id === selectedMainProducts[0].id)?.name === '業師諮詢'

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
  // const totalAppointments = sum(contractProducts.map(product => product.appointments * product.amount))
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
  const endedAt =
    startedAt && period
      ? moment(startedAt)
          .add(period?.amount || 0, period?.type ? periodTypeConverter(period.type) : 'y')
          .toDate()
      : null

  const totalPrice = sum([...contractProducts, ...contractDiscounts].map(v => v.price * v.amount))

  return (
    <DefaultLayout>
      <div className="container py-5">
        <AdminBlock>
          <MemberDescriptionBlock member={member} properties={properties} memberBlockRef={memberBlockRef} />
          <MemberContractCreationForm
            form={form}
            initialValues={{
              contractId: contracts[0].id,
              withCreatorId: false,
              orderExecutorRatio: 1,
              identity: 'normal',
              period,
              withProductStartedAt: false,
              productStartedAt: moment(startedAt),
            }}
            onValuesChange={(_, values) => {
              setReRender(prev => prev + 1)
              setStartedAt(
                values.withProductStartedAt
                  ? values.productStartedAt.toDate()
                  : moment().add(1, 'days').startOf('day').toDate(),
              )
              setPeriod(values.period ? values.period : period)
            }}
            memberId={memberId}
            startedAt={startedAt}
            endedAt={endedAt}
            contractProducts={selectedProducts}
            isAppointmentOnly={isAppointmentOnly}
            products={products.filter(
              product =>
                product.periodType === null ||
                product.periodAmount === null ||
                (product.periodAmount === period.amount && product.periodType === period.type) ||
                periodTypeByDay[product.periodType] * product.periodAmount <=
                  periodTypeByDay[period.type] * period.amount,
            )}
            contracts={contracts}
            sales={sales}
            appointmentPlanCreators={appointmentPlanCreators}
            totalPrice={totalPrice}
          />

          <MemberContractCreationBlock
            form={form}
            member={member}
            contracts={contracts}
            startedAt={startedAt}
            endedAt={endedAt}
            selectedProducts={selectedProducts}
            memberBlockRef={memberBlockRef}
            contractProducts={contractProducts}
            contractDiscounts={contractDiscounts}
            totalPrice={totalPrice}
            totalCoins={totalCoins}
          />
        </AdminBlock>
      </div>
    </DefaultLayout>
  )
}

export const periodTypeConverter: (type: PeriodType) => MomentPeriodType = type => {
  if (['D', 'W', 'M', 'Y'].includes(type)) {
    return type === 'M' ? (type as MomentPeriodType) : (type.toLowerCase() as MomentPeriodType)
  }

  return type as MomentPeriodType
}

const useContractInfo = (appId: string, memberId: string) => {
  const { loading, error, data } = useQuery<hasura.GET_CONTRACT_INFO, hasura.GET_CONTRACT_INFOVariables>(
    gql`
      query GET_CONTRACT_INFO($appId: String!, $memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
          email
          member_phones {
            id
            phone
          }
          member_properties {
            id
            value
            property {
              id
              name
            }
          }
        }
        property(where: { name: { _in: ["學生程度", "每月學習預算", "轉職意願", "上過其他課程", "特別需求"] } }) {
          id
          name
          placeholder
        }
        contract(
          where: { app_id: { _eq: $appId }, published_at: { _is_null: false } }
          order_by: { created_at: desc }
        ) {
          id
          name
          description
          options
        }
        project_plan(
          where: { published_at: { _is_null: false }, project: { app_id: { _eq: $appId } } }
          order_by: [{ position: asc_nulls_last }, { title: asc }]
        ) {
          id
          title
          list_price
          options
          period_amount
          period_type
        }
        appointment_plan(distinct_on: [creator_id]) {
          id
          creator {
            id
            name
          }
        }
        sales: member(
          where: { app_id: { _eq: $appId }, member_permissions: { permission_id: { _eq: "BACKSTAGE_ENTER" } } }
        ) {
          id
          name
          username
        }
      }
    `,
    {
      variables: {
        appId,
        memberId,
      },
    },
  )

  const info: ContractInfo = {
    member: null,
    properties: [],
    contracts: [],
    products: [],
    appointmentPlanCreators: [],
    sales: [],
  }

  if (!loading && !error && data) {
    info.member = data.member_by_pk
      ? {
          id: data.member_by_pk.id,
          name: data.member_by_pk.name,
          email: data.member_by_pk.email,
          phone: data.member_by_pk.member_phones[0]?.phone,
          properties: data.member_by_pk.member_properties.map(v => ({
            id: v.id,
            value: v.value,
            propertyId: v.property.id,
            name: v.property.name,
          })),
        }
      : null
    info.properties = data.property.map(p => ({
      id: p.id,
      name: p.name,
      placeholder: p.placeholder || null,
    }))
    info.contracts = data.contract.map(c => ({
      id: c.id,
      name: c.name,
      options: c.options,
      description: c.description,
    }))
    info.products = data.project_plan.map(v => ({
      id: v.id,
      name: v.title || '',
      price: v.list_price,
      addonPrice: v.options?.addonPrice || 0,
      appointments: v.options?.appointments || 0,
      coins: v.options?.coins || 0,
      periodAmount: v.period_amount || 0,
      periodType: v.period_type as PeriodType | null,
    }))
    info.appointmentPlanCreators = data.appointment_plan
      .map(v =>
        v.creator
          ? {
              id: v.creator.id || null,
              name: v.creator.name || null,
            }
          : null,
      )
      .filter(notEmpty)
    info.sales = data.sales.filter(notEmpty)
  }

  return {
    loading,
    error,
    ...info,
  }
}

export type { ContractInfo, FieldProps }
export { paymentMethods, installmentPlans }

export default MemberContractCreationPage
