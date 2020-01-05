import { Icon } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { AvatarImage } from '../common/Image'

const StyledName = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledInstructorBlock = styled.div`
  margin-bottom: 0.75rem;
  padding: 1.25rem;
  border-radius: 4px;
  background-color: var(--gray-lighter);

  :last-child {
    margin-bottom: 2rem;
  }
`
const RoleAdminBlock: React.FC<{
  name: string | null
  pictureUrl: string | null
  onDelete?: () => void
}> = ({ name, pictureUrl, onDelete }) => {
  return (
    <StyledInstructorBlock className="d-flex align-items-center justify-content-center">
      <AvatarImage src={pictureUrl} size={36} className="mr-3" />
      <StyledName className="flex-grow-1">{name}</StyledName>
      <Icon type="delete" onClick={() => onDelete && onDelete()} />
    </StyledInstructorBlock>
  )
}

export default RoleAdminBlock
