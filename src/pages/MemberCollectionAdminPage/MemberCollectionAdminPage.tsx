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
import { MemberCollectionAdminFieldFilter } from '../../types/member'
import ForbiddenPage from '../ForbiddenPage'

const MemberCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { isAuthenticating, permissions, authToken } = useAuth()
  const { loading } = useApp()
  const [fieldFilter, setFieldFilter] = useState<MemberCollectionAdminFieldFilter>({})
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
