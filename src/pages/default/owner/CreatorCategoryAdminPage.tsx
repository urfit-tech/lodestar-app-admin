import Icon from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { Redirect } from 'react-router-dom'
import { AdminPageTitle } from '../../../components/admin'
import CategoryAdminCard from '../../../components/admin/CategoryAdminCard'
import AdminLayout from '../../../components/layout/AdminLayout'
import { useApp } from '../../../contexts/AppContext'
import { useAuth } from '../../../contexts/AuthContext'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as CalendarAltIcon } from '../../../images/icon/calendar-alt.svg'
import LoadingPage from '../LoadingPage'

const CreatorCategoryAdminPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const { loading, enabledModules } = useApp()
  const { isAuthenticating, currentUserRole } = useAuth()

  if (loading || isAuthenticating) {
    return <LoadingPage />
  }

  if (!enabledModules.creator_display || currentUserRole === 'content-creator') {
    return <Redirect to="/" />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.creatorDisplayCategory)}</span>
      </AdminPageTitle>

      <CategoryAdminCard classType={'creator'} />
    </AdminLayout>
  )
}

export default CreatorCategoryAdminPage
