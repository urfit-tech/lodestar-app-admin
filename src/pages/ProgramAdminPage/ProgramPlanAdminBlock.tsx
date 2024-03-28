import { PlusOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import ProgramPlanAdminModal from '../../components/program/ProgramPlanAdminModal'
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

  return (
    <>
      <ProgramPlanAdminModal
        programId={program.id}
        renderTrigger={({ onOpen }) => (
          <div className="d-flex mb-4">
            <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onOpen?.('perpetual')}>
              {formatMessage(commonMessages.ui.perpetualPlan)}
            </Button>
            <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onOpen?.('period')}>
              {formatMessage(commonMessages.ui.periodPlan)}
            </Button>
            <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onOpen?.('subscription')}>
              {formatMessage(commonMessages.ui.subscriptionPlan)}
            </Button>
            <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onOpen?.('membership')}>
              {formatMessage(commonMessages.ui.membershipPlan)}
            </Button>
          </div>
        )}
        onRefetch={onRefetch}
      />
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
