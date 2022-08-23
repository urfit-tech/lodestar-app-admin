import Icon from '@ant-design/icons'
import { Skeleton } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import ProfileAccountAdminCard from '../components/member/ProfileAccountAdminCard'
import ProfileBasicCard from '../components/member/ProfileBasicCard'
import ProfilePasswordAdminCard from '../components/member/ProfilePasswordAdminCard'
import { commonMessages } from '../helpers/translation'
import { ReactComponent as UserIcon } from '../images/icon/user.svg'

const SettingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <UserIcon />} className="mr-3" />
        {currentUserRole === 'app-owner' ? (
          <span>{formatMessage(commonMessages.menu.ownerSettings)}</span>
        ) : currentUserRole === 'content-creator' ? (
          <span>{formatMessage(commonMessages.menu.creatorSettings)}</span>
        ) : (
          <span>{formatMessage(commonMessages.menu.memberSettings)}</span>
        )}
      </AdminPageTitle>

      {!currentMemberId ? (
        <Skeleton active />
      ) : (
        <ProfileBasicCard
          className="mb-4"
          memberId={currentMemberId}
          withTitle={currentUserRole === 'content-creator'}
          withFields={currentUserRole === 'content-creator'}
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
