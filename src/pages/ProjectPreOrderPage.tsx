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
import { commonMessages } from '../helpers/translation'
import { useProject } from '../hooks/project'
import { ReactComponent as ProjectIcon } from '../images/icon/project.svg'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

const ProjectPreOrderPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole, permissions } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const { insertProject } = useProject()

  if (
    !enabledModules.project ||
    !(
      Boolean(permissions.PROJECT_ADMIN) ||
      Boolean(permissions.PROJECT_PRE_ORDER_ADMIN) ||
      Boolean(permissions.PROJECT_NORMAL) ||
      Boolean(permissions.PROJECT_PRE_ORDER_NORMAL)
    )
  ) {
    return <ForbiddenPage />
  }

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
              allowedPermissions={['PROJECT_PRE_ORDER_ADMIN']}
              withCreatorSelector={currentUserRole === 'app-owner'}
              creatorAppellation={formatMessage(pageMessages.ProjectPreOrderPage.sponsor)}
              customTitle={formatMessage(pageMessages.ProjectPreOrderPage.projectTitle)}
              customTitleDefault={formatMessage(pageMessages.ProjectPreOrderPage.unnamedProject)}
              categoryClassType="project"
              onCreate={({ title, creatorId, categoryIds }) =>
                insertProject({
                  variables: {
                    appId,
                    title,
                    memberId: creatorId || currentMemberId,
                    type: 'pre-order',
                    projectCategories:
                      categoryIds?.map((categoryId: string, index: number) => ({
                        category_id: categoryId,
                        position: index,
                      })) || [],
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
