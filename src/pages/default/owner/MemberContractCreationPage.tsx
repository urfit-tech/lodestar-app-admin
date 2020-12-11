import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Alert, Button, DatePicker, Descriptions, Form, Input, InputNumber, message, Select, Space, Tag } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment from 'moment'
import { range } from 'ramda'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 } from 'uuid'
import DefaultLayout from '../../../components/layout/DefaultLayout'
import types from '../../../types'
import LoadingPage from '../LoadingPage'

const MemberContractCreationPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>()

  const { loading: loadingMember, error: errorMember, data: dataMember } = useQuery<types.GET_CONTRACT_MEMBER>(
    GET_CONTRACT_MEMBER,
    { variables: { id: memberId } },
  )
  const { loading: loadingProducts, error: errorProducts, data: dataProducts } = useQuery<types.GET_CONTRACT_PRODUCT>(
    GET_CONTRACT_PRODUCT,
  )

  if (loadingMember || loadingProducts) {
    return <LoadingPage />
  }

  if (errorMember || errorProducts) {
    return null
  }

  return (
    <MemberContractForm
      product={dataProducts?.xuemi_product.map(v => v.name) || []}
      member={
        dataMember?.member_by_pk
          ? {
              id: dataMember.member_by_pk.id,
              name: dataMember.member_by_pk.name,
              email: dataMember.member_by_pk.email,
              phones: dataMember.member_by_pk.member_phones.map(v => v.phone).join(','),
              properties: dataMember.member_by_pk.member_properties.map(v => ({
                id: v.id,
                value: v.value,
                propertyId: v.property.id,
                name: v.property.name,
              })),
            }
          : null
      }
    />
  )
}

type OrderExecutorProps = {
  member_id: string | undefined
  ratio: number | undefined
}
const paymentSelect = ['藍新', '歐付寶', '富比世', '新仲信', '舊仲信', '匯款', '現金', '裕富']
const installmentPlans = [1, 3, 6, 8, 9, 12, 18, 24, 30]

