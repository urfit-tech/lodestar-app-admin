import { CloseOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Space,
  Tag,
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { sum } from 'lodash'
import moment from 'moment'
import { range } from 'ramda'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { AdminBlock, AdminBlockTitle } from '../../../components/admin'
import SingleUploader from '../../../components/form/SingleUploader'
import DefaultLayout from '../../../components/layout/DefaultLayout'
import { useApp } from '../../../contexts/AppContext'
import { currencyFormatter } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import types from '../../../types'
import { PeriodType } from '../../../types/general'
import LoadingPage from '../LoadingPage'

type FieldProps = {
  contractId: string
  withCreatorId: boolean
  creatorId?: string | null
  identity: 'normal' | 'student'
  referralMemberId?: string | null
  paymentMethod: string
  installmentPlan: number
  paymentNumber: string
  orderExecutorId: string
  orderExecutorRatio: number
  orderExecutors: {
    memberId?: string
    ratio?: number
  }[]
  contractProducts: {
    name: string
    amount: number
  }[]
}

const StyledFieldLabel = styled.div`
  font-size: 14px;
`
const StyledPriceField = styled.div`
  width: 150px;
`
const StyledOrder = styled.div`
  border: 1px solid var(--gray-darker);
  padding: 1rem;
`
const StyledTotal = styled.div`
  margin-bottom: 0.5rem;
  color: ${props => props.theme['@primary-color']};
  font-size: 20px;
  text-align: right;
`

const MemberContractCreationPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>()

  const { loading: loadingMember, error: errorMember, data: dataMember } = useQuery<types.GET_CONTRACT_MEMBER>(
    GET_CONTRACT_MEMBER,
    { variables: { id: memberId } },
  )

  if (loadingMember) {
    return <LoadingPage />
  }

  if (errorMember || !dataMember?.member_by_pk) {
    return null
  }

  return (
    <DefaultLayout>
      <div className="container py-5">
        <AdminBlock>
          <MemberContractForm
            member={{
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
            }}
          />
        </AdminBlock>
      </div>
    </DefaultLayout>
  )
}

