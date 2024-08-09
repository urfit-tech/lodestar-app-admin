import { Button, DatePicker, Descriptions, Form, Input, InputNumber, Select, Tabs } from 'antd'
import { FormProps } from 'antd/lib/form/Form'
import { sum } from 'lodash'
import moment from 'moment'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import styled from 'styled-components'
import { ContractInfo, ContractSales, FieldProps, paymentMethods, paymentModes } from '.'
import { AdminBlockTitle } from '../../components/admin'

const LANGUAGES = ['中文', '外文', '師資班', '方言'] as const
const PRODUCT_CATEGORy = [
  '註冊費',
  '學費',
  '教材',
  '活動',
  // 'B/G訂單',
  '其他',
] as const

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
          },
          {
            title: '3',
          },
          {
            title: '4',
          },
          {
            title: '6',
          },
          {
            title: '9',
          },
          {
            title: '10',
          },
          {
            title: '12',
          },
          {
            title: '15',
          },
          {
            title: '16',
          },
          {
            title: '24',
          },
          {
            title: '36',
          },
          {
            title: '39',
          },
          {
            title: '40',
          },
          {
            title: '52',
          },
          {
            title: '60',
          },
          {
            title: '78',
          },
          {
            title: '117',
          },
          {
            title: '130',
          },
          {
            title: '195',
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
        title: 'BG訂單',
        projects: [
          { title: 'AIT_2人班' },
          { title: 'AIT_3-5人班' },
          { title: 'AIT_6-10人班' },
          { title: 'AIT_個人班' },
          { title: '外交學院' },
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
        title: 'BG訂單',
        projects: [{ title: '再興' }, { title: '幼華' }, { title: '聖心' }],
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
        onceSessions: [{ title: '26' }],
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

const calculateEndedAt = (startedAt: Date, weeks: number) => {
  return moment(startedAt).add(weeks + 2, 'weeks')
}

const MemberContractCreationForm: React.FC<
  FormProps<FieldProps> & {
    contracts: ContractInfo['contracts']
    products: ContractInfo['products']
    sales: ContractSales['sales']
    selectedProducts: {
      id: string
      amount: number
      price: number
      totalPrice: number
    }[]
    onChangeSelectedProducts: (selectedProduct: {
      id: string
      amount: number
      price: number
      totalPrice: number
    }) => void
    deleteSelectedProduct: (id: string) => void
    adjustSelectedProductAmount: (id: string, amount: number) => void
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
    ...formProps
  }) => {
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
    }>({
      language: '中文',
      product: '學費',
      programType: '標準時數',
      classMode: '內課',
      classType: '個人班',
      locationType: '海內',
      languageType: '英文',
    })
    console.log(category)

    const productOptions: any = CUSTOM_PRODUCT_OPTIONS_CONFIG.find(v => v.language === category.language)?.products
    const options = productOptions?.find((v: any) => v.title === category.product)

    const [weeklyBatch, setWeeklyBatch] = useState(10)
    const [totalAmount, setTotalAmount] = useState(60)
    const [customPrice, setCustomPrice] = useState(0)
    console.log(products)

    const filterProducts = useMemo(() => {
      return products.filter(product => {
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
    }, [category, weeklyBatch, totalAmount])

    console.log(filterProducts)
    return (
      <Form layout="vertical" colon={false} hideRequiredMark form={form} {...formProps}>
        <AdminBlockTitle>產品清單</AdminBlockTitle>
        <Tabs
          className="mb-5"
          onTabClick={key => {
            setCategory({
              language: key,
              product: category.product || '學費',
              programType: category.programType || '標準時數',
              classMode: category.classMode || '內課',
              classType: category.classType || '個人班',
              locationType: category.locationType || '海內',
              languageType: category.languageType || '英文',
            })
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
                    justifyContent: 'space-between',
                    backgroundColor: '#f6f6f6',
                    padding: '12px 24px',
                  }}
                >
                  {category.product === '學費' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {(category.language === '方言' || category.language === '外文') && (
                        <div style={{ width: 110 }}>
                          語言
                          <Select
                            value={category.languageType}
                            style={{ width: 110 }}
                            onChange={value => {
                              setCategory({ ...category, languageType: value })
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
                            setCategory({ ...category, programType: value })
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
                              setCategory({ ...category, [v.id]: value })
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
                        <InputNumber
                          min={1}
                          value={weeklyBatch}
                          onChange={e => {
                            setWeeklyBatch(Number(e))
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
                          }}
                        />
                      </div>
                      <div style={{ whiteSpace: 'nowrap', width: 110 }}>
                        <div>單價/堂</div>
                        {filterProducts[0]?.options.isCustomPrice ? (
                          <InputNumber
                            value={customPrice}
                            onChange={e => {
                              setCustomPrice(Number(e))
                            }}
                          />
                        ) : (
                          <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                            {filterProducts[0]?.price}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {category.product === '註冊費' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        width: '100%',
                      }}
                    >
                      <div style={{ width: 110 }}>
                        項目
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
                        {filterProducts[0]?.options.isCustomPrice ? (
                          <InputNumber
                            value={customPrice}
                            onChange={e => {
                              setCustomPrice(Number(e))
                            }}
                          />
                        ) : (
                          <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                            {filterProducts[0]?.price}
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
                        justifyContent: 'space-between',
                        gap: 8,
                        width: '100%',
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
                              language: category.language,
                              product: category.product,
                              project: value,
                              programType: category.programType,
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
                      <div style={{ width: 500 }}>
                        品項
                        <Select style={{ width: 500 }}>
                          {filterProducts.map((d: { title: string }) => (
                            <Select.Option key={d.title} value={d.title}>
                              {d.title}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div style={{ width: 110, whiteSpace: 'nowrap' }}>
                        <div>單價</div>
                        {filterProducts[0]?.options.isCustomPrice ? (
                          <InputNumber
                            value={customPrice}
                            onChange={e => {
                              setCustomPrice(Number(e))
                            }}
                          />
                        ) : (
                          <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                            {filterProducts[0]?.price}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* {category.product === '活動' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        width: '100%',
                      }}
                    >
                      <div style={{ width: 110 }}>
                        項目
                        <Select defaultValue={'移地教學'} style={{ width: 110 }}>
                          {options.projects.map(d => (
                            <Select.Option key={d} value={d}>
                              {d}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div style={{ width: 110, whiteSpace: 'nowrap' }}>
                        <div>單價</div>
                        {filterProducts[0]?.options.isCustomPrice ? (
                          <InputNumber
                            value={customPrice}
                            onChange={e => {
                              setCustomPrice(Number(e))
                            }}
                          />
                        ) : (
                          <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                            {filterProducts[0]?.price}
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}

                  {/* {category.product === '其他' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        width: '100%',
                      }}
                    >
                      <div style={{ width: 110 }}>
                        項目
                        <Select defaultValue={'其他收入'} style={{ width: 110 }}>
                          {['其他收入', '外購教材：當代中文課程'].map(d => (
                            <Select.Option key={d} value={d}>
                              {d}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div style={{ width: 110, whiteSpace: 'nowrap' }}>
                        <div>單價</div>
                        {filterProducts[0]?.options.isCustomPrice ? (
                          <InputNumber
                            value={customPrice}
                            onChange={e => {
                              setCustomPrice(Number(e))
                            }}
                          />
                        ) : (
                          <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
                            {filterProducts[0]?.price}
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
                  <Button
                    disabled={filterProducts.length === 0}
                    onClick={() => {
                      const price = filterProducts[0]?.options.isCustomPrice ? customPrice : filterProducts[0].price
                      onChangeSelectedProducts({
                        id: filterProducts[0].id,
                        amount: category.product === '學費' ? totalAmount : 1,
                        price,
                        totalPrice: price * (category.product === '學費' ? totalAmount : 1),
                      })

                      category.product === '學費' &&
                        form?.setFieldsValue({
                          endedAt: calculateEndedAt(
                            form.getFieldValue('startedAt'),
                            Math.ceil(totalAmount / weeklyBatch),
                          ),
                        })
                    }}
                  >
                    + 新增項目
                  </Button>
                </div>
              </div>
            </Tabs.TabPane>
          ))}
        </Tabs>

        <AdminBlockTitle>訂單內容</AdminBlockTitle>
        <div style={{ border: '1px solid #ececec', padding: '12px 8px', marginBottom: 24 }}>
          {selectedProducts.map(v => {
            const p = products.find(p => p.id === v.id)
            if (!p) return null
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
                <div>{p.title}</div>
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
            <Select<string> defaultValue="依據訂單內容">
              {['依據訂單內容'].map(v => (
                <Select.Option key={v} value={v}>
                  依據訂單內容
                </Select.Option>
              ))}
            </Select>
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

          <Descriptions.Item label="結帳公司">
            <Form.Item className="mb-0" name="company" rules={[{ required: true, message: '請選擇結帳公司' }]}>
              <Select<string>>
                {[
                  '中華語文 - 70560259',
                  '靈呱 - 42307734',
                  '附設臺北市私立中華語文 - 42379477',
                  '基金會 - 20084864',
                ].map((payment: string) => (
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
                  .map((payment: string) => (
                    <Select.Option key={payment} value={payment}>
                      {payment}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="執行人員">
            <Form.Item className="mb-0" name="executorId" rules={[{ required: true, message: '請選擇執行人員' }]}>
              <Select<string>>
                {sales.map(m => (
                  <Select.Option key={m.id} value={m.id}>
                    {m.name}( {m.email} )
                  </Select.Option>
                ))}
              </Select>
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

export default MemberContractCreationForm
