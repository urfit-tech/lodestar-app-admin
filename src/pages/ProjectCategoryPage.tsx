import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CategoryAdminCard from '../components/admin/CategoryAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import { ProjectIcon } from '../images/icon'
import ForbiddenPage from './ForbiddenPage'

const ProjectCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()
  const { enabledModules } = useApp()

  if (!enabledModules.project || !permissions.PROJECT_CATEGORY_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <ProjectIcon className="mr-3" />
        <span>{formatMessage(commonMessages.menu.projectCategory)}</span>
      </AdminPageTitle>

      <CategoryAdminCard classType="project" />
    </AdminLayout>
  )
}

export default ProjectCategoryPage