const MemberContractForm: React.FC<{
  member: {
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
  }
}> = ({ member }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { xuemiSales } = useXuemiSales()

  const { data: dataProducts } = useQuery<types.GET_CONTRACT_PRODUCT>(GET_CONTRACT_PRODUCT)
  const { data: dataProperties } = useQuery<types.GET_PROPERTIES>(GET_PROPERTIES)
  const { data: dataContracts } = useQuery<types.GET_CONTRACTS>(GET_CONTRACTS)
  const { data: dataProjectPlans } = useQuery<types.GET_PROJECT_PLANS>(GET_PROJECT_PLANS)
  const { data: dataCreators } = useQuery<types.GET_APPOINTMENT_PLAN_CREATORS>(GET_APPOINTMENT_PLAN_CREATORS)
  const [addMemberContract] = useMutation<types.ADD_MEMBER_CONTRACT, types.ADD_MEMBER_CONTRACTVariables>(
    ADD_MEMBER_CONTRACT,
  )
  const memberBlockRef = useRef<HTMLDivElement | null>(null)

  const [memberContractUrl, setMemberContractUrl] = useState('')
  const [selectedProjectPlanId, setSelectedProjectPlanId] = useState<string>('')
  const [startedAt, setStartedAt] = useState<Date>(moment().add(1, 'hour').startOf('hour').toDate())
  const [certificationPath, setCertificationPath] = useState('')
  const [referralMemberFilter, setReferralMemberFilter] = useState('')
  const [contractProducts, setContractProducts] = useState<
    {
      name: string
      amount: number
    }[]
  >([])

  const { data: dataReferralMembers } = useQuery<
    types.GET_REFERRAL_MEMBER_COLLECTION,
    types.GET_REFERRAL_MEMBER_COLLECTIONVariables
  >(GET_REFERRAL_MEMBER_COLLECTION, {
    variables: { condition: referralMemberFilter ? { name: { _ilike: `%${referralMemberFilter}%` } } : undefined },
  })

  const selectedProjectPlan = dataProjectPlans?.project_plan.find(v => v.id === selectedProjectPlanId)
  const endedAt = selectedProjectPlan
    ? moment(startedAt)
        .add(selectedProjectPlan.period_amount, selectedProjectPlan.period_type as PeriodType)
        .toDate()
    : null
  const productPrice =
    dataProducts?.xuemi_product.reduce((accumulator, currentValue) => {
      const tmp = { ...accumulator }
      tmp[currentValue.name] = currentValue.price
      return tmp
    }, {} as { [productName: string]: number }) || {}

  const handleContractAdded = async () => {
    const alert = document.getElementsByClassName('ant-alert')[0]
    if (memberBlockRef.current?.contains(alert)) {
      message.warning('學員資料請填寫完整')
      return
    }

    // TODO: calculate product contents
    const appointmentAmount = 0
    const currencyConversionValue = 0
    const coinAmount = 0

    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        if (values.identity === 'student' && !certificationPath) {
          message.warn('需上傳證明')
          return
        }

        if (window.confirm('請確認合約是否正確？')) {
          // generate coupons
          const couponPlanId = v4()
          const coupons = range(0, appointmentAmount).map(v => {
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
                      description: `學員編號：${member?.id}, 合約編號：${values.contractId}`,
                      started_at: startedAt,
                      ended_at: endedAt,
                      scope: ['AppointmentPlan'],
                    },
                  },
                },
              },
            }
          })

          let times = 0
          const orderId = moment().format('YYYYMMDDHHmmssSSS') + `${times}`.padStart(2, '0')
          const projectPlanName = values.contractProducts.map(product => product.name).join('、')

          addMemberContract({
            variables: {
              memberId: member.id,
              contractId: values.contractId,
              startedAt,
              endedAt,
              values: {
                orderId,
                price: currencyConversionValue,
                coupons,
                startedAt,
                endedAt,
                invoice: {
                  name: member.name,
                  phone: member.phones,
                  email: member.email,
                },
                cardName: '學米 VIP 會員卡',
                coinName: projectPlanName,
                memberId: member.id,
                paymentNo: moment().format('YYYYMMDDHHmmss'),
                coinAmount,
                projectPlanName,
                projectPlanProductId: `ProjectPlan_${selectedProjectPlanId}`,
                orderExecutors: [
                  {
                    member_id: values.orderExecutorId,
                    ratio: values.orderExecutorRatio,
                  },
                  ...(values.orderExecutors
                    .filter(orderExecutor => orderExecutor.memberId && orderExecutor.ratio)
                    .map(orderExecutor => ({
                      member_id: orderExecutor.memberId,
                      ratio: orderExecutor.ratio,
                    })) || []),
                ],
                paymentOptions: {
                  paymentMethod: values.paymentMethod,
                  installmentPlan: values.installmentPlan,
                  paymentNumber: values.paymentNumber,
                },
              },
              options: {
                appointmentCreatorId: values.withCreatorId ? values.creatorId : null,
                studentCertification: values.identity === 'student' ? certificationPath : null,
                referralMemberId: values.referralMemberId,
              },
            },
          })
            .then(({ data }) => {
              const contractId = data?.insert_member_contract_one?.id
              setMemberContractUrl(`https://www.xuemi.co/members/${member.id}/contracts/${contractId}`)
              message.success('成功產生合約')
            })
            .catch(err => message.error(`產生合約失敗，請確認資料是否正確。錯誤代碼：${err}`))
        }
      })
      .catch(() => {})
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      hideRequiredMark
      initialValues={{
        contractId: dataContracts?.contract[0]?.id,
        withCreatorId: false,
        identity: 'normal',
        orderExecutorRatio: 1,
      }}
      onValuesChange={(_, values) => {
        setContractProducts(values.contractProducts)
      }}
    >
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
          className="mb-5"
        >
          <Descriptions.Item label="學員姓名">
            {member?.name || <Alert type="error" message="未設定" />}
          </Descriptions.Item>
          <Descriptions.Item label="學員信箱">
            {member?.email || <Alert type="error" message="未設定" />}
          </Descriptions.Item>
          <Descriptions.Item label="學員電話">
            {(member?.phones && member?.phones.split(',').map((v, index) => <Tag key={index}>{v}</Tag>)) || (
              <Alert type="error" message="未設定" />
            )}
          </Descriptions.Item>
          {dataProperties?.property.map(property => (
            <Descriptions.Item label={property.name} key={property.id}>
              <div className="d-flex align-items-center">
                {member.properties.find(v => v.propertyId === property.id)?.value || (
                  <Alert type="error" message="未設定" />
                )}
              </div>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>

      <Descriptions title="合約期間" column={2} bordered className="mb-5">
        <Descriptions.Item label="合約項目">
          <Form.Item className="mb-0" name="contractId" rules={[{ required: true, message: '請選擇合約' }]}>
            <Select<string> style={{ width: 150 }}>
              {dataContracts?.contract.map(contract => (
                <Select.Option key={contract.id} value={contract.id}>
                  {contract.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Descriptions.Item>
        <Descriptions.Item label="合約效期">
          <Form.Item className="mb-0" rules={[{ required: true, message: '請選擇合約效期' }]}>
            <Select<string>
              style={{ width: 150 }}
              value={selectedProjectPlanId}
              onChange={value => setSelectedProjectPlanId(value)}
            >
              {dataProjectPlans?.project_plan.map(projectPlan => {
                return (
                  <Select.Option key={projectPlan.id} value={projectPlan.id}>
                    {projectPlan.period_amount} {projectPlan.period_type}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>
        </Descriptions.Item>
        <Descriptions.Item label="服務開始日">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            defaultValue={moment(startedAt)}
            onChange={value => value && setStartedAt(value.toDate())}
          />
        </Descriptions.Item>
        <Descriptions.Item label="服務結束日">
          {endedAt ? moment(endedAt).format('YYYY-MM-DD HH:mm:ss') : ''}
        </Descriptions.Item>
      </Descriptions>

      <div className="mb-5">
        <AdminBlockTitle>合約內容</AdminBlockTitle>
        <Form.List name="contractProducts">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <div key={field.key} className="d-flex align-items-center justify-content-start">
                    <Form.Item
                      name={[field.name, 'name']}
                      fieldKey={[field.fieldKey, 'name']}
                      label={field.key === 0 ? <StyledFieldLabel>項目名稱</StyledFieldLabel> : undefined}
                      rules={[{ required: true }]}
                    >
                      <Select<string> className="mr-3" style={{ width: '250px' }}>
                        {dataProducts?.xuemi_product.map(product => (
                          <Select.Option key={product.name} value={product.name}>
                            {product.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label={field.key === 0 ? <StyledFieldLabel>單價</StyledFieldLabel> : undefined}>
                      <StyledPriceField>{productPrice[contractProducts[field.key].name]}</StyledPriceField>
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'amount']}
                      fieldKey={[field.fieldKey, 'amount']}
                      label={field.key === 0 ? <StyledFieldLabel>數量</StyledFieldLabel> : undefined}
                    >
                      <InputNumber min={1} className="mr-3" />
                    </Form.Item>
                    <div className={field.key === 0 ? 'mt-2' : undefined}>
                      <CloseOutlined className="cursor-pointer" onClick={() => remove(field.name)} />
                    </div>
                  </div>
                ))}
                <Button icon={<PlusOutlined />} onClick={() => add({ amount: 1 })}>
                  新增項目
                </Button>
              </div>
            )
          }}
        </Form.List>
      </div>

      <Descriptions column={1} bordered className="mb-5">
        <Descriptions.Item label="指定業師">
          <div className="d-flex align-items-center">
            <Form.Item name="withCreatorId" noStyle>
              <Radio.Group>
                <Radio value={false}>不指定</Radio>
                <Radio value={true}>指定</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="creatorId" noStyle>
              <Select<string> style={{ width: '150px' }}>
                {dataCreators?.appointment_plan.map(v =>
                  v.creator?.id ? (
                    <Select.Option key={v.creator.id} value={v.creator.id}>
                      {v.creator.name}
                    </Select.Option>
                  ) : null,
                )}
              </Select>
            </Form.Item>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="學員身份">
          <Form.Item name="identity" className="m-0">
            <Radio.Group>
              <Radio value="normal">一般</Radio>
              <Radio value="student">學生</Radio>
              <SingleUploader
                uploadText={formatMessage(commonMessages.ui.uploadCertification)}
                path={`certification/${appId}/student_${member.id}`}
                onSuccess={() => setCertificationPath(`certification/${appId}/student_${member.id}`)}
              />
              <span>{certificationPath}</span>
            </Radio.Group>
          </Form.Item>
        </Descriptions.Item>
        <Descriptions.Item label="介紹人">
          <Form.Item name="referralMemberId" className="m-0">
            <Select<string>
              showSearch
              filterOption={false}
              onSearch={v => setReferralMemberFilter(v)}
              style={{ width: '150px' }}
            >
              {dataReferralMembers?.member.map(v => (
                <Select.Option key={v.name} value={v.id}>
                  {v.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Descriptions.Item>
      </Descriptions>

      <Descriptions title="付款方式" bordered className="mb-5">
        <Descriptions.Item label="付款方式">
          <Form.Item className="mb-0" name="paymentMethod" rules={[{ required: true, message: '請選擇付款方式' }]}>
            <Select<string> style={{ width: 120 }}>
              {['藍新', '歐付寶', '富比世', '新仲信', '舊仲信', '匯款', '現金', '裕富'].map((payment: string) => (
                <Select.Option key={payment} value={payment}>
                  {payment}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Descriptions.Item>
        <Descriptions.Item label="分期期數">
          <Form.Item className="mb-0" name="installmentPlan" rules={[{ required: true, message: '請選擇分期期數' }]}>
            <Select<string> style={{ width: 120 }}>
              {[1, 3, 6, 8, 9, 12, 18, 24, 30].map((installmentPlan: number) => (
                <Select.Option key={installmentPlan} value={installmentPlan}>
                  {installmentPlan}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Descriptions.Item>
        <Descriptions.Item label="金流編號">
          <Form.Item className="mb-0" name="paymentNumber" rules={[{ required: true, message: '請填寫金流編號' }]}>
            <Input />
          </Form.Item>
        </Descriptions.Item>
        <Descriptions.Item label="承辦人 / 分潤" span={3}>
          <Space align="center" className="d-flex mb-3">
            <Form.Item name="orderExecutorId" rules={[{ required: true, message: '請填寫承辦人' }]} noStyle>
              <Select
                showSearch
                placeholder="承辦人"
                style={{ width: '150px' }}
                filterOption={(input, option) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {xuemiSales?.map(member => (
                  <Select.Option key={member.id} value={member.id}>
                    {member.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="orderExecutorRatio" noStyle>
              <InputNumber min={0.1} max={1} step={0.1} style={{ width: '60px' }} />
            </Form.Item>
          </Space>

          <Form.List name="orderExecutors">
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map(field => (
                    <Space key={field.key} align="center" className="d-flex mb-3">
                      <Form.Item
                        {...field}
                        name={[field.name, 'memberId']}
                        fieldKey={[field.fieldKey, 'memberId']}
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
                          {xuemiSales?.map(member => (
                            <Select.Option key={member.id} value={member.id}>
                              {member.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'ratio']} fieldKey={[field.fieldKey, 'ratio']} noStyle>
                        <InputNumber min={0.1} max={1} step={0.1} style={{ width: '60px' }} />
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}

                  <Form.Item>
                    <Button type="dashed" onClick={() => add({ ratio: 0.1 })} block>
                      <PlusOutlined /> 加入
                    </Button>
                  </Form.Item>
                </div>
              )
            }}
          </Form.List>
        </Descriptions.Item>
      </Descriptions>

      <StyledOrder className="mb-5">
        {contractProducts.map(contractProduct => (
          <div className="row mb-2">
            <div className="col-6 text-right"></div>
            <div className="col-3">
              {contractProduct.name}
              {contractProduct.amount > 1 ? `x${contractProduct.amount}` : ''}
            </div>
            <div className="col-3 text-right">
              {currencyFormatter(productPrice[contractProduct.name] * contractProduct.amount)}
            </div>
          </div>
        ))}

        <div className="row mb-2">
          <div className="col-6 text-right">
            <strong>合計</strong>
          </div>
          <div className="col-6 text-right">
            <StyledTotal>
              {currencyFormatter(
                sum(
                  contractProducts.map(contractProduct => productPrice[contractProduct.name] * contractProduct.amount),
                ),
              )}
            </StyledTotal>
            <StyledTotal>0 次諮詢</StyledTotal>
            <StyledTotal>0 XP</StyledTotal>
          </div>
        </div>
      </StyledOrder>

      {memberContractUrl ? (
        <Alert message="合約連結" description={memberContractUrl} type="success" showIcon />
      ) : (
        <Button size="large" block type="primary" onClick={handleContractAdded}>
          產生合約
        </Button>
      )}
    </Form>
  )
}

const useXuemiSales = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_SALE_COLLECTION>(
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

  const xuemiSales =
    data?.member.map(v => ({
      id: v?.id || '',
      name: v?.name || v?.username || '',
    })) || []

  return {
    loading,
    error,
    xuemiSales,
    refetch,
  }
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
    property(where: { name: { _in: ["學生程度", "每月學習預算", "轉職意願", "上過其他課程", "特別需求"] } }) {
      id
      name
    }
  }
`
const GET_CONTRACT_PRODUCT = gql`
  query GET_CONTRACT_PRODUCT {
    xuemi_product(order_by: { name: desc }) {
      id
      name
      price
    }
  }
`
const GET_APPOINTMENT_PLAN_CREATORS = gql`
  query GET_APPOINTMENT_PLAN_CREATORS {
    appointment_plan(distinct_on: [creator_id]) {
      id
      creator {
        id
        name
      }
    }
  }
`
const GET_REFERRAL_MEMBER_COLLECTION = gql`
  query GET_REFERRAL_MEMBER_COLLECTION($condition: member_bool_exp) {
    member(where: $condition, limit: 10) {
      id
      name
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
    $options: jsonb
  ) {
    insert_member_contract_one(
      object: {
        member_id: $memberId
        contract_id: $contractId
        started_at: $startedAt
        ended_at: $endedAt
        values: $values
        options: $options
      }
    ) {
      id
    }
  }
`

export default MemberContractCreationPage
