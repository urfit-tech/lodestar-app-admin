import { Skeleton } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import CoinLogTabs from '../../components/checkout/CoinLogTabs'
import MemberAdminLayout from '../../components/layout/MemberAdminLayout'
import { useMemberAdmin } from '../../hooks/member'

const MemberCoinAdminPage: React.VFC = () => {
  const { memberId } = useParams<{ memberId: string }>()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin} onRefetch={refetchMemberAdmin}>
      <div className="p-5">
        <CoinLogTabs memberId={memberId} />
      </div>
    </MemberAdminLayout>
  )
}

export default MemberCoinAdminPage
