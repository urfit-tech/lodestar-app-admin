import { gql, useQuery } from '@apollo/client'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminBlock } from '../../components/admin'
import DefaultLayout from '../../components/layout/DefaultLayout'
import hasura from '../../hasura'
import { PeriodType } from '../../types/general'
import LoadingPage from '../LoadingPage'
import MemberContractCreationBlock from './MemberContractCreationBlock'
import MemberContractCreationForm from './MemberContractCreationForm'
import MemberDescriptionBlock from './MemberDescriptionBlock'

const paymentMethods = ['藍新-信用卡', '藍新-匯款', '銀行匯款', '現金', '遠刷', '手刷'] as const
const paymentModes = ['全額付清', '訂金+尾款', '暫收款後開發票'] as const

type FieldProps = {
  contractId: string
  executorId: string
  products: {
    id: string
    amount: number
    price: number
    totalPrice: number
  }[]
  paymentMethod: typeof paymentMethods[number]
  paymentMode: typeof paymentModes[number]
  startedAt: Date
  endedAt: Date
  company: string
}

type ContractInfo = {
  member: {
    id: string
    name: string
    email: string
  }
  contracts: {
    id: string
    name: string
    options: any
    description: string
  }[]
  products: {
    id: string
    productId: string
    title: string
    price: number
    options: {
      language: string
      product: string
      programType?: string
      classMode?: string
      classType?: string
      locationType?: string
      onceSessions?: number
      languageType?: string
      project?: string
      isCustomPrice?: boolean
      weeklyFrequency: {
        max?: number
        min?: number
      }
      totalSessions?: {
        max?: number
        min?: number
      }
    }
  }[]
}
type ContractSales = {
  sales: {
    id: string
    name: string
    email: string
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
  const { info, error, loading } = useContractInfo(appId, memberId)
  const { sales } = useContractSales(appId)
  const [selectedProducts, setSelectedProducts] = useState<
    {
      id: string
      amount: number
      price: number
      totalPrice: number
    }[]
  >([])
  const memberBlockRef = useRef<HTMLDivElement | null>(null)
  const [_, setReRender] = useState(0)

  if (loading || !!error || !info) {
    return <LoadingPage />
  }

  const { member, products, contracts } = info

  return (
    <DefaultLayout>
      <div className="container py-5">
        <AdminBlock>
          <MemberDescriptionBlock member={member} memberBlockRef={memberBlockRef} />
          <MemberContractCreationForm
            form={form}
            initialValues={{
              contractId: contracts[0].id,
              startedAt: moment(),
              endedAt: moment().add(1, 'y'),
              paymentMethod: paymentMethods[0],
              paymentMode: paymentModes[0],
            }}
            onValuesChange={(_, values) => {
              setReRender(prev => prev + 1)
            }}
            products={products}
            contracts={contracts}
            sales={sales?.sales || []}
            selectedProducts={selectedProducts}
            onChangeSelectedProducts={product => {
              setSelectedProducts(prev => {
                const existingProductIndex = prev.findIndex(p => p.id === product.id)
                if (existingProductIndex !== -1) {
                  const updatedProducts = [...prev]
                  const existingProduct = updatedProducts[existingProductIndex]

                  updatedProducts[existingProductIndex] = {
                    ...existingProduct,
                    amount: existingProduct.amount + product.amount,
                    totalPrice: (existingProduct.amount + product.amount) * existingProduct.price,
                  }
                  return updatedProducts
                } else {
                  return [...prev, product]
                }
              })
            }}
            deleteSelectedProduct={productId =>
              setSelectedProducts(prev => prev.filter(product => product.id !== productId))
            }
            adjustSelectedProductAmount={(productId, amount) =>
              setSelectedProducts(prev =>
                prev.map(product =>
                  product.id === productId
                    ? {
                        ...product,
                        amount,
                        totalPrice: product.price * amount,
                      }
                    : product,
                ),
              )
            }
          />

          <MemberContractCreationBlock
            form={form}
            member={member}
            products={products}
            selectedProducts={selectedProducts}
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
  const { authToken } = useAuth()
  const { loading, error, data } = useQuery<
    hasura.GET_CONTRACT_INFO_WITH_PRODUCTS,
    hasura.GET_CONTRACT_INFO_WITH_PRODUCTSVariables
  >(
    gql`
      query GET_CONTRACT_INFO_WITH_PRODUCTS($appId: String!, $memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
          email
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
        appointment_plan(where: { app_id: { _eq: $appId }, published_at: { _is_null: false } }) {
          id
          title
          price
          options
        }
        token(where: { app_id: { _eq: $appId }, type: { _eq: "contract" } }) {
          id
          title
          price
          options
        }
      }
    `,
    {
      variables: {
        appId,
        memberId,
      },
      skip: !appId || !memberId || !authToken,
    },
  )

  const info: ContractInfo | null =
    data && data.member_by_pk && data.appointment_plan && data.contract && data.token
      ? {
          member: {
            id: data.member_by_pk.id,
            name: data.member_by_pk.name,
            email: data.member_by_pk.email,
          },
          contracts: data.contract.map(c => ({
            id: c.id,
            name: c.name,
            options: c.options,
            description: c.description,
          })),
          products: data.appointment_plan
            .map(v => ({
              id: v.id,
              title: v.title,
              price: v.price,
              options: {
                language: v.options.language,
                product: v.options.product,
                programType: v.options.program_type,
                classMode: v.options.class_mode,
                classType: v.options.class_type,
                locationType: v.options.location_type,
                onceSessions: v.options.once_sessions,
                languageType: v.options.language_type,
                project: v.options.project,
                weeklyFrequency: v.options.weekly_frequency,
                totalSessions: v.options.total_sessions,
              },
              productId: 'AppointmentPlan_' + v.id,
            }))
            .concat(
              data.token.map(v => ({
                id: v.id,
                title: v.title,
                price: v.price,
                options: {
                  language: v.options.language,
                  product: v.options.product,
                  programType: v.options.program_type,
                  classMode: v.options.class_mode,
                  classType: v.options.class_type,
                  locationType: v.options.location_type,
                  onceSessions: v.options.once_sessions,
                  languageType: v.options.language_type,
                  project: v.options.project,
                  weeklyFrequency: v.options.weekly_frequency,
                  totalSessions: v.options.total_sessions,
                },
                productId: 'Token_' + v.id,
              })),
            ),
        }
      : null

  return {
    loading,
    error,
    info,
  }
}
const useContractSales = (appId: string) => {
  const { authToken } = useAuth()
  const { loading, error, data } = useQuery<hasura.GetContractSales, hasura.GetContractSalesVariables>(
    gql`
      query GetContractSales($appId: String!) {
        sales: member(
          where: { app_id: { _eq: $appId }, member_permissions: { permission_id: { _eq: "BACKSTAGE_ENTER" } } }
        ) {
          id
          name
          email
        }
      }
    `,
    {
      variables: {
        appId,
      },
      skip: !appId || !authToken,
    },
  )

  const sales: ContractSales | null =
    data && data.sales
      ? {
          sales: data.sales.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
          })),
        }
      : null

  return {
    loading,
    error,
    sales,
  }
}

export type { ContractInfo, FieldProps, ContractSales }
export { paymentMethods, paymentModes }

export default MemberContractCreationPage
