import { Icon, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import AdminLayout from '../../../components/layout/AdminLayout'
import SaleCollectionCreatorCard from '../../../containers/sale/SaleCollectionCreatorCard'
import SaleSummaryCreatorCard from '../../../containers/sale/SaleSummaryCreatorCard'
import { useAuth } from '../../../contexts/AuthContext'
import { commonMessages } from '../../../helpers/translation'

const SalesAdminPage = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="dollar" className="mr-3" />
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
