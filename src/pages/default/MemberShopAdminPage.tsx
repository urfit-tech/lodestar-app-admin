import React from 'react'
import { useParams } from 'react-router-dom'
import MemberShopLayout from '../../components/layout/MemberShopLayout'
import { useMemberShop } from '../../hooks/merchandise'
import MerchandiseCollectionAdminPane from './MerchandiseCollectionAdminPane'

const MemberShopAdminPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>()
  const { loadingMemberShop, errorMemberShop, memberShop, refetchMemberShop } = useMemberShop(shopId)

  if (loadingMemberShop || errorMemberShop || !memberShop) {
    return null
  }

  return (
    <MemberShopLayout memberShopTitle={memberShop.title} member={memberShop.member}>
      <MerchandiseCollectionAdminPane
        shopId={shopId}
        merchandises={memberShop?.merchandises || []}
        onRefetchMemberShop={refetchMemberShop}
      />
    </MemberShopLayout>
  )
}

export default MemberShopAdminPage
