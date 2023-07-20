import Icon from '@ant-design/icons'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import ProjectCollectionTabs from '../components/project/ProjectCollectionTabs'
import { commonMessages } from '../helpers/translation'
import { useIdentity } from '../hooks/identity'
import { useProject } from '../hooks/project'
import { ReactComponent as ProjectIcon } from '../images/icon/project.svg'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

const ProjectPortfolioPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, permissions } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const { insertProject, insertProjectRole } = useProject()
  const { getIdentity, insertMetaProjectAuthorIdentity } = useIdentity()
  const { identityId, identityListRefetch } = getIdentity('Project', 'author')

  if (
    !enabledModules.portfolio_project ||
    !(Boolean(permissions.PROJECT_PORTFOLIO_ADMIN) || Boolean(permissions.PROJECT_PORTFOLIO_NORMAL))
  ) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ProjectIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.projectPortfolio)}</span>
      </AdminPageTitle>
      {currentMemberId && (
        <div className="row mb-5">
          <div className="col-8">
            <ProductCreationModal
              allowedPermissions={['PROJECT_PORTFOLIO_ADMIN']}
              customModalTitle={formatMessage(pageMessages.ProjectPortfolioPage.createPortfolio)}
              customTitle={formatMessage(pageMessages.ProjectPortfolioPage.projectTitle)}
              customTitleDefault={formatMessage(pageMessages.ProjectPortfolioPage.untitledPortfolio)}
              categoryClassType="project"
              onCreate={({ title, categoryIds }) =>
                insertProject({
                  variables: {
                    appId,
                    title,
                    memberId: currentMemberId,
                    type: 'portfolio',
                    projectCategories:
                      categoryIds?.map((categoryId: string, index: number) => ({
                        category_id: categoryId,
                        position: index,
                      })) || [],
                  },
                })
                  .then(({ data }) => {
                    const projectId = data?.insert_project?.returning[0]?.id
                    if (!identityId) {
                      insertMetaProjectAuthorIdentity({ variables: { appId: appId, type: 'Project' } })
                        .then(res => {
                          identityListRefetch?.()
                          let insertedIdentityId = res.data?.insert_identity?.returning[0].id
                          insertProjectRole({
                            variables: {
                              projectId: projectId,
                              memberId: currentMemberId,
                              identityId: insertedIdentityId,
                              markedNotificationStatus: 'sended',
                            },
                          })
                            .then(() => {
                              projectId && history.push(`/projects/${projectId}`)
                            })
                            .catch(handleError)
                        })
                        .catch(handleError)
                    } else {
                      insertProjectRole({
                        variables: {
                          projectId: projectId,
                          memberId: currentMemberId,
                          identityId: identityId,
                          markedNotificationStatus: 'sended',
                        },
                      })
                        .then(() => projectId && history.push(`/projects/${projectId}`))
                        .catch(handleError)
                    }
                  })
                  .catch(err => process.env.NODE_ENV === 'development' && console.error(err))
              }
            />
          </div>
        </div>
      )}
      <ProjectCollectionTabs projectType="portfolio" />
    </AdminLayout>
  )
}

export default ProjectPortfolioPage
