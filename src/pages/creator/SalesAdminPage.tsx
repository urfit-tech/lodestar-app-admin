import { DollarOutlined } from '@ant-design/icons'
import { Typography } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminLayout from '../../components/layout/AdminLayout'
import SaleCollectionCreatorCard from '../../components/sale/SaleCollectionCreatorCard'
import SaleSummaryCreatorCard from '../../components/sale/SaleSummaryCreatorCard'
import { commonMessages } from '../../helpers/translation'

const SalesAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <DollarOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
      </Typography.Title>

      <div className="row mb-3">
        <div className="col-12">{currentMemberId && <SaleSummaryCreatorCard memberId={currentMemberId} />}</div>
      </div>

      {currentMemberId && <SaleCollectionCreatorCard memberId={currentMemberId} />}
    </AdminLayout>
  )
}

export default SalesAdminPage
