import { FileAddOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { ProjectAdminProps } from '../../types/project'
import ProjectPlanAdminModal from './ProjectPlanAminModal'

const ProjectPlanAdminBlock: React.FC<{
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, onRefetch }) => {
  const { formatMessage } = useIntl()

  if (!project) {
    return <Skeleton active />
  }
  console.log(project)
  return (
    <>
      <ProjectPlanAdminModal
        projectId={project.id}
        renderTrigger={({ setVisible }) => (
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-5">
            {formatMessage(commonMessages.ui.createPlan)}
          </Button>
        )}
        onRefetch={onRefetch}
      />

      <div className="row"></div>
    </>
  )
}

export default ProjectPlanAdminBlock
