import React from 'react'
import { StyledAdminBlock, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const PodcastProgramContentAdminBlock: React.FC = () => {
  return (
    <div className="container py-5">
      <StyledAdminPaneTitle>廣播內容</StyledAdminPaneTitle>

      <StyledAdminBlock></StyledAdminBlock>
    </div>
  )
}

export default PodcastProgramContentAdminBlock
