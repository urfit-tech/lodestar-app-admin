import { Icon, Skeleton, Typography } from 'antd'
import moment from 'moment'
import React, { useContext } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../../components/auth/AuthContext'
import MembershipCardBlock from '../../../components/common/MembershipCardBlock'
import DefaultLayout from '../../../components/layout/DefaultLayout'
import MemberAdminLayout from '../../../components/layout/MemberAdminLayout'
import AppContext from '../../../containers/common/AppContext'
import { useEnrolledMembershipCardCollection, useMembershipCard } from '../../../hooks/card'
import { useMember } from '../../../hooks/member'
import { ReactComponent as MembercardIcon } from '../../../images/default/membercard.svg'
import NotFoundPage from '../NotFoundPage'

const StyledContainer = styled.div`
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
`

const CardCollectionAdminPage = () => {
  const { currentMemberId } = useAuth()
  const { loading, enabledModules } = useContext(AppContext)
  const { enrolledMembershipCardCollection } = useEnrolledMembershipCardCollection(currentMemberId || '')

  if (loading) {
    return (
      <DefaultLayout>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (!enabledModules.member_card) {
    return <NotFoundPage />
  }

  return (
    <MemberAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <MembercardIcon />} className="mr-3" />
        <span>會員卡</span>
      </Typography.Title>

      <div className="row">
        {enrolledMembershipCardCollection.map(membershipCard => (
          <div className="col-12 col-lg-6" key={membershipCard.card.id}>
            <MembershipcardAdminBlock
              cardId={membershipCard.card.id}
              memberId={currentMemberId || ''}
              updatedAt={membershipCard.updatedAt}
            />
          </div>
        ))}
      </div>
    </MemberAdminLayout>
  )
}
const MembershipcardAdminBlock: React.FC<{
  memberId: string
  cardId: string
  updatedAt?: Date | null
}> = ({ memberId, cardId, updatedAt }) => {
  const { loadingMembershipCard, errorMembershipCard, membershipCard } = useMembershipCard(cardId)
  const { loadingMember, errorMember, member } = useMember(memberId)

  if (loadingMembershipCard || errorMembershipCard || loadingMember || errorMember || !member) {
    return null
  }

  return (
    <StyledContainer>
      <MembershipCardBlock
        template={membershipCard.template}
        templateVars={{
          avatar: member.pictureUrl,
          name: member.name || '',
          account: member.username,
          date: updatedAt ? moment(updatedAt).format('YYYY/MM/DD') : '',
        }}
        title={membershipCard.title}
        description={membershipCard.description}
      />
    </StyledContainer>
  )
}

export default CardCollectionAdminPage
