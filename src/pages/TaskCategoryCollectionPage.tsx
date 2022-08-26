import { BookOutlined } from '@ant-design/icons'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CategoryAdminCard from '../components/admin/CategoryAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'

const TaskCategoryCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  if (!permissions.TASK_CATEGORY_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BookOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.taskCategory)}</span>
      </AdminPageTitle>

      <CategoryAdminCard classType="task" />
    </AdminLayout>
  )
}

export default TaskCategoryCollectionPage
