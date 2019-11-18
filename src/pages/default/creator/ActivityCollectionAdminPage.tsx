import { Icon, Typography } from 'antd'
import React from 'react'
import { useAuth } from '../../../components/auth/AuthContext'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import ActivityCollectionAdminBlock from '../../../containers/activity/ActivityCollectionAdminBlock'
import { ReactComponent as CalendarAltIcon } from '../../../images/default/calendar-alt.svg'

const ActivityCollectionAdminPage = () => {
  const { currentMemberId } = useAuth()

  return (
    <CreatorAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>線下實體管理</span>
      </Typography.Title>

      {currentMemberId && <ActivityCollectionAdminBlock memberId={currentMemberId} />}
    </CreatorAdminLayout>
  )
}

export default ActivityCollectionAdminPage
