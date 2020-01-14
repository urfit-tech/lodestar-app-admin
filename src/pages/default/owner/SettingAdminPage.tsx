import React from 'react'
import ProfileBasicAdminCard from '../../../components/profile/ProfileBasicAdminCard'
import ProfileAccountAdminCard from '../../../components/profile/ProfileAccountAdminCard'
import ProfilePasswordAdminCard from '../../../components/profile/ProfilePasswordAdminCard'
import { useAuth } from '../../../contexts/AuthContext'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { Typography, Icon } from 'antd'
import { ReactComponent as UserIcon } from '../../../images/icon/user.svg'

const SettingAdminPage: React.FC = ({}) => {
  const { currentMemberId } = useAuth()
  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <UserIcon />} className="mr-3" />
        <span>會員管理</span>
      </Typography.Title>
      <ProfileBasicAdminCard className="mb-4" memberId={currentMemberId || ''} />
      <ProfileAccountAdminCard className="mb-4" memberId={currentMemberId || ''}/>
      <ProfilePasswordAdminCard memberId={currentMemberId || ''} />
    </OwnerAdminLayout>
  )
}

export default SettingAdminPage
