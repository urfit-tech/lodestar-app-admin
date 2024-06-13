import { Skeleton, Space } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { Fragment } from 'react'
import { useIntl } from 'react-intl'
import ItemsSortingModal from '../../components/common/ItemsSortingModal'
import {
  MembershipPlanModal,
  PeriodPlanModal,
  PerpetualPlanModal,
  SubscriptionPlanModal,
} from '../../components/program/programPlanAdminModals'
import ProgramSubscriptionPlanAdminCard from '../../components/program/ProgramSubscriptionPlanAdminCard'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useProgramPlanSortCollection, useUpdateProgramPlanSortCollection } from '../../hooks/program'
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
  const { programPlanSorts, refetchProgramPlanSorts } = useProgramPlanSortCollection(program?.id || '')
  const { updatePositions } = useUpdateProgramPlanSortCollection()
  const { currentUserRole } = useAuth()

  const hasMembershipCardPermission = enabledModules.membership_card && currentUserRole === 'app-owner'

  if (!program) {
    return <Skeleton active />
  }

  return (
    <>
      <div className="d-flex justify-content-between">
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

          {hasMembershipCardPermission && (
            <MembershipPlanModal
              programId={program.id}
              renderTrigger={({ onOpen }) => (
                <ModalTriggerButton title={formatMessage(commonMessages.ui.membershipPlan)} onOpen={onOpen} />
              )}
              onRefetch={onRefetch}
            />
          )}
        </Space>

        <ItemsSortingModal
          items={programPlanSorts}
          triggerText={formatMessage(programMessages['*'].sortProgramPlan)}
          onSubmit={values =>
            updatePositions({
              variables: {
                data: values.map((value, index) => ({
                  id: value.id,
                  program_id: value.programId,
                  list_price: value.listPrice,
                  title: value.title || '',
                  position: index,
                })),
              },
            })
              .then(() => {
                refetchProgramPlanSorts()
                onRefetch?.()
              })
              .catch(handleError)
          }
        />
      </div>

      <div className="row">
        {program.plans.map(programPlan => (
          <Fragment key={programPlan.id}>
            <div className="col-12 col-sm-6 col-lg-4 mb-3" key={programPlan.id}>
              <ProgramSubscriptionPlanAdminCard
                programId={program.id}
                programPlan={programPlan}
                onRefetch={onRefetch}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}

export default ProgramPlanAdminBlock
