import { Skeleton } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { AdminBlock, AdminBlockTitle, AdminPageTitle } from '../../components/admin'
import MemberShopLayout from '../../components/layout/MemberShopLayout'
import ShippingMethodAdminBlock from '../../components/merchandise/ShippingMethodAdminBlock'
import { useMemberShop } from '../../hooks/merchandise'

const messages = defineMessages({
  shippingMethodsAdmin: { id: 'merchandise.label.shippingMethodsAdmin', defaultMessage: '物流設定' },
  shippingMethod: { id: 'merchandise.label.shippingMethod', defaultMessage: '寄送方式' },
})

const MemberShopAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { shopId } = useParams<{ shopId: string }>()
  const { loadingMemberShop, errorMemberShop, memberShop, refetchMemberShop } = useMemberShop(shopId)

  if (loadingMemberShop || errorMemberShop || !memberShop) {
    return null
  }

  return (
    <MemberShopLayout memberShopTitle={memberShop.title} member={memberShop.member}>
      <AdminPageTitle>{formatMessage(messages.shippingMethodsAdmin)}</AdminPageTitle>
      <AdminBlock>
        <AdminBlockTitle>{formatMessage(messages.shippingMethod)}</AdminBlockTitle>
        {memberShop ? (
          <ShippingMethodAdminBlock memberShop={memberShop} refetch={refetchMemberShop} />
        ) : (
          <Skeleton active />
        )}
      </AdminBlock>
    </MemberShopLayout>
  )
}

export default MemberShopAdminPage
