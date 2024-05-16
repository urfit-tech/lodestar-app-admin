import { Skeleton, Space } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { Fragment } from 'react'
import { useIntl } from 'react-intl'
import {
  MembershipPlanModal,
  PeriodPlanModal,
  PerpetualPlanModal,
  SubscriptionPlanModal,
} from '../../components/program/programPlanAdminModals'
import ProgramSubscriptionPlanAdminCard from '../../components/program/ProgramSubscriptionPlanAdminCard'
import { commonMessages } from '../../helpers/translation'
import { ProgramAdminProps } from '../../types/program'
import ModalTriggerButton from './ModalTriggerButton'

const ProgramPlanAdminBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
  renderTrigger?: React.FC<{
    onOpen?: () => void
    onClose?: () => void
  }>
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()

  if (!program) {
    return <Skeleton active />
  }

  return (
    <>
      <Space direction="horizontal" size="small">
        <PerpetualPlanModal
          programId={program.id}
          renderTrigger={({ onOpen }) => (
            <ModalTriggerButton title={formatMessage(commonMessages.ui.perpetualPlan)} onOpen={onOpen} />
          )}
          onRefetch={onRefetch}
        />

        <PeriodPlanModal
          programId={program.id}
          renderTrigger={({ onOpen }) => (
            <ModalTriggerButton title={formatMessage(commonMessages.ui.periodPlan)} onOpen={onOpen} />
          )}
          onRefetch={onRefetch}
        />

        <SubscriptionPlanModal
          programId={program.id}
          renderTrigger={({ onOpen }) => (
            <ModalTriggerButton title={formatMessage(commonMessages.ui.subscriptionPlan)} onOpen={onOpen} />
          )}
          onRefetch={onRefetch}
        />

        {enabledModules.membership_card && (
          <MembershipPlanModal
            programId={program.id}
            renderTrigger={({ onOpen }) => (
              <ModalTriggerButton title={formatMessage(commonMessages.ui.membershipPlan)} onOpen={onOpen} />
            )}
            onRefetch={onRefetch}
          />
        )}
      </Space>

      <div className="row">
        {program.plans.map(programPlan => (
          <Fragment key={programPlan.id}>
            {!enabledModules.membership_card && programPlan.cardId ? null : (
              <div className="col-12 col-sm-6 col-lg-4 mb-3" key={programPlan.id}>
                <ProgramSubscriptionPlanAdminCard
                  programId={program.id}
                  programPlan={programPlan}
                  onRefetch={onRefetch}
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </>
  )
}

export default ProgramPlanAdminBlock
