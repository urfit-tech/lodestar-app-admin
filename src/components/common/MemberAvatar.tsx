import React from 'react'
import { AvatarImage } from './Image'

type MemberAvatarProps = {
  name: string
  pictureUrl: string
}
const MemberAvatar: React.FC<MemberAvatarProps> = ({ name, pictureUrl }) => {
  return (
    <div className="d-flex align-items-center justify-content-start">
      <AvatarImage className="mr-3" src={pictureUrl} size={36} />
      <span className="pl-1">{name}</span>
    </div>
  )
}

export default MemberAvatar
