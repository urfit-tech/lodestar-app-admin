import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import RoleAdminCard from '../components/admin/RoleAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import { ProjectIcon } from '../images/icon'
import ForbiddenPage from './ForbiddenPage'

const ProjectRolePage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()
  const { enabledModules } = useApp()

  if (!enabledModules.project || !permissions.PROJECT_ROLE_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <ProjectIcon className="mr-3" />
        <span>{formatMessage(commonMessages.menu.roleManagement)}</span>
      </AdminPageTitle>

      <RoleAdminCard classType="Project" />
    </AdminLayout>
  )
}

export default ProjectRolePage
