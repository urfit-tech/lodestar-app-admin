import { Button, Checkbox, DatePicker, Descriptions, Form, Input, Select, Tabs } from 'antd'
import { FormProps } from 'antd/lib/form/Form'
import moment from 'moment'
import { last } from 'ramda'
import React, { memo, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import styled from 'styled-components'
import { ContractInfo, FieldProps, paymentMethods } from '.'
import { AdminBlockTitle } from '../../components/admin'

const StyledFieldLabel = styled.div`
  font-size: 14px;
`
const StyledPriceField = styled.div`
  width: 150px;
`

const MemberContractCreationForm: React.FC<
  FormProps<FieldProps> & {
    contracts: ContractInfo['contracts']
    startedAt: Date
    endedAt: Date | null
    products: ContractInfo['products']
    contractProducts: NonNullable<FieldProps['contractProducts']>
    appointmentPlanCreators: ContractInfo['appointmentPlanCreators']
    memberId: string
    isAppointmentOnly: boolean
    sales: ContractInfo['sales']
    totalPrice: number
  }
> = memo(
  ({
    contracts,
    startedAt,
    endedAt,
    products,
    contractProducts,
    appointmentPlanCreators,
    memberId,
    isAppointmentOnly,
    sales,
    totalPrice,
    form,
    ...formProps
  }) => {
    const [identity, setIdentity] = useState<'normal' | 'student'>('normal')
    const [certificationPath, setCertificationPath] = useState('')
    const [filterProducts, setFilterProducts] = useState<ContractInfo['products']>(products)
    const [quantity, setQuantity] = useState(1)
    const [tabKey, setTabKey] = useState('中文')

    const matchProduct = (params: string, products: ContractInfo['products']) => {
      if (params.length < 2) return setFilterProducts(products)
      setFilterProducts(products.filter(product => product.name.toLowerCase().includes(params.toLowerCase())))
    }

    return (
      <Form layout="vertical" colon={false} hideRequiredMark form={form} {...formProps}>
        <AdminBlockTitle>產品清單</AdminBlockTitle>
        <Tabs
          className="mb-5"
          defaultActiveKey="中文"
          onTabClick={key => {
            setTabKey(key)
          }}
        >
          {['中文', '外文', '師資班', '方言'].map(k => (
            <Tabs.TabPane key={k} tab={k}>
              <div style={{ padding: '8px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                  {['註冊費', '學費', '教材', '活動', 'B/G訂單', '其他'].map(v => (
                    <Button key={v} type={v === '學費' ? 'primary' : undefined}>
                      {v}
                    </Button>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#f6f6f6',
                    padding: '12px 24px',
                  }}
                >
                  {[
                    { title: '項目', options: ['標準時數'] },
                    { title: '海內/外', options: ['海內'] },
                    { title: '上課方式', options: ['內課'] },
                    { title: '班型', options: ['個人班'] },
                    { title: '週頻率', options: ['10'] },
                    { title: '總堂數', options: ['120'] },
                  ].map(v => (
                    <div key={v.title} style={{ width: 110 }}>
                      {v.title}
                      <Select defaultValue={v.options[0]} style={{ width: 110 }}>
                        {v.options.map(d => (
                          <Select.Option key={d} value={d}>
                            {d}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  ))}
                  <div style={{ whiteSpace: 'nowrap' }}>
                    <div>單價/堂</div>
                    <div style={{ width: 110, height: 45, display: 'flex', alignItems: 'center' }}>650</div>
                  </div>
                  <Button>+ 新增項目</Button>
                </div>
              </div>
            </Tabs.TabPane>
          ))}
        </Tabs>

        <AdminBlockTitle>訂單內容</AdminBlockTitle>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #ececec',
            padding: '12px 8px',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <div>中文_學費_標準時數_海內_內課_個人_每週10堂以上_超過60堂</div>
          <div>
            <QuantityInput
              value={quantity}
              min={1}
              onChange={value => {
                setQuantity(Number(value))
              }}
            />
          </div>
          <div>$78,000</div>
          <div>
            <AiOutlineClose />
          </div>
        </div>

        <Descriptions title="合約內容" column={2} bordered className="mb-5">
          <Descriptions.Item label="合約項目" style={{ whiteSpace: 'nowrap' }}>
            <Form.Item className="mb-0" name="contractId" rules={[{ required: true, message: '請選擇合約' }]}>
              <Select<string>>
                {contracts.map(v => (
                  <Select.Option key={v.id} value={v.id}>
                    一般標準合約（中文）：C/BIP
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label="合約效期" style={{ whiteSpace: 'nowrap' }}>
            <Form.Item className="mb-0" name="periodType" rules={[{ required: true, message: '請選擇效期' }]}>
              <Select<string> defaultValue="依據訂單內容">
                {['依據訂單內容'].map(v => (
                  <Select.Option key={v} value={v}>
                    依據訂單內容
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label="開始時間" style={{ whiteSpace: 'nowrap' }}>
            <Form.Item name="productStartedAt" noStyle>
              <DatePicker
                disabledDate={date =>
                  date.isBefore(moment().add(1, 'day').startOf('day')) ||
                  date.isAfter(moment().add(14, 'day').startOf('day'))
                }
              />
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label="結束時間" style={{ whiteSpace: 'nowrap' }}>
            <Form.Item name="productStartedAt" noStyle>
              <DatePicker
                defaultValue={moment().add(1, 'y')}
                disabledDate={date =>
                  date.isBefore(moment().add(1, 'day').startOf('day')) ||
                  date.isAfter(moment().add(14, 'day').startOf('day'))
                }
              />
            </Form.Item>
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="付款方式" column={2} bordered className="mb-5">
          <Descriptions.Item label="金流渠道">
            <Form.Item className="mb-0" name="paymentMethod" rules={[{ required: true, message: '請選擇付款方式' }]}>
              <Select<string> defaultValue="藍新">
                {paymentMethods.map((payment: string) => (
                  <Select.Option key={payment} value={payment}>
                    {payment}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="收款單位">
            <Form.Item className="mb-0" name="paymentMethod" rules={[{ required: true, message: '請選擇付款方式' }]}>
              <Select<string> defaultValue="中華語文">
                {paymentMethods.map((payment: string) => (
                  <Select.Option key={payment} value={payment}>
                    {payment}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="付款模式">
            <Form.Item className="mb-2" name="paymentMethod" rules={[{ required: true, message: '請選擇付款方式' }]}>
              <Select<string> defaultValue="全額付清">
                {paymentMethods.map((payment: string) => (
                  <Select.Option key={payment} value={payment}>
                    {payment}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="withProductStartedAt" valuePropName="checked" noStyle>
              <Checkbox>是否訂金</Checkbox>
            </Form.Item>
          </Descriptions.Item>
        </Descriptions>
      </Form>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.endedAt?.getTime() === nextProps.endedAt?.getTime() &&
      prevProps.isAppointmentOnly === nextProps.isAppointmentOnly &&
      prevProps.contractProducts.length === nextProps.contractProducts.length &&
      last(prevProps.contractProducts)?.id === last(nextProps.contractProducts)?.id
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
