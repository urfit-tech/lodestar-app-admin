import { Icon, Typography } from 'antd'
import React from 'react'
import CreatorAdminLayout from '../../../components/layout/CreatorAdminLayout'
import SaleCollectionCreatorCard from '../../../containers/sale/SaleCollectionCreatorCard'
import SaleSummaryCreatorCard from '../../../containers/sale/SaleSummaryCreatorCard'
import { useAuth } from '../../../contexts/AuthContext'

const SalesAdminPage = () => {
  const { currentMemberId } = useAuth()

  return (
    <CreatorAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="dollar" className="mr-3" />
        <span>銷售管理</span>
      </Typography.Title>
      <div className="row mb-3">
        <div className="col-12">{currentMemberId && <SaleSummaryCreatorCard memberId={currentMemberId} />}</div>
      </div>
      {currentMemberId && <SaleCollectionCreatorCard memberId={currentMemberId} />}
    </CreatorAdminLayout>
  )
}

export default SalesAdminPage
