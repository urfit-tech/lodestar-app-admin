import React from 'react'
import { StyledAdminBlock, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const PodcastProgramRoleAdminBlock: React.FC = () => {
  return (
    <div className="container py-5">
      <StyledAdminPaneTitle>身份管理</StyledAdminPaneTitle>

      <StyledAdminBlock></StyledAdminBlock>
    </div>
  )
}

export default PodcastProgramRoleAdminBlock
