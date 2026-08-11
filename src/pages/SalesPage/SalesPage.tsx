import { DollarOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import OrderExportModal from '../../components/sale/OrderExportModal'
import OrderImportModal from '../../components/sale/OrderImportModal'
import SaleCollectionAdminCard from '../../components/sale/SaleCollectionAdminCard'
import pageMessages from '../translation'
import SaleSummaryCard from './SaleSummaryCard'

const SalesPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <DollarOutlined className="mr-3" />
        <span>{formatMessage(pageMessages.SalesPage.salesAdmin)}</span>
      </AdminPageTitle>

      <div className="d-flex mb-4">
        {(permissions.SALES_RECORDS_ADMIN || permissions.READ_GROUP_SALES_ALL) && (
          <OrderExportModal
            exportPermission={permissions.SALES_RECORDS_ADMIN ? 'Admin' : 'Group'}
            renderTrigger={({ setVisible }) => (
              <Button className="mr-2" type="primary" icon={<DownloadOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(pageMessages.SalesPage.export)}
              </Button>
            )}
          />
        )}
        <OrderImportModal
          title={formatMessage(pageMessages.SalesPage.import)}
          renderTrigger={({ show }) => (
            <Button onClick={() => show()}>{formatMessage(pageMessages.SalesPage.import)}</Button>
          )}
        />
      </div>

      <div className="mb-3 position-relative">
        <SaleSummaryCard />
      </div>

      <SaleCollectionAdminCard />
    </AdminLayout>
  )
}

export default SalesPage
