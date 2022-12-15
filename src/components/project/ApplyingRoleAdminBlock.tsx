import { Button } from 'antd'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AvatarImage } from '../common/Image'
import { commonMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'
import React, { useState } from 'react'

const StyledMessage = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledInstructorBlock = styled.div`
  margin-bottom: 0.75rem;
  padding: 1.25rem;
  border-radius: 4px;
  border: solid 1px #ececec;

  :last-child {
    margin-bottom: 2rem;
  }
`

const ApplyingRoleAdminBlock: React.VFC<{
  name: string | null
  identity: string | null
  pictureUrl: string | null
  onAgree?: () => void
  onReject?: () => void
}> = ({ name, identity, pictureUrl, onAgree, onReject }) => {
  const { formatMessage } = useIntl()
  return (
    <StyledInstructorBlock className="d-flex align-items-center justify-content-center">
      <AvatarImage size="36px" src={pictureUrl} className="mr-3" />
      <StyledMessage className="flex-grow-1">
        {formatMessage(commonMessages.text.applyingProjectRole, { name, identity })}
      </StyledMessage>
      {onAgree && (
        <Button className="mr-3" onClick={() => onAgree()}>
          {formatMessage(commonMessages.ui.agree)}
        </Button>
      )}
      {onReject && <Button onClick={() => onReject()}>{formatMessage(commonMessages.ui.reject)}</Button>}
    </StyledInstructorBlock>
  )
}

export default ApplyingRoleAdminBlock
