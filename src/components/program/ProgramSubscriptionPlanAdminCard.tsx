import { MoreOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Divider, Dropdown, Menu } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPlanPeriodType, ProgramPlanProps } from '../../types/program'
import { AdminBlock, AdminBlockTitle } from '../admin'
import CountDownTimeBlock from '../common/CountDownTimeBlock'
import PriceLabel from '../common/PriceLabel'
import { BraftContent } from '../common/StyledBraftEditor'
import ProgramPlanAdminModal from './ProgramPlanAdminModal'

const messages = defineMessages({
  subscriptionCount: { id: 'program.text.subscriptionCount', defaultMessage: '{count} 人' },
})
const StyledCountDownBlock = styled.div`
  margin-top: 20px;
`
const ProgramSubscriptionPlanAdminCard: React.FC<{
  programId: string
  programPlan: ProgramPlanProps
  onRefetch?: () => void
}> = ({ programId, programPlan, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { salePrice, listPrice, discountDownPrice, periodType } = programPlan
  const { loadingEnrollmentCount, enrollmentCount } = useProgramPlanEnrollmentCount(programPlan.id)

  const isOnSale = (programPlan.soldAt?.getTime() || 0) > Date.now()
  return (
    <AdminBlock>
      <AdminBlockTitle className="mb-3">{programPlan.title}</AdminBlockTitle>
      <PriceLabel
        listPrice={listPrice}
        salePrice={isOnSale ? salePrice : undefined}
        downPrice={discountDownPrice || undefined}
        periodAmount={1}
        periodType={periodType as ProgramPlanPeriodType}
      />
      {programPlan?.soldAt && isOnSale && (
        <StyledCountDownBlock>
          <CountDownTimeBlock expiredAt={programPlan?.soldAt} icon />
        </StyledCountDownBlock>
      )}
      <Divider />

      <div className="mb-3">
        <BraftContent>{programPlan.description}</BraftContent>
      </div>

      <div className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          {!loadingEnrollmentCount && formatMessage(messages.subscriptionCount, { count: `${enrollmentCount}` })}
        </div>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item>
                <ProgramPlanAdminModal
                  onRefetch={onRefetch}
                  programId={programId}
                  programPlan={programPlan}
                  renderTrigger={({ setVisible }) => (
                    <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                  )}
                />
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOutlined style={{ fontSize: '24px' }} />
        </Dropdown>
      </div>
    </AdminBlock>
  )
}

const useProgramPlanEnrollmentCount = (programPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT,
    types.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNTVariables
  >(
    gql`
      query GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT($programPlanId: uuid!) {
        program_plan_enrollment_aggregate(where: { program_plan_id: { _eq: $programPlanId } }) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { programPlanId } },
  )

  const enrollmentCount = data?.program_plan_enrollment_aggregate.aggregate?.count || 0

  return {
    loadingEnrollmentCount: loading,
    errorEnrollmentCount: error,
    enrollmentCount,
    refetchEnrollmentCount: refetch,
  }
}

export default ProgramSubscriptionPlanAdminCard
