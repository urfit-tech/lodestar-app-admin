import { gql, useQuery } from '@apollo/client'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment, { Moment } from 'moment'
import { flatten, sum, uniqBy } from 'ramda'
import React, { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DeepPick } from 'ts-deep-pick'
import { AdminBlock } from '../../components/admin'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { installmentPlans } from '../../constants'
import hasura from '../../hasura'
import { notEmpty } from '../../helpers'
import { useAppCustom, useManagers } from '../../hooks'
import LoadingPage from '../../pages/LoadingPage'
import { PeriodType } from '../../types/general'
import MemberContractCreationBlock from './MemberContractCreationBlock'
import MemberContractCreationForm from './MemberContractCreationForm'
import MemberDescriptionBlock from './MemberDescriptionBlock'

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
  selectedProjectPlanId: string | null
  selectedGiftDays?: 0 | 7 | 14
  contractProducts?: {
    id: string
    amount: number
  }[]
  creatorId?: string | null
  referralMemberId?: string
  paymentMethod?: string
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
  rebateGift?: string
  dealer?: string
}

type ContractInfo = {
  member: {
    id: string
    name: string
    email: string
    phones: string[]
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
  }[]
  projectPlans: {
    id: string
    title: string
    periodAmount: number
    periodType: PeriodType | null
  }[]
  products: {
    id: string
    name: string
    price: number
    addonPrice: number | null
    appointments: number
    previews: {
      productId: string
      title: string
      price?: number
      periodAmount?: number
      periodType?: PeriodType
    }[]
    customCoupons: {
      number: number
      startedAt?: Date | null
      endedAt?: Date | null
      title: string
      type: 'percent' | 'cash'
      amount: number
      constraint: number
      scope: any
    }[]
    coins: number
    periodAmount: number
    periodType: PeriodType | null
  }[]
  appointmentPlanCreators: {
    id: string | null
    name: string | null
  }[]
  managers: {
    id: string
    name: string
    username: string
  }[]
  coinExchangeRage: number
}
type ContractItem = {
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
  const appCustom = useAppCustom()

  const [form] = useForm<FieldProps>()
  const fieldValue = form.getFieldsValue()

  const {
    member,
    products,
    properties,
    contracts,
    projectPlans,
    appointmentPlanCreators,
    managers,
    coinExchangeRage,
    ...contractInfoStatus
  } = usePrivateTeachContractInfo(appId, memberId, appCustom.contractProjectPlan)

  const productPreviewsProductIds = useMemo(() => {
    return uniqBy(v => v.productId, flatten(products.map(p => p.previews))).map(p => p.productId)
  }, [products])

  const { previewsPeriodInfo } = useProjectPlanPreviewsPeriodInfo(productPreviewsProductIds)

  const productsWithPreviewPeriodInfo = useMemo(() => {
    return products.map(p => ({
      ...p,
      previews: p.previews.map(preview => ({
        ...preview,
        ...previewsPeriodInfo?.filter(period => period.productId === preview.productId)[0],
      })),
    }))
  }, [products, previewsPeriodInfo])

  const memberBlockRef = useRef<HTMLDivElement | null>(null)
  const [, setReRender] = useState(0)
  const [startedAt, setStartedAt] = useState(moment().add(1, 'days').startOf('day').toDate())

  if (contractInfoStatus.loading || !!contractInfoStatus.error || !member) {
    return <LoadingPage />
  }
  const selectedProjectPlan =
    projectPlans.find(
      v =>
        v.periodAmount === appCustom.contractProjectPlan.periodAmount &&
        v.periodType === appCustom.contractProjectPlan.periodType.toUpperCase(),
    ) || null

  // calculate contract items results
  const selectedProducts = uniqBy(v => v.id, fieldValue.contractProducts || [])
  const selectedMainProducts = selectedProducts.filter(contractProduct =>
    products.find(product => product.id === contractProduct.id && product.price),
  )

  // for ooschool bonus extended service coupons
  const planProducts = selectedProducts
    .map(contractProduct => products.filter(product => contractProduct.id === product.id))
    .flatMap(v => v)
    .filter(
      planProduct =>
        planProduct.name.includes('基本方案') ||
        planProduct.name.includes('標準方案') ||
        planProduct.name.includes('專業方案'),
    )

  const totalPlanStarCount = planProducts.reduce((accum, product) => {
    const [field, _, plan] = product.name.split('-')
    return (accum += appCustom.coachCoursePlanStarList[field][plan])
  }, 0)
  const totalBonusExtendedServiceCoupons =
    totalPlanStarCount > 0
      ? appCustom.bonusExtendedServiceCoupons[totalPlanStarCount >= 10 ? '10' : totalPlanStarCount.toString()]
      : 0

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
  const totalAppointments = sum(contractProducts.map(product => product.appointments * product.amount))
  const totalCoins = sum(contractProducts.map(product => product.coins * product.amount))
  const contractsOptions = contracts.find(v => v.id === fieldValue.contractId)?.options
  if (fieldValue.withCreatorId && totalAppointments > 0) {
    contractProducts.push({
      id: contractsOptions.projectPlanId['designatedIndustryTeacher'],
      type: 'addonProduct',
      name: '指定業師',
      price: 1000,
      appointments: 0,
      coins: 0,
      amount: totalAppointments,
    })
  }

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
    discountAmount['studentPromotion'] = Math.floor(
      (sum(mainProducts.map(mainProduct => mainProduct.price)) + discountAmount['referral'] * mainProducts.length) *
        -(1 - 0.65 / 0.75),
    )
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

    if (contractsOptions?.couponPlanId) {
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
  const totalPrice = sum([...contractProducts, ...contractDiscounts].map(v => v.price * v.amount))
  const endedAt = moment(startedAt)
    .add(appCustom.contractProjectPlan.periodAmount, appCustom.contractProjectPlan.periodType)
    .subtract(1, 'second')
    .toDate()
  const serviceStartedAt = moment().toDate()
  let serviceEndedAt = endedAt
  for (const s of appCustom.serviceExtend.sort((a, b) => (a.threshold > b.threshold ? -1 : 1))) {
    if (totalPrice > s.threshold) {
      serviceEndedAt = moment(endedAt).add(s.periodAmount, s.periodType).toDate()
      break
    }
  }

  // calculate rebateGift
  if (fieldValue.rebateGift) {
    const [couponPlanId, price, name] = fieldValue.rebateGift.split('_')
    contractDiscounts.push({
      id: couponPlanId,
      type: 'rebateDiscount',
      name: `滿額學習工具 - ${name}`,
      price: Number(price),
      appointments: 0,
      coins: 0,
      amount: 1,
    })
  }

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
            }}
            memberId={memberId}
            startedAt={startedAt}
            endedAt={endedAt}
            serviceStartedAt={serviceStartedAt}
            serviceEndedAt={serviceEndedAt}
            contractProducts={selectedProducts}
            isAppointmentOnly={isAppointmentOnly}
            products={productsWithPreviewPeriodInfo}
            contracts={contracts}
            projectPlans={projectPlans}
            managers={managers}
            appointmentPlanCreators={appointmentPlanCreators}
            totalPrice={totalPrice}
            rebateGift={contractsOptions?.['rebateGift']}
          />

          <MemberContractCreationBlock
            form={form}
            member={member}
            products={productsWithPreviewPeriodInfo}
            selectedProjectPlan={selectedProjectPlan}
            startedAt={startedAt}
            endedAt={endedAt}
            serviceStartedAt={serviceStartedAt}
            serviceEndedAt={serviceEndedAt}
            selectedProducts={selectedProducts}
            memberBlockRef={memberBlockRef}
            coinExchangeRage={coinExchangeRage}
            contractProducts={contractProducts}
            contractDiscounts={contractDiscounts}
            totalPrice={totalPrice}
            totalAppointments={totalAppointments}
            totalCoins={totalCoins}
            customContractCard={appCustom.contractCard}
            customContractProduct={appCustom.contractProduct}
            totalBonusExtendedServiceCoupons={totalBonusExtendedServiceCoupons}
          />
        </AdminBlock>
      </div>
    </DefaultLayout>
  )
}

