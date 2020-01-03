import React from 'react'
import { InferType } from 'yup'
import { useAuth } from '../../contexts/AuthContext'
import { programSchema } from '../../schemas/program'
import ProgramSubscriptionPlanCard from './ProgramSubscriptionPlanCard'

const ProgramSubscriptionPlanSection: React.FC<{
  program: InferType<typeof programSchema>
}> = ({ program }) => {
  const { currentMemberId } = useAuth()
  return (
    <div id="subscription">
      {currentMemberId &&
        program.plans.map(programPlan => (
          <div key={programPlan.id} className="mb-3">
            <ProgramSubscriptionPlanCard memberId={currentMemberId} programId={program.id} programPlan={programPlan} />
          </div>
        ))}
    </div>
  )
}

export default ProgramSubscriptionPlanSection
