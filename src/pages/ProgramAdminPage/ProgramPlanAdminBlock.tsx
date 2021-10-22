import { PlusOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import ProgramGroupBuyingAdminForm from '../../components/program/ProgramGroupBuyingAdminForm'
import ProgramPerpetualPlanAdminCard from '../../components/program/ProgramPerpetualPlanAdminCard'
import ProgramPlanAdminModal from '../../components/program/ProgramPlanAdminModal'
import ProgramSubscriptionPlanAdminCard from '../../components/program/ProgramSubscriptionPlanAdminCard'
import { commonMessages } from '../../helpers/translation'
import { ProgramAdminProps } from '../../types/program'

const ProgramPlanAdminBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()

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
              {formatMessage(commonMessages.ui.createPlan)}
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
    <>
      <AdminBlock>
        <AdminBlockTitle>售價設定</AdminBlockTitle>
        <ProgramPerpetualPlanAdminCard program={program} onRefetch={onRefetch} />
      </AdminBlock>
      {enabledModules['group_buying'] && (
        <AdminBlock>
          <AdminBlockTitle>多人方案</AdminBlockTitle>
          <ProgramGroupBuyingAdminForm program={program} onRefetch={onRefetch} />
        </AdminBlock>
      )}
    </>
  )
}

export default ProgramPlanAdminBlock
