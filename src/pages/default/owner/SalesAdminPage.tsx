import { DollarOutlined } from '@ant-design/icons'
import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminLayout from '../../../components/layout/AdminLayout'
import SaleCollectionAdminCard from '../../../components/sale/SaleCollectionAdminCard'
import SaleSummaryCard from '../../../components/sale/SaleSummaryAdminCard'
import OrderExportModal from '../../../containers/sale/OrderExportModal'
import { commonMessages } from '../../../helpers/translation'

const SalesAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <DollarOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
      </Typography.Title>

      <div className="mb-4">
        <OrderExportModal />
      </div>

      <div className="row mb-3">
        <div className="col-12">
          <SaleSummaryCard />
        </div>
      </div>

      <SaleCollectionAdminCard />
    </AdminLayout>
  )
}

export default SalesAdminPage
