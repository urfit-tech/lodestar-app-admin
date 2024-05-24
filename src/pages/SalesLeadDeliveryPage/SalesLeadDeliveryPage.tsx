import Icon, { SwapOutlined } from '@ant-design/icons'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { Steps } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import SalesLeadConfirmSection from '../../components/salesLead/SalesLeadConfirmSection'
import SalesLeadFilterSection from '../../components/salesLead/SalesLeadFilterSection'
import SalesLeadResultSection from '../../components/salesLead/SalesLeadResultSection'
import hasura from '../../hasura'
import { GetLeadCandidates } from '../../hooks/sales'
import { AssignResult, Filter } from '../../types/sales'
import { salesLeadDeliveryPageMessages } from './translation'

const UpdateLeadManager = gql`
  mutation UpdateLeadManager($memberIds: [String!], $updated: member_set_input) {
    update_member(where: { id: { _in: $memberIds } }, _set: $updated) {
      affected_rows
    }
  }
`

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
        <SalesLeadFilterSection
          filter={filter}
          onNext={filter => {
            setFilter(filter)
            setCurrentStep(step => step + 1)
          }}
        />
      )}
      {currentStep === 1 && (
        <SalesLeadConfirmSection
          filter={filter}
          setCurrentStep={setCurrentStep}
          onNext={({ condition, limit, managerId, isClearClosedAt, isClearCompletedAt, isClearRecycledAt }) => {
            setAssignedResult({
              status: 'info',
            })
            getLeadManager({ variables: { condition, limit } })
              .then(({ data }) => {
                const memberIds = data?.member.map(m => m.id)
                updateLeadManager({
                  variables: {
                    memberIds,
                    updated: {
                      manager_id: managerId,
                      last_manager_assigned_at: new Date(),
                      completed_at: isClearCompletedAt ? null : undefined,
                      closed_at: isClearClosedAt ? null : undefined,
                      recycled_at: isClearRecycledAt ? null : undefined,
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
        <SalesLeadResultSection result={assignedResult} onBack={() => setCurrentStep(0)} />
      )}
    </AdminLayout>
  )
}

export default SalesLeadDeliveryPage
