import { PlusOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ProjectAdminProps, ProjectPlanSortProps } from '../../types/project'
import ItemsSortingModal from '../common/ItemsSortingModal'
import ProjectPlanAdminModal from './ProjectPlanAdminModal'
import ProjectPlanCard from './ProjectPlanCard'
import projectMessages from './translation'

const ProjectPlanAdminBlock: React.FC<{
  projectId: string
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ projectId, project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updatePositions] = useMutation<
    hasura.UPDATE_PROJECT_PLAN_POSITION_COLLECTION,
    hasura.UPDATE_PROJECT_PLAN_POSITION_COLLECTIONVariables
  >(UPDATE_PROJECT_PLAN_POSITION_COLLECTION)

  const { projectPlanSorts, refetchProjectPlanSorts } = useProjectPlanSortCollection(projectId)

  if (!project) {
    return <Skeleton active />
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <ProjectPlanAdminModal
          projectId={project.id}
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
            </div>
          )}
          onRefetch={onRefetch}
        />
        <ItemsSortingModal
          items={projectPlanSorts}
          triggerText={formatMessage(projectMessages['*'].sortProjectPlan)}
          onSubmit={values =>
            updatePositions({
              variables: {
                data: values.map((value, index) => ({
                  id: value.id,
                  project_id: value.projectId,
                  title: value.title || '',
                  position: index,
                })),
              },
            })
              .then(() => {
                refetchProjectPlanSorts()
                onRefetch?.()
              })
              .catch(handleError)
          }
        />
      </div>
      <div className="row">
        {project.projectPlan.map(projectPlan => (
          <div key={projectPlan.id} className="col-12 col-md-6 col-lg-4 mb-5">
            <ProjectPlanCard projectPlan={projectPlan} projectId={project.id} onRefetch={onRefetch} />
          </div>
        ))}
      </div>
    </>
  )
}

const useProjectPlanSortCollection = (projectId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROJECT_PLAN_SORT_COLLECTION,
    hasura.GET_PROJECT_PLAN_SORT_COLLECTIONVariables
  >(
    gql`
      query GET_PROJECT_PLAN_SORT_COLLECTION($projectId: uuid) {
        project_plan(where: { project_id: { _eq: $projectId } }, order_by: { position: asc }) {
          id
          project_id
          title
        }
      }
    `,
    {
      variables: {
        projectId,
      },
    },
  )
  const projectPlanSorts: ProjectPlanSortProps[] =
    data?.project_plan.map(v => ({
      id: v.id,
      projectId: v.project_id,
      title: v.title || '',
    })) || []
  return {
    loadingProjectPlanSorts: loading,
    errorProjectPlanSorts: error,
    projectPlanSorts,
    refetchProjectPlanSorts: refetch,
  }
}

const UPDATE_PROJECT_PLAN_POSITION_COLLECTION = gql`
  mutation UPDATE_PROJECT_PLAN_POSITION_COLLECTION($data: [project_plan_insert_input!]!) {
    insert_project_plan(objects: $data, on_conflict: { constraint: project_plan_pkey, update_columns: position }) {
      affected_rows
    }
  }
`
export default ProjectPlanAdminBlock
