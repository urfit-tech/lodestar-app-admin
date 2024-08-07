import { Button, DatePicker, Descriptions, Form, Input, InputNumber, Select, Tabs } from 'antd'
import { FormProps } from 'antd/lib/form/Form'
import { sum } from 'lodash'
import moment from 'moment'
import React, { memo, useEffect, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import styled from 'styled-components'
import { ContractInfo, FieldProps, paymentMethods, paymentModes } from '.'
import { AdminBlockTitle } from '../../components/admin'

const LANGUAGES = ['中文', '外文', '師資班', '方言'] as const
const PRODUCT_CATEGORIES = [
  '註冊費',
  '學費',
  '教材',
  '活動',
  // 'B/G訂單',
  '其他',
] as const

const calculateEndedAt = (startedAt: Date, weeks: number) => {
  console.log(startedAt)

  return moment(startedAt).add(weeks + 2, 'weeks')
}

const MemberContractCreationForm: React.FC<
  FormProps<FieldProps> & {
    contracts: ContractInfo['contracts']
    products: ContractInfo['products']
    sales: ContractInfo['sales']
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
    const [categories, setCategories] = useState<{
      language: typeof LANGUAGES[number]
      productCategory: typeof PRODUCT_CATEGORIES[number]
      item: string
      abroad: '海內' | '海外'
      classType: '內課' | '外課'
      class: '個人' | '自組' | '團體'
    }>({
      language: '中文',
      productCategory: '學費',
      item: '標準時數',
      abroad: '海內',
      classType: '內課',
      class: '個人',
    })

    const [weeklyBatch, setWeeklyBatch] = useState(10)
    const [totalAmount, setTotalAmount] = useState(61)
    const [customPrice, setCustomPrice] = useState(0)

    const filterProducts = products.filter(product => {
      const productOptions = product.options

      const categoryMatch =
        categories.productCategory !== '學費'
          ? [categories.language, categories.productCategory].every(item => productOptions.categories.includes(item))
          : Object.values(categories).every(item => productOptions.categories.includes(item))

      if (productOptions.isCustomPrice || categories.productCategory !== '學費') {
        return categoryMatch
      }
      const totalAmountMatch =
        (!productOptions?.totalAmount?.min || totalAmount >= productOptions?.totalAmount?.min) &&
        (!productOptions?.totalAmount?.max || totalAmount <= productOptions?.totalAmount?.max)

      const weeklyBatchMatch =
        (!productOptions?.weeklyBatch?.min || weeklyBatch >= productOptions?.weeklyBatch?.min) &&
        (!productOptions?.weeklyBatch?.max || weeklyBatch <= productOptions?.weeklyBatch?.max)

      return categoryMatch && totalAmountMatch && weeklyBatchMatch
    })
    console.log(filterProducts)

    return (
      <Form layout="vertical" colon={false} hideRequiredMark form={form} {...formProps}>
        <AdminBlockTitle>產品清單</AdminBlockTitle>
        <Tabs
          className="mb-5"
          onTabClick={key => {
            setCategories({ ...categories, language: key as typeof LANGUAGES[number] })
          }}
        >
          {LANGUAGES.map(k => (
            <Tabs.TabPane key={k} tab={k}>
              <div style={{ padding: '8px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                  {PRODUCT_CATEGORIES.map(v => (
                    <Button
                      key={v}
                      type={v === categories?.productCategory ? 'primary' : undefined}
                      onClick={() => {
                        setCategories({ ...categories, productCategory: v as typeof PRODUCT_CATEGORIES[number] })
                      }}
                    >
                      {v}
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
                  {categories.productCategory === '學費' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div style={{ width: 110 }}>
                        項目
                        <Select
                          defaultValue={'標準時數'}
                          style={{ width: 110 }}
                          onChange={value => {
                            setCategories({ ...categories, item: value })
                          }}
                        >
                          {['標準時數', '客製時數', '套裝項目'].map(d => (
                            <Select.Option key={d} value={d}>
                              {d}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      {[
                        { id: 'abroad', title: '海內/外', options: ['海內', '海外'] },
                        { id: 'classType', title: '上課方式', options: ['內課', '外課', '線上課'] },
                        {
                          id: 'class',
                          title: '班型',
                          options: ['個人', '自組', '團體', '2人', '3-5人', '6-10人', '2-10人'],
                        },
                      ].map(v => (
                        <div key={v.title} style={{ width: 110 }}>
                          {v.title}
                          <Select
                            defaultValue={v.options[0]}
                            style={{ width: 110 }}
                            onChange={value => {
                              setCategories({ ...categories, [v.id]: value })
                            }}
                          >
                            {v.options.map(d => (
                              <Select.Option key={d} value={d}>
                                {d}
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

                  {categories.productCategory === '註冊費' && (
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

                  {categories.productCategory === '教材' && (
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
                        <Select defaultValue={'NPC新實用華語/漢語'} style={{ width: 110 }}>
                          {['NPC新實用華語/漢語', 'NICD新中級華語/漢語', '(A5版) 商用會話'].map(d => (
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

                  {categories.productCategory === '活動' && (
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
                          {['移地教學'].map(d => (
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

                  {categories.productCategory === '其他' && (
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
                  )}
                  <Button
                    disabled={filterProducts.length === 0}
                    onClick={() => {
                      const price = filterProducts[0]?.options.isCustomPrice ? customPrice : filterProducts[0].price
                      onChangeSelectedProducts({
                        id: filterProducts[0].id,
                        amount: categories.productCategory === '學費' ? totalAmount : 1,
                        price,
                        totalPrice: price * (categories.productCategory === '學費' ? totalAmount : 1),
                      })

                      categories.productCategory === '學費' &&
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
                  .filter(mode => (sum(selectedProducts.map(p => p.totalPrice)) >= 24000 ? true : mode === '訂金+尾款'))
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
