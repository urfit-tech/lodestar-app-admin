import { EditOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Divider, Dropdown, Menu, message, Tag } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ProgramPlan, ProgramPlanPeriodType } from '../../types/program'
import { AdminBlock, AdminBlockTitle } from '../admin'
import AdminModal from '../admin/AdminModal'
import CountDownTimeBlock from '../common/CountDownTimeBlock'
import PriceLabel from '../common/PriceLabel'
import ProductSkuModal from '../common/ProductSkuModal'
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
  programPlan: ProgramPlan
  onRefetch?: () => void
}> = ({ programId, programPlan, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { salePrice, listPrice, discountDownPrice, periodType, periodAmount, currencyId } = programPlan
  const { loadingEnrollmentCount, enrollmentCount } = useProgramPlanEnrollmentCount(programPlan.id)

  const [setProgramPlanPrimary] = useMutation<
    hasura.UPDATE_PROGRAM_PLAN_PRIMARY,
    hasura.UPDATE_PROGRAM_PLAN_PRIMARYVariables
  >(UPDATE_PROGRAM_PLAN_PRIMARY)

  const [archiveProgramPlan] = useMutation<hasura.DELETE_PROGRAM_PLAN, hasura.DELETE_PROGRAM_PLANVariables>(
    DELETE_PROGRAM_PLAN,
  )

  const isOnSale = (programPlan.soldAt?.getTime() || 0) > Date.now()
  const description = programPlan.description?.trim() || ''
  const programPlanType = programPlan.autoRenewed
    ? 'subscription'
    : programPlan.periodAmount && programPlan.periodType
    ? 'period'
    : 'perpetual'

  const handleSetProgramPlanPrimary = () => {
    setProgramPlanPrimary({ variables: { programId: programId, programPlanId: programPlan.id } }).then(() => {
      message.success(formatMessage(commonMessages.event.successfullySaved))
      onRefetch?.()
    })
  }
  const handleArchiveProgramPlan = () => {
    archiveProgramPlan({ variables: { programPlanId: programPlan.id } }).then(() => {
      message.success(formatMessage(commonMessages.event.successfullyDeleted))
      onRefetch?.()
    })
  }

  return (
    <AdminBlock>
      <AdminBlockTitle className="mb-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center h-100">
          <Tag className="mr-2">
            {programPlanType === 'subscription'
              ? formatMessage(commonMessages.ui.subscriptionPlan)
              : programPlanType === 'period'
              ? formatMessage(commonMessages.ui.periodPlan)
              : formatMessage(commonMessages.ui.perpetualPlan)}
          </Tag>
          {programPlan.title}
        </div>
        <div>
          <ProgramPlanAdminModal
            onRefetch={onRefetch}
            programId={programId}
            programPlan={programPlan}
            renderTrigger={({ onOpen }) => (
              <EditOutlined
                className="mr-3"
                onClick={() =>
                  onOpen?.(
                    programPlan.periodAmount && programPlan.periodType
                      ? programPlan.autoRenewed
                        ? 'subscription'
                        : 'period'
                      : 'perpetual',
                  )
                }
              />
            )}
          />
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => handleSetProgramPlanPrimary()}>
                  {formatMessage(commonMessages.label.setPrimaryPlan)}
                </Menu.Item>
                <Menu.Item>
                  <AdminModal
                    title={''}
                    renderTrigger={({ setVisible }) => (
                      <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.label.removePlan)}</span>
                    )}
                    okText={formatMessage(commonMessages.ui.delete)}
                    okButtonProps={{ danger: true }}
                    cancelText={formatMessage(commonMessages.ui.back)}
                    onOk={() => handleArchiveProgramPlan()}
                  >
                    <div>{formatMessage(programMessages.text.deleteProgramPlanConfirmation)}</div>
                  </AdminModal>
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      </AdminBlockTitle>
      <PriceLabel
        listPrice={listPrice}
        salePrice={isOnSale ? salePrice : undefined}
        downPrice={discountDownPrice || undefined}
        periodAmount={periodAmount || 1}
        periodType={periodType as ProgramPlanPeriodType}
        currencyId={currencyId}
      />
      {programPlan.isCountdownTimerVisible && programPlan?.soldAt && isOnSale && (
        <StyledCountDownBlock>
          <CountDownTimeBlock expiredAt={programPlan?.soldAt} icon />
        </StyledCountDownBlock>
      )}
      <Divider />

      {description.length && (
        <div className="mb-3">
          <BraftContent>{description}</BraftContent>
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          {!loadingEnrollmentCount && formatMessage(messages.subscriptionCount, { count: `${enrollmentCount}` })}
        </div>
        {enabledModules.sku && (
          <ProductSkuModal
            productId={`ProgramPlan_${programPlan.id}`}
            renderTrigger={({ onOpen, sku }) => (
              <Button type="link" onClick={() => onOpen?.()}>
                {sku
                  ? `${formatMessage(commonMessages.label.sku)}: ${sku}`
                  : formatMessage(commonMessages.label.skuSetting)}
              </Button>
            )}
          />
        )}
      </div>
    </AdminBlock>
  )
}

const useProgramPlanEnrollmentCount = (programPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT,
    hasura.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNTVariables
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

const UPDATE_PROGRAM_PLAN_PRIMARY = gql`
  mutation UPDATE_PROGRAM_PLAN_PRIMARY($programPlanId: uuid!, $programId: uuid!) {
    clearPrimary: update_program_plan(where: { program: { id: { _eq: $programId } } }, _set: { is_primary: false }) {
      affected_rows
    }
    setPrimary: update_program_plan(where: { id: { _eq: $programPlanId } }, _set: { is_primary: true }) {
      affected_rows
    }
  }
`
const DELETE_PROGRAM_PLAN = gql`
  mutation DELETE_PROGRAM_PLAN($programPlanId: uuid!) {
    update_program_plan(where: { id: { _eq: $programPlanId } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`
export default ProgramSubscriptionPlanAdminCard
