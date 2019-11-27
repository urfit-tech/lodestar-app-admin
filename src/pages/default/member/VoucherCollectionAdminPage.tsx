import { Icon, Typography } from 'antd'
import React from 'react'
import { Redirect } from 'react-router'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import VoucherCollectionBlock from '../../../containers/voucher/VoucherCollectionBlock'
import { ReactComponent as GiftIcon } from '../../../images/default/gift.svg'

const VoucherCollectionAdminPage = () => {
  if (process.env.REACT_APP_MODULE_VOUCHER === 'DISABLED') {
    return <Redirect to="/" />
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
