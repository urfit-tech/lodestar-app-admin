import { Icon, Skeleton, Typography } from 'antd'
import React, { useContext } from 'react'
import DefaultLayout from '../../../components/layout/DefaultLayout'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import AppContext from '../../../containers/common/AppContext'
import VoucherPlanCollectionBlock from '../../../containers/voucher/VoucherPlanCollectionBlock'
import { ReactComponent as DiscountIcon } from '../../../images/icon/discount.svg'
import NotFoundPage from '../NotFoundPage'

const VoucherPlanCollectionAdminPage = () => {
  const { loading, enabledModules } = useContext(AppContext)

  if (loading) {
    return (
      <DefaultLayout>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (!enabledModules.voucher) {
    return <NotFoundPage />
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
