import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import {
  Button,
  Checkbox,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Skeleton,
  Tabs,
} from 'antd'
import { FormProps } from 'antd/lib/form/Form'
import { sum } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { prop, uniqBy } from 'ramda'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import styled from 'styled-components'
import {
  ContractInfo,
  ContractProduct,
  ContractSales,
  FieldProps,
  paymentMethods,
  paymentModes,
  SelectedProduct,
} from '.'
import { AdminBlockTitle } from '../../components/admin'
import MemberSelector from '../../components/form/MemberSelector'
import hasura from '../../hasura'

const CUSTOM_PRODUCT_OPTIONS_CONFIG = [
  {
    language: '中文',
    products: [
      {
        title: '註冊費',
      },
      {
        title: '學費',
        programType: [{ title: '標準時數' }, { title: '套裝項目' }, { title: '客製時數' }, { title: '自訂項目' }],
        classMode: [{ title: '內課' }, { title: '外課' }, { title: '線上課' }],
        classType: [
          {
            title: '個人班',
          },
          {
            title: '自組班',
          },
          {
            title: '團體班',
          },
          {
            title: '2-10人班',
          },
          {
            title: '2人班',
          },
          {
            title: '3-5人班',
          },
          {
            title: '3人班',
          },
          {
            title: '4人班',
          },
          {
            title: '5人班',
          },
          {
            title: '6-10人班',
          },
          {
            title: '6人班',
          },
          {
            title: '7人班',
          },
          {
            title: '8人班',
          },
          {
            title: '9人班',
          },
          {
            title: '10人班',
          },
        ],
        locationType: [{ title: '海內' }, { title: '海外' }],
        onceSessions: [
          {
            title: '1',
            week: '1',
          },
          {
            title: '3',
            week: '1',
          },
          {
            title: '4',
            week: '1',
          },
          {
            title: '6',
            week: '1',
          },
          {
            title: '9',
            week: '1',
          },
          {
            title: '10',
            week: '1',
          },
          {
            title: '12',
            week: '4',
          },
          {
            title: '15',
            week: '1',
          },
          {
            title: '16',
            week: '4',
          },
          {
            title: '24',
            week: '4',
          },
          {
            title: '36',
            week: '4',
          },
          {
            title: '39',
            week: '13',
          },
          {
            title: '40',
            week: '4',
          },
          {
            title: '52',
            week: '13',
          },
          {
            title: '60',
            week: '4',
          },
          {
            title: '78',
            week: '13',
          },
          {
            title: '117',
            week: '13',
          },
          {
            title: '130',
            week: '13',
          },
          {
            title: '195',
            week: '13',
          },
        ],
      },
      {
        title: '教材',
        projects: [
          { title: '(A5版) 商用會話' },
          { title: '(A5版) 日常會話' },
          { title: 'NICD新中級華語/漢語' },
          { title: 'NPC新實用華語/漢語' },
          { title: 'NRC新華文/漢語讀本' },
          { title: '兩岸遊' },
          { title: '商務漢語會話' },
          { title: '圖畫故事' },
          { title: '外國人三分鐘漢語演講' },
          { title: '宗教' },
          { title: '漢語文言文選讀' },
          { title: '焦點新聞' },
          { title: '生活華語' },
          { title: '發音' },
          { title: '銀行與證券投資' },
          { title: '口袋辭典' },
          { title: '兩岸現代漢語常用詞典' },
        ],
      },
      {
        title: '活動',
        projects: [{ title: '移地教學' }, { title: '自訂' }],
      },
      {
        title: '其他',
        projects: [
          { title: '其他收入' },
          { title: '外購教材：當代中文課程' },
          { title: '外購教材：各行各業說中文' },
          { title: '外購教材：新版實用視聽華語' },
          { title: '外購教材：時代華語' },
          { title: '外購教材：學華語向前走' },
          { title: '外購教材：HELLO華語' },
          { title: '外購教材：康軒國語' },
          { title: '外購教材：新實用漢語課本' },
          { title: '外購教材：HSK 標準教程' },
          { title: '外購教材：其他台灣用書' },
          { title: '外購教材：模擬試題' },
          { title: '外購教材：其他大陸用書' },
          { title: '外購教材：遠東' },
          { title: '外購教材：自訂' },
        ],
      },
    ],
  },
  {
    language: '外文',
    products: [
      {
        title: '註冊費',
      },
      {
        title: '學費',
        languageType: [
          { title: '德文' },
          { title: '日文' },
          { title: '法文' },
          { title: '英文' },
          { title: '西文' },
          { title: '韓文' },
        ],
        programType: [{ title: '標準時數' }, { title: '套裝項目' }, { title: '客製時數' }, { title: '自訂項目' }],
        classMode: [{ title: '內課' }, { title: '外課' }, { title: '線上課' }],
        classType: [
          {
            title: '個人班',
          },
          {
            title: '自組班',
          },
          {
            title: '團體班',
          },
          {
            title: '2人班',
          },
          {
            title: '3-5人班',
          },
          {
            title: '3人班',
          },
          {
            title: '4人班',
          },
          {
            title: '5人班',
          },
        ],
        locationType: [{ title: '海內' }],
      },
      {
        title: '活動',
        projects: [{ title: '自訂' }],
      },
      {
        title: '其他',
        projects: [{ title: '其他收入' }, { title: '外購教材：自訂' }],
      },
    ],
  },
  {
    language: '師資班',
    products: [
      {
        title: '註冊費',
      },
      {
        title: '學費',
        programType: [{ title: '套裝項目' }, { title: '自訂項目' }],
        classMode: [{ title: '內課' }],
        classType: [{ title: '團體班' }],
        locationType: [{ title: '海內' }],
        onceSessions: [
          { title: '26', week: '2' },
          { title: '26', week: '5' },
        ],
      },
      {
        title: '活動',
        projects: [{ title: '自訂' }],
      },
      {
        title: '其他',
        projects: [{ title: '其他收入' }, { title: '外購教材：自訂' }],
      },
    ],
  },
  {
    language: '方言',
    products: [
      {
        title: '註冊費',
      },
      {
        title: '學費',
        languageType: [{ title: '台語' }, { title: '粵語' }],
        programType: [{ title: '客製時數' }, { title: '自訂項目' }],
        classMode: [{ title: '內課' }, { title: '外課' }, { title: '線上課' }],
        classType: [{ title: '個人班' }, { title: '自組班' }],
        locationType: [{ title: '海內' }],
      },
      {
        title: '教材',
        projects: [{ title: '台語' }, { title: '粵語' }],
      },
      {
        title: '其他',
        projects: [{ title: '其他收入' }, { title: '外購教材：自訂' }],
      },
    ],
  },
]