const MemberContractForm: React.FC<{
  member?: {
    id: string
    name: string
    email: string
    phones: string
    properties: {
      id: string
      value: string
      propertyId: string
      name: string
    }[]
  } | null
  product: string[]
}> = ({ member, product }) => {
  const [form] = useForm()
  const { data: propertiesData } = useQuery(GET_PROPERTIES)
  const { data: contractsData } = useQuery(GET_CONTRACTS)
  const { data: projectPlansData } = useQuery(GET_PROJECT_PLANS)
  const [addMemberContract] = useMutation(ADD_MEMBER_CONTRACT)
  const { dataSource: members } = useMemberCollection()
  const [memberContractUrl, setMemberContractUrl] = useState('')
  const [selectedContractId, setSelectedContractId] = useState<string | undefined>(contractsData?.contract[0]?.id)
  const [selectedProjectPlanId, setSelectedProjectPlanId] = useState<string | undefined>(
    projectPlansData?.project_plan[0]?.id,
  )
  const [coinAmount, setCoinAmount] = useState(0)
  const [appointmentAmount, setAppointmentAmount] = useState(0)
  const [currencyConversionValue, setCurrencyConversionValue] = useState(0)
  const [startedAt, setStartedAt] = useState<string | undefined>(moment().format())
  const [endedAt, setEndedAt] = useState<string | undefined>('')
  const [orderExecutorId, setOrderExecutorId] = useState<string>('')
  const [orderExecutorRatio, setOrderExecutorRatio] = useState<number>(1)
  const memberBlockRef = useRef(null)
  const formItemClass = 'mb-0'

  useEffect(() => {
    const projectPlan = projectPlansData?.project_plan.filter((v: any) => v.id === selectedProjectPlanId)[0]
    projectPlan && setEndedAt(moment(startedAt).add(projectPlan.period_amount, projectPlan.period_type).format())
  }, [projectPlansData, selectedProjectPlanId, startedAt])

  const handleContractAdded = async () => {
    const alert = document.getElementsByClassName('ant-alert')[0]
    if ((memberBlockRef.current! as any).contains(alert)) {
      message.warning('學員資料請填寫完整')
      return
    }
    if (!orderExecutorId) {
      message.warning('請填寫承辦人')
      return
    }
    form
      .validateFields()
      .then((values: any) => {
        if (window.confirm('請確認合約是否正確？')) {
          // generate coupons
          const couponPlanId = v4()
          const coupons = range(0, appointmentAmount).map((v: any) => {
            return {
              member_id: member?.id,
              coupon_code: {
                data: {
                  code: moment().format('x') + v,
                  count: 1,
                  remaining: 0,
                  app_id: 'xuemi',
                  coupon_plan: {
                    on_conflict: {
                      constraint: 'coupon_plan_pkey',
                      update_columns: ['title'],
                    },
                    data: {
                      id: couponPlanId,
                      type: 2,
                      amount: 100,
                      title: `學米諮詢券`,
                      description: `學員編號：${member?.id}, 合約編號：${selectedContractId}`,
                      started_at: startedAt,
                      ended_at: endedAt,
                      scope: ['AppointmentPlan'],
                    },
                  },
                },
              },
            }
          })
          const defaultOrderExecutor: OrderExecutorProps = {
            member_id: orderExecutorId,
            ratio: orderExecutorRatio,
          }
          let times = 0
          const orderId = moment().format('YYYYMMDDHHmmssSSS') + `${times}`.padStart(2, '0')
          const projectPlanName = values.projectPlanName.join('、')

          const variables = {
            memberId: member?.id,
            contractId: selectedContractId,
            startedAt,
            endedAt,
            values: {
              orderId,
              price: currencyConversionValue,
              coupons,
              startedAt,
              endedAt,
              invoice: {
                name: member?.name,
                phone: member?.phones,
                email: member?.email,
              },
              cardName: '學米 VIP 會員卡',
              coinName: `${projectPlanName}`,
              memberId: member?.id,
              paymentNo: moment().format('YYYYMMDDHHmmss'),
              coinAmount,
              projectPlanName,
              projectPlanProductId: `ProjectPlan_${selectedProjectPlanId}`,
              orderExecutors: [
                defaultOrderExecutor,
                ...(values.orderExecutors
                  ?.filter((orderExecutor: OrderExecutorProps) => orderExecutor.member_id && orderExecutor.ratio)
                  .map((orderExecutor: OrderExecutorProps) => ({
                    member_id: orderExecutor.member_id,
                    ratio: orderExecutor.ratio,
                  })) || []),
              ],
              paymentOptions: {
                paymentMethod: values?.paymentMethod,
                installmentPlan: values?.installmentPlan,
                paymentNumber: values?.paymentNumber,
              },
            },
          }
          addMemberContract({ variables })
            .then(({ data }) => {
              setMemberContractUrl(
                `https://www.xuemi.co/members/${member?.id}/contracts/${data.insert_member_contract_one.id}`,
              )
              message.success('成功產生合約')
            })
            .catch(err => message.error(`產生合約失敗，請確認資料是否正確。錯誤代碼：${err}`))
        }
      })
      .catch(() => {})
  }
  return (
    <DefaultLayout>
      <div className="site-layout-content pt-5">
        <div className="container">
          {member && (
            <div className="mb-5">
              <div ref={memberBlockRef}>
                <Descriptions
                  title={
                    <>
                      <span>學生資料</span>
                      <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                        {'請去學米後台 > 會員列表 > 找到學員並將資料填寫完成'}
                      </div>
                    </>
                  }
                  bordered
                  className="mb-3"
                  extra={
                    <Button
                      type="primary"
                      onClick={() => window.open(`https://admin.xuemi.co/admin/members/${member.id}`, '_blank')}
                    >
                      前往學生頁
                    </Button>
                  }
                >
                  <Descriptions.Item label="學員姓名">
                    {member?.name || <Alert type="error" message="未設定"></Alert>}
                  </Descriptions.Item>
                  <Descriptions.Item label="學員信箱">
                    {member?.email || <Alert type="error" message="未設定"></Alert>}
                  </Descriptions.Item>
                  <Descriptions.Item label="學員電話">
                    {(member?.phones && member?.phones.split(',').map((v, index) => <Tag key={index}>{v}</Tag>)) || (
                      <Alert type="error" message="未設定"></Alert>
                    )}
                  </Descriptions.Item>
                  {propertiesData?.property.map((property: any) => (
                    <Descriptions.Item label={property.name} key={property.id}>
                      <div className="d-flex align-items-center">
                        {member.properties.find(v => v?.propertyId === property.id)?.value || (
                          <Alert type="error" message="未設定" />
                        )}

                        {member.properties.find(v => v?.propertyId === property.id)?.value &&
                          property.name
                            .split('(')[1]
                            ?.toLowerCase()
                            .indexOf(member.properties.find(v => v?.propertyId === property.id)?.value.toLowerCase()) <
                            0 && (
                            <div className="ml-3">
                              <Alert message="內容不符合" type="warning" />
                            </div>
                          )}
                      </div>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
              <Descriptions title="購買項目" bordered className="mb-3">
                <Descriptions.Item label="開始日期">
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD   HH:mm:ss"
                    defaultValue={moment(startedAt)}
                    onChange={(date, dateString: string) => {
                      setStartedAt(moment(dateString).format())
                      const projectPlan = projectPlansData?.project_plan.filter(
                        (v: any) => v.id === selectedProjectPlanId,
                      )[0]
                      projectPlan &&
                        setEndedAt(moment(dateString).add(projectPlan.period_amount, projectPlan.period_type).format())
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="結束日期" span={2}>
                  {endedAt ? moment(endedAt).format('YYYY-MM-DD   HH:mm:ss') : ''}
                </Descriptions.Item>
                <Descriptions.Item label="產品項目" span={3}>
                  <Form form={form} name="projectPlan">
                    <Form.Item
                      className={formItemClass}
                      name="projectPlanName"
                      rules={[{ required: true, message: '請填寫產品項目' }]}
                    >
                      <Select mode="multiple" placeholder="Please select" style={{ width: '100%' }}>
                        {product.map(name => (
                          <Select.Option value={name} key={name}>
                            {name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Form>
                </Descriptions.Item>
                <Descriptions.Item label="支付金額">
                  <InputNumber
                    min={0}
                    value={currencyConversionValue}
                    onChange={v => typeof v === 'number' && setCurrencyConversionValue(v)}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="承辦人 / 分潤">
                  <Form form={form} name="orderExecutors" autoComplete="off">
                    <Form.Item noStyle name="defaultOrderExecutor">
                      <Space
                        style={{
                          display: 'flex',
                          marginBottom: '15px',
                        }}
                        align="start"
                      >
                        <Select
                          showSearch
                          placeholder="承辦人"
                          style={{ width: '150px' }}
                          onChange={v => {
                            typeof v === 'string' && setOrderExecutorId(v)
                          }}
                          filterOption={(input, option) =>
                            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {members &&
                            members.map((member: any) => (
                              <Select.Option key={member.id} value={member.id}>
                                {member.name}
                              </Select.Option>
                            ))}
                        </Select>

                        <InputNumber
                          min={0.1}
                          max={1}
                          step={0.1}
                          style={{ width: '60px' }}
                          value={orderExecutorRatio}
                          onChange={v => {
                            typeof v === 'number' && setOrderExecutorRatio(v)
                          }}
                        />
                      </Space>
                    </Form.Item>
                    <Form.List name="orderExecutors">
                      {(fields, { add, remove }) => {
                        return (
                          <div>
                            {fields.map(field => (
                              <Space
                                key={field.key}
                                style={{
                                  display: 'flex',
                                  marginBottom: '15px',
                                }}
                                align="start"
                              >
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'member_id']}
                                  fieldKey={[field.fieldKey, 'member_id']}
                                  noStyle
                                >
                                  <Select
                                    showSearch
                                    placeholder="承辦人"
                                    style={{ width: '150px' }}
                                    filterOption={(input, option) =>
                                      option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                  >
                                    {members &&
                                      members.map((member: any) => (
                                        <Select.Option key={member.id} value={member.id}>
                                          {member.name}
                                        </Select.Option>
                                      ))}
                                  </Select>
                                </Form.Item>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'ratio']}
                                  fieldKey={[field.fieldKey, 'ratio']}
                                  noStyle
                                >
                                  <InputNumber min={0.1} max={1} step={0.1} style={{ width: '60px' }} />
                                </Form.Item>

                                <MinusCircleOutlined
                                  onClick={() => {
                                    remove(field.name)
                                  }}
                                />
                              </Space>
                            ))}

                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => {
                                  add()
                                }}
                                block
                              >
                                <PlusOutlined /> 加入
                              </Button>
                            </Form.Item>
                          </div>
                        )
                      }}
                    </Form.List>
                  </Form>
                </Descriptions.Item>
              </Descriptions>
              <Descriptions bordered className="mb-4">
                <Descriptions.Item label="合約項目" span={3}>
                  <Form form={form} name="contract">
                    <Form.Item
                      className={formItemClass}
                      name="contract"
                      rules={[{ required: true, message: '請選擇合約' }]}
                    >
                      <Select<string>
                        style={{ width: 150 }}
                        value={selectedContractId}
                        onChange={setSelectedContractId}
                      >
                        {contractsData?.contract.map((contract: any) => {
                          return (
                            <Select.Option key={contract.id} value={contract.id}>
                              {contract.name}
                            </Select.Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Form>
                </Descriptions.Item>
                <Descriptions.Item label="合約效期" span={3}>
                  <Form form={form} name="contractPeriod">
                    <Form.Item
                      className={formItemClass}
                      name="contractPeriod"
                      rules={[{ required: true, message: '請選擇合約效期' }]}
                    >
                      <Select<string>
                        style={{ width: 150 }}
                        value={selectedProjectPlanId}
                        onChange={setSelectedProjectPlanId}
                      >
                        {projectPlansData?.project_plan.map((projectPlan: any) => {
                          return (
                            <Select.Option key={projectPlan.id} value={projectPlan.id}>
                              {projectPlan.period_amount} {projectPlan.period_type}
                            </Select.Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Form>
                </Descriptions.Item>
                <Descriptions.Item label="代幣數量">
                  <InputNumber min={0} value={coinAmount} onChange={v => typeof v === 'number' && setCoinAmount(v)} />
                </Descriptions.Item>
                <Descriptions.Item label="諮詢次數">
                  <InputNumber
                    min={0}
                    value={appointmentAmount}
                    onChange={v => typeof v === 'number' && setAppointmentAmount(v)}
                  />
                </Descriptions.Item>
              </Descriptions>
              <Descriptions title="付款選項" bordered className="mb-4">
                <Descriptions.Item label="付款方式">
                  <Form form={form} name="orderPayment">
                    <Form.Item
                      className={formItemClass}
                      name="paymentMethod"
                      rules={[{ required: true, message: '請選擇付款方式' }]}
                    >
                      <Select<string> style={{ width: 120 }}>
                        {paymentSelect.map((payment: string) => {
                          return (
                            <Select.Option key={payment} value={payment}>
                              {payment}
                            </Select.Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Form>
                </Descriptions.Item>
                <Descriptions.Item label="分期期數">
                  <Form form={form} name="orderInstallment">
                    <Form.Item
                      className={formItemClass}
                      name="installmentPlan"
                      rules={[{ required: true, message: '請選擇分期期數' }]}
                    >
                      <Select<string> style={{ width: 120 }}>
                        {installmentPlans.map((installmentPlan: number) => {
                          return (
                            <Select.Option key={installmentPlan} value={installmentPlan}>
                              {installmentPlan}
                            </Select.Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Form>
                </Descriptions.Item>
                <Descriptions.Item label="金流編號">
                  <Form form={form} name="orderPaymentNumber">
                    <Form.Item
                      className={formItemClass}
                      name="paymentNumber"
                      rules={[{ required: true, message: '請填寫金流編號' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Form>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
          {memberContractUrl ? (
            <Alert className="mb-3" message="合約連結" description={memberContractUrl} type="success" showIcon />
          ) : (
            member && (
              <Button className="mb-3" size="large" block type="primary" onClick={handleContractAdded}>
                產生合約
              </Button>
            )
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}

const GET_CONTRACT_MEMBER = gql`
  query GET_CONTRACT_MEMBER($id: String!) {
    member_by_pk(id: $id) {
      id
      name
      email
      member_phones {
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
  }
`

const ADD_MEMBER_CONTRACT = gql`
  mutation ADD_MEMBER_CONTRACT(
    $memberId: String!
    $contractId: uuid!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $values: jsonb!
  ) {
    insert_member_contract_one(
      object: {
        member_id: $memberId
        contract_id: $contractId
        started_at: $startedAt
        ended_at: $endedAt
        values: $values
      }
    ) {
      id
    }
  }
`

const GET_CONTRACTS = gql`
  query GET_CONTRACTS {
    contract(where: { published_at: { _is_null: false } }) {
      id
      name
    }
  }
`

const GET_PROJECT_PLANS = gql`
  query GET_PROJECT_PLANS {
    project_plan(where: { title: { _like: "%私塾方案%" } }) {
      id
      period_amount
      period_type
    }
  }
`

const GET_PROPERTIES = gql`
  query GET_PROPERTIES {
    property(
      where: {
        name: {
          _in: [
            "學生程度(零基礎/有接觸/有工作經驗)"
            "每月學習預算"
            "轉職意願(是/否)"
            "上過其他課程(是/否)"
            "特別需求"
          ]
        }
      }
    ) {
      id
      name
    }
  }
`

const GET_CONTRACT_PRODUCT = gql`
  query GET_CONTRACT_PRODUCT {
    xuemi_product(order_by: { name: desc }) {
      name
    }
  }
`

export const useMemberCollection = () => {
  const { loading, error, data, refetch } = useQuery(
    gql`
      query GET_SALE_COLLECTION {
        member(
          where: {
            _and: [
              { app_id: { _eq: "xuemi" } }
              {
                id: {
                  _nin: [
                    "36fd9f57-8b10-448f-a4f9-0bed863fd6d6"
                    "da47da06-0216-473d-a9f4-4c4c61bf527a"
                    "3ef84eb1-440c-4a1e-bad5-8ec4f8db2da3"
                    "e2b33255-5a91-48f1-a990-4c23481a69a4"
                    "5d2d2ceb-cdfe-451f-8b5e-4b9f4647181f"
                    "f1048043-b504-4688-8763-a81a1fe0ce0c"
                    "fab0d8bc-77fe-4f7e-b5d0-bf363b594e9a"
                    "a88cf509-a31b-4031-a82b-bbb69705e65f"
                    "01ddcad1-10ba-41c9-866b-73de354db5f3"
                    "ddd38d96-ce13-4ed9-a8cf-9b3ec0127cb8"
                    "751409f3-2d93-4f2c-8864-3a697a44a272"
                    "401c2f40-5b42-46d9-a0e6-90ec327d9d4a"
                    "c22a2f4a-8975-4bff-9719-7c06aed30d2f"
                    "35c76fb3-4426-4c7a-b157-a512bf5ab0c8"
                    "7800c80f-cf2d-4c6b-8e0c-ced911b765ff"
                    "61d34cbc-4253-41e7-b112-54eb3e962eba"
                    "39cab75f-1976-429d-a919-f87ecff48da5"
                  ]
                }
              }
              { email: { _like: "%@xuemi.co%" } }
            ]
          }
        ) {
          id
          name
          username
        }
      }
    `,
  )

  const dataSource =
    loading || error || !data
      ? []
      : data.member.map((v: any) => ({
          id: v?.id,
          name: v?.name || v?.username,
        }))

  return {
    loading,
    error,
    dataSource,
    refetch,
  }
}

export default MemberContractCreationPage
