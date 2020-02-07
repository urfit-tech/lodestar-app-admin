import { Icon, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import SaleCollectionAdminCard from '../../../components/sale/SaleCollectionAdminCard'
import SaleSummaryCard from '../../../components/sale/SaleSummaryAdminCard'
import { commonMessages } from '../../../helpers/translation'

const SalesAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="dollar" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
      </Typography.Title>

      <div className="row mb-3">
        <div className="col-12">
          <SaleSummaryCard />
        </div>
      </div>

      <SaleCollectionAdminCard />
    </OwnerAdminLayout>
  )
}

export default SalesAdminPage
