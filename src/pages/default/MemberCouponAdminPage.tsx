import { Skeleton } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import MemberAdminLayout from '../../components/layout/MemberAdminLayout'
import MemberCouponAdminBlock from '../../components/member/MemberCouponAdminBlock'
import { useMemberAdmin } from '../../hooks/member'

const MemberProfileAdminPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin} onRefetch={refetchMemberAdmin}>
      <div className="p-5">
        <MemberCouponAdminBlock coupons={memberAdmin.coupons} />
      </div>
    </MemberAdminLayout>
  )
}

export default MemberProfileAdminPage
