import { Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import MemberAdminLayout from '../../components/layout/MemberAdminLayout'
import MemberProfileBasicForm from '../../components/member/MemberProfileBasicForm'
import MemberPropertyAdminForm from '../../components/member/MemberPropertyAdminForm'
import { useApp } from '../../contexts/AppContext'
import { memberMessages } from '../../helpers/translation'
import { useMemberAdmin } from '../../hooks/member'

const MemberProfileAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberId } = useParams<{ memberId: string }>()
  const { enabledModules } = useApp()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin}>
      <div className="p-5">
        <AdminBlock>
          <AdminBlockTitle>{formatMessage(memberMessages.label.basic)}</AdminBlockTitle>
          <MemberProfileBasicForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
        </AdminBlock>
        {enabledModules.member_property && (
          <AdminBlock>
            <AdminBlockTitle>{formatMessage(memberMessages.label.property)}</AdminBlockTitle>
            <MemberPropertyAdminForm memberId={memberId} />
          </AdminBlock>
        )}
      </div>
    </MemberAdminLayout>
  )
}

export default MemberProfileAdminPage
