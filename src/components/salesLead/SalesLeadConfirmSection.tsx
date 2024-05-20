import { Box, Flex, Text } from '@chakra-ui/react'
import { Button, Checkbox, Col, InputNumber, Row, Slider, Statistic } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { member_bool_exp } from '../../hasura'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useProperty } from '../../hooks/member'
import { useGetManagerWithMemberCount, useSalesLeadCandidates } from '../../hooks/sales'
import { salesLeadDeliveryPageMessages } from '../../pages/SalesLeadDeliveryPage/translation'
import { Filter, Property } from '../../types/sales'
import AdminCard from '../admin/AdminCard'
import ManagerInput from '../common/ManagerInput'
import { MemberFieldFilter } from '../memberCollection/MemberCollectionControlPanel'
import MemberCollectionTableBlock from '../memberCollection/MemberCollectionTableBlock'
import SalesLeadLimitConfirmModel from './SalesLeadLimitConfirmModel'

const extraColumn = (formatMessage: (message: { id: string; defaultMessage: string }) => string) => {
  return [
    {
      title: formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.starRange),
      dataIndex: 'star',
      key: 'star',
    },
    {
      title: formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastCalledRange),
      dataIndex: 'lastMemberNoteCalled',
      key: 'lastMemberNoteCalled',
    },
    {
      title: formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastAnsweredRange),
      dataIndex: 'lastMemberNoteAnswered',
      key: 'lastMemberNoteAnswered',
    },
    {
      title: formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead),
      dataIndex: 'completedAt',
      key: 'completedAt',
    },
    {
      title: formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedLead),
      dataIndex: 'closedAt',
      key: 'closedAt',
    },
    {
      title: formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.recycledLead),
      dataIndex: 'recycledAt',
      key: 'recycledAt',
    },
  ]
}

const SalesLeadConfirmSection: React.FC<{
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
  const propertyColumn = JSON.parse(settings['sales_lead_delivery_page.confirm_section.default_member_property_column'])
  const propertyColumnIds = propertyColumn
    .map((columnName: string) => properties.find(property => columnName === property.name))
    .map((property: Property) => property.id)
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
  const { leadCandidatesCondition, leadCandidatesCounts, members, loadingLeadCandidates } = useSalesLeadCandidates({
    filter,
    properties,
    limit,
  })
  const extraColumns = extraColumn(formatMessage)

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
          loading={loadingLeadCandidates}
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

export default SalesLeadConfirmSection
