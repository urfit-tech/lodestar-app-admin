import { useQuery } from '@apollo/react-hooks'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { AdminBlock } from 'lodestar-app-admin/src/components/admin'
import DefaultLayout from 'lodestar-app-admin/src/components/layout/DefaultLayout'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { notEmpty } from 'lodestar-app-admin/src/helpers'
import LoadingPage from 'lodestar-app-admin/src/pages/default/LoadingPage'
import { PeriodType } from 'lodestar-app-admin/src/types/general'
import moment from 'moment'
import { uniqBy } from 'ramda'
import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import hasura from '../../hasura'
import MemberContractCreationBlock from './MemberContractCreationBlock'
import MemberContractCreationForm from './MemberContractCreationForm'
import MemberDescriptionBlock from './MemberDescriptionBlock'

const paymentMethods = ['藍新', '歐付寶', '富比世', '新仲信', '舊仲信', '匯款', '現金', '裕富'] as const
const installmentPlans = [1, 3, 6, 8, 9, 12, 18, 24, 30] as const

type FieldProps = {
  contractId: string
  withCreatorId: boolean
  orderExecutorRatio: number
  startedAt: Date
  identity: 'normal' | 'student'
  certification?: {
    file: {
      name: string
    }
  }
  selectedProjectPlanId?: string | null
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

const MemberContractCreationPage: React.VFC = () => {
  const { memberId } = useParams<{ memberId: string }>()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const fieldValue = form.getFieldsValue()

  const {
    member,
    products,
    properties,
    contracts,
    projectPlans,
    appointmentPlanCreators,
    sales,
    ...contractInfoStatus
  } = usePrivateTeachContractInfo(appId, memberId)

  const memberBlockRef = useRef<HTMLDivElement | null>(null)
  const [, setReRender] = useState(0)

  if (contractInfoStatus.loading || !!contractInfoStatus.error || !member) {
    return <LoadingPage />
  }

  const selectedProjectPlan = projectPlans.find(v => v.id === fieldValue.selectedProjectPlanId) || null
  const endedAt = selectedProjectPlan
    ? moment(fieldValue.startedAt)
        .add(
          selectedProjectPlan.periodAmount || 0,
          selectedProjectPlan.periodType ? periodTypeConverter(selectedProjectPlan.periodType) : 'y',
        )
        .add(fieldValue.selectedGiftDays, 'days')
        .toDate()
    : null

  // calculate contract items results
  const contractProducts = uniqBy(v => v.id, fieldValue.contractProducts || [])
  const selectedMainProducts = contractProducts.filter(orderProduct =>
    products.find(product => product.id === orderProduct.id && product.price),
  )
  const isAppointmentOnly =
    selectedMainProducts.length === 1 &&
    products.find(product => product.id === selectedMainProducts[0].id)?.name === '業師諮詢'

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
              startedAt: moment().add(1, 'day').startOf('day'),
              identity: 'normal',
            }}
            onValuesChange={() => setReRender(prev => prev + 1)}
            memberId={memberId}
            endedAt={endedAt}
            contractProducts={contractProducts}
            isAppointmentOnly={isAppointmentOnly}
            products={products.filter(
              product =>
                product.periodType === null ||
                (product.periodAmount === selectedProjectPlan?.periodAmount &&
                  product.periodType === selectedProjectPlan.periodType),
            )}
            contracts={contracts}
            projectPlans={projectPlans}
            sales={sales}
            appointmentPlanCreators={appointmentPlanCreators}
          />

          <MemberContractCreationBlock
            form={form}
            member={member}
            products={products}
            contracts={contracts}
            selectedProjectPlan={selectedProjectPlan}
            endedAt={endedAt}
            contractProducts={contractProducts}
            isAppointmentOnly={isAppointmentOnly}
            memberBlockRef={memberBlockRef}
          />
        </AdminBlock>
      </div>
    </DefaultLayout>
  )
}

const periodTypeConverter: (type: PeriodType) => MomentPeriodType = type => {
  if (['D', 'W', 'Y'].includes(type)) {
    return type.toLowerCase() as MomentPeriodType
  }

  return type as MomentPeriodType
}

const usePrivateTeachContractInfo = (appId: string, memberId: string) => {
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
        contract(where: { published_at: { _is_null: false } }) {
          id
          name
          options
        }
        projectPrivateTeachPlan: project_plan(where: { title: { _like: "%私塾方案%" } }, order_by: { position: asc }) {
          id
          title
          period_amount
          period_type
        }
        products: project_plan(
          where: {
            title: { _nlike: "%私塾方案%" }
            project_id: { _eq: "50b678a6-14b0-4148-b706-724d7e834e20" }
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
        xuemi_sales {
          member {
            id
            name
            username
          }
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
    projectPlans: [],
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
          phones: data.member_by_pk.member_phones.map(v => v.phone),
          properties: data.member_by_pk.member_properties.map(v => ({
            id: v.id,
            value: v.value,
            propertyId: v.property.id,
            name: v.property.name,
          })),
        }
      : null
    info.properties = data.property
    info.contracts = data.contract
    info.projectPlans = data.projectPrivateTeachPlan.map(v => ({
      id: v.id,
      title: v.title,
      periodAmount: v.period_amount || 0,
      periodType: v.period_type as PeriodType | null,
    }))
    info.products = data.products.map(v => ({
      id: v.id,
      name: v.title,
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
              id: v.creator.id,
              name: v.creator.name,
            }
          : null,
      )
      .filter(notEmpty)
    info.sales = data.xuemi_sales.map(v => v.member).filter(notEmpty)
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
