import { Icon, Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../../components/admin'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { commonMessages } from '../../../helpers/translation'

const BlogAdminCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole } = useAuth()

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon type="shopping" theme="filled" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.blogPosts)}</span>
      </AdminPageTitle>

      {/* <BlogPostCreationModal /> */}

      <Tabs defaultActiveKey="published">
        <Tabs.TabPane key="published" tab={formatMessage(commonMessages.status.published)}></Tabs.TabPane>
        <Tabs.TabPane key="draft" tab={formatMessage(commonMessages.status.draft)}></Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

export default BlogAdminCollectionPage
