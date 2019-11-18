import { AvatarProps } from 'antd/lib/avatar'
import React from 'react'
import styled from 'styled-components'
import { usePublicMember } from '../../hooks/data'
import { Member } from '../../schemas/general'
import { AvatarImage } from './Image'

const MemberName = styled.span`
  font-size: 14px;
  color: #9b9b9b;
`

type MemberAvatarProps = AvatarProps & {
  memberId: string
  renderAvatar?: (member: Partial<Member>) => React.ReactNode
  renderText?: (member: Partial<Member>) => React.ReactNode
  withName?: boolean
}
const MemberAvatar: React.FC<MemberAvatarProps> = ({ memberId, shape, size, renderAvatar, renderText, withName }) => {
  const { member } = usePublicMember(memberId)
  if (!member) {
    return null
  }

  return (
    <div className="d-flex align-items-center">
      {renderAvatar ? renderAvatar(member) : <AvatarImage src={member.pictureUrl || ''} shape={shape} size={size} />}
      {renderText && renderText(member)}
      {withName && <MemberName className="ml-3">{member.name}</MemberName>}
    </div>
  )
}

export default MemberAvatar
