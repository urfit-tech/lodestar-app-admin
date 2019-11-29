import React from 'react'
import { StyledAdminBlock, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const PodcastProgramSettingsAdminBlock: React.FC = () => {
  return (
    <div className="container py-5">
      <StyledAdminPaneTitle>廣播設定</StyledAdminPaneTitle>

      <StyledAdminBlock></StyledAdminBlock>
    </div>
  )
}

export default PodcastProgramSettingsAdminBlock
