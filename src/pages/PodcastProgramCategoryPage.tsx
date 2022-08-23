import { BookOutlined } from '@ant-design/icons'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CategoryAdminCard from '../components/admin/CategoryAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'

const PodcastProgramCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()

  if (!enabledModules.podcast || (!permissions.PODCAST_ADMIN && !permissions.PODCAST_NORMAL)) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BookOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.podcastCategory)}</span>
      </AdminPageTitle>

      <CategoryAdminCard classType="podcastProgram" />
    </AdminLayout>
  )
}

export default PodcastProgramCategoryPage
