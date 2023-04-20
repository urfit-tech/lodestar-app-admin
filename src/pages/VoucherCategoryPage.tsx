import { BookOutlined } from '@ant-design/icons'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CategoryAdminCard from '../components/admin/CategoryAdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

const VoucherCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  if (!permissions.PROGRAM_CATEGORY_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BookOutlined className="mr-3" />
        <span>{formatMessage(pageMessages.VoucherCategoryPage.voucherCategory)}</span>
      </AdminPageTitle>

      <CategoryAdminCard classType="voucher" />
    </AdminLayout>
  )
}

export default VoucherCategoryPage
