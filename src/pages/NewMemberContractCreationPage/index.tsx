import { gql, useQuery } from '@apollo/client'
import { useForm } from 'antd/lib/form/Form'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { intersection, isNotEmpty, path, pipe, prop } from 'ramda'
import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminBlock } from '../../components/admin'
import hasura from '../../hasura'
import { memberAccountReceivableAvailable } from '../../helpers'
import { useCopyMemberContractInfo, useMemberAdmin } from '../../hooks/member'
import LoadingPage from '../LoadingPage'
import ContractLayout from './ContractLayout'
import MemberContractCreationBlock from './MemberContractCreationBlock'
import MemberContractCreationForm from './MemberContractCreationForm'
import MemberDescriptionBlock from './MemberDescriptionBlock'

const paymentMethods = ['藍新', '銀行匯款', '現金', '實體刷卡', '遠端輸入卡號'] as const
const paymentModes = [
  '全額付清',
  '先上課後月結實支實付',
  '先上課後月結固定金額',
  '課前頭款+自訂分期',
  '開課後自訂分期',
] as const

type SelectedProduct = {
  id: string
  amount: number
  price: number
  totalPrice: number
  productId: string
  title: string
  options: {
    product: string
    language: string
    language_type?: string
    program_type?: string
    class_mode?: string
    class_type?: string
    location_type?: string
    project?: string
    once_sessions?: number
    weekly_frequency?: { max: number; min: number }
    total_sessions?: { max: number; min: number }
  }
}

type FieldProps = {
  contractId: string
  executorId: string
  products: SelectedProduct[]
  paymentMethod: typeof paymentMethods[number]
  paymentMode: typeof paymentModes[number]
  uniformNumber: string
  invoiceComment: string
  startedAt: Date
  endedAt: Date
  company: string
  skipIssueInvoice: boolean
  uniformTitle: string
  invoiceEmail: string
  language: string
  destinationEmail: string
  accountReceivable: boolean
  paymentDueDate: moment.Moment | null
  expiredAt: Date
}

