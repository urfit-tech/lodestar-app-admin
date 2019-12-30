import { Icon, Typography } from 'antd'
import React from 'react'
import { useAuth } from '../../../components/auth/AuthContext'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import ActivityCollectionAdminBlock from '../../../containers/activity/ActivityCollectionAdminBlock'
import { ReactComponent as CalendarAltIcon } from '../../../images/icon/calendar-alt.svg'

const ActivityCollectionAdminPage = () => {
  const { currentMemberId, currentUserRole } = useAuth()
  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>線下實體管理</span>
      </Typography.Title>

      {currentMemberId && (
        <ActivityCollectionAdminBlock memberId={currentUserRole === 'app-owner' ? undefined : currentMemberId} />
      )}
    </AdminLayout>
  )
}

export default ActivityCollectionAdminPage
