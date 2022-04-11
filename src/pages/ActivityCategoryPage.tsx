import { BookOutlined } from '@ant-design/icons'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CategoryAdminCard from '../components/admin/CategoryAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'

const ActivityCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()

  if (!enabledModules.activity || !permissions.ACTIVITY_CATEGORY_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BookOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.activityCategory)}</span>
      </AdminPageTitle>

      <CategoryAdminCard classType="activity" />
    </AdminLayout>
  )
}

export default ActivityCategoryPage
