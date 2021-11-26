import { Skeleton } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { AdminPageTitle, StyledAdminBlock, StyledAdminBlockTitle } from '../components/admin'
import MemberShopLayout from '../components/layout/MemberShopLayout'
import MemberShopBasicForm from '../components/merchandise/MemberShopBasicForm'
import { useMemberShop } from '../hooks/merchandise'

const messages = defineMessages({
  settingsAdmin: { id: 'merchandise.label.settingsAdmin', defaultMessage: '商店資訊' },
  basicSettings: { id: 'merchandise.label.basicSettings', defaultMessage: '基本設定' },
})

const MemberShopAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { shopId } = useParams<{ shopId: string }>()
  const { loadingMemberShop, errorMemberShop, memberShop, refetchMemberShop } = useMemberShop(shopId)

  if (loadingMemberShop || errorMemberShop || !memberShop) {
    return <Skeleton active />
  }

  return (
    <MemberShopLayout memberShopTitle={memberShop.title} member={memberShop.member}>
      <AdminPageTitle>{formatMessage(messages.settingsAdmin)}</AdminPageTitle>
      <StyledAdminBlock>
        <StyledAdminBlockTitle>{formatMessage(messages.basicSettings)}</StyledAdminBlockTitle>
        {<MemberShopBasicForm memberShop={memberShop} onRefetch={refetchMemberShop} />}
      </StyledAdminBlock>
    </MemberShopLayout>
  )
}

export default MemberShopAdminPage
