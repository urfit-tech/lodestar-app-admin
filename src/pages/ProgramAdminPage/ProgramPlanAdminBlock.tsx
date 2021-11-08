import { PlusOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
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
  const { enabledModules } = useApp()

  if (!program) {
    return <Skeleton active />
  }

  return (
    <>
      <ProgramPlanAdminModal
        programId={program.id}
        renderTrigger={({ onPlanCreate }) => (
          <div className="d-flex mb-4">
            <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onPlanCreate?.('perpetual')}>
              {formatMessage(commonMessages.ui.perpetualPlan)}
            </Button>
            <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onPlanCreate?.('period')}>
              {formatMessage(commonMessages.ui.periodPlan)}
            </Button>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              className="mr-2"
              onClick={() => onPlanCreate?.('subscription')}
            >
              {formatMessage(commonMessages.ui.subscriptionPlan)}
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

  // return (
  //   <>
  //     <AdminBlock>
  //       <AdminBlockTitle>售價設定</AdminBlockTitle>
  //       <ProgramPerpetualPlanAdminCard program={program} onRefetch={onRefetch} />
  //     </AdminBlock>
  //     {enabledModules['group_buying'] && (
  //       <AdminBlock>
  //         <AdminBlockTitle>多人方案</AdminBlockTitle>
  //         <ProgramGroupBuyingAdminForm program={program} onRefetch={onRefetch} />
  //       </AdminBlock>
  //     )}
  //   </>
  // )
}

export default ProgramPlanAdminBlock
