import { Icon, Typography } from 'antd'
import React from 'react'
import { useAuth } from '../../../components/auth/AuthContext'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import OrderCollectionAdminCard from '../../../components/sale/OrderCollectionAdminCard'
import { ReactComponent as ClipboardListIcon } from '../../../images/default/clipboard-list.svg'

const OrderCollectionAdminPage = () => {
  const { currentMemberId } = useAuth()
  return (
    <MemberAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <ClipboardListIcon />} className="mr-3" />
        <span>訂單記錄</span>
      </Typography.Title>

      {currentMemberId && <OrderCollectionAdminCard memberId={currentMemberId} />}
    </MemberAdminLayout>
  )
}

export default OrderCollectionAdminPage