type ContractInfo = {
  member: {
    id: string
    name: string
    email: string
    properties: {
      id: string
      name: string
      placeholder: string
      value: string | null
    }[]
    agreedAndUnexpiredContracts: {
      ended_at: Date
      type: string
    }[]
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

type GetTypeFromSingleItem<T> = T extends Array<infer Item> ? Item : never
type SingleContractProduct = GetTypeFromSingleItem<ContractProduct['products']>

type ContractSales = {
  sales: {
    id: string
    name: string
    email: string
    permissionGroups: string[]
  }[]
}

const MemberContractCreationPage: React.VFC = () => {
  const { id: appId } = useApp()
  const { memberId } = useParams<{ memberId: string }>()
  const { currentMemberId: adminId } = useAuth()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin } = useMemberAdmin(adminId ?? '')
  const [form] = useForm<FieldProps>()
  const { info, error, loading } = useContractInfo(appId, memberId)
  const { products } = useContractProducts(appId)
  const { sales } = useContractSales(appId)
  const [installments, setInstallments] = useState<{ index: number; price: number; endedAt: Date }[]>([])
  const [targetProduct, setTargetProduct] = useState<SingleContractProduct>()

  const [contractSourceId] = useQueryParam('contractSourceId', StringParam)

  const {
    loading: contractSourceLoading,
    contractSourceData,
    selectedProductsData,
  } = useCopyMemberContractInfo(contractSourceId || '')
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    !contractSourceLoading && contractSourceId && selectedProductsData.length > 0 ? selectedProductsData : [],
  )

  const updateInstallmentPrice = (index: number, price: number, endedAt: Date) => {
    setInstallments(prevInstallments =>
      prevInstallments.map(installment =>
        installment.index === index ? { ...installment, price, endedAt } : installment,
      ),
    )
  }
  const addNewInstallment = (newInstallment: { index: number; price: number; endedAt: Date }) => {
    setInstallments(prevInstallments => [...prevInstallments, newInstallment])
  }

  const removeInstallment = (index: number) => {
    setInstallments(prevInstallments => prevInstallments.filter(installment => installment.index !== index))
  }
  const memberBlockRef = useRef<HTMLDivElement | null>(null)
  const [_, setReRender] = useState(0)

  if (loading || error || !info || loadingMemberAdmin || errorMemberAdmin) {
    return <LoadingPage />
  }

  const { member, contracts } = info
  const permissionGroupIds = memberAdmin?.permissionGroups?.map(prop('id')) || []
  const productsUnderPermissionGroup = products?.products.filter(
    pipe((path as any)(['options', 'permissionGroups']), intersection(permissionGroupIds), isNotEmpty),
  )

  const memberType = member.properties.find(p => p.name === '會員類型')?.value
  const isAccountReceivableAvailable = memberType ? memberAccountReceivableAvailable(memberType) : false
  const isMemberTypeBG = !!memberType && !(memberType.trim().startsWith('C') || memberType.trim().startsWith('BIP'))
  const memberZeroTax = member.properties.find(p => p.name === '是否零稅')?.value
  const isMemberZeroTax = !!memberZeroTax && memberZeroTax === '是'
  const paymentDueDate = moment(dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm'))

  return (
    <ContractLayout member={member} isMemberTypeBG={isMemberTypeBG}>
      <div className="container py-5">
        <AdminBlock>
          <MemberDescriptionBlock member={member} memberBlockRef={memberBlockRef} />
          <MemberContractCreationForm
            form={form}
            initialValues={
              contractSourceId && selectedProductsData.length > 0
                ? {
                    id: selectedProductsData[0]?.id,
                    title: selectedProductsData[0]?.title,
                    amount: selectedProductsData[0]?.amount,
                    price: selectedProductsData[0]?.price,
                    contractId: contractSourceData.contract_id,
                    startedAt: moment(),
                    endedAt: moment().add(1, 'y'),
                    paymentMethod: contractSourceData.paymentMethod,
                    paymentMode: contractSourceData.paymentMode,
                    invoiceEmail: contractSourceData.invoiceEmail,
                    paymentDueDate: paymentDueDate,
                    invoiceComment: contractSourceData.invoiceComment,
                    uniformNumber: contractSourceData.uniformNumber,
                    uniformTitle: contractSourceData.uniformTitle,
                    company: contractSourceData.company,
                    executorId: contractSourceData.executorId,
                    language: contractSourceData.language,
                    destinationEmail: member.email,
                  }
                : {
                    contractId: contracts[0].id,
                    startedAt: moment(),
                    endedAt: moment().add(1, 'y'),
                    paymentMethod: paymentMethods[0],
                    paymentMode: paymentModes[0],
                    invoiceEmail: member.email,
                    destinationEmail: member.email,
                    language: 'zh-tw',
                    paymentDueDate: paymentDueDate,
                    uniformNumber: member.properties.find(p => p.name === '統一編號')?.value,
                    uniformTitle: member.properties.find(p => p.name === '發票抬頭')?.value,
                  }
            }
            onValuesChange={(_, values) => {
              setReRender(prev => prev + 1)
              if (values.startedAt) {
                form?.setFieldsValue({
                  endedAt: moment(values.startedAt).add(1, 'y').endOf('day'),
                })
              }
            }}
            products={productsUnderPermissionGroup || []}
            contracts={contracts}
            sales={sales?.sales || []}
            selectedProducts={selectedProducts}
            onChangeSelectedProducts={product => {
              setSelectedProducts(prev => {
                const existingProductIndex = prev.findIndex(p => p.id === product.id && p.price === product.price)
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
            deleteSelectedProduct={p =>
              setSelectedProducts(prev => prev.filter(product => product.id !== p.id || p.price !== product.price))
            }
            adjustSelectedProductAmount={(p, amount) =>
              setSelectedProducts(prev =>
                prev.map(product =>
                  product.id === p.id && product.price === p.price
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
            removeInstallment={removeInstallment}
            member={member}
            isMemberTypeBG={isMemberTypeBG}
            isMemberZeroTax={isMemberZeroTax}
            targetProduct={targetProduct}
            setTargetProduct={setTargetProduct}
            isAccountReceivableAvailable={isAccountReceivableAvailable}
          />
          <MemberContractCreationBlock
            form={form}
            member={member}
            selectedProducts={selectedProducts}
            contracts={contracts}
            installments={installments}
            sales={sales?.sales || []}
            isMemberTypeBG={isMemberTypeBG}
            isMemberZeroTax={isMemberZeroTax}
            isAccountReceivableAvailable={isAccountReceivableAvailable}
          />
        </AdminBlock>
      </div>
    </ContractLayout>
  )
}

const useContractInfo = (appId: string, memberId: string) => {
  const { authToken } = useAuth()
  const { loading, error, data, refetch } = useQuery<hasura.GetContractInfo, hasura.GetContractInfoVariables>(
    gql`
      query GetContractInfo($appId: String!, $memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
          email
          member_contracts(
            where: { agreed_at: { _is_null: false }, ended_at: { _gt: "now()" }, revoked_at: { _is_null: true } }
          ) {
            ended_at
            contract {
              options
            }
          }
          member_properties {
            id
            value
            property_id
          }
        }
        property(where: { app_id: { _eq: $appId } }) {
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
            properties: data.property.map(p => ({
              id: p.id,
              name: p.name,
              placeholder: p.placeholder || '',
              value: data.member_by_pk?.member_properties.find(mp => mp.property_id === p.id)?.value || null,
            })),
            agreedAndUnexpiredContracts: data.member_by_pk.member_contracts.map(c => ({
              ended_at: c.ended_at,
              type: c.contract.options.type,
            })),
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
    refetch,
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
                permissionGroups: v.options?.permissionGroups ?? [],
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
                  permissionGroups: v.options?.permissionGroups ?? [],
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

export type { ContractInfo, FieldProps, ContractSales, ContractProduct, SelectedProduct }
export { paymentMethods, paymentModes }

export default MemberContractCreationPage
