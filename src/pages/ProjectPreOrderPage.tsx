import Icon from '@ant-design/icons'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import ProjectCollectionTabs from '../components/project/ProjectCollectionTabs'
import { commonMessages, projectMessages } from '../helpers/translation'
import { useProject } from '../hooks/project'
import { ReactComponent as ProjectIcon } from '../images/icon/project.svg'

const ProjectPreOrderPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole } = useAuth()
  const { id: appId } = useApp()
  const { insertProject } = useProject()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ProjectIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.projectPreOrder)}</span>
      </AdminPageTitle>
      {currentMemberId && (
        <div className="row mb-5">
          <div className="col-8">
            <ProductCreationModal
              allowedPermission={'PROJECT_PRE_ORDER_ADMIN'}
              withCreatorSelector={currentUserRole === 'app-owner'}
              creatorAppellation={formatMessage(projectMessages.label.sponsor)}
              customTitle={formatMessage(projectMessages.label.projectTitle)}
              customTitleDefault={formatMessage(projectMessages.label.unnamedProject)}
              onCreate={({ title, creatorId }) =>
                insertProject({
                  variables: {
                    appId,
                    title,
                    memberId: creatorId || currentMemberId,
                    type: 'pre-order',
                  },
                })
                  .then(({ data }) => {
                    const projectId = data?.insert_project?.returning[0]?.id
                    projectId && history.push(`/projects/${projectId}`)
                  })
                  .catch(err => process.env.NODE_ENV === 'development' && console.error(err))
              }
            />
          </div>
        </div>
      )}
      <ProjectCollectionTabs projectType="pre-order" />
    </AdminLayout>
  )
}

export default ProjectPreOrderPage
