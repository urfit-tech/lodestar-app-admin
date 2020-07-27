import { BookOutlined } from '@ant-design/icons'
import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import CategoryAdminCard from '../../components/common/CategoryAdminCard'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'

const ActivityCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()
  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <BookOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.activityCategory)}</span>
      </Typography.Title>
      <CategoryAdminCard classType="activity" />
    </AdminLayout>
  )
}

export default ActivityCategoryPage
