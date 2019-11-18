import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import ProjectPlanCollectionBlockComponent, {
  ProjectPlanBlockProps,
} from '../../components/project/ProjectPlanCollectionBlock'
import types from '../../types'

const ProjectPlanCollectionBlock: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { loading, error, data } = useQuery<
    types.GET_ENROLLED_PROEJCT_PLANS,
    types.GET_ENROLLED_PROEJCT_PLANSVariables
  >(GET_ENROLLED_PROEJCT_PLANS, { variables: { memberId } })

  const projectPlans: ProjectPlanBlockProps[] =
    loading || error || !data
      ? []
      : data.project_plan_enrollment
          .map(projectPlan =>
            projectPlan.project_plan
              ? {
                  id: projectPlan.project_plan.id,
                  title: projectPlan.project_plan.title,
                  description: projectPlan.project_plan.description,
                  project: {
                    id: projectPlan.project_plan.project.id,
                    title: projectPlan.project_plan.project.title,
                    expiredAt: new Date(projectPlan.project_plan.project.expired_at),
                  },
                }
              : null,
          )
          .flat()

  return <ProjectPlanCollectionBlockComponent projectPlans={projectPlans} />
}

const GET_ENROLLED_PROEJCT_PLANS = gql`
  query GET_ENROLLED_PROEJCT_PLANS($memberId: String!) {
    project_plan_enrollment(where: { member_id: { _eq: $memberId } }) {
      project_plan {
        id
        title
        description
        project {
          id
          title
          expired_at
        }
      }
    }
  }
`

export default ProjectPlanCollectionBlock
