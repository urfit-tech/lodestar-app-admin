import { DollarOutlined } from '@ant-design/icons'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import OrderExportModal from '../../components/sale/OrderExportModal'
import SaleCollectionAdminCard from '../../components/sale/SaleCollectionAdminCard'
import SaleSummaryCard from '../../components/sale/SaleSummaryAdminCard'
import { commonMessages } from '../../helpers/translation'

const SalesAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <DollarOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
      </AdminPageTitle>

      <div className="mb-4">
        <OrderExportModal isAuth={permissions.SALES_RECORDS_ADMIN || permissions.SALES_RECORDS_CREATOR} />
      </div>

      <div className="mb-3 position-relative">
        <SaleSummaryCard isAuth={permissions.GROSS_SALES_ADMIN} />
      </div>

      <SaleCollectionAdminCard isAuth={permissions.SALES_RECORDS_ADMIN || permissions.SALES_RECORDS_CREATOR} />
    </AdminLayout>
  )
}

export default SalesAdminPage
