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
import ForbiddenPage from './ForbiddenPage'

const SettingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions } = useAuth()

  if (!permissions.SETTING_ADMIN || permissions.SETTING_NORMAL) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <UserIcon />} className="mr-3" />
        {permissions.SETTING_ADMIN ? (
          <span>{formatMessage(commonMessages.menu.ownerSettings)}</span>
        ) : permissions.SETTING_NORMAL ? (
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
          withTitle={permissions.SETTING_NORMAL}
          withFields={permissions.SETTING_NORMAL}
          withTags={permissions.SETTING_NORMAL}
          withAbstract={permissions.SETTING_NORMAL}
          withDescription={permissions.SETTING_NORMAL}
        />
      )}

      <ProfileAccountAdminCard className="mb-4" memberId={currentMemberId || ''} />
      <ProfilePasswordAdminCard memberId={currentMemberId || ''} />
    </AdminLayout>
  )
}

export default SettingAdminPage
