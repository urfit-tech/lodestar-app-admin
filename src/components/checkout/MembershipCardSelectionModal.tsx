import { Modal } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { rgba } from '../../helpers'
import { useEnrolledMembershipCardCollection, useMembershipCard } from '../../hooks/card'
import { useMember } from '../../hooks/member'
import { memberSchema } from '../../schemas/general'
import MembershipCardBlock from '../common/MembershipCardBlock'

const StyledIcon = styled.div`
  margin-bottom: 1.25rem;
  width: 52px;
  height: 52px;
  background: ${props => rgba(props.theme['@primary-color'], 0.1)};
  color: ${props => props.theme['@primary-color']};
  font-size: 24px;
  line-height: 52px;
  text-align: center;
  border-radius: 50%;
`
const StyledTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
  color: #585858;
`
const StyledContainer = styled.div`
  margin-bottom: 0.75rem;
  padding: 1rem;
  border: solid 1px #ececec;
  border-radius: 4px;
  cursor: pointer;
`

type MembershipCardSelectionModalProps = {
  memberId: string
  onSelect?: (membershipCardId: string) => void
  render?: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    selectedMembershipCard: any
  }>
}
const MembershipCardSelectionModal: React.FC<MembershipCardSelectionModalProps> = ({ memberId, onSelect, render }) => {
  const { enrolledMembershipCardCollection } = useEnrolledMembershipCardCollection(memberId)
  const { loadingMember, errorMember, member } = useMember(memberId)
  const [visible, setVisible] = useState(false)
  const [selectedMembershipCard, setSelectedMembershipCard] = useState()

  if (loadingMember || errorMember || !member) {
    return render ? render({ setVisible, selectedMembershipCard }) : null
  }

  return (
    <>
      {render && render({ setVisible, selectedMembershipCard })}
      <Modal title="選擇會員卡" footer={null} onCancel={() => setVisible(false)} visible={visible}>
        {/* <StyledIcon>
          <Icon type="idcard" />
        </StyledIcon>
        <StyledTitle className="mb-4">選擇會員卡</StyledTitle> */}

        {enrolledMembershipCardCollection.map(membershipCard => (
          <div
            key={membershipCard.card.id}
            onClick={() => {
              onSelect && onSelect(membershipCard.card.id)
              setSelectedMembershipCard({
                id: membershipCard.card.id,
                title: membershipCard.card.title,
              })
              setVisible(false)
            }}
          >
            <MembershipCardItem
              member={member}
              membershipCardId={membershipCard.card.id}
              updatedAt={membershipCard.updatedAt}
            />
          </div>
        ))}
      </Modal>
    </>
  )
}

const MembershipCardItem: React.FC<{
  member: InferType<typeof memberSchema>
  membershipCardId: string
  updatedAt?: Date | null
}> = ({ member, membershipCardId, updatedAt }) => {
  const { loadingMembershipCard, errorMembershipCard, membershipCard } = useMembershipCard(membershipCardId)

  if (loadingMembershipCard || errorMembershipCard) {
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
          date: updatedAt ? moment(updatedAt).format('YYYY//MM/DD') : '',
        }}
        title={membershipCard.title}
        description={membershipCard.description}
        variant="list-item"
      />
    </StyledContainer>
  )
}

export default MembershipCardSelectionModal
