import { Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { StyledAdminBlock, StyledAdminBlockTitle } from '../components/admin'
import MemberAdminLayout from '../components/layout/MemberAdminLayout'
import MemberProfileAbstractForm from '../components/member/MemberProfileAbstractForm'
import MemberProfileBasicForm from '../components/member/MemberProfileBasicForm'
import MemberPropertyAdminForm from '../components/member/MemberPropertyAdminForm'
import { memberMessages } from '../helpers/translation'
import { useMemberAdmin } from '../hooks/member'

const MemberProfileAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberId } = useParams<{ memberId: string }>()
  const { enabledModules } = useApp()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <MemberAdminLayout member={memberAdmin} onRefetch={refetchMemberAdmin}>
      <div className="p-5">
        <StyledAdminBlock>
          <StyledAdminBlockTitle>{formatMessage(memberMessages.label.basic)}</StyledAdminBlockTitle>
          <MemberProfileBasicForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
        </StyledAdminBlock>
        {enabledModules.member_property && (
          <StyledAdminBlock>
            <StyledAdminBlockTitle>{formatMessage(memberMessages.label.property)}</StyledAdminBlockTitle>
            <MemberPropertyAdminForm memberId={memberId} />
          </StyledAdminBlock>
        )}
        <StyledAdminBlock>
          <StyledAdminBlockTitle>{formatMessage(memberMessages.label.abstract)}</StyledAdminBlockTitle>
          <MemberProfileAbstractForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
        </StyledAdminBlock>
      </div>
    </MemberAdminLayout>
  )
}

export default MemberProfileAdminPage
