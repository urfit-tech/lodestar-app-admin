import Icon from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Progress,
  Radio,
  Select,
  Skeleton,
  Switch,
  Tabs,
  TimePicker,
  Tooltip,
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import gql from 'graphql-tag'
import { AdminBlock, AdminBlockTitle, AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import { AvatarImage } from 'lodestar-app-admin/src/components/common/Image'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { currencyFormatter, handleError, notEmpty } from 'lodestar-app-admin/src/helpers'
import { commonMessages, errorMessages } from 'lodestar-app-admin/src/helpers/translation'
import { ReactComponent as CallOutIcon } from 'lodestar-app-admin/src/images/icon/call-out.svg'
import { ReactComponent as PhoneIcon } from 'lodestar-app-admin/src/images/icon/phone.svg'
import moment, { Moment } from 'moment'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { salesMessages } from '../helpers/translation'
import types from '../types'

const MemberName = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const MemberDescription = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`
const StyledMetrics = styled.div`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledProgress = styled(Progress)`
  display: inline-block;
  width: 12rem;
`
const AssignedMemberName = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const AssignedMemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledLabel = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledButton = styled(Button)<{ $iconSize?: string }>`
  padding: 0 1rem;
  height: 36px;
  line-height: 1;
  font-size: ${props => props.$iconSize};
`

const SalesCallPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>{formatMessage(salesMessages.label.salesCall)}</span>
      </AdminPageTitle>

      {currentMemberId && <SalesSummary salesId={currentMemberId} />}

      <Tabs activeKey={activeKey || 'potentials'} onChange={key => setActiveKey(key)}>
        <Tabs.TabPane key="potentials" tab={formatMessage(salesMessages.label.potentials)}>
          {currentMemberId && <AssignedMemberContactBlock salesId={currentMemberId} />}
        </Tabs.TabPane>
        <Tabs.TabPane key="keep-in-touch" tab={formatMessage(salesMessages.label.keepInTouch)}></Tabs.TabPane>
        <Tabs.TabPane key="deals" tab={formatMessage(salesMessages.label.deals)}></Tabs.TabPane>
        <Tabs.TabPane key="revoked" tab={formatMessage(salesMessages.label.revoked)} disabled></Tabs.TabPane>
        <Tabs.TabPane key="rejected" tab={formatMessage(salesMessages.label.rejected)} disabled></Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

const SalesSummary: React.FC<{
  salesId: string
}> = ({ salesId }) => {
  const { formatMessage } = useIntl()
  const { loadingSalesSummary, errorSalesSummary, salesSummary } = useSalesSummary(salesId)

  if (loadingSalesSummary) {
    return <Skeleton active />
  }

  if (errorSalesSummary || !salesSummary) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const newAssignedRate =
    salesSummary && salesSummary.assignedMembersAll
      ? Math.round((salesSummary.assignedMembersNew * 100) / salesSummary.assignedMembersAll)
      : 0
  const oldAssignedRate = salesSummary && salesSummary.assignedMembersAll ? 100 - newAssignedRate : 0

  return (
    <AdminBlock className="p-4">
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-start flex-grow-1">
          <AvatarImage size="44px" src={salesSummary.sales?.picture_url} className="mr-2" />
          <div>
            <MemberName>{salesSummary.sales?.name}</MemberName>
            <MemberDescription>
              <span className="mr-2">{salesSummary.sales?.email}</span>
              <span>分機號碼：{salesSummary.sales?.telephone}</span>
            </MemberDescription>
          </div>
        </div>

        <StyledMetrics className="flex-shrink-0 mr-4">
          本月業績：{currencyFormatter(salesSummary.sharingOfMonth)}
        </StyledMetrics>
        <StyledMetrics className="flex-shrink-0">本月成交：{salesSummary.contractsOfMonth}</StyledMetrics>
      </div>
      <Divider />

      <div className="d-flex align-items-center">
        <div className="mr-3">今日通時：{Math.ceil(salesSummary.totalDuration / 60)} 分鐘</div>
        <div className="mr-3">今日通次：{salesSummary.totalNotes} 次</div>
        <div className="mr-3">今日有效名單：{salesSummary.assignedMembersToday}</div>
        <div className="mr-3 flex-grow-1">
          <span className="mr-2">名單新舊佔比：</span>
          <Tooltip title={`新 ${newAssignedRate}% / 舊 ${oldAssignedRate}%`}>
            <StyledProgress percent={100} showInfo={false} success={{ percent: newAssignedRate }} />
          </Tooltip>
        </div>
        <div>
          <span className="mr-2">{formatMessage(salesMessages.label.autoStartCalls)}</span>
          <Switch disabled />
        </div>
      </div>
    </AdminBlock>
  )
}

type memberNoteFieldProps = {
  status: 'not-answered' | 'rejected' | 'willing'
  duration: Moment
  description: string
}
type memberPropertyFieldProps = {
  [PropertyName: string]: string
}
const propertyFields: {
  name: string
  required?: boolean
}[] = [
  { name: '性別', required: true },
  { name: '縣市' },
  { name: '有意願領域', required: true },
  { name: '是否在職', required: true },
  { name: '是否為相關職務' },
  { name: '學生程度', required: true },
  { name: '學習動機' },
  { name: '每月學習預算' },
  { name: '有沒有上過其他課程' },
  { name: '是否有轉職意願', required: true },
]

const AssignedMemberContactBlock: React.FC<{
  salesId: string
}> = ({ salesId }) => {
  const { formatMessage } = useIntl()
  const { apiHost, authToken } = useAuth()
  const { id: appId } = useApp()

  const [memberNoteForm] = useForm<memberNoteFieldProps>()
  const [memberPropertyForm] = useForm<memberPropertyFieldProps>()

  const {
    loadingAssignedMember,
    errorAssignedMember,
    sales,
    properties,
    assignedMember,
    refetchAssignedMember,
  } = useFirstAssignedMember(salesId)
  const [markInvalidMember] = useMutation<types.MARK_INVALID_MEMBER, types.MARK_INVALID_MEMBERVariables>(
    MARK_INVALID_MEMBER,
  )
  const [updateMemberPhone] = useMutation<types.UPDATE_MEMBER_PHONE, types.UPDATE_MEMBER_PHONEVariables>(
    UPDATE_MEMBER_PHONE,
  )
  const [insertMemberNote] = useMutation<types.INSERT_MEMBER_NOTE, types.INSERT_MEMBER_NOTEVariables>(
    INSERT_MEMBER_NOTE,
  )
  const [updateMemberProperties] = useMutation<types.UPDATE_MEMBER_PROPERTIES, types.UPDATE_MEMBER_PROPERTIESVariables>(
    UPDATE_MEMBER_PROPERTIES,
  )

  const [selectedPhone, setSelectedPhone] = useState('')
  const [disabledPhones, setDisabledPhones] = useState<string[]>([])
  const [customPhoneNumber, setCustomPhoneNumber] = useState('')
  const [memberNoteStatus, setMemberNoteStatus] = useState<memberNoteFieldProps['status']>('not-answered')
  const [loading, setLoading] = useState(false)

  if (loadingAssignedMember) {
    return <Skeleton active />
  }

  if (errorAssignedMember || !assignedMember) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const withDurationInput = !sales?.telephone.startsWith('8')
  const primaryPhoneNumber = selectedPhone === 'custom-phone' ? customPhoneNumber : selectedPhone

  const resetForms = async () => {
    memberNoteForm.resetFields()
    setSelectedPhone('')
    setDisabledPhones([])
    setMemberNoteStatus('not-answered')
    refetchAssignedMember().then(({ data }) => {
      memberPropertyForm.setFieldsValue(
        properties.reduce(
          (accumulator, property) => ({
            ...accumulator,
            [property.id]: data.member[0]?.member_properties.find(v => v.property.id === property.id)?.value || '',
          }),
          {} as { [PropertyID: string]: string },
        ),
      )
    })
    message.success('儲存成功')
  }

  const handleSubmit = async () => {
    if (!primaryPhoneNumber) {
      if (assignedMember.phones.every(phone => disabledPhones.includes(phone))) {
        setLoading(true)
        await markInvalidMember({
          variables: {
            memberId: assignedMember.id,
          },
        }).catch(handleError)
        setLoading(false)
        resetForms()
        return
      }

      message.error('請選取主要電話')
      return
    }

    setLoading(true)
    try {
      await memberNoteForm.validateFields()
      await memberPropertyForm.validateFields()
    } catch (error) {
      process.env.NODE_ENV === 'development' && console.error(error)
      message.error('請確實填寫必填欄位')
      setLoading(false)
      return
    }

    try {
      const noteValues = memberNoteForm.getFieldsValue()
      const propertyValues = memberPropertyForm.getFieldsValue()
      await updateMemberPhone({
        variables: {
          data: [
            ...assignedMember.phones.map(phone => ({
              member_id: assignedMember.id,
              phone,
              is_primary: phone === primaryPhoneNumber,
              is_valid: disabledPhones.includes(phone),
            })),
            selectedPhone === 'custom-phone'
              ? {
                  member_id: assignedMember.id,
                  phone: primaryPhoneNumber,
                  is_primary: true,
                }
              : undefined,
          ].filter(notEmpty),
        },
      })
      await insertMemberNote({
        variables: {
          data: {
            member_id: assignedMember.id,
            author_id: salesId,
            type: 'outbound',
            status: memberNoteStatus === 'not-answered' ? 'missed' : 'answered',
            duration: withDurationInput
              ? noteValues.duration.hour() * 3600 + noteValues.duration.minute() * 60 + noteValues.duration.second()
              : 0,
            description: noteValues.description,
            rejected_at: memberNoteStatus === 'rejected' ? new Date() : undefined,
          },
        },
      })
      await updateMemberProperties({
        variables: {
          data: properties
            .filter(property => propertyValues[property.id])
            .map(property => ({
              member_id: assignedMember.id,
              property_id: property.id,
              value: propertyValues[property.id],
            })),
        },
      })
      resetForms()
    } catch (error) {
      handleError(error)
    }
    setLoading(false)
  }

  const handleCall = async (phone: string) => {
    if (!window.confirm(`撥打號碼：${phone}`)) {
      return
    }

    axios
      .post(
        `//${apiHost}/call`,
        {
          appId,
          callFrom: sales?.telephone,
          callTo: phone,
        },
        {
          headers: { authorization: `Bearer ${authToken}` },
        },
      )
      .then(({ data: { code } }) => {
        if (code === 'SUCCESS') {
          message.success('話機連結成功')
        } else {
          message.error('電話錯誤')
        }
      })
      .catch(error => {
        process.env.NODE_ENV === 'development' && console.error(error)
        message.error('連線異常，請再嘗試')
      })
  }

  return (
    <AdminBlock className="p-4">
      <div className="row">
        <div className="col-5">
          <AssignedMemberName className="mb-2">{assignedMember.name}</AssignedMemberName>
          <AssignedMemberEmail>{assignedMember.email}</AssignedMemberEmail>
        </div>
        <div className="col-7">
          <div>會員分類：{assignedMember.categories.map(category => category.name).join(',')}</div>
          <div>
            <span className="mr-2">
              素材：{assignedMember.properties.find(property => property.name === '廣告素材')?.value}
            </span>
            <a
              href="https://docs.google.com/presentation/d/1JA-ucGIoMpSzCh5nBW5IpSBf_QsqnY3W1c9-U5Xnk1c/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
            >
              查看
            </a>
          </div>
          <div>
            填單日期：
            {assignedMember.properties
              .find(property => property.name === '填單日期')
              ?.value.split(',')
              .map(date => moment(date).format('YYYY-MM-DD'))}
          </div>
        </div>
      </div>
      <Divider />
      <div className="row mb-4">
        <div className="col-5">
          <AdminBlockTitle className="mb-4">聯絡紀錄</AdminBlockTitle>
          <StyledLabel className="mb-3">選取主要電話</StyledLabel>
          <Radio.Group
            value={selectedPhone}
            onChange={e => {
              setSelectedPhone(e.target.value)
              setCustomPhoneNumber('')
            }}
            className="mb-5"
          >
            {assignedMember.phones.map(phone => {
              const isDisabled = disabledPhones.includes(phone)

              return (
                <Radio
                  key={phone}
                  value={phone}
                  disabled={disabledPhones.includes(phone)}
                  className="d-flex align-items-center mb-3"
                >
                  <div className="d-flex align-items-center">
                    <div className="mr-2">{phone}</div>
                    <StyledButton
                      type="primary"
                      disabled={isDisabled}
                      className="mr-2"
                      $iconSize="20px"
                      onClick={() => handleCall(phone)}
                    >
                      <CallOutIcon />
                    </StyledButton>
                    <StyledButton
                      size="small"
                      onClick={() => {
                        setSelectedPhone('')
                        isDisabled
                          ? setDisabledPhones(disabledPhones.filter(disabledPhone => disabledPhone !== phone))
                          : setDisabledPhones([...disabledPhones, phone])
                      }}
                    >
                      {isDisabled ? '恢復' : '無效'}
                    </StyledButton>
                  </div>
                </Radio>
              )
            })}
            <Radio value="custom-phone" className="d-flex align-items-center">
              <div className="d-flex align-items-center">
                <div className="mr-2">新增其他號碼</div>
                {selectedPhone === 'custom-phone' && (
                  <div className="flex-grow-1">
                    <Input
                      value={customPhoneNumber}
                      onChange={e => setCustomPhoneNumber(e.target.value.replace(/[^\d+\-()]/g, ''))}
                    />
                  </div>
                )}
              </div>
            </Radio>
          </Radio.Group>

          <Form
            form={memberNoteForm}
            layout="vertical"
            initialValues={{
              status: 'not-answered',
              duration: moment('00:00:00', 'HH:mm:ss'),
            }}
            onValuesChange={(_, values) => {
              setMemberNoteStatus(values.status)
            }}
          >
            <Form.Item name="status" label={<StyledLabel>通話狀態</StyledLabel>}>
              <Select disabled={!primaryPhoneNumber}>
                <Select.Option value="not-answered">一接就掛/未接</Select.Option>
                <Select.Option value="rejected">拒絕</Select.Option>
                <Select.Option value="willing">有意願再聊</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="duration"
              label={<StyledLabel>通時</StyledLabel>}
              className={withDurationInput ? '' : 'd-none'}
            >
              <TimePicker showNow={false} disabled={!primaryPhoneNumber} />
            </Form.Item>
            <Form.Item
              name="description"
              label={<StyledLabel>本次聯絡備註</StyledLabel>}
              rules={[{ required: memberNoteStatus !== 'not-answered', message: '請填寫備註' }]}
            >
              <Input.TextArea disabled={!primaryPhoneNumber} />
            </Form.Item>
          </Form>
        </div>
        <div className="col-7">
          <Form
            form={memberPropertyForm}
            colon={false}
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={assignedMember.properties.reduce(
              (accumulator, property) => ({
                ...accumulator,
                [property.id]: property.value,
              }),
              {} as { [PropertyID: string]: string },
            )}
          >
            {propertyFields.map(propertyField => {
              const property = properties.find(property => property.name === propertyField.name)
              if (!property) {
                return null
              }

              return (
                <Form.Item
                  key={property.id}
                  name={property.id}
                  label={property.name}
                  rules={[{ required: memberNoteStatus === 'willing' && propertyField.required }]}
                >
                  {property.options ? (
                    <Select disabled={!primaryPhoneNumber}>
                      {property.options.map(option => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Input disabled={!primaryPhoneNumber} />
                  )}
                </Form.Item>
              )
            })}
          </Form>
        </div>
      </div>
      <Button type="primary" loading={loading} block onClick={() => handleSubmit()}>
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </AdminBlock>
  )
}

const useSalesSummary = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_SALES_SUMMARY, types.GET_SALES_SUMMARYVariables>(
    gql`
      query GET_SALES_SUMMARY(
        $salesId: String!
        $startOfToday: timestamptz!
        $startOfMonth: timestamptz!
        $startOfTwoWeeks: timestamptz!
        $startOfThreeMonths: timestamptz!
      ) {
        member_by_pk(id: $salesId) {
          id
          picture_url
          name
          username
          email
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
        }
        order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
          order_executor_id
          total_price
          ratio
        }
        member_contract_aggregate(
          where: { author_id: { _eq: $salesId }, agreed_at: { _gte: $startOfMonth }, revoked_at: { _is_null: true } }
        ) {
          aggregate {
            count
          }
        }
        member_note_aggregate(
          where: {
            author_id: { _eq: $salesId }
            type: { _eq: "outbound" }
            status: { _eq: "answered" }
            duration: { _gt: 0 }
            created_at: { _gte: $startOfToday }
          }
        ) {
          aggregate {
            count
            sum {
              duration
            }
          }
        }
        assigned_members_today: member_aggregate(
          where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfToday } }
        ) {
          aggregate {
            count
          }
        }
        assigned_members_last_two_weeks: member_aggregate(
          where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfTwoWeeks } }
        ) {
          aggregate {
            count
          }
        }
        assigned_members_last_three_months: member_aggregate(
          where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfThreeMonths } }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        salesId,
        startOfToday: moment().startOf('day').toDate(),
        startOfMonth: moment().startOf('month').toDate(),
        startOfTwoWeeks: moment().subtract(2, 'weeks').startOf('day').toDate(),
        startOfThreeMonths: moment().subtract(3, 'months').startOf('day').toDate(),
      },
    },
  )

  const salesSummary = data
    ? {
        sales: data.member_by_pk
          ? {
              id: data.member_by_pk.id,
              picture_url: data.member_by_pk.picture_url,
              name: data.member_by_pk.name || data.member_by_pk.username,
              email: data.member_by_pk.email,
              telephone: data.member_by_pk.member_properties[0]?.value || '',
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        contractsOfMonth: data.member_contract_aggregate.aggregate?.count || 0,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
        assignedMembersToday: data.assigned_members_today.aggregate?.count || 0,
        assignedMembersNew: data.assigned_members_last_two_weeks.aggregate?.count || 0,
        assignedMembersAll: data.assigned_members_last_three_months.aggregate?.count || 0,
      }
    : null

  return {
    loadingSalesSummary: loading,
    errorSalesSummary: error,
    salesSummary,
    refetchSalesSummary: refetch,
  }
}

const useFirstAssignedMember = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_FIRST_ASSIGNED_MEMBER,
    types.GET_FIRST_ASSIGNED_MEMBERVariables
  >(
    gql`
      query GET_FIRST_ASSIGNED_MEMBER($salesId: String!, $selectedProperties: [String!]!) {
        member_by_pk(id: $salesId) {
          id
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
        }
        property(where: { name: { _in: $selectedProperties } }) {
          id
          name
          placeholder
        }
        member(
          where: {
            manager_id: { _eq: $salesId }
            assigned_at: { _is_null: false }
            _not: { member_notes: { author_id: { _eq: $salesId } } }
          }
          order_by: [{ assigned_at: asc }]
          limit: 1
        ) {
          id
          email
          name
          username
          member_phones {
            id
            phone
          }
          member_categories {
            id
            category {
              id
              name
            }
          }
          member_properties {
            id
            property {
              id
              name
            }
            value
          }
        }
      }
    `,
    { variables: { salesId, selectedProperties: propertyFields.map(field => field.name) } },
  )

  const sales = data?.member_by_pk
    ? {
        id: data.member_by_pk.id,
        telephone: data.member_by_pk.member_properties[0]?.value || '',
      }
    : null
  const properties =
    data?.property.map(property => ({
      id: property.id,
      name: property.name,
      options: property.placeholder ? property.placeholder.replace(/^\(|\)$/g, '').split('/') : null,
    })) || []
  const assignedMember = data?.member?.[0]
    ? {
        id: data.member[0].id,
        email: data.member[0].email,
        name: data.member[0].name || data.member[0].username,
        phones: data.member[0].member_phones.map(v => v.phone),
        categories: data.member[0].member_categories.map(v => ({
          id: v.category.id,
          name: v.category.name,
        })),
        properties: data.member[0].member_properties.map(v => ({
          id: v.property.id,
          name: v.property.name,
          value: v.value,
        })),
      }
    : null

  return {
    loadingAssignedMember: loading,
    errorAssignedMember: error,
    sales,
    properties,
    assignedMember,
    refetchAssignedMember: refetch,
  }
}

const UPDATE_MEMBER_PHONE = gql`
  mutation UPDATE_MEMBER_PHONE($data: [member_phone_insert_input!]!) {
    insert_member_phone(
      objects: $data
      on_conflict: { constraint: member_phone_member_id_phone_key, update_columns: [is_primary, is_valid] }
    ) {
      affected_rows
    }
  }
`
const MARK_INVALID_MEMBER = gql`
  mutation MARK_INVALID_MEMBER($memberId: String!) {
    update_member(where: { id: { _eq: $memberId } }, _set: { manager_id: null }) {
      affected_rows
    }
    update_member_phone(where: { member_id: { _eq: $memberId } }, _set: { is_valid: false }) {
      affected_rows
    }
  }
`
const INSERT_MEMBER_NOTE = gql`
  mutation INSERT_MEMBER_NOTE($data: member_note_insert_input!) {
    insert_member_note_one(object: $data) {
      id
    }
  }
`
const UPDATE_MEMBER_PROPERTIES = gql`
  mutation UPDATE_MEMBER_PROPERTIES($data: [member_property_insert_input!]!) {
    insert_member_property(
      objects: $data
      on_conflict: { constraint: member_property_member_id_property_id_key, update_columns: [value] }
    ) {
      returning {
        id
      }
    }
  }
`

export default SalesCallPage
