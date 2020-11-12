import { GlobalOutlined } from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AppBasicCard from '../../components/app/AppBasicCard'
import AppSettingCard from '../../components/app/AppSettingCard'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'

const AppAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <GlobalOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appAdmin)}</span>
      </AdminPageTitle>

      <AppBasicCard appId={appId} title="基本資料" className="mb-3" />
      <AppSettingCard appId={appId} title="網站設定" className="mb-3" />
    </AdminLayout>
  )
}

export default AppAdminPage