const BG_PRODUCT_OPTIONS_CONFIG = [
  {
    language: '中文',
    products: [
      {
        title: '學費',
        projects: [
          { title: 'AIT_2人班' },
          { title: 'AIT_3-5人班' },
          { title: 'AIT_6-10人班' },
          { title: 'AIT_個人班' },
          { title: '外交學院' },
        ],
      },
    ],
  },
  {
    language: '中文',
    products: [
      {
        title: '學費',
        projects: [{ title: '再興' }, { title: '幼華' }, { title: '聖心' }],
      },
    ],
  },
]

export type PaymentCompany = {
  permissionGroupId: string
  name: string
  companies: {
    name: string
    paymentGateway?: string
    invoiceGateway?: string
    invoiceGatewayId?: string
    paymentGatewayId?: string
    companyUniformNumber?: string
    companyAddress?: string
    companyPhone?: string
    invoiceCompanyName?: string
  }[]
}

const MemberContractCreationForm: React.FC<
  FormProps<FieldProps> & {
    contracts: ContractInfo['contracts']
    products: ContractProduct['products']
    sales: ContractSales['sales']
    selectedProducts: SelectedProduct[]
    onChangeSelectedProducts: (selectedProduct: SelectedProduct) => void
    deleteSelectedProduct: (selectedProduct: SelectedProduct) => void
    adjustSelectedProductAmount: (selectedProduct: SelectedProduct, amount: number) => void
    installments: { index: number; price: number; endedAt: Date }[]
    updateInstallmentPrice: (index: number, price: number, endedAt: Date) => void
    addNewInstallment: (installment: { index: number; price: number; endedAt: Date }) => void
    removeInstallment: (index: number) => void
    member: ContractInfo['member']
    isMemberTypeBG: boolean
    isMemberZeroTax: boolean
  }
