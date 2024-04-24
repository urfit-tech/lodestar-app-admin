import { PlusOutlined } from '@ant-design/icons'
import { Button, Skeleton, Space } from 'antd'
import React from 'react'
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

const ProgramPlanAdminBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()

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

        <MembershipPlanModal
          programId={program.id}
          renderTrigger={({ onOpen }) => (
            <OpenPlanModal title={formatMessage(commonMessages.ui.membershipPlan)} onOpen={onOpen} />
          )}
          onRefetch={onRefetch}
        />
      </Space>

      <div className="row">
        {program.plans.map(programPlan => (
          <div className="col-12 col-sm-6 col-lg-4 mb-3" key={programPlan.id}>
            <ProgramSubscriptionPlanAdminCard programId={program.id} programPlan={programPlan} onRefetch={onRefetch} />
          </div>
        ))}
      </div>
    </>
  )
}

export default ProgramPlanAdminBlock
