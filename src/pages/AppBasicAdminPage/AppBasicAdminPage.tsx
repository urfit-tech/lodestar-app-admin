import { GlobalOutlined } from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'
import AppBasicAdminCard from './AppBasicAdminCard'
import AppHostAdminCard from './AppHostAdminCard'
import AppNavAdminCard from './AppNavAdminCard'

const AppBasicAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <GlobalOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appBasicAdmin)}</span>
      </AdminPageTitle>
      <AppBasicAdminCard className="mb-3"></AppBasicAdminCard>
      <AppHostAdminCard className="mb-3" title="App Hosts"></AppHostAdminCard>
      <AppNavAdminCard className="mb-3" title="App Navs"></AppNavAdminCard>
    </AdminLayout>
  )
}

export default AppBasicAdminPage
