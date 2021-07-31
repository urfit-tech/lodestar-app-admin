import { GlobalOutlined } from '@ant-design/icons'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import AppBasicCard from '../components/app/AppBasicCard'
import AdminLayout from '../components/layout/AdminLayout'
import { useApp } from '../contexts/AppContext'
import { commonMessages } from '../helpers/translation'

const AppBasicAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <GlobalOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appAdmin)}</span>
      </AdminPageTitle>

      <AppBasicCard appId={appId} title="基本資料" className="mb-3" />

      <AppHostAdminCard className="mb-3" title="App Hosts"></AppHostAdminCard>
    </AdminLayout>
  )
}

type AppHostAdminCardProps = CardProps
const AppHostAdminCard: React.VFC<AppHostAdminCardProps> = ({ ...cardProps }) => {
  return <AdminCard {...cardProps}>App Host Card</AdminCard>
}

export default AppBasicAdminPage
