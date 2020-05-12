import { Icon, Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as UserIcon } from '../../images/icon/user.svg'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import ProfileAccountAdminCard from '../../components/profile/ProfileAccountAdminCard'
import ProfileBasicCard from '../../components/profile/ProfileBasicCard'
import ProfilePasswordAdminCard from '../../components/profile/ProfilePasswordAdminCard'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'

const SettingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <UserIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.ownerSettings)}</span>
      </AdminPageTitle>

      {!currentMemberId ? (
        <Skeleton active />
      ) : (
        <ProfileBasicCard
          className="mb-4"
          memberId={currentMemberId}
          withTitle={currentUserRole === 'content-creator'}
          withTags={currentUserRole === 'content-creator'}
          withAbstract={currentUserRole === 'content-creator'}
          withDescription={currentUserRole === 'content-creator'}
        />
      )}

      <ProfileAccountAdminCard className="mb-4" memberId={currentMemberId || ''} />
      <ProfilePasswordAdminCard memberId={currentMemberId || ''} />
    </AdminLayout>
  )
}

export default SettingAdminPage
