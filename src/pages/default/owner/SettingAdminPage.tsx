import { Icon } from 'antd'
import React from 'react'
import { AdminPageTitle } from '../../../components/admin'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import ProfileAccountAdminCard from '../../../components/profile/ProfileAccountAdminCard'
import ProfileBasicCard from '../../../components/profile/ProfileBasicCard'
import ProfilePasswordAdminCard from '../../../components/profile/ProfilePasswordAdminCard'
import { useAuth } from '../../../contexts/AuthContext'
import { ReactComponent as UserIcon } from '../../../images/icon/user.svg'

const SettingAdminPage: React.FC = () => {
  const { currentMemberId } = useAuth()

  return (
    <OwnerAdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <UserIcon />} className="mr-3" />
        <span>管理者設定</span>
      </AdminPageTitle>

      <ProfileBasicCard className="mb-4" memberId={currentMemberId || ''} />
      <ProfileAccountAdminCard className="mb-4" memberId={currentMemberId || ''} />
      <ProfilePasswordAdminCard memberId={currentMemberId || ''} />
    </OwnerAdminLayout>
  )
}

export default SettingAdminPage
