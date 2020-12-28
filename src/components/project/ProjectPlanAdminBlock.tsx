import { EditOutlined, FileAddOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, projectMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectAdminProps, ProjectPlanSortProps } from '../../types/project'
import { OverlayBlock, OverlayWrapper } from '../admin/PositionAdminLayout'
import ItemsSortingModal from '../common/ItemsSortingModal'
import ProjectPlanAdminModal from './ProjectPlanAminModal'
import ProjectPlanCard from './ProjectPlanCard'

const StyledButton = styled(Button)`
  && {
    background: none;
    border: 1px solid white;
    color: white;
  }
`

const ProjectPlanAdminBlock: React.FC<{
  projectId: string
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ projectId, project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updatePositions] = useMutation<
    types.UPDATE_PROJECT_PLAN_POSITION_COLLECTION,
    types.UPDATE_PROJECT_PLAN_POSITION_COLLECTIONVariables
  >(UPDATE_PROJECT_PLAN_POSITION_COLLECTION)

  const { projectPlanSorts, refetchProjectPlanSorts } = useProjectPlanSortCollection(projectId)

  if (!project) {
    return <Skeleton active />
  }

  return (
    <>
      <div className="d-flex justify-content-between" style={{ width: '100%' }}>
        <ProjectPlanAdminModal
          projectId={project.id}
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-5">
              {formatMessage(commonMessages.ui.createPlan)}
            </Button>
          )}
          onRefetch={onRefetch}
        />
        <ItemsSortingModal
          items={projectPlanSorts}
          triggerText={formatMessage(projectMessages.ui.sortProjectPlan)}
          onSubmit={values =>
            updatePositions({
              variables: {
                data: values.map((value, index) => ({
                  id: value.id,
                  project_id: value.projectId,
                  title: value.title,
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
            <OverlayWrapper>
              <ProjectPlanCard projectPlan={projectPlan} />
              <OverlayBlock>
                <div>
                  <ProjectPlanAdminModal
                    projectId={project.id}
                    projectPlan={projectPlan}
                    renderTrigger={({ setVisible }) => (
                      <StyledButton block icon={<EditOutlined />} onClick={() => setVisible(true)}>
                        {formatMessage(projectMessages.ui.editProject)}
                      </StyledButton>
                    )}
                    onRefetch={onRefetch}
                  />
                </div>
              </OverlayBlock>
            </OverlayWrapper>
          </div>
        ))}
      </div>
    </>
  )
}

const useProjectPlanSortCollection = (projectId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PROJECT_PLAN_SORT_COLLECTION,
    types.GET_PROJECT_PLAN_SORT_COLLECTIONVariables
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
      title: v.title,
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
