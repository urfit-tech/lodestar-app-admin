import { Icon, Skeleton, Typography } from 'antd'
import React, { useContext } from 'react'
import DefaultLayout from '../../../components/layout/DefaultLayout'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import AppContext from '../../../containers/common/AppContext'
import VoucherCollectionBlock from '../../../containers/voucher/VoucherCollectionBlock'
import { ReactComponent as GiftIcon } from '../../../images/default/gift.svg'
import NotFoundPage from '../NotFoundPage'

const VoucherCollectionAdminPage = () => {
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
    <MemberAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <GiftIcon />} className="mr-3" />
        <span>兌換券</span>
      </Typography.Title>

      <VoucherCollectionBlock />
    </MemberAdminLayout>
  )
}

export default VoucherCollectionAdminPage
