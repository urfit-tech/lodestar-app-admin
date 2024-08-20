import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, DatePicker, Descriptions, Form, Input, InputNumber, Select, Skeleton, Tabs } from 'antd'
import { FormProps } from 'antd/lib/form/Form'
import { sum } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import styled from 'styled-components'
import { ContractInfo, ContractProduct, ContractSales, FieldProps, paymentMethods, paymentModes } from '.'
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
        programType: [{ title: '標準時數' }, { title: '套裝項目' }, { title: '客製時數' }],
        classMode: [{ title: '內課' }, { title: '外課' }, { title: '線上課' }],
        classType: [
          { title: '個人班' },
          { title: '自組班' },
          { title: '團體班' },
          { title: '2-10人班' },
          { title: '2人班' },
          { title: '3-5人班' },
          { title: '6-10人班' },
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
        ],
      },
      {
        title: '活動',
        projects: [{ title: '移地教學' }],
      },
      {
        title: '其他',
        projects: [
          { title: '其他收入' },
          { title: '外購教材：HELLO華語' },
          { title: '外購教材：HSK 標準教程' },
          { title: '外購教材：其他台灣用書' },
          { title: '外購教材：其他大陸用書' },
          { title: '外購教材：各行各業說中文' },
          { title: '外購教材：學華語向前走' },
          { title: '外購教材：康軒國語' },
          { title: '外購教材：新實用漢語課本' },
          { title: '外購教材：新版實用視聽華語' },
          { title: '外購教材：時代華語' },
          { title: '外購教材：當代中文課程' },
          { title: '外購教材：遠東' },
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
        programType: [{ title: '標準時數' }, { title: '套裝項目' }, { title: '客製時數' }],
        classMode: [{ title: '內課' }, { title: '外課' }, { title: '線上課' }],
        classType: [
          { title: '個人班' },
          { title: '團體班' },
          { title: '2人班' },
          { title: '3-5人班' },
          { title: '自組2-5人' },
          { title: '自組3-10人' },
        ],
        locationType: [{ title: '海內' }],
      },
      {
        title: '其他',
        projects: [{ title: '其他收入' }],
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
        programType: [{ title: '套裝項目' }],
        classMode: [{ title: '內課' }],
        classType: [{ title: '團體班' }],
        locationType: [{ title: '海內' }],
        onceSessions: [
          { title: '26', week: '2' },
          { title: '26', week: '5' },
        ],
      },
      {
        title: '其他',
        projects: [{ title: '其他收入' }],
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
        programType: [{ title: '客製時數' }],
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
        projects: [{ title: '其他收入' }],
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

type PaymentCompany = {
  permissionGroupId: string
  name: string
  companies: string[]
}

const calculateEndedAt = (startedAt: Date, weeks: number) => {
  return moment(startedAt).add(weeks + 2, 'weeks')
}

const MemberContractCreationForm: React.FC<
  FormProps<FieldProps> & {
    contracts: ContractInfo['contracts']
    products: ContractProduct['products']
    sales: ContractSales['sales']
    selectedProducts: {
      id: string
      amount: number
      price: number
      totalPrice: number
      productId: string
      title: string
    }[]
    onChangeSelectedProducts: (selectedProduct: {
      id: string
      amount: number
      price: number
      totalPrice: number
      productId: string
      title: string
    }) => void
    deleteSelectedProduct: (id: string) => void
    adjustSelectedProductAmount: (id: string, amount: number) => void
    installments: { index: number; price: number }[]
    updateInstallmentPrice: (index: number, price: number) => void
    addNewInstallment: (installment: { index: number; price: number }) => void
    removeInstallment: (index: number) => void
    member: ContractInfo['member']
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
    ...formProps
  }) => {
    const fieldValue = form?.getFieldsValue()

    const { id: appId } = useApp()
    const { currentMemberId, authToken, currentUserRole } = useAuth()
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

    const { data: appSettings } = useQuery<hasura.GetCustomSetting, hasura.GetCustomSettingVariables>(
      gql`
        query GetCustomSetting($appId: String!) {
          app_setting(where: { app_id: { _eq: $appId }, key: { _eq: "custom" } }) {
            value
          }
        }
      `,
      { variables: { appId }, skip: !authToken || !appId },
    )

    const customSetting: { paymentCompanies: PaymentCompany[] } = JSON.parse(appSettings?.app_setting[0]?.value || '{}')

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
      programType: member.isBG ? '自訂項目' : '標準時數',
      classMode: '內課',
      classType: '個人班',
      locationType: '海內',
      name: member.isBG ? undefined : '中文_學費_標準時數_海內_內課_個人班_每週10堂以上_60堂以上',
    })

    const productOptions: any = CUSTOM_PRODUCT_OPTIONS_CONFIG.find(v => v.language === category.language)?.products
    const options = productOptions?.find((v: any) => v.title === category.product)

    const [weeklyBatch, setWeeklyBatch] = useState(10)
    const [totalAmount, setTotalAmount] = useState(60)
    const [customPrice, setCustomPrice] = useState(0)
    const [newProductName, setNewProductName] = useState('')
    const [loading, setLoading] = useState(false)

    const filterProducts = useMemo(() => {
      return products.filter(product => {
        if (category.programType === '自訂項目') {
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

    console.log({ category })
    console.log({ products })
    console.log({ filterProducts })
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
                      programType: member.isBG ? '自訂項目' : '標準時數',
                      classMode: '內課',
                      classType: '個人班',
                      locationType: '海內',
                    }
                  : key === '外文'
                  ? {
                      language: key,
                      product: '學費',
                      programType: member.isBG ? '自訂項目' : '標準時數',
                      classMode: '內課',
                      classType: '個人班',
                      locationType: '海內',
                      languageType: '英文',
                    }
                  : key === '師資班'
                  ? {
                      language: key,
                      product: '學費',
                      programType: member.isBG ? '自訂項目' : '套裝項目',
                      classMode: '內課',
                      classType: '團體班',
                      locationType: '海內',
                    }
                  : key === '方言'
                  ? {
                      language: key,
                      product: '學費',
                      programType: member.isBG ? '自訂項目' : '客製時數',
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
                      member.isBG ? (
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
                            <Select defaultValue={'自訂項目'} value={'自訂項目'} style={{ width: 110 }}>
                              {[{ title: '自訂項目' }].map((d: { title: string }) => (
                                <Select.Option key={d.title} value={d.title}>
                                  {d.title}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>

                          <div style={{ width: 500 }}>
                            品項
                            <Input
                              value={newProductName}
                              onChange={e => {
                                setNewProductName(e.target.value)
                              }}
                            />
                          </div>

                          <div style={{ width: 110, marginRight: 8 }}>
                            總堂數
                            <InputNumber
                              min={1}
                              value={totalAmount}
                              onChange={e => {
                                setTotalAmount(Number(e))
                                setCategory({
                                  ...category,
                                  name: undefined,
                                })
                              }}
                            />
                          </div>

                          <div style={{ whiteSpace: 'nowrap', width: 110 }}>
                            <div>單價/堂</div>
                            {selectedProduct?.options.isCustomPrice || member.isBG ? (
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
                        </div>
                      ) : (
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
                                setCategory({ ...category, programType: value, name: undefined })
                              }}
                            >
                              {options.programType.map((d: { title: string }) => (
                                <Select.Option key={d.title} value={d.title}>
                                  {d.title}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>
                          {[
                            { id: 'locationType', title: '海內/外', options: options.locationType },
                            { id: 'classMode', title: '上課方式', options: options.classMode },
                            {
                              id: 'classType',
                              title: '班型',
                              options: options.classType,
                            },
                          ].map(v => (
                            <div key={v.title} style={{ width: 110 }}>
                              {v.title}
                              <Select
                                defaultValue={v.options[0]?.title}
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
                            {category.language !== '外文' && category.programType === '套裝項目' ? (
                              category.language === '中文' ? (
                                <div>{weeklyBatch}</div>
                              ) : (
                                <Select
                                  defaultValue={options.onceSessions?.[0]?.week}
                                  style={{ width: 110 }}
                                  onChange={value => {
                                    setWeeklyBatch(Number(value))
                                    setCategory({
                                      ...category,
                                      name: undefined,
                                    })
                                  }}
                                >
                                  {(options.onceSessions || []).map((d: { week: string }) => (
                                    <Select.Option key={d.week} value={d.week}>
                                      {d.week}
                                    </Select.Option>
                                  ))}
                                </Select>
                              )
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
                          <div style={{ width: 110, marginRight: 8 }}>
                            總堂數
                            {category.language !== '外文' && category.programType === '套裝項目' ? (
                              <Select
                                defaultValue={options.onceSessions?.[0]?.title}
                                style={{ width: 110 }}
                                onChange={value => {
                                  setCategory({
                                    ...category,
                                    name: undefined,
                                  })
                                  setTotalAmount(Number(value))
                                  category.language === '中文' &&
                                    setWeeklyBatch(
                                      options.onceSessions?.find(
                                        (v: { title: string }) => v.title === String(totalAmount),
                                      )?.week,
                                    )
                                }}
                              >
                                {(category.language === '師資班' ? [{ title: '26' }] : options.onceSessions || []).map(
                                  (d: { title: string }) => (
                                    <Select.Option key={d.title} value={d.title}>
                                      {d.title}
                                    </Select.Option>
                                  ),
                                )}
                              </Select>
                            ) : (
                              <InputNumber
                                min={1}
                                value={totalAmount}
                                onChange={e => {
                                  setTotalAmount(Number(e))
                                  setCategory({
                                    ...category,
                                    name: undefined,
                                  })
                                }}
                              />
                            )}
                          </div>
                          <div style={{ width: 500 }}>
                            品項
                            <Select
                              style={{ width: 500 }}
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
                          </div>
                          <div style={{ whiteSpace: 'nowrap', width: 110 }}>
                            <div>單價/堂</div>
                            {selectedProduct?.options.isCustomPrice || member.isBG ? (
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
                        </div>
                      )
                    ) : null}

                    {category.product === '註冊費' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 32,
                          width: '100%',
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
                          {selectedProduct?.options.isCustomPrice || member.isBG ? (
                            <InputNumber
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
                        <div style={{ width: 480 }}>
                          品項
                          <Select
                            style={{ width: 480 }}
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
                        </div>
                        <div style={{ width: 110, whiteSpace: 'nowrap' }}>
                          <div>單價</div>
                          {selectedProduct?.options.isCustomPrice || member.isBG ? (
                            <InputNumber
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
                      </div>
                    )}

                    <Button
                      disabled={(!member.isBG && (filterProducts.length === 0 || !selectedProduct)) || loading}
                      loading={loading}
                      onClick={() => {
                        if (category.product === '學費' && member.isBG && !!newProductName) {
                          setLoading(true)
                          insertAppointmentPlan({
                            variables: {
                              data: {
                                title: newProductName,
                                price: customPrice,
                                duration: 0,
                                published_at: new Date(),
                                app_id: appId,
                                options: { isBG: true },
                              },
                            },
                          })
                            .then(r => {
                              const id = r.data?.insert_appointment_plan_one?.id
                              const productId = `AppointmentPlan_${id}`

                              onChangeSelectedProducts({
                                id,
                                amount: totalAmount,
                                price: customPrice * totalAmount,
                                totalPrice: customPrice * totalAmount,
                                productId,
                                title: newProductName,
                              })
                            })
                            .catch(e => {
                              console.log(e)
                            })
                            .finally(() => {
                              setLoading(false)
                            })
                        } else if (selectedProduct) {
                          const price = filterProducts.find(p => p.title === category.name)?.options.isCustomPrice
                            ? customPrice
                            : selectedProduct.price
                          onChangeSelectedProducts({
                            id: selectedProduct.id,
                            amount: category.product === '學費' ? totalAmount : 1,
                            price,
                            totalPrice:
                              category.programType === '套裝項目'
                                ? price
                                : price * (category.product === '學費' ? totalAmount : 1),
                            productId: selectedProduct.productId,
                            title: selectedProduct.title,
                          })

                          category.product === '學費' &&
                            form?.setFieldsValue({
                              endedAt: calculateEndedAt(
                                form.getFieldValue('startedAt'),
                                Math.ceil(totalAmount / weeklyBatch),
                              ),
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

        <AdminBlockTitle>訂單內容</AdminBlockTitle>
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
                        adjustSelectedProductAmount(v.id, value || 1)
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 110, textAlign: 'right' }}>${v.totalPrice.toLocaleString()}</div>
                  <div>
                    <AiOutlineClose
                      onClick={() => {
                        deleteSelectedProduct(v.id)
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {selectedProducts.filter(p => p.productId.includes('AppointmentPlan_')).length > 0 && !member.isBG && (
          <Descriptions title="合約內容" column={2} bordered className="mb-5">
            <Descriptions.Item label="合約項目" style={{ whiteSpace: 'nowrap' }}>
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
            <Descriptions.Item label="合約效期" style={{ whiteSpace: 'nowrap' }}>
              依據訂單內容
            </Descriptions.Item>
            <Descriptions.Item label="開始時間" style={{ whiteSpace: 'nowrap' }}>
              <Form.Item name="startedAt" noStyle>
                <DatePicker />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item label="結束時間" style={{ whiteSpace: 'nowrap' }}>
              <Form.Item name="endedAt" noStyle>
                <DatePicker />
              </Form.Item>
            </Descriptions.Item>
          </Descriptions>
        )}

        <Descriptions title="付款方式" column={2} bordered className="mb-5">
          <Descriptions.Item label="結帳管道">
            <Form.Item className="mb-0" name="paymentMethod" rules={[{ required: true, message: '請選擇結帳管道' }]}>
              <Select<string>>
                {paymentMethods.map((payment: string) => (
                  <Select.Option key={payment} value={payment}>
                    {payment}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="付款模式">
            <Form.Item className="mb-2" name="paymentMode" rules={[{ required: true, message: '請選擇付款模式' }]}>
              <Select<string>>
                {paymentModes
                  .filter(mode => (sum(selectedProducts.map(p => p.totalPrice)) >= 24000 ? true : mode !== '訂金+尾款'))
                  .filter(mode => member.isBG && !['訂金+尾款', '暫收款後開發票'].includes(mode))
                  .map((payment: string) => (
                    <Select.Option key={payment} value={payment}>
                      {payment}
                    </Select.Option>
                  ))}
              </Select>
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
                    onChange={value => updateInstallmentPrice(installment.index, Number(value))}
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
                </div>
              ))}
              <Button
                icon={<PlusOutlined />}
                type="link"
                onClick={() => {
                  addNewInstallment({ index: installments.length + 1, price: 0 })
                }}
              ></Button>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="統一編號">
            <Form.Item className="mb-0" name="unifiedNumber">
              <Input />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="發票備註">
            <Form.Item className="mb-2" name="invoiceComment">
              <Input />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="結帳公司">
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
                    <Select.Option key={company} value={company}>
                      {company}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="執行人員">
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
}> = ({ value = 0, min = -Infinity, max = Infinity, remainQuantity, onChange }) => {
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
        disabled={min === value || remainQuantity === 0}
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
        disabled={max === value || remainQuantity === 0}
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
  return category.language === '中文' &&
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
    : category.language === '中文' &&
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
    : category.language === '中文' &&
      category.programType === '客製時數' &&
      category.classType === '個人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 950
    : category.language === '中文' &&
      category.programType === '客製時數' &&
      category.classType === '2人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 1400
    : category.language === '中文' &&
      category.programType === '客製時數' &&
      category.classType === '3-5人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 2000
    : category.language === '中文' &&
      category.programType === '客製時數' &&
      category.classType === '6-10人班' &&
      category.classMode === '外課' &&
      category.locationType === '海內'
    ? 3000
    : category.language === '中文' &&
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
    : category.language === '中文' &&
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
    : category.language === '中文' &&
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
