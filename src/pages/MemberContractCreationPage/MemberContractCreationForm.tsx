import { CloseOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, DatePicker, Descriptions, Form, Input, InputNumber, Radio, Select, Space } from 'antd'
import { FormProps } from 'antd/lib/form/Form'
import moment from 'moment'
import { last } from 'ramda'
import React, { memo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { ContractInfo, FieldProps, installmentPlans, paymentMethods } from '.'
import { AdminBlockTitle } from '../../components/admin'
import PeriodSelector from '../../components/form/PeriodSelector'
import pageMessages from '../translation'
import CertificationUploader from './CertificationUploader'
import ReferralMemberSelector from './ReferralMemberSelector'

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
    const { formatMessage } = useIntl()
    const [identity, setIdentity] = useState<'normal' | 'student'>('normal')
    const [certificationPath, setCertificationPath] = useState('')
    const [filterProducts, setFilterProducts] = useState<ContractInfo['products']>(products)

    const matchProduct = (params: string, products: ContractInfo['products']) => {
      if (params.length < 2) return setFilterProducts(products)
      setFilterProducts(products.filter(product => product.name.toLowerCase().includes(params.toLowerCase())))
    }

    return (
      <Form layout="vertical" colon={false} hideRequiredMark form={form} {...formProps}>
        <Descriptions
          title={formatMessage(pageMessages.MemberContractCreationForm.contractPeriod)}
          column={1}
          bordered
          className="mb-5"
        >
          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.contractItem)}>
            <Form.Item
              className="mb-0"
              name="contractId"
              rules={[
                { required: true, message: formatMessage(pageMessages.MemberContractCreationForm.selectContract) },
              ]}
            >
              <Select<string>>
                {contracts.map(v => (
                  <Select.Option key={v.id} value={v.id}>
                    {v.name} ({v.description})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.contractValidity)}>
            <Form.Item
              className="mb-0"
              name="period"
              rules={[
                {
                  required: true,
                  message: formatMessage(pageMessages.MemberContractCreationForm.selectContractValidity),
                },
              ]}
            >
              <PeriodSelector onChange={() => form?.setFieldsValue({ contractProducts: [] })} />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.serviceStartDate)}>
            {moment(startedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>

          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.serviceEndDate)}>
            {endedAt ? moment(endedAt).format('YYYY-MM-DD HH:mm:ss') : ''}
          </Descriptions.Item>
        </Descriptions>

        <div className="mb-5">
          <AdminBlockTitle>{formatMessage(pageMessages.MemberContractCreationForm.contractContent)}</AdminBlockTitle>
          <Form.List initialValue={[{ amount: 1 }]} name="contractProducts">
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map((field, index) => {
                    const contractProduct = products.find(
                      product => contractProducts && product.id === contractProducts[index]?.id,
                    )

                    return (
                      <div key={field.key} className="d-flex align-items-center justify-content-start">
                        <Form.Item
                          name={[field.name, 'id']}
                          rules={[
                            {
                              required: true,
                              message: formatMessage(pageMessages.MemberContractCreationForm.selectContract),
                            },
                          ]}
                          fieldKey={[field.fieldKey, 'id']}
                          label={
                            index === 0 ? (
                              <StyledFieldLabel>
                                {formatMessage(pageMessages.MemberContractCreationForm.itemName)}
                              </StyledFieldLabel>
                            ) : undefined
                          }
                        >
                          <Select<string>
                            className="mr-3"
                            showSearch
                            allowClear
                            filterOption={false}
                            style={{ width: '500px' }}
                            placeholder={formatMessage(pageMessages.MemberContractCreationForm.itemPlaceholder)}
                            onSearch={val => matchProduct(val, products)}
                            onBlur={() => setFilterProducts(products)}
                            onClear={() => setFilterProducts(products)}
                          >
                            {filterProducts.map(product => (
                              <Select.Option key={product.id} value={product.id} title={product.name}>
                                {product.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label={
                            index === 0 ? (
                              <StyledFieldLabel>
                                {formatMessage(pageMessages.MemberContractCreationForm.unitPrice)}
                              </StyledFieldLabel>
                            ) : undefined
                          }
                        >
                          <StyledPriceField>
                            {contractProduct?.name === '業師諮詢' && isAppointmentOnly
                              ? contractProduct?.price
                              : contractProduct?.addonPrice || contractProduct?.price || 0}
                          </StyledPriceField>
                        </Form.Item>

                        <Form.Item
                          name={[field.name, 'amount']}
                          fieldKey={[field.fieldKey, 'amount']}
                          label={
                            index === 0 ? (
                              <StyledFieldLabel>
                                {formatMessage(pageMessages.MemberContractCreationForm.quantity)}
                              </StyledFieldLabel>
                            ) : undefined
                          }
                        >
                          <InputNumber min={1} className="mr-3" />
                        </Form.Item>

                        {fields.length > 1 && (
                          <div className={index === 0 ? 'mt-2' : 'mb-4'}>
                            <CloseOutlined className="cursor-pointer" onClick={() => remove(field.name)} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <Button icon={<PlusOutlined />} onClick={() => add({ amount: 1 })}>
                    {formatMessage(pageMessages.MemberContractCreationForm.addItem)}
                  </Button>
                </>
              )
            }}
          </Form.List>
        </div>

        <Descriptions column={1} bordered className="mb-5">
          <Descriptions.Item
            label={formatMessage(pageMessages.MemberContractCreationForm.memberStatus)}
            className="m-0"
          >
            <div className="d-flex align-items-center">
              <Form.Item name="identity" noStyle>
                <Radio.Group value={identity} onChange={e => setIdentity(e.target.value)}>
                  <Radio value="normal">{formatMessage(pageMessages.MemberContractCreationForm.normal)}</Radio>
                  <Radio value="student">{formatMessage(pageMessages.MemberContractCreationForm.student)}</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="certification" noStyle>
                {identity === 'student' && (
                  <CertificationUploader memberId={memberId} onFinish={path => setCertificationPath(path)} />
                )}
              </Form.Item>

              {<span className={identity === 'normal' ? 'd-none' : 'ml-3'}>{certificationPath}</span>}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.referrer)}>
            <Form.Item name="referralMemberId" noStyle>
              <ReferralMemberSelector />
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.deposit)}>
            <Form.Item name="hasDeposit" valuePropName="checked" noStyle>
              <Checkbox>{formatMessage(pageMessages.MemberContractCreationForm.deductDeposit)}</Checkbox>
            </Form.Item>
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.appreciationPeriod)}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <Form.Item name="withProductStartedAt" valuePropName="checked" noStyle>
                  <Checkbox>{formatMessage(pageMessages.MemberContractCreationForm.useAppreciationPeriod)}</Checkbox>
                </Form.Item>
              </div>
              <div className="flex-grow-1 ml-2">
                <Form.Item name="productStartedAt" noStyle>
                  <DatePicker
                    disabledDate={date =>
                      date.isBefore(moment().add(1, 'day').startOf('day')) ||
                      date.isAfter(moment().add(14, 'day').startOf('day'))
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          title={formatMessage(pageMessages.MemberContractCreationForm.paymentMethod)}
          bordered
          className="mb-5"
        >
          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.paymentMethod)}>
            <Form.Item
              className="mb-0"
              name="paymentMethod"
              rules={[
                { required: true, message: formatMessage(pageMessages.MemberContractCreationForm.selectPaymentMethod) },
              ]}
            >
              <Select<string> style={{ width: 120 }}>
                {paymentMethods.map((payment: string) => (
                  <Select.Option key={payment} value={payment}>
                    {payment}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.installmentPeriod)}>
            <Form.Item
              className="mb-0"
              name="installmentPlan"
              rules={[
                {
                  required: true,
                  message: formatMessage(pageMessages.MemberContractCreationForm.selectInstallmentPeriod),
                },
              ]}
            >
              <Select<string> style={{ width: 120 }}>
                {installmentPlans.map(installmentPlan => (
                  <Select.Option key={installmentPlan} value={installmentPlan}>
                    {installmentPlan}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label={formatMessage(pageMessages.MemberContractCreationForm.paymentNumber)}>
            <Form.Item className="mb-0" name="paymentNumber">
              <Input />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item
            label={formatMessage(pageMessages.MemberContractCreationForm.contractManagerAndProfit)}
            span={3}
          >
            <Space align="center" className="d-flex mb-3">
              <Form.Item
                name="orderExecutorId"
                rules={[
                  {
                    required: true,
                    message: formatMessage(pageMessages.MemberContractCreationForm.fillContractManager),
                  },
                ]}
              >
                <Select<string>
                  showSearch
                  placeholder={formatMessage(pageMessages.MemberContractCreationForm.contractManager)}
                  style={{ width: '150px' }}
                  optionFilterProp="label"
                >
                  {sales.map(member => (
                    <Select.Option key={member.id} value={member.id} label={`${member.id} ${member.name}`}>
                      {member.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="orderExecutorRatio">
                <InputNumber min={0.1} max={1} step={0.1} style={{ width: '60px' }} />
              </Form.Item>
            </Space>

            <Form.List name="orderExecutors">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(field => (
                    <Space key={field.key} align="center" className="d-flex mb-3">
                      <Form.Item
                        {...field}
                        name={[field.name, 'memberId']}
                        fieldKey={[field.fieldKey, 'memberId']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage(pageMessages.MemberContractCreationForm.fillContractManager),
                          },
                        ]}
                      >
                        <Select<string>
                          showSearch
                          placeholder={formatMessage(pageMessages.MemberContractCreationForm.contractManager)}
                          style={{ width: '150px' }}
                          optionFilterProp="label"
                        >
                          {sales.map(member => (
                            <Select.Option key={member.id} value={member.id} label={`${member.id} ${member.name}`}>
                              {member.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'ratio']} fieldKey={[field.fieldKey, 'ratio']}>
                        <InputNumber min={0.1} max={1} step={0.1} style={{ width: '60px' }} />
                      </Form.Item>
                      <MinusCircleOutlined className="mb-4" onClick={() => remove(field.name)} />
                    </Space>
                  ))}

                  <Button type="dashed" onClick={() => add({ ratio: 0.1 })} block>
                    <PlusOutlined /> {formatMessage(pageMessages.MemberContractCreationForm.addManager)}
                  </Button>
                </div>
              )}
            </Form.List>
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

export default MemberContractCreationForm
