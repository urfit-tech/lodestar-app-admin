import { Icon, Typography } from 'antd'
import React from 'react'
import { Redirect } from 'react-router'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import VoucherPlanCollectionBlock from '../../../containers/voucher/VoucherPlanCollectionBlock'
import { ReactComponent as DiscountIcon } from '../../../images/default/discount.svg'

const VoucherPlanCollectionAdminPage = () => {
  if (process.env.REACT_APP_MODULE_VOUCHER === 'DISABLED') {
    return <Redirect to="/" />
  }

  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>兌換方案</span>
      </Typography.Title>

      <VoucherPlanCollectionBlock />
    </OwnerAdminLayout>
  )
}

export default VoucherPlanCollectionAdminPage
