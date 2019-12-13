import { Icon, Typography } from 'antd'
import React from 'react'
import { useAuth } from '../../../components/auth/AuthContext'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import ProfileAccountAdminCard from '../../../components/profile/ProfileAccountAdminCard'
import ProfileBasicAdminCard from '../../../components/profile/ProfileBasicAdminCard'
import ProfilePasswordAdminCard from '../../../components/profile/ProfilePasswordAdminCard'
import { ReactComponent as UserIcon } from '../../../images/default/user.svg'

const ProfileAdminPage = () => {
  const { currentMemberId } = useAuth()

  return (
    <MemberAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <UserIcon />} className="mr-3" />
        <span>個人設定</span>
      </Typography.Title>

      <div className="mb-3">{currentMemberId && <ProfileBasicAdminCard memberId={currentMemberId} />}</div>
      <div className="mb-3">{currentMemberId && <ProfileAccountAdminCard memberId={currentMemberId} />}</div>
      <div className="mb-3">{currentMemberId && <ProfilePasswordAdminCard memberId={currentMemberId} />}</div>
    </MemberAdminLayout>
  )
}

export default ProfileAdminPage
