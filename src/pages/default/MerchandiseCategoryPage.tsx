import { Icon, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import CategoryAdminCard from '../../components/common/CategoryAdminCard'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'

const MerchandiseCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()
  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="book" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.merchandiseCategory)}</span>
      </Typography.Title>
      <CategoryAdminCard classType="merchandise" />
    </AdminLayout>
  )
}

export default MerchandiseCategoryPage
