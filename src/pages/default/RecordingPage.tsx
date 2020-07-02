import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import RecordButton from '../../components/podcast/RecordButton'
import PodcastProgramHeader from '../../containers/podcast/PodcastProgramHeader'
import { podcastMessages } from '../../helpers/translation'

const StyledLayoutContent = styled.div`
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 5rem 0;
`
const StyledPageTitle = styled.h1`
  margin-bottom: 2rem;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
`

const RecordingPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { match } = useRouter<{ podcastProgramId: string }>()
  const podcastProgramId = match.params.podcastProgramId

  return (
    <div>
      <PodcastProgramHeader podcastProgramId={podcastProgramId} noPreview />
      <StyledLayoutContent>
        <div className="text-center">
          <StyledPageTitle>{formatMessage(podcastMessages.ui.recordAudio)}</StyledPageTitle>
          <RecordButton />
        </div>
      </StyledLayoutContent>
    </div>
  )
}

export default RecordingPage
