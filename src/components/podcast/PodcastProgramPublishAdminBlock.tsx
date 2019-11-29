import React from 'react'
import { StyledAdminBlock, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const PodcastProgramPublishAdminBlock: React.FC = () => {
  return (
    <div className="container py-5">
      <StyledAdminPaneTitle>發佈設定</StyledAdminPaneTitle>

      <StyledAdminBlock></StyledAdminBlock>
    </div>
  )
}

export default PodcastProgramPublishAdminBlock
