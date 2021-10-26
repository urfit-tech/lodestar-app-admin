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

type SalesStatus = {
  authStatus: 'Admin' | 'Creator' | 'None'
  memberId: string | null
}

const SalesAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions, currentMemberId } = useAuth()

  const grossSalesPermission: SalesStatus = permissions.GROSS_SALES_ADMIN
    ? { authStatus: 'Admin', memberId: currentMemberId }
    : permissions.GROSS_SALES_CREATOR
    ? { authStatus: 'Creator', memberId: currentMemberId }
    : { authStatus: 'None', memberId: currentMemberId }

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
        <SaleSummaryCard {...grossSalesPermission} />
      </div>

      <SaleCollectionAdminCard />
    </AdminLayout>
  )
}

export default SalesAdminPage
