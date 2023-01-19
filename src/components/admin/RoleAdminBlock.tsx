import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
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
const StyledRemainingDays = styled.div`
  color: var(--gray-dark);
`

const RoleAdminBlock: React.FC<{
  name: string | null
  pictureUrl: string | null
  remainingDays?: string
  onEdit?: () => void
  onDelete?: () => void
}> = ({ name, pictureUrl, remainingDays, onEdit, onDelete }) => {
  return (
    <StyledInstructorBlock className="d-flex align-items-center justify-content-center">
      <AvatarImage size="36px" src={pictureUrl} className="mr-3" />
      <div className="d-flex flex-grow-1">
        <StyledName>{name}</StyledName>
        <StyledRemainingDays className="ml-3">{remainingDays}</StyledRemainingDays>
      </div>
      {onEdit && <EditOutlined className="mr-3" onClick={() => onEdit()} />}
      {onDelete && <DeleteOutlined onClick={() => onDelete()} />}
    </StyledInstructorBlock>
  )
}

export default RoleAdminBlock
