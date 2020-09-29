import { Skeleton } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import MemberShopLayout from '../../components/layout/MemberShopLayout'
import MemberShopPublishBlock from '../../components/merchandise/MemberShopPublishBlock'
import { useMemberShop } from '../../hooks/merchandise'

const messages = defineMessages({
  publishAdmin: { id: 'merchandise.label.publishAdmin', defaultMessage: '啟用設定' },
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
      <AdminPageTitle>{formatMessage(messages.publishAdmin)}</AdminPageTitle>
      <AdminBlock>
        {memberShop ? (
          <MemberShopPublishBlock memberShop={memberShop} refetch={refetchMemberShop} />
        ) : (
          <Skeleton active />
        )}
      </AdminBlock>
    </MemberShopLayout>
  )
}

export default MemberShopAdminPage
