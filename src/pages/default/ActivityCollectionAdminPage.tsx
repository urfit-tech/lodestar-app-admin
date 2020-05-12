import { Icon, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import AdminLayout from '../../components/layout/AdminLayout'
import ActivityCollectionAdminBlock from '../../containers/activity/ActivityCollectionAdminBlock'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'

const ActivityCollectionAdminPage = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.activities)}</span>
      </Typography.Title>

      {currentMemberId && (
        <ActivityCollectionAdminBlock memberId={currentUserRole === 'app-owner' ? null : currentMemberId} />
      )}
    </AdminLayout>
  )
}

export default ActivityCollectionAdminPage
