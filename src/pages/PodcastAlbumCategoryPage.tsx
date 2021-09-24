import { BookOutlined } from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CategoryAdminCard from '../components/admin/CategoryAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'

const PodcastAlbumCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BookOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.podcastAlbumCategory)}</span>
      </AdminPageTitle>

      <CategoryAdminCard classType="podcastAlbum" />
    </AdminLayout>
  )
}

export default PodcastAlbumCategoryPage
