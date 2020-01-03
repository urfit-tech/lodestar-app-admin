import { Skeleton } from 'antd'
import React from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import PodcastProgramAdminBlock from '../../../containers/podcast/PodcastProgramAdminBlock'
import { useAuth } from '../../../contexts/AuthContext'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`

const PodcastProgramAdminPage: React.FC = () => {
  const { match } = useRouter<{ podcastProgramId: string }>()
  const podcastProgramId = match.params.podcastProgramId
  const { currentMemberId } = useAuth()

  return (
    <StyledWrapper>
      {!currentMemberId ? <Skeleton active /> : <PodcastProgramAdminBlock podcastProgramId={podcastProgramId} />}
    </StyledWrapper>
  )
}

export default PodcastProgramAdminPage
