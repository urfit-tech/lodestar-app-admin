import { Icon, Typography } from 'antd'
import React from 'react'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import SaleCollectionAdminCard from '../../../components/sale/SaleCollectionAdminCard'
import SaleSummaryCard from '../../../components/sale/SaleSummaryAdminCard'

const SalesAdminPage = () => (
  <OwnerAdminLayout>
    <Typography.Title level={3} className="mb-4">
      <Icon type="dollar" className="mr-3" />
      <span>銷售管理</span>
    </Typography.Title>

    <div className="row mb-3">
      <div className="col-12">
        <SaleSummaryCard />
      </div>
      {/* <div className="col-12">
        <Statistic title="課程銷售總額" value={591800} suffix="元" />
      </div>
      <div className="col-12">
        <Statistic title="商品銷售總額" value={591800} suffix="元" />
      </div> */}
    </div>

    <SaleCollectionAdminCard />
  </OwnerAdminLayout>
)

export default SalesAdminPage
