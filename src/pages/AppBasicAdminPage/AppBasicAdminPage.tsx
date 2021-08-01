import { GlobalOutlined } from '@ant-design/icons'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'
import AppHostAdminCard from './AppHostAdminCard'
import AppNavAdminCard from './AppNavAdminCard'

const AppBasicAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()

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
type AppBasicAdminCardProps = CardProps
const AppBasicAdminCard: React.VFC<AppBasicAdminCardProps> = ({ ...cardProps }) => {
  return <AdminCard {...cardProps}>logo</AdminCard>
}

export default AppBasicAdminPage
