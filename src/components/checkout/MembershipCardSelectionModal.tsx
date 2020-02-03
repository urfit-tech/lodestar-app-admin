import { Modal } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { InferType } from 'yup'
import { membershipCardMessages } from '../../helpers/translation'
import { useEnrolledMembershipCardCollection, useMembershipCard } from '../../hooks/card'
import { useMember } from '../../hooks/member'
import { memberSchema } from '../../schemas/general'
import MembershipCardBlock from '../common/MembershipCardBlock'

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
  const { formatMessage } = useIntl()
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

      <Modal
        title={formatMessage(membershipCardMessages.label.selectMembershipCard)}
        footer={null}
        onCancel={() => setVisible(false)}
        visible={visible}
      >
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
