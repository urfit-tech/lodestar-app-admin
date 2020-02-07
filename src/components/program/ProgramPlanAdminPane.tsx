import { Button, Spin, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { InferType } from 'yup'
import { commonMessages } from '../../helpers/translation'
import { programSchema } from '../../schemas/program'
import ProgramPerpetualPlanAdminCard from './ProgramPerpetualPlanAdminCard'
import ProgramPlanAdminModal from './ProgramPlanAdminModal'
import ProgramSubscriptionPlanAdminCard from './ProgramSubscriptionPlanAdminCard'

const messages = defineMessages({
  createPlan: { id: 'program.ui.createPlan', defaultMessage: '建立方案' },
})

type ProgramPlanAdminPaneProps = CardProps & {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramPlanAdminPane: React.FC<ProgramPlanAdminPaneProps> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()

  return (
    <div className="container py-3">
      <Typography.Title className="pb-3" level={3}>
        {formatMessage(commonMessages.label.salesPlan)}
      </Typography.Title>
      {program && program.isSubscription && (
        <ProgramPlanAdminModal
          onRefetch={onRefetch}
          programId={program.id}
          renderTrigger={({ setVisible }) => (
            <Button icon="plus" type="primary" className="mb-3" onClick={() => setVisible(true)}>
              {formatMessage(messages.createPlan)}
            </Button>
          )}
        />
      )}
      {!program ? (
        <Spin />
      ) : program.isSubscription ? (
        // for subscription
        program.plans.map(programPlan => {
          return (
            <div className="mb-3" key={programPlan.id}>
              <ProgramSubscriptionPlanAdminCard
                programId={program.id}
                programPlan={programPlan}
                isSubscription={program.isSubscription}
                onRefetch={onRefetch}
              />
            </div>
          )
        })
      ) : (
        // for perpetual
        <ProgramPerpetualPlanAdminCard program={program} onRefetch={onRefetch} />
      )}
    </div>
  )
}

export default ProgramPlanAdminPane
