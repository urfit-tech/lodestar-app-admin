import { PlusOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { ProgramAdminProps } from '../../types/program'
import { AdminBlock } from '../admin'
import ProgramPerpetualPlanAdminCard from './ProgramPerpetualPlanAdminCard'
import ProgramPlanAdminModal from './ProgramPlanAdminModal'
import ProgramSubscriptionPlanAdminCard from './ProgramSubscriptionPlanAdminCard'

const messages = defineMessages({
  createPlan: { id: 'program.ui.createPlan', defaultMessage: '建立方案' },
})

const ProgramPlanAdminBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()

  if (!program) {
    return <Skeleton active />
  }

  if (program.isSubscription) {
    return (
      <>
        <ProgramPlanAdminModal
          programId={program.id}
          renderTrigger={({ setVisible }) => (
            <Button icon={<PlusOutlined />} type="primary" className="mb-4" onClick={() => setVisible(true)}>
              {formatMessage(messages.createPlan)}
            </Button>
          )}
          onRefetch={onRefetch}
        />

        {program.plans.map(programPlan => (
          <div className="mb-3" key={programPlan.id}>
            <ProgramSubscriptionPlanAdminCard programId={program.id} programPlan={programPlan} onRefetch={onRefetch} />
          </div>
        ))}
      </>
    )
  }

  return (
    <AdminBlock>
      <ProgramPerpetualPlanAdminCard program={program} onRefetch={onRefetch} />
    </AdminBlock>
  )
}

export default ProgramPlanAdminBlock
