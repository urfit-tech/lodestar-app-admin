import Icon, { SwapOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Result, Slider, Statistic, Steps } from 'antd'
import { ResultProps } from 'antd/lib/result'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CategoryInput from '../components/common/CategoryInput'
import SalesMemberInput from '../components/common/SalesMemberInput'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { notEmpty } from '../helpers'
import { salesMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'

type Filter = {
  categoryIds: string[]
  createdAtRange: [Date, Date] | null
  assignedAtRange: [Date, Date] | null
  managerId?: string
  starRange: [number, number]
}
type AssignResult = {
  status: ResultProps['status']
  data?: number
  error?: Error
}
const SalesLeadDeliveryPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { permissions } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [assignedResult, setAssignedResult] = useState<AssignResult>()
  const [filter, setFilter] = useState<Filter>({
    categoryIds: [],
    starRange: [-999, 999],
    createdAtRange: null,
    assignedAtRange: null,
  })
  const [updateLeadManager] = useMutation<hasura.UPDATE_LEAD_MANAGER, hasura.UPDATE_LEAD_MANAGERVariables>(
    UPDATE_LEAD_MANAGER,
  )

  if (!permissions.SALES_LEAD_DELIVERY_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-5 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <SwapOutlined />} />
          <span>{formatMessage(salesMessages.salesLeadDelivery)}</span>
        </AdminPageTitle>
      </div>
      <Steps className="mb-5" current={currentStep} type="navigation" onChange={setCurrentStep}>
        <Steps.Step title="篩選名單" />
        <Steps.Step title="確認派發" />
        <Steps.Step title="派發結果" disabled={!assignedResult} />
      </Steps>
      {currentStep === 0 && (
        <FilterSection
          filter={filter}
          onNext={filter => {
            setFilter(filter)
            setCurrentStep(step => step + 1)
          }}
        />
      )}
      {currentStep === 1 && (
        <ConfirmSection
          filter={filter}
          onNext={({ memberIds, managerId }) => {
            setCurrentStep(step => step + 1)
            setAssignedResult({
              status: 'info',
            })
            updateLeadManager({ variables: { appId, memberIds, managerId } })
              .then(({ data }) => {
                setAssignedResult({
                  status: 'success',
                  data: data?.update_member?.affected_rows || 0,
                })
              })
              .catch(error => {
                setAssignedResult({
                  status: 'error',
                  error,
                })
              })
          }}
        />
      )}
      {currentStep === 2 && assignedResult && <ResultSection result={assignedResult} />}
    </AdminLayout>
  )
}

const FilterSection: React.FC<{ filter: Filter; onNext?: (filter: Filter) => void }> = ({ filter, onNext }) => {
  return (
    <Form<Filter>
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 12 }}
      initialValues={filter}
      onFinish={values => {
        onNext?.(values)
      }}
    >
      <Form.Item label="原承辦人" name="managerId">
        <SalesMemberInput />
      </Form.Item>
      <Form.Item label="領域" name="categoryIds">
        <CategoryInput categoryClass="member" />
      </Form.Item>
      <Form.Item label="星等" name="starRange">
        <Slider range min={-999} max={999} />
      </Form.Item>
      <Form.Item label="名單建立日期" name="createdAtRange">
        <DatePicker.RangePicker allowClear />
      </Form.Item>
      <Form.Item label="名單派發日期" name="assignedAtRange">
        <DatePicker.RangePicker allowClear />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6 }}>
        <Button type="primary" htmlType="submit">
          下一步
        </Button>
      </Form.Item>
    </Form>
  )
}

