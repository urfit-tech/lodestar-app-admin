import { Skeleton } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import { AdminBlock } from '../../components/admin'
import MemberAdminLayout from '../../components/layout/MemberAdminLayout'
import MemberPermissionForm from '../../components/member/MemberPermissionForm'
import { useMemberAdmin } from '../../hooks/member'

const MemberProfileAdminPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)
  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin} onRefetch={() => refetchMemberAdmin}>
      <div className="p-5">
        <AdminBlock>
          <MemberPermissionForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
        </AdminBlock>
      </div>
    </MemberAdminLayout>
  )
}

export default MemberProfileAdminPage
