import Icon, { SwapOutlined } from '@ant-design/icons'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, Text } from '@chakra-ui/react'
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Result,
  Row,
  Select,
  Slider,
  Spin,
  Statistic,
  Steps,
} from 'antd'
import { ResultProps } from 'antd/lib/result'
import { isEmpty } from 'lodash'
import { DESKTOP_BREAK_POINT } from 'lodestar-app-element/src/components/common/Responsive'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import CategoryInput from '../../components/common/CategoryInput'
import ManagerInput from '../../components/common/ManagerInput'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura, { member_bool_exp } from '../../hasura'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useProperty } from '../../hooks/member'
import { useGetManagerWithMemberCount } from '../../hooks/sales'
import { ColumnProperty, MemberCollectionProps } from '../../types/member'
import { MemberCollectionTableBlock, MemberFieldFilter } from '../MemberCollectionAdminPage/MemberCollectionAdminPage'
import SalesLeadLimitConfirmModel from './SalesLeadLimitConfirmModel'
import { salesLeadDeliveryPageMessages } from './translation'

type LeadTypeFilter = 'contained' | 'only' | 'excluded'

type Filter = {
  [key: string]: any
  categoryIds: string[]
  createdAtRange: [Date, Date] | null
  lastCalledRange: [Moment | null, Moment | null] | null
  lastAnsweredRange: [Moment | null, Moment | null] | null
  managerId?: string
  starRange: [number, number]
  starRangeIsNull: boolean
  completedLead: LeadTypeFilter
  closedLead: LeadTypeFilter
  recycledLead: LeadTypeFilter
  closedAtRange: [Date, Date] | null
  excludeLastCalled: boolean
  excludeLastAnswered: boolean
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
    lastCalledRange: null,
    lastAnsweredRange: null,
    starRangeIsNull: false,
    completedLead: 'excluded',
    closedLead: 'excluded',
    recycledLead: 'excluded',
    closedAtRange: null,
    excludeLastCalled: false,
    excludeLastAnswered: false,
  })

  const [updateLeadManager] = useMutation<hasura.UpdateLeadManager, hasura.UpdateLeadManagerVariables>(
    UpdateLeadManager,
  )

  const [getLeadManager] = useLazyQuery<hasura.GetLeadCandidates, hasura.GetLeadCandidatesVariables>(
    GetLeadCandidates,
    { fetchPolicy: 'no-cache' },
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
          setCurrentStep={setCurrentStep}
          onNext={({ condition, limit, managerId, isClearClosedAt, isClearCompletedAt, isClearRecycledAt }) => {
            setAssignedResult({
              status: 'info',
            })
            getLeadManager({ variables: { condition, limit } })
              .then(({ data }) => {
                const memberIds = data?.member.map(m => m.id) || []
                updateLeadManager({
                  variables: {
                    memberIds,
                    updated: {
                      manager_id: managerId,
                      last_manager_assigned_at: new Date(),
                      completed_at: isClearCompletedAt ? null : undefined,
                      closed_at: isClearClosedAt ? null : undefined,
                      recycled_at: isClearRecycledAt ? null : undefined,
                      lead_status_category_id: null,
                      star: isClearCompletedAt || isClearClosedAt || isClearRecycledAt ? 0 : undefined,
                    },
                  },
                })
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
      {currentStep === 2 && assignedResult && (
        <ResultSection result={assignedResult} onBack={() => setCurrentStep(0)} />
      )}
    </AdminLayout>
  )
}

const FilterSection: React.FC<{
  filter: Filter
  onNext?: (filter: Filter) => void
}> = ({ filter, onNext }) => {
  const { formatMessage } = useIntl()
  const [starRangeIsNull, setStarRangeIsNull] = useState(filter.starRangeIsNull)
  const [notCalled, setNotCalled] = useState(filter.notCalled)
  const [notAnswered, setNotAnswered] = useState(filter.notAnswered)
  const [lastCalledRange, setLastCalledRange] = useState<[Moment | null, Moment | null] | null>(filter.lastCalledRange)
  const [lastAnsweredRange, setLastAnsweredRange] = useState<[Moment | null, Moment | null] | null>(
    filter.lastAnsweredRange,
  )
  const [excludeLastCalled, setExcludeLastCalled] = useState(filter.excludeLastCalled)
  const [excludeLastAnswered, setExcludeLastAnswered] = useState(filter.excludeLastAnswered)
  const [starRange, setStarRange] = useState<[number, number]>([-999, 999])
  const { loadingProperties, properties } = useProperty()
  const { currentMemberId } = useAuth()
  const ExactMatchCheckBox = styled(Form.Item)`
    left: 0%;
    bottom: -150%;
    display: flex;
    position: absolute;
    @media (min-width: ${DESKTOP_BREAK_POINT}px) {
      left: auto;
      bottom: auto;
      right: -120px;
    }
  `
  const ExcludeCheckBox = styled(Form.Item)`
    margin-bottom: 0px;
  `
  const PropertiesItem = styled(Form.Item)`
    margin-bottom: 40px;
    @media (min-width: ${DESKTOP_BREAK_POINT}px) {
      margin-bottom: 24px;
    }
  `

  return (
    <Form<Filter>
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 12 }}
      initialValues={filter}
      onFinish={values => onNext?.({ ...values, starRange, excludeLastCalled, excludeLastAnswered })}
    >
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.originalManager)}
        name="managerId"
      >
        <ManagerInput />
      </Form.Item>
      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.field)} name="categoryIds">
        <CategoryInput categoryClass="member" />
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.starRangeIsNull)}
        name="starRangeIsNull"
        valuePropName="checked"
      >
        <Checkbox onChange={e => setStarRangeIsNull(e.target.checked)} />
      </Form.Item>

      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.starRange)}>
        <Slider
          range
          min={-999}
          max={999}
          disabled={starRangeIsNull}
          value={[starRange[0], starRange[1]]}
          onChange={v => setStarRange(v)}
        />
      </Form.Item>
      <Form.Item label=" " colon={false}>
        <Input.Group compact>
          <Form.Item noStyle>
            <InputNumber
              min={-999}
              max={999}
              disabled={starRangeIsNull}
              value={starRange[0]}
              onChange={v => v && (+v > starRange[1] ? setStarRange([+v, +v]) : setStarRange([+v, starRange[1]]))}
            />
          </Form.Item>
          <div style={{ height: '43px', marginLeft: '0.25rem', marginRight: '0.25rem' }}>
            <div className="d-flex align-items-center" style={{ height: '100%' }}>
              ~
            </div>
          </div>
          <Form.Item noStyle>
            <InputNumber
              min={-999}
              max={999}
              disabled={starRangeIsNull}
              value={starRange[1]}
              onChange={v => v && (+v < starRange[0] ? setStarRange([+v, +v]) : setStarRange([starRange[0], +v]))}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.createdAtRange)}
        name="createdAtRange"
      >
        <DatePicker.RangePicker allowClear />
      </Form.Item>

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.notCalled)}
        name="notCalled"
        valuePropName="checked"
      >
        <Checkbox onChange={e => setNotCalled(e.target.checked)} />
      </Form.Item>
      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastCalledRange)}>
        <Box>
          <Form.Item name="lastCalledRange" noStyle getValueProps={v => ({ value: notCalled ? [null, null] : v })}>
            <DatePicker.RangePicker
              allowClear
              disabled={notCalled}
              onChange={data => {
                if (!data) {
                  setExcludeLastCalled(false)
                }
                setLastCalledRange(data)
              }}
            />
          </Form.Item>
          <ExcludeCheckBox
            name="excludeLastCalled"
            valuePropName="checked"
            getValueProps={() => ({ checked: notCalled ? false : excludeLastCalled })}
          >
            <Checkbox
              checked={excludeLastCalled}
              onChange={e => setExcludeLastCalled(e.target.checked)}
              style={{ display: 'flex', alignItems: 'center' }}
              disabled={notCalled ? true : !lastCalledRange}
            >
              <Text color="var(--gary-dark)" size="sm">
                {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}
                {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastCalledRange)}
              </Text>
            </Checkbox>
          </ExcludeCheckBox>
        </Box>
      </Form.Item>

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.notAnswered)}
        name="notAnswered"
        valuePropName="checked"
      >
        <Checkbox onChange={e => setNotAnswered(e.target.checked)} />
      </Form.Item>

      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastAnsweredRange)}>
        <Box>
          <Form.Item name="lastAnsweredRange" noStyle getValueProps={v => ({ value: notAnswered ? [null, null] : v })}>
            <DatePicker.RangePicker
              allowClear
              disabled={notAnswered}
              onChange={data => {
                if (!data) {
                  setExcludeLastAnswered(false)
                }
                setLastAnsweredRange(data)
              }}
            />
          </Form.Item>
          <ExcludeCheckBox
            name="excludeLastAnswered"
            valuePropName="checked"
            getValueProps={() => ({ checked: notAnswered ? false : excludeLastAnswered })}
          >
            <Checkbox
              defaultChecked={false}
              onChange={e => setExcludeLastAnswered(e.target.checked)}
              style={{ display: 'flex', alignItems: 'center' }}
              disabled={notAnswered ? true : !lastAnsweredRange}
            >
              <Text color="var(--gary-dark)" size="sm">
                {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}
                {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastAnsweredRange)}
              </Text>
            </Checkbox>
          </ExcludeCheckBox>
        </Box>
      </Form.Item>

      <Form.Item
        name="completedLead"
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
      >
        <Radio.Group>
          <Radio value="contained">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.contained)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
          </Radio>
          <Radio value="only">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.onlyFilter)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
          </Radio>
          <Radio value="excluded">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="closedLead"
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedLead)}
      >
        <Radio.Group>
          <Radio value="contained">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.contained)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedLead)}
          </Radio>
          <Radio value="only">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.onlyFilter)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedLead)}
          </Radio>
          <Radio value="excluded">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedLead)}
          </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedRange)}
        name="closedAtRange"
        getValueProps={v => ({ value: notCalled ? [null, null] : v })}
      >
        <DatePicker.RangePicker allowClear disabled={notCalled} />
      </Form.Item>

      <Form.Item
        name="recycledLead"
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.recycledLead)}
      >
        <Radio.Group>
          <Radio value="contained">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.contained)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.recycledLead)}
          </Radio>
          <Radio value="only">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.onlyFilter)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.recycledLead)}
          </Radio>
          <Radio value="excluded">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.recycledLead)}
          </Radio>
        </Radio.Group>
      </Form.Item>
      {!currentMemberId || loadingProperties ? (
        <Spin />
      ) : (
        properties.map(property => (
          <PropertiesItem label={property.name} key={property.id}>
            {property?.placeholder?.includes('/') ? (
              <Form.Item name={property.name} style={{ width: '100%', margin: '0px' }}>
                <Select>
                  {property?.placeholder?.split('/').map((value: string, idx: number) => (
                    <Select.Option key={idx} value={value}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Box position="relative" w="100%" display="flex">
                <Form.Item name={property.name} style={{ width: '100%', margin: '0px' }}>
                  <Input style={{ width: '100%' }} />
                </Form.Item>
                <ExactMatchCheckBox name={`is${property.name}ExactMatch`} valuePropName="checked">
                  <Checkbox style={{ display: 'flex', alignItems: 'center' }}>
                    <Text color="var(--gary-dark)" size="sm">
                      {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.exactMatch)}
                    </Text>
                  </Checkbox>
                </ExactMatchCheckBox>
              </Box>
            )}
          </PropertiesItem>
        ))
      )}

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
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  onNext?: (values: {
    condition: member_bool_exp
    limit: number
    managerId: string | null
    isClearCompletedAt: boolean
    isClearClosedAt: boolean
    isClearRecycledAt: boolean
  }) => void
}> = ({ filter, setCurrentStep, onNext }) => {
  const { formatMessage } = useIntl()
  const [managerId, setManagerId] = useState<string>()
  const [numDeliver, setNumDeliver] = useState(1)
  const { properties } = useProperty()
  const [visible, setVisible] = useState(false)
  const { currentUserRole } = useAuth()
  const { id: appId, settings, enabledModules } = useApp()
  const propertyColumn = JSON.parse(
    settings['sales_lead_delivery_page.confirm_section.default_member_property_column'] || '[]',
  )
  const propertyColumnIds = propertyColumn
    .map((columnName: string) => properties.find(property => columnName === property.name))
    .map((property: ColumnProperty) => property.id)
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([
    '#',
    'createdAt',
    'consumption',
    'categories',
    'managerName',
    ...propertyColumnIds,
  ])
  const [isClearCompletedAt, setIsClearCompletedAt] = useState(false)
  const [isClearClosedAt, setIsClearClosedAt] = useState(false)
  const [isClearRecycledAt, setIsClearRecycledAt] = useState(false)

  const limit = 50

  const extraColumns = [
    {
      title: formatMessage(commonMessages.label.star),
      dataIndex: 'star',
      key: 'star',
    },
    {
      title: formatMessage(commonMessages.label.lastMemberNoteCalled),
      dataIndex: 'lastMemberNoteCalled',
      key: 'lastMemberNoteCalled',
    },
    {
      title: formatMessage(commonMessages.label.lastMemberNoteAnswered),
      dataIndex: 'lastMemberNoteAnswered',
      key: 'lastMemberNoteAnswered',
    },
    {
      title: formatMessage(commonMessages.label.completedAt),
      dataIndex: 'completedAt',
      key: 'completedAt',
    },
    {
      title: formatMessage(commonMessages.label.closedAt),
      dataIndex: 'closedAt',
      key: 'closedAt',
    },
    {
      title: formatMessage(commonMessages.label.recycledAt),
      dataIndex: 'recycledAt',
      key: 'recycledAt',
    },
  ]

  const allFieldColumns: ({
    id: string
    title: string
  } | null)[] = [
    { id: 'createdAt', title: formatMessage(commonMessages.label.createdDate) },
    { id: 'loginedAt', title: formatMessage(commonMessages.label.lastLogin) },
    { id: 'consumption', title: formatMessage(commonMessages.label.consumption) },
    { id: 'categories', title: formatMessage(commonMessages.label.category) },
    { id: 'tags', title: formatMessage(commonMessages.label.tags) },
    enabledModules.member_assignment && currentUserRole === 'app-owner'
      ? { id: 'managerName', title: formatMessage(memberMessages.label.manager) }
      : null,
    ...extraColumns.map(column => ({
      id: column.key,
      title: column.title,
    })),
    ...properties.map(property => ({
      id: property.id,
      title: property.name,
    })),
  ]

  const andCondition = []
  if (filter.lastCalledRange && filter.excludeLastCalled) {
    const lastCalledCondition = {
      _or: [
        {
          last_member_note_called: {
            _lte: moment(filter.lastCalledRange[0]).startOf('day'),
          },
        },
        {
          last_member_note_called: {
            _gte: moment(filter.lastCalledRange[1]).endOf('day'),
          },
        },
      ],
    }

    andCondition.push(lastCalledCondition)
  }

  if (filter.lastAnsweredRange && filter.excludeLastAnswered) {
    const lastAnsweredCondition = {
      _or: [
        {
          last_member_note_answered: {
            _lte: moment(filter.lastAnsweredRange[0]).startOf('day'),
          },
        },
        {
          last_member_note_answered: {
            _gte: moment(filter.lastAnsweredRange[1]).endOf('day'),
          },
        },
      ],
    }

    andCondition.push(lastAnsweredCondition)
  }

  properties.map(property => {
    if (!isEmpty(filter[property.name])) {
      andCondition.push({
        member_properties: {
          property: { name: { _eq: property.name } },
          value: filter[`is${property.name}ExactMatch`]
            ? { _eq: `${filter[property.name]}` }
            : { _like: `%${filter[property.name]}%` },
        },
      })
    }
    return undefined
  })

  const leadCandidatesCondition = {
    member_phones: { phone: { _neq: '' }, is_valid: { _neq: false } },
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
    last_member_note_called: filter.notCalled
      ? {
          _is_null: true,
        }
      : filter.lastCalledRange && !filter.excludeLastCalled
      ? {
          _gte: moment(filter.lastCalledRange[0]).startOf('day'),
          _lte: moment(filter.lastCalledRange[1]).endOf('day'),
        }
      : undefined,
    last_member_note_answered: filter.notAnswered
      ? {
          _is_null: true,
        }
      : filter.lastAnsweredRange && !filter.excludeLastAnswered
      ? {
          _gte: moment(filter.lastAnsweredRange[0]).startOf('day'),
          _lte: moment(filter.lastAnsweredRange[1]).endOf('day'),
        }
      : undefined,
    _and: andCondition.length === 0 ? undefined : andCondition,
    completed_at:
      filter.completedLead === 'contained'
        ? undefined
        : {
            _is_null: filter.completedLead === 'excluded',
          },
    _or:
      filter.closedLead === 'contained' && filter.closedAtRange
        ? [
            {
              closed_at: {
                _gte: moment(filter.closedAtRange[0]).startOf('day'),
                _lte: moment(filter.closedAtRange[1]).endOf('day'),
              },
            },
            {
              closed_at: {
                _is_null: true,
              },
            },
          ]
        : undefined,
    closed_at:
      filter.closedLead === 'excluded'
        ? {
            _is_null: true,
          }
        : filter.closedLead === 'only'
        ? filter.closedAtRange
          ? {
              _gte: moment(filter.closedAtRange[0]).startOf('day'),
              _lte: moment(filter.closedAtRange[1]).endOf('day'),
            }
          : {
              _is_null: false,
            }
        : undefined,
    recycled_at:
      filter.recycledLead === 'contained'
        ? undefined
        : {
            _is_null: filter.recycledLead === 'excluded',
          },
  }

  // 使用 aggregate 查詢總數（讓資料庫計算，避免抓回全部資料）
  const { data: countData, loading: loadingCount } = useQuery<
    hasura.GetLeadCandidatesCount,
    hasura.GetLeadCandidatesCountVariables
  >(GetLeadCandidatesCount, {
    fetchPolicy: 'no-cache',
    variables: {
      condition: leadCandidatesCondition,
    },
  })

  // 只取前 50 筆預覽資料
  const { data: leadCandidatesData, loading: loadingLeadCandidates } = useQuery<
    hasura.GetLeadCandidates,
    hasura.GetLeadCandidatesVariables
  >(GetLeadCandidates, {
    fetchPolicy: 'no-cache',
    variables: {
      condition: leadCandidatesCondition,
      limit,
    },
  })

  const leadCandidatesCounts = countData?.member_aggregate?.aggregate?.count ?? 0

  const members = leadCandidatesData?.member.map(member => ({
    ...member,
    managerId: member.manager_id,
    createdAt: new Date(member.created_at),
    loginedAt: member.logined_at ? moment(member.logined_at).format('YYYY-MM-DD') : null,
    lastMemberNoteCalled: member.last_member_note_called
      ? moment(member.last_member_note_called).format('YYYY-MM-DD')
      : null,
    lastMemberNoteAnswered: member.last_member_note_answered
      ? moment(member.last_member_note_answered).format('YYYY-MM-DD')
      : null,
    completedAt: member.completed_at ? moment(member.completed_at).format('YYYY-MM-DD') : null,
    closedAt: member.closed_at ? moment(member.closed_at).format('YYYY-MM-DD') : null,
    recycledAt: member.recycled_at ? moment(member.recycled_at).format('YYYY-MM-DD') : null,
  })) as MemberCollectionProps[]

  const { managerWithMemberCountData } = useGetManagerWithMemberCount(managerId as string, appId)

  const handleOnNext = () => {
    onNext?.({
      condition: leadCandidatesCondition,
      limit: numDeliver,
      managerId: managerId || null,
      isClearCompletedAt,
      isClearClosedAt,
      isClearRecycledAt,
    })
  }

  const handleClick = () => {
    const memberCount = managerWithMemberCountData?.memberCount
    const isAggregateAvailable = typeof memberCount === 'object' && memberCount !== null && 'aggregate' in memberCount

    const managerLeadLimit = settings['manager_lead_limit']
    const isManagerLeadLimitValid = managerLeadLimit && Number(managerLeadLimit) > 0

    if (
      isManagerLeadLimitValid &&
      isAggregateAvailable &&
      memberCount.aggregate.count + numDeliver > Number(managerLeadLimit)
    ) {
      setVisible(true)
    } else {
      setCurrentStep(step => step + 1)
      handleOnNext()
    }
  }

  return (
    <div className="row">
      <div className="offset-md-3 col-12 col-md-6 text-center">
        <Statistic
          loading={loadingCount || loadingLeadCandidates}
          className="mb-3"
          title={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.expectedDeliveryAmount)}
          value={`${numDeliver} / ${leadCandidatesCounts}`}
        />
        <div className="mb-2">
          <ManagerInput value={managerId} onChange={setManagerId} />
        </div>
        {!loadingLeadCandidates && (
          <Row className="mb-2">
            <Col span={6}>
              <InputNumber value={numDeliver} onChange={v => v && setNumDeliver(+v)} max={leadCandidatesCounts} />
            </Col>
            <Col span={18}>
              <Slider value={numDeliver} onChange={setNumDeliver} max={leadCandidatesCounts} />
            </Col>
          </Row>
        )}

        <Row className="mb-2">
          <Checkbox checked={isClearCompletedAt} onChange={e => setIsClearCompletedAt(e.target.checked)}>
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.clearCompletedAt)}
          </Checkbox>
        </Row>
        <Row className="mb-2">
          <Checkbox checked={isClearClosedAt} onChange={e => setIsClearClosedAt(e.target.checked)}>
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.clearClosedAt)}
          </Checkbox>
        </Row>
        <Row className="mb-2">
          <Checkbox checked={isClearRecycledAt} onChange={e => setIsClearRecycledAt(e.target.checked)}>
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.clearRecycledAt)}
          </Checkbox>
        </Row>

        <Button type="primary" block onClick={handleClick}>
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverSalesLead)}
        </Button>

        {managerId && (
          <SalesLeadLimitConfirmModel
            anticipatedDispatchCount={numDeliver}
            visible={visible}
            setVisible={setVisible}
            setCurrentStep={setCurrentStep}
            onConfirm={handleOnNext}
            confirmationData={managerWithMemberCountData}
          />
        )}
      </div>
      <Box className="container mt-4">
        <Flex alignItems="center" justifyContent="space-between">
          <Text>{formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.previewResult, { limit })}</Text>
          <MemberFieldFilter
            allColumns={allFieldColumns}
            visibleColumnIds={visibleColumnIds}
            setVisibleColumnIds={setVisibleColumnIds}
          />
        </Flex>
        <AdminCard className="mb-5 mt-2">
          <MemberCollectionTableBlock
            visibleColumnIds={visibleColumnIds}
            loadingMembers={loadingLeadCandidates || !members}
            currentMembers={members}
            limit={limit}
            properties={properties}
            visibleShowMoreButton={false}
            visibleColumnSearchProps={false}
            extraColumns={extraColumns}
          />
        </AdminCard>
      </Box>
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

const UpdateLeadManager = gql`
  mutation UpdateLeadManager($memberIds: [String!]!, $updated: member_set_input) {
    update_member(where: { id: { _in: $memberIds } }, _set: $updated) {
      affected_rows
    }
  }
`

const GetLeadCandidates = gql`
  query GetLeadCandidates($condition: member_bool_exp, $limit: Int) {
    member(where: $condition, limit: $limit, order_by: { created_at: desc }) {
      id
      picture_url
      name
      email
      role
      created_at
      username
      logined_at
      manager_id
      star
      closed_at
      completed_at
      recycled_at
      last_member_note_called
      last_member_note_answered
    }
  }
`

const GetLeadCandidatesCount = gql`
  query GetLeadCandidatesCount($condition: member_bool_exp) {
    member_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
  }
`
export default SalesLeadDeliveryPage
