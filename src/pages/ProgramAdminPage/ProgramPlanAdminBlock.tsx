import { PlusOutlined } from '@ant-design/icons'
import { Button, Skeleton, Space } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
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

const ProgramPlanAdminBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { programPlanSorts, refetchProgramPlanSorts } = useProgramPlanSortCollection(program?.id || '')
  const { updatePositions } = useUpdateProgramPlanSortCollection()

  if (!program) {
    return <Skeleton active />
  }

  const OpenPlanModal: React.FC<{
    title: string
    onOpen?: () => void
    onClose?: () => void
  }> = ({ title, onOpen }) => {
    return (
      <div className="d-flex mb-4">
        <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onOpen?.()}>
          {title}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <Space direction="horizontal" size="small">
          <PerpetualPlanModal
            programId={program.id}
            renderTrigger={({ onOpen }) => (
              <OpenPlanModal title={formatMessage(commonMessages.ui.perpetualPlan)} onOpen={onOpen} />
            )}
            onRefetch={onRefetch}
          />

          <PeriodPlanModal
            programId={program.id}
            renderTrigger={({ onOpen }) => (
              <OpenPlanModal title={formatMessage(commonMessages.ui.periodPlan)} onOpen={onOpen} />
            )}
            onRefetch={onRefetch}
          />

          <SubscriptionPlanModal
            programId={program.id}
            renderTrigger={({ onOpen }) => (
              <OpenPlanModal title={formatMessage(commonMessages.ui.subscriptionPlan)} onOpen={onOpen} />
            )}
            onRefetch={onRefetch}
          />

          {enabledModules.membership_card && (
            <MembershipPlanModal
              programId={program.id}
              renderTrigger={({ onOpen }) => (
                <OpenPlanModal title={formatMessage(commonMessages.ui.membershipPlan)} onOpen={onOpen} />
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
          <>
            {!enabledModules.membership_card && programPlan.cardId ? null : (
              <div className="col-12 col-sm-6 col-lg-4 mb-3" key={programPlan.id}>
                <ProgramSubscriptionPlanAdminCard
                  programId={program.id}
                  programPlan={programPlan}
                  onRefetch={onRefetch}
                />
              </div>
            )}
          </>
        ))}
      </div>
    </>
  )
}

export default ProgramPlanAdminBlock
