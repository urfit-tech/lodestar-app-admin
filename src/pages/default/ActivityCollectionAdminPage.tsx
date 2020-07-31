import Icon from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import ActivityCollectionAdminBlock from '../../containers/activity/ActivityCollectionAdminBlock'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'

const ActivityCollectionAdminPage = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.activities)}</span>
      </AdminPageTitle>

      {currentMemberId && (
        <ActivityCollectionAdminBlock memberId={currentUserRole === 'app-owner' ? null : currentMemberId} />
      )}
    </AdminLayout>
  )
}

export default ActivityCollectionAdminPage