const ConfirmSection: React.FC<{
  filter: Filter
  onNext?: (values: { memberIds: string[]; managerId: string | null }) => void
}> = ({ filter, onNext }) => {
  const { id: appId } = useApp()
  const [managerId, setManagerId] = useState<string>()
  const [numDeliver, setNumDeliver] = useState(1)
  const { data: leadCandidatesData, loading: isLeadCandidatesLoading } = useQuery<
    hasura.GET_LEAD_CANDIDATES,
    hasura.GET_LEAD_CANDIDATESVariables
  >(
    gql`
      query GET_LEAD_CANDIDATES($condition: member_bool_exp) {
        member(where: $condition) {
          id
        }
      }
    `,
    {
      fetchPolicy: 'no-cache',
      variables: {
        condition: {
          _and: [
            {
              app_id: {
                _eq: appId || 'demo',
              },
            },
            {
              role: {
                _eq: 'general-member',
              },
            },
            {
              manager_id: {
                _is_null: !filter.managerId,
                _eq: filter.managerId || undefined,
              },
              member_categories:
                filter.categoryIds.length > 0
                  ? {
                      category: {
                        name: {
                          _in: filter.categoryIds,
                        },
                      },
                    }
                  : undefined,
              created_at: filter.createdAtRange
                ? {
                    _gte: moment(filter.createdAtRange[0]).startOf('day'),
                    _lte: moment(filter.createdAtRange[1]).endOf('day'),
                  }
                : undefined,
            },
            {
              _or: [
                {
                  star: {
                    _gte: filter.starRange[0],
                    _lte: filter.starRange[1],
                  },
                },
                {
                  star: {
                    _is_null: true,
                  },
                },
              ],
            },
          ],
        },
      },
    },
  )
  const { data: assignedLeadsData, loading: isAssignedLeadsLoading } = useQuery<
    hasura.GET_ASSIGNED_LEADS,
    hasura.GET_ASSIGNED_LEADSVariables
  >(
    gql`
      query GET_ASSIGNED_LEADS(
        $appId: String!
        $memberIds: [String!]
        $assignedAtCondition: timestamptz_comparison_exp
      ) {
        audit_log(
          distinct_on: [member_id]
          where: {
            member: { app_id: { _eq: $appId } }
            member_id: { _in: $memberIds }
            created_at: $assignedAtCondition
          }
        ) {
          member_id
        }
      }
    `,
    {
      fetchPolicy: 'no-cache',
      variables: {
        appId,
        memberIds: filter.assignedAtRange ? leadCandidatesData?.member.map(v => v.id) || [] : [],
        assignedAtCondition: filter.assignedAtRange
          ? {
              _gte: moment(filter.assignedAtRange[0]).startOf('day'),
              _lte: moment(filter.assignedAtRange[1]).endOf('day'),
            }
          : undefined,
      },
    },
  )
  const filteredMemberIds = useMemo(() => {
    const memberIds =
      (filter.assignedAtRange
        ? assignedLeadsData?.audit_log.map(v => v.member_id).filter(notEmpty)
        : leadCandidatesData?.member.map(v => v.id)) || []
    return memberIds
  }, [assignedLeadsData, filter.assignedAtRange, leadCandidatesData?.member])

  const isLoading = isAssignedLeadsLoading || isLeadCandidatesLoading
  return (
    <div className="row">
      <div className="offset-md-3 col-12 col-md-6 text-center">
        <Statistic
          loading={isLoading}
          className="mb-3"
          title="預計派發名單數"
          value={`${numDeliver} / ${filteredMemberIds.length}`}
        />
        <div className="mb-2">
          <SalesMemberInput value={managerId} onChange={setManagerId} />
        </div>
        {!isLoading && <Slider value={numDeliver} onChange={setNumDeliver} max={filteredMemberIds.length} />}
        <Button
          type="primary"
          block
          onClick={() => onNext?.({ memberIds: filteredMemberIds.slice(0, numDeliver), managerId: managerId || null })}
        >
          派發名單
        </Button>
      </div>
    </div>
  )
}

const ResultSection: React.FC<{ result: AssignResult; onBack?: () => void }> = ({ result, onBack }) => {
  return (
    <Result
      status={result.status}
      title={result.status === 'success' ? '成功派發名單' : result.status === 'error' ? '派發名單失敗' : '派發名單中'}
      subTitle={
        result.status === 'success'
          ? `已派發 ${result.data} 筆名單`
          : result.status === 'error'
          ? result.error?.message
          : '正在派發名單中，請稍等'
      }
      extra={[<Button onClick={() => onBack?.()}>再次派發</Button>]}
    />
  )
}

const UPDATE_LEAD_MANAGER = gql`
  mutation UPDATE_LEAD_MANAGER($appId: String!, $memberIds: [String!], $managerId: String) {
    update_member(where: { app_id: { _eq: $appId }, id: { _in: $memberIds } }, _set: { manager_id: $managerId }) {
      affected_rows
    }
  }
`
export default SalesLeadDeliveryPage
