import React from 'react'
import { useParams } from 'react-router-dom'
import MemberShopLayout from '../../components/layout/MemberShopLayout'
import { useMemberShop } from '../../hooks/merchandise'
import MerchandiseCollectionAdminBlock from './MerchandiseCollectionAdminBlock'

const MemberShopAdminPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>()
  const { loadingMemberShop, errorMemberShop, memberShop } = useMemberShop(shopId)

  if (loadingMemberShop || errorMemberShop || !memberShop) {
    return null
  }

  return (
    <MemberShopLayout memberShopTitle={memberShop.title} member={memberShop.member}>
      <MerchandiseCollectionAdminBlock shopId={shopId} merchandises={memberShop?.merchandises || []} />
    </MemberShopLayout>
  )
}

export default MemberShopAdminPage