> = memo(
  ({
    contracts,
    products,
    sales,
    form,
    selectedProducts,
    onChangeSelectedProducts,
    deleteSelectedProduct,
    adjustSelectedProductAmount,
    installments,
    updateInstallmentPrice,
    addNewInstallment,
    member,
    removeInstallment,
    isMemberTypeBG,
    isMemberZeroTax,
    ...formProps
  }) => {
    const fieldValue = form?.getFieldsValue()
    const { id: appId, settings, enabledModules } = useApp()
    const { currentMemberId, authToken, currentUserRole } = useAuth()
    const customSetting: { paymentCompanies: PaymentCompany[] } = JSON.parse(settings['custom'] || '{}')

    const { data: memberPermissionGroups } = useQuery<
      hasura.GetMemberPermissionGroup,
      hasura.GetMemberPermissionGroupVariables
    >(
      gql`
        query GetMemberPermissionGroup($memberId: String!) {
          member_permission_group(where: { member_id: { _eq: $memberId } }) {
            permission_group_id
          }
        }
      `,
      { variables: { memberId: currentMemberId || '' }, skip: !currentMemberId || !authToken },
    )
    const [insertAppointmentPlan] = useMutation<
      hasura.CreateAppointmentPlan,
      hasura.CreateAppointmentPlanVariables
    >(gql`
      mutation CreateAppointmentPlan($data: appointment_plan_insert_input!) {
        insert_appointment_plan_one(object: $data) {
          id
        }
      }
    `)
    const [insertToken] = useMutation<hasura.CreateToken, hasura.CreateTokenVariables>(gql`
      mutation CreateToken($data: token_insert_input!) {
        insert_token_one(object: $data) {
          id
        }
      }
    `)

    const [category, setCategory] = useState<{
      language: string
      product: string
      programType?: string
      classMode?: string
      classType?: string
      locationType?: string
      languageType?: string
      onceSessions?: string
      project?: string
      name?: string
    }>({
      language: '中文',
      product: '學費',
      programType: '標準時數',
      classMode: '內課',
      classType: '個人班',
      locationType: '海內',
    })
    const [weeklyBatch, setWeeklyBatch] = useState(10)
    const [week, setWeek] = useState(13)
    const [totalAmount, setTotalAmount] = useState(60)
    const [customPrice, setCustomPrice] = useState(0)
    const [customTotalPrice, setCustomTotalPrice] = useState(0)
    const [newProductName, setNewProductName] = useState('')
    const [loading, setLoading] = useState(false)
    const [zeroTaxPrice, setZeroTaxPrice] = useState(0)

    const memberType = member.properties.find(p => p.name === '會員類型')?.value
    const productOptions: any = CUSTOM_PRODUCT_OPTIONS_CONFIG.find(v => v.language === category.language)?.products
    const options = productOptions?.find((v: any) => v.title === category.product)
    const validateNumericSessionInput = (value: number) => {
      const regex = /^\d+(\.\d{0,1})?$/
      if (!regex.test(value.toString())) {
        console.error('課程堂數只能輸入小數點後一位')
        return false
      }
      return true
    }

    const filterProducts = useMemo(() => {
      return products.filter(product => {
        if (category.project?.includes('自訂')) {
          return true
        }

        if (category.product === '學費' && category.programType === '自訂項目') {
          return true
        }

        if (product.options.language !== category.language) {
          return false
        }

        if (category.product !== '學費') {
          if (product.options.product !== category.product) {
            return false
          }

          if (product.options.project !== category.project) {
            return false
          }

          return true
        } else {
          if (
            (product.options.language === '方言' || product.options.language === '外文') &&
            product.options.languageType !== category.languageType
          ) {
            return false
          }

          if (product.options.programType !== category.programType) {
            return false
          }

          if (product.options.classMode !== category.classMode) {
            return false
          }

          if (product.options.classType !== category.classType) {
            return false
          }

          if (product.options.locationType !== category.locationType) {
            return false
          }

          if (category.language === '中文' && category.programType === '套裝項目' && ![1, 4, 13].includes(week)) {
            return true
          }

          if (
            product.options.programType === '套裝項目' &&
            product.options.onceSessions &&
            product.options.onceSessions !== totalAmount
          ) {
            return false
          }

          const totalAmountMatch =
            (!product.options.totalSessions?.min || totalAmount >= product.options.totalSessions?.min) &&
            (!product.options.totalSessions?.max || totalAmount <= product.options.totalSessions?.max)

          const weeklyBatchMatch =
            (!product.options.weeklyFrequency?.min || weeklyBatch >= product.options.weeklyFrequency?.min) &&
            (!product.options.weeklyFrequency?.max || weeklyBatch <= product.options.weeklyFrequency?.max)

          if (product.options.isCustomPrice) {
            return true
          }

          if (!totalAmountMatch || !weeklyBatchMatch) {
            return false
          }

          return true
        }
      })
    }, [category, weeklyBatch, totalAmount, products])

    const selectedProduct = filterProducts.find(p => p.title === category.name)
    useEffect(() => {
      isMemberZeroTax &&
        !['註冊費', '學費'].includes(category.product) &&
        setZeroTaxPrice(Math.round((customTotalPrice || customPrice || selectedProduct?.price || 0) / 1.05))
    }, [customPrice, isMemberZeroTax, selectedProduct?.price, customTotalPrice, category])

    return (
      <Form layout="vertical" colon={false} hideRequiredMark form={form} {...formProps}>
        <AdminBlockTitle>產品清單</AdminBlockTitle>
        {products.length === 0 ? (
          <Skeleton active />
        ) : (
          <Tabs
            className="mb-5"
            onTabClick={key => {
              setCategory(
                key === '中文'
                  ? {
                      language: key,
                      product: '學費',
                      programType: '標準時數',
                      classMode: '內課',
                      classType: '個人班',
                      locationType: '海內',
                    }
                  : key === '外文'
                  ? {
                      language: key,
                      product: '學費',
                      programType: '標準時數',
                      classMode: '內課',
                      classType: '個人班',
                      locationType: '海內',
                      languageType: '英文',
                    }
                  : key === '師資班'
                  ? {
                      language: key,
                      product: '學費',
                      programType: '套裝項目',
                      classMode: '內課',
                      classType: '團體班',
                      locationType: '海內',
                    }
                  : key === '方言'
                  ? {
                      language: key,
                      product: '學費',
                      programType: '客製時數',
                      classMode: '內課',
                      classType: '個人班',
                      locationType: '海內',
                      languageType: '台語',
                    }
                  : category,
              )
              setWeeklyBatch(key === '中文' ? 10 : key === '外文' ? 4 : key === '師資班' ? 5 : key === '方言' ? 10 : 10)
              setTotalAmount(
                key === '中文' ? 60 : key === '外文' ? 10 : key === '師資班' ? 26 : key === '方言' ? 60 : 60,
              )
              setNewProductName('')
              setCustomPrice(0)
              setCustomTotalPrice(0)
              setZeroTaxPrice(0)
            }}
          >
            {CUSTOM_PRODUCT_OPTIONS_CONFIG.map((k, index) => (
              <Tabs.TabPane key={k.language} tab={k.language}>
                <div style={{ padding: '8px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                    {k.products.map(v => (
                      <Button
                        key={v.title}
                        type={v.title === category?.product ? 'primary' : undefined}
                        onClick={() => {
                          setCategory({
                            language: category.language,
                            product: v.title,
                            programType: category.programType || '標準時數',
                            classMode: category.classMode || '內課',
                            classType: category.classType || '個人班',
                            locationType: category.locationType || '海內',
                            languageType: category.languageType || '英文',
                            project:
                              v.title !== '註冊費' && v.title !== '學費'
                                ? (
                                    CUSTOM_PRODUCT_OPTIONS_CONFIG.find(
                                      p => p.language === (category as { language: string }).language,
                                    ) as { products: { title: string; projects: { title: string }[] }[] } | undefined
                                  )?.products.find(p => p.title === v.title)?.projects[0]?.title
                                : undefined,
                            name: v.title === '註冊費' ? `${category.language}_註冊費` : undefined,
                          })
                          setWeeklyBatch(
                            category.language === '中文'
                              ? 10
                              : category.language === '外文'
                              ? 4
                              : category.language === '師資班'
                              ? 5
                              : category.language === '方言'
                              ? 10
                              : 10,
                          )
                          setTotalAmount(
                            category.language === '中文'
                              ? 60
                              : category.language === '外文'
                              ? 10
                              : category.language === '師資班'
                              ? 26
                              : category.language === '方言'
                              ? 60
                              : 60,
                          )
                          setNewProductName('')
                          setCustomPrice(0)
                          setCustomTotalPrice(0)
                          setZeroTaxPrice(0)
                        }}
                      >
                        {v.title}
                      </Button>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f6f6f6',
                      padding: '12px 24px',
                    }}
                  >
                    {category.product === '學費' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        {(category.language === '方言' || category.language === '外文') && (
                          <div style={{ width: 110 }}>
                            語言
                            <Select
                              value={category.languageType}
                              style={{ width: 110 }}
                              onChange={value => {
                                setCategory({ ...category, languageType: value, name: undefined })
                              }}
                            >
                              {options.languageType.map((d: { title: string }) => (
                                <Select.Option key={d.title} value={d.title}>
                                  {d.title}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>
                        )}
                        <div style={{ width: 110 }}>
                          項目
                          <Select
                            defaultValue={category.programType}
                            value={category.programType}
                            style={{ width: 110 }}
                            onChange={value => {
                              setCategory(
                                value === '套裝項目'
                                  ? { ...category, programType: value, name: undefined, classType: '團體班' }
                                  : value === '標準時數'
                                  ? { ...category, programType: value, name: undefined, classType: '個人班' }
                                  : { ...category, programType: value, name: undefined },
                              )
                              if (value === '套裝項目') {
                                if (category.language === '中文') {
                                  setWeeklyBatch(15)
                                  setWeek(13)
                                  setTotalAmount(195)
                                }
                                if (category.language === '師資班') {
                                  setWeeklyBatch(5)
                                  setTotalAmount(26)
                                }
                              } else {
                                setWeeklyBatch(10)
                                setTotalAmount(60)
                              }
                            }}
                          >
                            {options?.programType
                              .filter((p: { title: string }) => isMemberTypeBG || p.title !== '自訂項目')
                              .map((d: { title: string }) => (
                                <Select.Option key={d.title} value={d.title}>
                                  {d.title}
                                </Select.Option>
                              ))}
                          </Select>
                        </div>
                        {category.programType !== '自訂項目' && (
                          <>
                            {[
                              {
                                id: 'locationType',
                                title: '海內/外',
                                value: category.locationType,
                                options: options.locationType,
                              },
                              {
                                id: 'classMode',
                                title: '上課方式',
                                value: category.classMode,
                                options: options.classMode,
                              },
                              {
                                id: 'classType',
                                title: '班型',
                                value: category.classType,
                                options: options.classType,
                              },
                            ].map(v => (
                              <div key={v.title} style={{ width: 110 }}>
                                {v.title}
                                <Select
                                  defaultValue={v.options[0]?.title}
                                  value={v.value}
                                  style={{ width: 110 }}
                                  onChange={value => {
                                    setCategory({ ...category, [v.id]: value, name: undefined })
                                  }}
                                >
                                  {v.options.map((d: { title: string }) => (
                                    <Select.Option key={d.title} value={d.title}>
                                      {d.title}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </div>
                            ))}
                            <div style={{ width: 110, marginRight: 8 }}>
                              週頻率
                              {category.programType === '套裝項目' && category.language !== '外文' ? (
                                category.language === '中文' ? (
                                  <Select
                                    defaultValue={weeklyBatch}
                                    style={{ width: 110 }}
                                    value={weeklyBatch}
                                    onChange={value => {
                                      setWeeklyBatch(Number(value))
                                      setCategory({
                                        ...category,
                                        name: undefined,
                                      })
                                      setTotalAmount(week * Number(value))
                                    }}
                                  >
                                    {[
                                      { week: '1' },
                                      { week: '3' },
                                      { week: '4' },
                                      { week: '6' },
                                      { week: '9' },
                                      { week: '10' },
                                      { week: '15' },
                                    ].map((d: { week: string }) => (
                                      <Select.Option key={d.week} value={d.week}>
                                        {d.week}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                ) : category.language === '師資班' ? (
                                  <Select
                                    defaultValue={weeklyBatch}
                                    style={{ width: 110 }}
                                    value={weeklyBatch}
                                    onChange={value => {
                                      setWeeklyBatch(Number(value))
                                      setCategory({
                                        ...category,
                                        name: undefined,
                                      })
                                      setTotalAmount(26)
                                    }}
                                  >
                                    {[{ week: '2' }, { week: '5' }].map((d: { week: string }) => (
                                      <Select.Option key={d.week} value={d.week}>
                                        {d.week}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                ) : null
                              ) : (
                                <InputNumber
                                  min={1}
                                  value={weeklyBatch}
                                  onChange={e => {
                                    setWeeklyBatch(Number(e))
                                    setCategory({
                                      ...category,
                                      name: undefined,
                                    })
                                  }}
                                />
                              )}
                            </div>
                            {category.language === '中文' && category.programType === '套裝項目' && (
                              <div style={{ width: 110, marginRight: 8 }}>
                                週數
                                {weeklyBatch === 1 ? (
                                  <div>{weeklyBatch}</div>
                                ) : (
                                  <InputNumber
                                    min={1}
                                    value={week}
                                    onChange={e => {
                                      setWeek(Number(e))
                                      setCategory({
                                        ...category,
                                        name: undefined,
                                      })
                                      setTotalAmount(weeklyBatch * Number(e))
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </>
                        )}
                        <div style={{ width: 110, marginRight: 8 }}>
                          總堂數
                          {category.programType === '套裝項目' && category.language !== '外文' ? (
                            category.language === '中文' ? (
                              <div>{totalAmount}</div>
                            ) : category.language === '師資班' ? (
                              <Select
                                defaultValue={totalAmount}
                                value={totalAmount}
                                style={{ width: 110 }}
                                onChange={value => {
                                  setCategory({
                                    ...category,
                                    name: undefined,
                                  })
                                  setTotalAmount(Number(value))
                                }}
                              >
                                {[{ title: '26' }].map((d: { title: string }) => (
                                  <Select.Option key={d.title} value={d.title}>
                                    {d.title}
                                  </Select.Option>
                                ))}
                              </Select>
                            ) : null
                          ) : (
                            <InputNumber
                              min={1}
                              value={totalAmount}
                              step={0.1}
                              onChange={e => {
                                const numericValue = Number(e)

                                if (!validateNumericSessionInput(numericValue)) {
                                  return message.error('課程堂數只能輸入小數點後一位')
                                }

                                const roundedValue = Math.floor(numericValue * 10) / 10

                                setTotalAmount(roundedValue)
                                setCategory({
                                  ...category,
                                  name: undefined,
                                })
                              }}
                            />
                          )}
                        </div>
                        <div style={{ width: '100%', marginRight: 16 }}>
                          品項
                          {category.programType === '自訂項目' || category.project?.includes('自訂') ? (
                            <Input
                              style={{ width: '100%', marginRight: 16 }}
                              value={newProductName}
                              onChange={e => {
                                setNewProductName(e.target.value)
                              }}
                            />
                          ) : (
                            <Select
                              style={{ width: '100%', marginRight: 16 }}
                              value={category.name}
                              onChange={value => {
                                setCategory({
                                  ...category,
                                  name: value.toString(),
                                })
                                setCustomPrice(calculateMinPrice(category, weeklyBatch, totalAmount))
                                setCustomPrice(0)
                                setCustomTotalPrice(0)
                                setZeroTaxPrice(0)
                              }}
                            >
                              {uniqBy(prop('title'), filterProducts).map((d: { title: string }) => (
                                <Select.Option key={d.title} value={d.title}>
                                  {d.title}
                                </Select.Option>
                              ))}
                            </Select>
                          )}
                        </div>
                        <div style={{ whiteSpace: 'nowrap', width: 110 }}>
                          <div>{category.programType === '套裝項目' ? '總價' : '單價/堂'}</div>
                          {selectedProduct?.options.isCustomPrice ||
                          isMemberTypeBG ||
                          (category.language === '中文' &&
                            category.programType === '套裝項目' &&
                            ![1, 4, 13].includes(week)) ? (
                            <InputNumber
                              min={calculateMinPrice(category, weeklyBatch, totalAmount)}
                              value={customPrice}
                              onChange={e => {
                                setCustomPrice(Number(e))
                              }}
                            />
                          ) : (
                            <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                              {selectedProduct?.price}
                            </div>
                          )}
                        </div>
                        <div style={{ whiteSpace: 'nowrap', width: 110 }}>
                          <div>開放總價</div>
                          <InputNumber
                            value={customTotalPrice}
                            onChange={e => {
                              setCustomTotalPrice(Number(e))
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {category.product === '註冊費' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 32,
                          width: '100%',
                          marginRight: 16,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ width: 110 }}>
                          品項
                          <Select defaultValue={'註冊費'} style={{ width: 110 }}>
                            {['註冊費'].map(d => (
                              <Select.Option key={d} value={d}>
                                {d}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                        <div style={{ width: 110, whiteSpace: 'nowrap' }}>
                          <div>單價</div>
                          {selectedProduct?.options.isCustomPrice || isMemberTypeBG ? (
                            <InputNumber
                              min={0}
                              value={customPrice}
                              onChange={e => {
                                setCustomPrice(Number(e))
                              }}
                            />
                          ) : (
                            <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                              {selectedProduct?.price}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {category.product !== '學費' && category.product !== '註冊費' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          marginRight: 16,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ width: 200 }}>
                          項目
                          <Select
                            defaultValue={options?.projects[0].title}
                            style={{ width: 200 }}
                            value={category.project}
                            onChange={value => {
                              setCategory({
                                ...category,
                                project: value,
                                name: undefined,
                              })
                            }}
                          >
                            {options?.projects.map((d: { title: string }) => (
                              <Select.Option key={d.title} value={d.title}>
                                {d.title}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                        <div style={{ width: '100%', marginRight: 16 }}>
                          品項
                          {category.project?.includes('自訂') ? (
                            <Input
                              style={{ width: '100%', marginRight: 16 }}
                              value={newProductName}
                              onChange={e => {
                                setNewProductName(e.target.value)
                              }}
                            />
                          ) : (
                            <Select
                              style={{ width: '100%', marginRight: 16 }}
                              value={category.name}
                              onChange={value => {
                                setCategory({
                                  ...category,
                                  name: value.toString(),
                                })
                              }}
                            >
                              {filterProducts.map((d: { title: string }) => (
                                <Select.Option key={d.title} value={d.title}>
                                  {d.title}
                                </Select.Option>
                              ))}
                            </Select>
                          )}
                        </div>
                        <div style={{ width: 110, whiteSpace: 'nowrap' }}>
                          <div>單價</div>
                          {selectedProduct?.options.isCustomPrice ||
                          isMemberTypeBG ||
                          category.project?.includes('自訂') ? (
                            <InputNumber
                              min={0}
                              value={customPrice}
                              onChange={e => {
                                setCustomPrice(Number(e))
                              }}
                            />
                          ) : (
                            <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                              {filterProducts.find(p => p.title === category.name)?.price}
                            </div>
                          )}
                        </div>
                        {isMemberZeroTax && (
                          <div style={{ whiteSpace: 'nowrap', width: 110, marginLeft: 12 }}>
                            <div>零稅價</div>
                            <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>{zeroTaxPrice}</div>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      disabled={
                        (!isMemberTypeBG &&
                          !category.project?.includes('自訂') &&
                          (filterProducts.length === 0 || !selectedProduct)) ||
                        loading
                      }
                      loading={loading}
                      onClick={() => {
                        if (category.programType === '自訂項目' || category.project?.includes('自訂')) {
                          if (!newProductName) {
                            return message.error('請輸入自訂產品命名字')
                          }
                          setLoading(true)
                          if (category.product === '學費') {
                            insertAppointmentPlan({
                              variables: {
                                data: {
                                  title: newProductName,
                                  price: customPrice,
                                  duration: 0,
                                  published_at: new Date(),
                                  app_id: appId,
                                  options:
                                    category.programType === '自訂項目'
                                      ? {
                                          isBG: isMemberTypeBG,
                                          language: category.language,
                                          product: category.product,
                                          language_type: category.languageType,
                                          total_sessions: { max: totalAmount, min: totalAmount },
                                        }
                                      : {
                                          language: category.language,
                                          product: category.product,
                                          language_type: category.languageType,
                                          program_type: category.programType,
                                          class_mode: category.classMode,
                                          class_type: category.classType,
                                          location_type: category.locationType,
                                          project: category.project,
                                          once_sessions: category.programType === '套裝項目' ? week : undefined,
                                          weekly_frequency: { max: weeklyBatch, min: weeklyBatch },
                                          total_sessions: { max: totalAmount, min: totalAmount },
                                        },
                                },
                              },
                            })
                              .then(r => {
                                const id = r.data?.insert_appointment_plan_one?.id
                                const productId = `AppointmentPlan_${id}`

                                onChangeSelectedProducts({
                                  id,
                                  amount: totalAmount,
                                  price: zeroTaxPrice || customPrice,
                                  totalPrice: (zeroTaxPrice || customPrice) * totalAmount,
                                  productId,
                                  title: newProductName,
                                  options:
                                    category.programType === '自訂項目'
                                      ? {
                                          language: category.language,
                                          product: category.product,
                                          language_type: category.languageType,
                                          total_sessions: { max: totalAmount, min: totalAmount },
                                        }
                                      : {
                                          product: category.product,
                                          language: category.language,
                                          language_type: category.languageType,
                                          program_type: category.programType,
                                          class_mode: category.classMode,
                                          class_type: category.classType,
                                          location_type: category.locationType,
                                          project: category.project,
                                          once_sessions: category.programType === '套裝項目' ? week : undefined,
                                          weekly_frequency: { max: weeklyBatch, min: weeklyBatch },
                                          total_sessions: { max: totalAmount, min: totalAmount },
                                        },
                                })
                              })
                              .catch(e => {
                                console.log(e)
                              })
                              .finally(() => {
                                setLoading(false)
                              })
                          } else {
                            insertToken({
                              variables: {
                                data: {
                                  title: newProductName,
                                  price: customPrice,
                                  app_id: appId,
                                  type: 'contract',
                                  options: {
                                    language: category.language,
                                    product: category.product,
                                    project: category.project,
                                  },
                                },
                              },
                            })
                              .then(r => {
                                const id = r.data?.insert_token_one?.id
                                const productId = `Token_${id}`

                                onChangeSelectedProducts({
                                  id,
                                  amount: category.product === '學費' ? totalAmount : 1,
                                  price: zeroTaxPrice || customPrice,
                                  totalPrice: (zeroTaxPrice || customPrice) * 1,
                                  productId,
                                  title: newProductName,
                                  options: {
                                    product: category.product,
                                    language: category.language,
                                    project: category.project,
                                  },
                                })
                              })
                              .catch(e => {
                                console.log(e)
                              })
                              .finally(() => {
                                setLoading(false)
                              })
                          }
                        } else if (selectedProduct) {
                          const price =
                            filterProducts.find(p => p.title === category.name)?.options.isCustomPrice || isMemberTypeBG
                              ? customPrice
                              : selectedProduct.price
                          onChangeSelectedProducts({
                            id: selectedProduct.id,
                            amount: category.product === '學費' ? totalAmount : 1,
                            price: zeroTaxPrice
                              ? category.product === '學費'
                                ? Math.round((zeroTaxPrice / totalAmount) * 100) / 100
                                : zeroTaxPrice
                              : customTotalPrice
                              ? category.product === '學費'
                                ? Math.round((customTotalPrice / totalAmount) * 100) / 100
                                : customTotalPrice
                              : price,
                            totalPrice: zeroTaxPrice
                              ? zeroTaxPrice
                              : customTotalPrice
                              ? customTotalPrice
                              : category.language === '中文' &&
                                category.programType === '套裝項目' &&
                                ![1, 4, 13].includes(week)
                              ? customPrice
                              : category.programType === '套裝項目'
                              ? price
                              : price * (category.product === '學費' ? totalAmount : 1),
                            productId: selectedProduct.productId,
                            title: selectedProduct.title,
                            options: {
                              language: category.language,
                              product: category.product,
                              language_type: category.languageType,
                              program_type: category.programType,
                              class_mode: category.classMode,
                              class_type: category.classType,
                              location_type: category.locationType,
                              project: category.project,
                              once_sessions: category.programType === '套裝項目' ? week : undefined,
                              weekly_frequency: { max: weeklyBatch, min: weeklyBatch },
                              total_sessions: { max: totalAmount, min: totalAmount },
                            },
                          })
                        }
                      }}
                    >
                      + 新增項目
                    </Button>
                  </div>
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        )}

        <AdminBlockTitle>
          訂單內容<span style={{ color: 'red' }}> *</span>
        </AdminBlockTitle>
        <div style={{ border: '1px solid #ececec', padding: '12px 8px', marginBottom: 24 }}>
          {selectedProducts.map(v => {
            return (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',

                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div>{v.title}</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 40,
                  }}
                >
                  <div>
                    <QuantityInput
                      value={v.amount}
                      min={1}
                      onChange={value => {
                        adjustSelectedProductAmount(v, value || 1)
                      }}
                      disabled={v.title.includes('套裝項目')}
                    />
                  </div>
                  <div style={{ minWidth: 110, textAlign: 'right' }}>${v.totalPrice.toLocaleString()}</div>
                  <div style={{ cursor: 'pointer' }}>
                    <AiOutlineClose
                      onClick={() => {
                        deleteSelectedProduct(v)
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {selectedProducts.filter(
          p =>
            p.productId.includes('AppointmentPlan_') &&
            ((p.options.language === '師資班' && !member.agreedAndUnexpiredContracts.find(c => c.type === 'teacher')) ||
              (p.options.language !== '師資班' && !member.agreedAndUnexpiredContracts.find(c => c.type === 'normal'))),
        ).length > 0 &&
          !isMemberTypeBG && (
            <Descriptions title="合約內容" column={2} bordered className="mb-5">
              <Descriptions.Item
                label={
                  <div>
                    合約項目<span style={{ color: 'red' }}> *</span>
                  </div>
                }
                style={{ whiteSpace: 'nowrap' }}
              >
                <Form.Item className="mb-0" name="contractId" rules={[{ required: true, message: '請選擇合約' }]}>
                  <Select<string>>
                    {contracts.map(v => (
                      <Select.Option key={v.id} value={v.id}>
                        {v.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div>
                    合約效期<span style={{ color: 'red' }}> *</span>
                  </div>
                }
                style={{ whiteSpace: 'nowrap' }}
              >
                依據訂單內容
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div>
                    開始時間<span style={{ color: 'red' }}> *</span>
                  </div>
                }
                style={{ whiteSpace: 'nowrap' }}
              >
                <Form.Item name="startedAt" noStyle>
                  <DatePicker />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div>
                    結束時間<span style={{ color: 'red' }}> *</span>
                  </div>
                }
                style={{ whiteSpace: 'nowrap' }}
              >
                <Form.Item name="endedAt" noStyle>
                  <DatePicker
                    // disabledDate={current =>
                    //   !!current &&
                    //   form?.getFieldValue('startedAt') &&
                    //   current < moment(form?.getFieldValue('startedAt')).add(1, 'y').startOf('day')
                    // }
                    disabledDate={current =>
                      !!current &&
                      (current < moment().startOf('day') ||
                        current > moment(form?.getFieldValue('startedAt')).add(1, 'y').endOf('day'))
                    }
                  />
                </Form.Item>
              </Descriptions.Item>
            </Descriptions>
          )}

        <Descriptions title="付款方式" column={2} bordered className="mb-5">
          <Descriptions.Item
            label={
              <div>
                結帳管道<span style={{ color: 'red' }}> *</span>
              </div>
            }
          >
            <Form.Item className="mb-0" name="paymentMethod" rules={[{ required: true, message: '請選擇結帳管道' }]}>
              <Select<string>>
                {paymentMethods.map((payment: string) => (
                  <Select.Option key={payment} value={payment}>
                    {payment}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {enabledModules.account_receivable && (
              <Form.Item name="accountReceivable">
                <Checkbox
                  disabled={!memberType || !/^B|G/.test(memberType.trim())}
                  onChange={e => {
                    form?.setFieldsValue({ accountReceivable: e.target.checked })
                  }}
                >
                  應收帳款
                </Checkbox>
              </Form.Item>
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <div>
                付款模式<span style={{ color: 'red' }}> *</span>
              </div>
            }
          >
            <Form.Item name="paymentMode" rules={[{ required: true, message: '請選擇付款模式' }]}>
              <Select<string>
                onChange={e => {
                  if (!['先上課後月結固定金額', '課前頭款+自訂分期', '開課後自訂分期'].includes(e)) {
                    installments.forEach(installment => {
                      removeInstallment(installment.index)
                    })
                  }
                }}
              >
                {paymentModes
                  .filter(mode => (sum(selectedProducts.map(p => p.totalPrice)) >= 24000 ? true : mode !== '訂金+尾款'))
                  .filter(
                    mode =>
                      (!!isMemberTypeBG &&
                        [
                          '全額付清',
                          '先上課後月結實支實付',
                          '先上課後月結固定金額',
                          '課前頭款+自訂分期',
                          '開課後自訂分期',
                        ].includes(mode)) ||
                      (!isMemberTypeBG && ['全額付清', '訂金+尾款'].includes(mode)),
                  )
                  .map((payment: string) => (
                    <Select.Option key={payment} value={payment}>
                      {payment}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item name="skipIssueInvoice">
              <Checkbox
                onChange={e => {
                  form?.setFieldsValue({ skipIssueInvoice: e.target.checked })
                }}
              >
                手動開發票
              </Checkbox>
            </Form.Item>
          </Descriptions.Item>
          {['先上課後月結固定金額', '課前頭款+自訂分期', '開課後自訂分期'].includes(fieldValue?.paymentMode || '') && (
            <Descriptions.Item span={2} label="自訂分期">
              <div>總金額：{sum(selectedProducts.map(p => p.totalPrice)).toLocaleString()}</div>
              {installments.map(installment => (
                <div
                  key={installment.index}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}
                >
                  <div>{installment.index === 1 ? '頭期' : `${installment.index}期`}</div>
                  <InputNumber
                    min={0}
                    max={sum(selectedProducts.map(p => p.totalPrice))}
                    value={installment.price}
                    onChange={value => {
                      const max =
                        sum(selectedProducts.map(p => p.totalPrice)) -
                        sum(installments.filter(i => i.index !== installment.index).map(i => i.price))
                      const updatedValue = Number(value) > max ? max : Number(value)
                      updateInstallmentPrice(installment.index, updatedValue, installment.endedAt)
                    }}
                  />
                  {installment.index !== 1 && (
                    <Button
                      icon={<CloseCircleOutlined />}
                      type="link"
                      onClick={() => {
                        removeInstallment(installment.index)
                      }}
                    ></Button>
                  )}
                  <div style={{ marginLeft: 24 }}>
                    繳款期限：
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      showTime={{ format: 'HH:mm' }}
                      value={moment(installment.endedAt)}
                      onChange={value => {
                        value && updateInstallmentPrice(installment.index, installment.price, value.toDate())
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                icon={<PlusOutlined />}
                type="link"
                onClick={() => {
                  addNewInstallment({ index: installments.length + 1, price: 0, endedAt: new Date() })
                }}
              ></Button>
            </Descriptions.Item>
          )}

          <Descriptions.Item
            label={
              <div>
                發票收件人信箱<span style={{ color: 'red' }}> *</span>
              </div>
            }
          >
            <Form.Item className="mb-2" name="invoiceEmail">
              <Input />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="發票備註">
            <Form.Item className="mb-2" name="invoiceComment">
              <Input />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="統一編號">
            <Form.Item className="mb-0" name="uniformNumber">
              <Input />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="發票抬頭">
            <Form.Item className="mb-0" name="uniformTitle">
              <Input />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <div>
                結帳公司<span style={{ color: 'red' }}> *</span>
              </div>
            }
          >
            <Form.Item className="mb-0" name="company" rules={[{ required: true, message: '請選擇結帳公司' }]}>
              <Select<string>>
                {customSetting?.paymentCompanies
                  ?.filter(
                    company =>
                      currentUserRole === 'app-owner' ||
                      !!memberPermissionGroups?.member_permission_group
                        .map(g => g.permission_group_id)
                        .includes(company.permissionGroupId),
                  )
                  .map(company => company.companies)
                  .flat()
                  .map(company => (
                    <Select.Option key={company.name} value={company.name}>
                      {company.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <div>
                執行人員<span style={{ color: 'red' }}> *</span>
              </div>
            }
          >
            <Form.Item className="mb-0" name="executorId" rules={[{ required: true, message: '請選擇執行人員' }]}>
              <MemberSelector
                members={sales
                  .filter(
                    s =>
                      currentUserRole === 'app-owner' ||
                      s.permissionGroups.filter(
                        group =>
                          !!memberPermissionGroups?.member_permission_group
                            .map(g => g.permission_group_id)
                            .includes(group),
                      ).length > 0,
                  )
                  .map(m => ({
                    id: m.id,
                    name: m.name,
                    username: m.name,
                    email: m.email,
                  }))}
              />
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <div>
                語言<span style={{ color: 'red' }}> *</span>
              </div>
            }
          >
            <Form.Item className="mb-0" name="language" rules={[{ required: true, message: '請選擇語言' }]}>
              <Select<string>>
                {[
                  { title: '中文', key: 'zh-tw' },
                  { title: '英文', key: 'en' },
                  { title: '日文', key: 'jp' },
                ].map(l => (
                  <Select.Option key={l.key} value={l.key}>
                    {l.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label={<div>{/* 付款人信箱<span style={{ color: 'red' }}> *</span> */}</div>}>
            {/* <Form.Item className="mb-2" name="destinationEmail">
              <Input />
            </Form.Item> */}
          </Descriptions.Item>
        </Descriptions>
      </Form>
    )
  },
)

const StyledInputGroup = styled(Input.Group)`
  && {
    width: auto;
    input {
      width: 5rem;
      text-align: center;
    }
  }
`
const QuantityInput: React.VFC<{
  value?: number
  min?: number
  max?: number
  remainQuantity?: number
  onChange?: (value: number | undefined) => void
  disabled?: boolean
}> = ({ value = 0, min = -Infinity, max = Infinity, remainQuantity, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState(`${value}`)
  useEffect(() => {
    setInputValue(`${value}`)
  }, [value])
  return (
    <StyledInputGroup compact>
      <Button
        icon="-"
        onClick={() => {
          const result = value - 1 <= min ? min : value - 1
          onChange && onChange(result)
          setInputValue(`${result}`)
        }}
        disabled={disabled || min === value || remainQuantity === 0}
      />
      <Input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onBlur={e => {
          const newValue = Number.isSafeInteger(parseInt(e.target.value)) ? parseInt(e.target.value) : value
          const result = newValue <= min ? min : newValue >= max ? max : newValue

          onChange && onChange(result)
          setInputValue(`${result}`)
        }}
      />
      <Button
        icon="+"
        onClick={() => {
          const result = value + 1 >= max ? max : value + 1
          onChange && onChange(result)
          setInputValue(`${result}`)
        }}
        disabled={disabled || max === value || remainQuantity === 0}
      />
    </StyledInputGroup>
  )
}

const calculateMinPrice = (
  category: {
    language: string
    product: string
    programType?: string
    classMode?: string
    classType?: string
    locationType?: string
    languageType?: string
    onceSessions?: string
    project?: string
  },
  weeklyBatch: number,
  totalAmount: number,
) => {
  return (category.language === '中文' || category.language === '方言') &&
    category.programType === '客製時數' &&
    category.classType === '個人班' &&
    category.classMode === '內課' &&
    category.locationType === '海內'
    ? weeklyBatch === 1
      ? 850
      : weeklyBatch >= 2 && weeklyBatch <= 9
      ? totalAmount < 60
        ? 800
        : 750
      : weeklyBatch >= 10
      ? totalAmount < 60
        ? 700
        : 650
      : 0
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '自組班' &&
      category.classMode === '內課' &&
      category.locationType === '海內'
    ? weeklyBatch === 1
      ? 550
      : weeklyBatch >= 2 && weeklyBatch <= 4
      ? totalAmount < 60
        ? 500
        : 470
      : weeklyBatch >= 5
      ? totalAmount < 60
        ? 450
        : 420
      : 0
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '個人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 950
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '2人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 1400
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '3-5人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 2000
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '6-10人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 3000
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '個人班' &&
      category.classMode === '線上課' &&
      category.locationType === '海內'
    ? weeklyBatch === 1
      ? 850
      : weeklyBatch >= 2 && weeklyBatch <= 9
      ? totalAmount < 60
        ? 800
        : 750
      : weeklyBatch >= 10
      ? totalAmount < 60
        ? 700
        : 650
      : 0
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '自組班' &&
      category.classMode === '線上課' &&
      category.locationType === '海內'
    ? weeklyBatch === 1
      ? 550
      : weeklyBatch >= 2 && weeklyBatch <= 4
      ? totalAmount < 60
        ? 500
        : 470
      : weeklyBatch >= 5
      ? totalAmount < 60
        ? 450
        : 420
      : 0
    : (category.language === '中文' || category.language === '方言') &&
      category.programType === '客製時數' &&
      category.classType === '個人班' &&
      category.classMode === '線上課' &&
      category.locationType === '海外'
    ? Math.ceil(totalAmount / weeklyBatch) * 7 === 1
      ? 550
      : weeklyBatch >= 2 && weeklyBatch <= 4
      ? totalAmount < 60
        ? 500
        : 470
      : weeklyBatch >= 5
      ? totalAmount < 60
        ? 450
        : 420
      : 0
    : category.language === '外文' &&
      category.programType === '客製時數' &&
      category.classType === '個人班' &&
      (category.classMode === '內課' || category.classMode === '線上課') &&
      category.locationType === '海內'
    ? weeklyBatch === 1
      ? totalAmount < 10
        ? 1200
        : 1100
      : weeklyBatch >= 2 && weeklyBatch <= 3 && totalAmount >= 10
      ? 1050
      : weeklyBatch >= 4 && totalAmount >= 10
      ? 980
      : 0
    : category.language === '外文' &&
      category.programType === '客製時數' &&
      category.classType === '自組班' &&
      (category.classMode === '內課' || category.classMode === '線上課') &&
      category.locationType === '海內'
    ? weeklyBatch === 1
      ? totalAmount < 10
        ? 800
        : 660
      : weeklyBatch >= 2 && weeklyBatch <= 3 && totalAmount >= 10
      ? 630
      : weeklyBatch >= 4 && totalAmount >= 10
      ? 590
      : 0
    : category.language === '外文' &&
      category.programType === '客製時數' &&
      category.classType === '團體班' &&
      (category.classMode === '內課' || category.classMode === '線上課') &&
      category.locationType === '海內'
    ? weeklyBatch === 1
      ? totalAmount < 10
        ? 600
        : 550
      : weeklyBatch >= 2 && weeklyBatch <= 3 && totalAmount >= 10
      ? 500
      : weeklyBatch >= 4 && totalAmount >= 10
      ? 460
      : 0
    : category.language === '外文' &&
      category.programType === '客製時數' &&
      category.classType === '個人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 1500
    : category.language === '外文' &&
      category.programType === '客製時數' &&
      category.classType === '2人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 1800
    : category.language === '外文' &&
      category.programType === '客製時數' &&
      category.classType === '3-5人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 1800
    : 0
}
export default MemberContractCreationForm
