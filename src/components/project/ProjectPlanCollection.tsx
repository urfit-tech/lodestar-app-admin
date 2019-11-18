import React from 'react'
import ProjectPlan, { ProjectPlanProps } from './ProjectPlan'

type ProjectPlanCollectionProps = {
  projectPlans: ProjectPlanProps[]
}
const ProjectPlanCollection: React.FC<ProjectPlanCollectionProps> = ({ projectPlans }) => {
  return (
    <>
      {projectPlans.map(projectPlan => (
        <div key={projectPlan.id} className="mb-4">
          <ProjectPlan {...projectPlan} />
        </div>
      ))}
    </>
  )
}

export default ProjectPlanCollection
