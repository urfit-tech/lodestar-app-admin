import { gql, useQuery } from '@apollo/client'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminBlock } from '../../components/admin'
import hasura from '../../hasura'
import LoadingPage from '../LoadingPage'
import ContractLayout from './ContractLayout'
import MemberContractCreationBlock from './MemberContractCreationBlock'
import MemberContractCreationForm from './MemberContractCreationForm'
import MemberDescriptionBlock from './MemberDescriptionBlock'

const paymentMethods = ['藍新', '銀行匯款', '現金', '實體刷卡'] as const
const paymentModes = [
  '全額付清',
  '訂金+尾款',
  '暫收款後開發票',
  '先上課後月結實支實付',
  '先上課後月結固定金額',
  '課前頭款+自訂分期',
  '開課後自訂分期',
] as const

type FieldProps = {
  contractId: string
  executorId: string
  products: {
    id: string
    amount: number
    price: number
    totalPrice: number
    productId: string
  }[]
  paymentMethod: typeof paymentMethods[number]
  paymentMode: typeof paymentModes[number]
  unifiedNumber: string
  invoiceComment: string
  startedAt: Date
  endedAt: Date
  company: string
}

type ContractInfo = {
  member: {
    id: string
    name: string
    email: string
    paymentComment?: string
    isBG?: boolean // business or government
  }
  contracts: {
    id: string
    name: string
    options: any
    description: string
  }[]
}

type ContractProduct = {
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
    permissionGroups: string[]
  }[]
}

const MemberContractCreationPage: React.VFC = () => {
  const { memberId } = useParams<{ memberId: string }>()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const { info, error, loading } = useContractInfo(appId, memberId)
  const { products } = useContractProducts(appId)
  const { sales } = useContractSales(appId)
  const [selectedProducts, setSelectedProducts] = useState<
    {
      id: string
      amount: number
      price: number
      totalPrice: number
      productId: string
      title: string
    }[]
  >([])
  const [installments, setInstallments] = useState([
    {
      index: 1,
      price: 0,
    },
  ])

  const updateInstallmentPrice = (index: number, price: number) => {
    setInstallments(prevInstallments =>
      prevInstallments.map(installment => (installment.index === index ? { ...installment, price } : installment)),
    )
  }
  const addNewInstallment = (newInstallment: { index: number; price: number }) => {
    setInstallments(prevInstallments => [...prevInstallments, newInstallment])
  }

  const removeInstallment = (index: number) => {
    setInstallments(prevInstallments => prevInstallments.filter(installment => installment.index !== index))
  }
  const memberBlockRef = useRef<HTMLDivElement | null>(null)
  const [_, setReRender] = useState(0)

  if (loading || !!error || !info) {
    return <LoadingPage />
  }

  const { member, contracts } = info
  console.log({ selectedProducts })

  return (
    <ContractLayout memberId={member.id} isBG={member.isBG}>
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
            products={products?.products || []}
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
            installments={installments}
            updateInstallmentPrice={updateInstallmentPrice}
            addNewInstallment={addNewInstallment}
            member={member}
          />

          <MemberContractCreationBlock
            form={form}
            member={member}
            products={products?.products || []}
            selectedProducts={selectedProducts}
            contracts={contracts}
            installments={installments}
          />
        </AdminBlock>
      </div>
    </ContractLayout>
  )
}

const useContractInfo = (appId: string, memberId: string) => {
  const { authToken } = useAuth()
  const { loading, error, data } = useQuery<hasura.GetContractInfo, hasura.GetContractInfoVariables>(
    gql`
      query GetContractInfo($appId: String!, $memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
          email
          member_properties(where: { property: { name: { _eq: "付款備註" } } }) {
            value
          }
          member_categories {
            category {
              name
            }
          }
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
    data && data.member_by_pk && data.contract
      ? {
          member: {
            id: data.member_by_pk.id,
            name: data.member_by_pk.name,
            email: data.member_by_pk.email,
            paymentComment: data.member_by_pk.member_properties[0]?.value,
            isBG:
              data.member_by_pk.member_categories.filter(v => v.category.name === 'B' || v.category.name === 'G')
                .length > 0,
          },
          contracts: data.contract.map(c => ({
            id: c.id,
            name: c.name,
            options: c.options,
            description: c.description,
          })),
        }
      : null

  return {
    loading,
    error,
    info,
  }
}

const useContractProducts = (appId: string) => {
  const { authToken } = useAuth()
  const { loading, error, data } = useQuery<hasura.GetContractProducts, hasura.GetContractProductsVariables>(
    gql`
      query GetContractProducts($appId: String!) {
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
      },
      skip: !appId || !authToken,
    },
  )

  const products: ContractProduct | null =
    data && data.appointment_plan && data.token
      ? {
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
                isCustomPrice: v.options.isCustomPrice,
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
                  isCustomPrice: v.options.isCustomPrice,
                },
                productId: 'Token_' + v.id,
              })),
            ),
        }
      : null

  return {
    loading,
    error,
    products,
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
          member_permission_groups {
            permission_group_id
          }
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
            permissionGroups: s.member_permission_groups.map(v => v.permission_group_id),
          })),
        }
      : null

  return {
    loading,
    error,
    sales,
  }
}

export type { ContractInfo, FieldProps, ContractSales, ContractProduct }
export { paymentMethods, paymentModes }

export default MemberContractCreationPage
