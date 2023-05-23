import Icon, { SwapOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Text } from '@chakra-ui/react'
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
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
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import CategoryInput from '../../components/common/CategoryInput'
import ManagerInput from '../../components/common/ManagerInput'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import { useProperty } from '../../hooks/member'
import { salesLeadDeliveryPageMessages } from './translation'

type Filter = {
  [key: string]: any
  categoryIds: string[]
  createdAtRange: [Date, Date] | null
  lastCalledRange: [Date, Date] | null
  lastAnsweredRange: [Date, Date] | null
  managerId?: string
  starRange: [number, number]
  starRangeIsNull: boolean
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
  const [starRangeIsNull, setStarRangeIsNull] = useState(false)
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
      onFinish={values => onNext?.({ ...values, starRange })}
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
      {!currentMemberId || loadingProperties ? (
        <Spin />
      ) : (
        properties.map(property => (
          <PropertiesItem label={property.name}>
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
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.createdAtRange)}
        name="createdAtRange"
      >
        <DatePicker.RangePicker allowClear />
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastCalledRange)}
        name="lastCalledRange"
      >
        <DatePicker.RangePicker allowClear />
      </Form.Item>
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastAnsweredRange)}
        name="lastAnsweredRange"
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
  const { properties } = useProperty()

  const { data: leadCandidatesData, loading: isLeadCandidatesLoading } = useQuery<
    hasura.GET_LEAD_CANDIDATES,
    hasura.GET_LEAD_CANDIDATESVariables
  >(
    gql`
      query GET_LEAD_CANDIDATES($condition: member_bool_exp) {
        member_phone(where: { _and: [{ phone: { _neq: "" } }, { member: $condition }] }, distinct_on: [member_id]) {
          member_id
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
          last_member_note_called: filter.lastCalledRange
            ? {
                _gte: moment(filter.lastCalledRange[0]).startOf('day'),
                _lte: moment(filter.lastCalledRange[1]).endOf('day'),
              }
            : undefined,
          last_member_note_answered: filter.lastAnsweredRange
            ? {
                _gte: moment(filter.lastAnsweredRange[0]).startOf('day'),
                _lte: moment(filter.lastAnsweredRange[1]).endOf('day'),
              }
            : undefined,
          _and: properties.map(property => {
            return {
              member_properties: !isEmpty(filter[property.name])
                ? {
                    property: { name: { _eq: property.name } },
                    value: filter[`is${property.name}ExactMatch`]
                      ? { _eq: `${filter[property.name]}` }
                      : { _like: `%${filter[property.name]}%` },
                  }
                : undefined,
            }
          }),
        },
      },
    },
  )

  const filteredMemberIds = useMemo(() => {
    const memberIds = leadCandidatesData?.member_phone.map(v => v.member_id) || []
    return memberIds
  }, [leadCandidatesData?.member_phone])

  const isLoading = isLeadCandidatesLoading

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
          <ManagerInput value={managerId} onChange={setManagerId} />
        </div>
        {!isLoading && (
          <Row className="mb-2">
            <Col span={6}>
              <InputNumber value={numDeliver} onChange={v => v && setNumDeliver(+v)} max={filteredMemberIds.length} />
            </Col>
            <Col span={18}>
              <Slider value={numDeliver} onChange={setNumDeliver} max={filteredMemberIds.length} />
            </Col>
          </Row>
        )}
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
