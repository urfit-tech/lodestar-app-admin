import { DollarOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import OrderExportModal from '../components/sale/OrderExportModal'
import OrderImportModal from '../components/sale/OrderImportModal'
import SaleCollectionAdminCard from '../components/sale/SaleCollectionAdminCard'
import SaleSummaryCard from '../components/sale/SaleSummaryCard'
import { commonMessages } from '../helpers/translation'

const messages = defineMessages({
  import: { id: 'pages.salesAdminPage.import', defaultMessage: '匯入資料' },
  export: { id: 'pages.salesAdminPage.export', defaultMessage: '匯出資料' },
})
const SalesAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <DollarOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
      </AdminPageTitle>

      <div className="d-flex mb-4">
        <OrderExportModal
          renderTrigger={({ setVisible }) => (
            <Button className="mr-2" type="primary" icon={<DownloadOutlined />} onClick={() => setVisible(true)}>
              {formatMessage(messages.export)}
            </Button>
          )}
        />
        <OrderImportModal
          title={formatMessage(messages.import)}
          renderTrigger={({ show }) => <Button onClick={() => show()}>{formatMessage(messages.import)}</Button>}
        />
      </div>

      <div className="mb-3 position-relative">
        <SaleSummaryCard />
      </div>

      <SaleCollectionAdminCard />
    </AdminLayout>
  )
}

export default SalesAdminPage
