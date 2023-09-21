import { GlobalOutlined } from '@ant-design/icons'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'
import ForbiddenPage from '../ForbiddenPage'
import AppBasicAdminCard from './AppBasicAdminCard'
import AppHostAdminCard from './AppHostAdminCard'
import AppNavAdminCard from './AppNavAdminCard'

const AppBasicAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  if (!permissions.APP_BASIC_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <GlobalOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appBasicAdmin)}</span>
      </AdminPageTitle>
      <AppBasicAdminCard className="mb-3" />
      <AppHostAdminCard className="mb-3" title="App Hosts" />
      <AppNavAdminCard className="mb-3" title={formatMessage(commonMessages.menu.navSettings)} />
    </AdminLayout>
  )
}

export default AppBasicAdminPage
