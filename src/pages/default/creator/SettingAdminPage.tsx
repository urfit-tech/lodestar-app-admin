import React from 'react'
import ProfileBasicCard from '../../../components/profile/ProfileBasicCard'
import ProfileAccountAdminCard from '../../../components/profile/ProfileAccountAdminCard'
import ProfilePasswordAdminCard from '../../../components/profile/ProfilePasswordAdminCard'
import { useAuth } from '../../../contexts/AuthContext'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import { Typography, Icon } from 'antd'
import { ReactComponent as UserIcon } from '../../../images/icon/user.svg'

const SettingAdminPage: React.FC = () => {
  const { currentMemberId, currentUserRole } = useAuth()
  
  return (
    <CreatorAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <UserIcon />} className="mr-3" />
        <span>創作者設定</span>
      </Typography.Title>
      <ProfileBasicCard
        className="mb-4"
        memberId={currentMemberId || ''}
        withTitle
        withTags
        withAbstract
        withDescription
      />
      <ProfileAccountAdminCard className="mb-4" memberId={currentMemberId || ''} />
      <ProfilePasswordAdminCard memberId={currentMemberId || ''} />
    </CreatorAdminLayout>
  )
}

export default SettingAdminPage
