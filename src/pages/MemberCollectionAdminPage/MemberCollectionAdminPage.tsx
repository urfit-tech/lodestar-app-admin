import { UserOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import MemberCollectionBlock from '../../components/memberCollection/MemberCollectionBlock'
import { commonMessages } from '../../helpers/translation'
import { useMembers } from '../../hooks/member'
import { UserRole } from '../../types/member'
import ForbiddenPage from '../ForbiddenPage'

export type FiledFilter = {
  role?: UserRole
  name?: string
  email?: string
  phone?: string
  username?: string
  category?: string
  managerName?: string
  tag?: string
  permissionGroup?: string
  properties?: {
    [propertyId: string]: string | undefined
  }
}

const MemberCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { isAuthenticating, permissions, currentUserRole, authToken } = useAuth()
  const { loading, id: appId, enabledModules, settings } = useApp()
  const [fieldFilter, setFieldFilter] = useState<FiledFilter>({})
  const limit = 10
  const { loading: loadingMembers, members, fetchMembers, nextToken } = useMembers(authToken || '', limit, fieldFilter)

  if (!isAuthenticating && !permissions.MEMBER_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.members)}</span>
      </AdminPageTitle>
      {loading || isAuthenticating || !authToken ? (
        <Spin />
      ) : (
        <MemberCollectionBlock
          currentUserRole={currentUserRole}
          appId={appId}
          enabledModules={enabledModules}
          settings={settings}
          members={members}
          fieldFilter={fieldFilter}
          setFieldFilter={setFieldFilter}
          nextToken={nextToken}
          loadingMembers={loadingMembers}
          limit={limit}
          fetchMembers={fetchMembers}
        />
      )}
    </AdminLayout>
  )
}

export default MemberCollectionAdminPage
