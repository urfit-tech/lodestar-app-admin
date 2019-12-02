import React, { useContext } from 'react'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { StyledAdminBlock, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const PodcastProgramSettingsAdminBlock: React.FC = () => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)

  return (
    <div className="container py-5">
      <StyledAdminPaneTitle>廣播設定</StyledAdminPaneTitle>

      <StyledAdminBlock></StyledAdminBlock>
    </div>
  )
}

export default PodcastProgramSettingsAdminBlock
