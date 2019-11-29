import React from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import PodcastProgramAdminBlock from '../../../containers/podcast/PodcastProgramAdminBlock'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`

const PodcastAdminPage: React.FC = () => {
  const { match } = useRouter<{ podcastId: string }>()
  const podcastId = match.params.podcastId

  return (
    <StyledWrapper>
      <PodcastProgramAdminBlock podcastId={podcastId} />
    </StyledWrapper>
  )
}

export default PodcastAdminPage
