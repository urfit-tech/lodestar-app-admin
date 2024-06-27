import { UserOutlined } from '@ant-design/icons'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import MemberTaskAdminBlock from '../components/task/MemberTaskAdminBlock'
import { commonMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'

const TaskCollectionPage: React.FC = () => {
  const localStorageMemberTaskDisplay = localStorage.getItem('memberTaskDisplay') || undefined
  const localStorageMemberTaskFilter = JSON.parse(localStorage.getItem('memberTaskFilter') || 'null')

  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  if (!permissions.TASK_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.tasks)}</span>
      </AdminPageTitle>

      <MemberTaskAdminBlock
        localStorageMemberTaskDisplay={localStorageMemberTaskDisplay}
        localStorageMemberTaskFilter={localStorageMemberTaskFilter}
      />
    </AdminLayout>
  )
}

export default TaskCollectionPage