const usePrivateTeachContractInfo = (
  appId: string,
  memberId: string,
  contractProjectPlan?: { title: string; id: string },
) => {
  const { managers } = useManagers()

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
        property(where: { is_required: { _eq: true } }) {
          id
          name
          placeholder
        }
        contract(where: { published_at: { _is_null: false }, app_id: { _eq: $appId } }) {
          id
          name
          options
        }
        projectPrivateTeachPlan: project_plan(where: { title: { _like: "%${
          contractProjectPlan?.title || ''
        }%" } }, order_by: { position: asc }) {
          id
          title
          period_amount
          period_type
        }
        products: project_plan(
          where: {
            title: { _nlike: "%${contractProjectPlan?.title || ''}%" }
            project_id: { _eq: "${contractProjectPlan?.id || ''}" }
            published_at: { _is_null: false }
            project: { app_id: { _eq: $appId } }
          }
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
        app_setting(where: { app_id: { _eq: $appId }, key: { _eq: "coin.exchange_rate" } }) {
          value
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

  const memorizedInfo = useMemo(() => {
    const info: ContractInfo = {
      member: null,
      properties: [],
      contracts: [],
      projectPlans: [],
      products: [],
      appointmentPlanCreators: [],
      managers: [],
      coinExchangeRage: 0,
    }

    if (!loading && !error && data) {
      info.member = data.member_by_pk
        ? {
            id: data.member_by_pk.id,
            name: data.member_by_pk.name,
            email: data.member_by_pk.email,
            phones: data.member_by_pk.member_phones.map(v => v.phone),
            properties: data.member_by_pk.member_properties.map(v => ({
              id: v.id,
              value: v.value,
              propertyId: v.property.id,
              name: v.property.name,
            })),
          }
        : null
      info.properties = data.property.map(v => ({
        ...v,
        placeholder: v.placeholder?.replace(/[()]/g, '').replace(/必填：/g, '') || null,
      }))
      info.contracts = data.contract.map(c => ({
        id: c.id,
        name: c.name,
        options: c.options,
      }))
      info.projectPlans = data.projectPrivateTeachPlan.map(v => ({
        id: v.id,
        title: v.title,
        periodAmount: v.period_amount || 0,
        periodType: v.period_type as PeriodType | null,
      }))
      info.products = data.products.map(v => ({
        id: v.id,
        name: v.title || '',
        price: v.list_price,
        addonPrice: v.options?.addonPrice || 0,
        appointments: v.options?.appointments || 0,
        coins: v.options?.coins || 0,
        periodAmount: v.period_amount || 0,
        periodType: v.period_type as PeriodType | null,
        previews: v.options?.previews || [],
        customCoupons:
          v.options?.coupons?.map(
            (customCoupon: {
              number: number
              startedAt?: Date | null
              endedAt?: Date | null
              title: string
              type: 'percent' | 'cash'
              amount: number
              constraint: number
              scope: any
            }) => ({
              number: customCoupon.number || 1,
              startedAt: customCoupon.startedAt,
              endedAt: customCoupon.endedAt,
              title: customCoupon.title || '',
              type: customCoupon.type || 'percent',
              amount: customCoupon.type === 'percent' && customCoupon.amount > 100 ? 100 : customCoupon.amount || 0,
              constraint: customCoupon.constraint || 0,
              scope: customCoupon.scope || [],
            }),
          ) || [],
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
      info.managers = managers
      info.coinExchangeRage = Number(data.app_setting[0]?.value) || 1
    }
    return info
  }, [data, managers])

  return {
    loading,
    error,
    ...memorizedInfo,
  }
}

const useProjectPlanPreviewsPeriodInfo = (productIds: string[]) => {
  const programPlanIds = productIds.filter(id => id.includes('ProgramPlan_')).map(id => id.replace(/ProgramPlan_/g, ''))
  const programPackagePlanIds = productIds
    .filter(id => id.includes('ProgramPackagePlan_'))
    .map(id => id.replace(/ProgramPackagePlan_/g, ''))

  const { data } = useQuery<hasura.getProjectPlanPreviewsPeriodInfo, hasura.getProjectPlanPreviewsPeriodInfoVariables>(
    gql`
      query getProjectPlanPreviewsPeriodInfo($programPlanIds: [uuid!]!, $programPackagePlanIds: [uuid!]!) {
        program_plan(where: { id: { _in: $programPlanIds } }) {
          id
          period_amount
          period_type
        }
        program_package_plan(where: { id: { _in: $programPackagePlanIds } }) {
          id
          period_amount
          period_type
        }
      }
    `,
    { variables: { programPlanIds, programPackagePlanIds }, skip: productIds.length === 0 },
  )

  const previewsPeriodInfo = data?.program_plan
    .map(p => ({
      productId: `ProgramPlan_${p.id}`,
      periodAmount: p.period_amount,
      periodType: p.period_type as PeriodType,
    }))
    .concat(
      data?.program_package_plan.map(p => ({
        productId: `ProgramPackagePlan_${p.id}`,
        periodAmount: p.period_amount,
        periodType: p.period_type as PeriodType,
      })),
    )
  return { previewsPeriodInfo }
}

export type { ContractInfo, ContractItem, FieldProps }

export default MemberContractCreationPage
