import Icon, { SwapOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, Input, Result, Slider, Statistic, Steps } from 'antd'
import { ResultProps } from 'antd/lib/result'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { notEmpty } from 'lodestar-app-admin/src/helpers'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import CategoryInput from '../../components/common/CategoryInput'
import SalesMemberInput from '../../components/common/SalesMemberInput'
import hasura from '../../hasura'
import { salesLeadDeliveryPageMessages } from './translation'

type Filter = {
  categoryIds: string[]
  createdAtRange: [Date, Date] | null
  assignedAtRange: [Date, Date] | null
  managerId?: string
  starRange: [number, number]
  starRangeIsNull: boolean
  marketingActivity: string
}
type AssignResult = {
  status: ResultProps['status']
  data?: number
  error?: Error
}
const SalesLeadDeliveryPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [currentStep, setCurrentStep] = useState(0)
  const [assignedResult, setAssignedResult] = useState<AssignResult>()
  const [filter, setFilter] = useState<Filter>({
    categoryIds: [],
    starRange: [-999, 999],
    createdAtRange: null,
    assignedAtRange: null,
    starRangeIsNull: false,
    marketingActivity: '',
  })
  const [updateLeadManager] = useMutation<hasura.UPDATE_LEAD_MANAGER, hasura.UPDATE_LEAD_MANAGERVariables>(
    UPDATE_LEAD_MANAGER,
  )

  return (
    <AdminLayout>
      <div className="mb-5 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <SwapOutlined />} />
          <span>{formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.salesLeadDelivery)}</span>
        </AdminPageTitle>
      </div>
      <Steps className="mb-5" current={currentStep} type="navigation" onChange={setCurrentStep}>
        <Steps.Step title={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.filterSalesLead)} />
        <Steps.Step title={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliveryConfirm)} />
        <Steps.Step
          title={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliveryResult)}
          disabled={!assignedResult}
        />
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
            updateLeadManager({ variables: { memberIds, managerId } })
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
  const { formatMessage } = useIntl()
  const [starRangeIsNull, setStarRangeIsNull] = useState(false)

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
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.originalManager)}
        name="managerId"
      >
        <SalesMemberInput />
      </Form.Item>
      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.field)} name="categoryIds">
        <CategoryInput class="member" />
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.starRangeIsNull)}
        name="starRangeIsNull"
        valuePropName="checked"
      >
        <Checkbox onChange={e => setStarRangeIsNull(e.target.checked)} />
      </Form.Item>
      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.starRange)} name="starRange">
        <Slider range min={-999} max={999} disabled={starRangeIsNull} />
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.marketingActivity)}
        name="marketingActivity"
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.createdAtRange)}
        name="createdAtRange"
      >
        <DatePicker.RangePicker allowClear />
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.assignedAtRange)}
        name="assignedAtRange"
      >
        <DatePicker.RangePicker allowClear />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6 }}>
        <Button type="primary" htmlType="submit">
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.nextStep)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const ConfirmSection: React.FC<{
  filter: Filter
  onNext?: (values: { memberIds: string[]; managerId: string | null }) => void
}> = ({ filter, onNext }) => {
  const { formatMessage } = useIntl()
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
          star: filter.starRangeIsNull
            ? {
                _is_null: true,
              }
            : {
                _gte: filter.starRange[0],
                _lte: filter.starRange[1],
              },
          member_properties:
            filter.marketingActivity !== ''
              ? { property: { name: { _eq: '行銷活動' } }, value: { _like: `%${filter.marketingActivity}%` } }
              : undefined,
        },
      },
    },
  )
  const { data: assignedLeadsData, loading: isAssignedLeadsLoading } = useQuery<
    hasura.GET_ASSIGNED_LEADS,
    hasura.GET_ASSIGNED_LEADSVariables
  >(
    gql`
      query GET_ASSIGNED_LEADS($memberIds: [String!], $assignedAtCondition: timestamptz_comparison_exp) {
        audit_log(
          distinct_on: [member_id]
          where: { member_id: { _in: $memberIds }, created_at: $assignedAtCondition }
        ) {
          member_id
        }
      }
    `,
    {
      fetchPolicy: 'no-cache',
      variables: {
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
          title={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.expectedDeliveryAmount)}
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
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverSalesLead)}
        </Button>
      </div>
    </div>
  )
}

const ResultSection: React.FC<{ result: AssignResult; onBack?: () => void }> = ({ result, onBack }) => {
  const { formatMessage } = useIntl()
  return (
    <Result
      status={result.status}
      title={
        result.status === 'success'
          ? formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverSuccessfully)
          : result.status === 'error'
          ? formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverFailed)
          : formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.delivering)
      }
      subTitle={
        result.status === 'success'
          ? formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliveredCount, {
              count: result.data,
            })
          : result.status === 'error'
          ? result.error?.message
          : formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliveringMessage)
      }
      extra={[
        <Button onClick={() => onBack?.()}>
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverAgain)}
        </Button>,
      ]}
    />
  )
}

const UPDATE_LEAD_MANAGER = gql`
  mutation UPDATE_LEAD_MANAGER($memberIds: [String!], $managerId: String) {
    update_member(where: { id: { _in: $memberIds } }, _set: { manager_id: $managerId }) {
      affected_rows
    }
  }
`
export default SalesLeadDeliveryPage
