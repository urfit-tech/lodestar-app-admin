import React from 'react'
import styled from 'styled-components'
import { usePublicMember } from '../../hooks/member'
import { MemberPublicProps } from '../../types/general'
import { AvatarImage, AvatarImageProps } from './Image'

const MemberName = styled.span`
  font-size: 14px;
  color: #9b9b9b;
`

const MemberAvatar: React.FC<
  AvatarImageProps & {
    memberId: string
    renderAvatar?: (member: MemberPublicProps) => React.ReactNode
    renderText?: (member: MemberPublicProps) => React.ReactNode
    withName?: boolean
  }
> = ({ memberId, renderAvatar, renderText, withName, ...props }) => {
  const { member } = usePublicMember(memberId)
  if (!member) {
    return null
  }

  return (
    <div className="d-flex align-items-center">
      {renderAvatar ? renderAvatar(member) : <AvatarImage src={member.pictureUrl || ''} {...props} />}
      {renderText && renderText(member)}
      {withName && <MemberName className="ml-3">{member.name}</MemberName>}
    </div>
  )
}

export default MemberAvatar
