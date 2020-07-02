import React from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import PodcastProgramHeader from '../../containers/podcast/PodcastProgramHeader'

const RecordingPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { match } = useRouter<{ podcastProgramId: string }>()
  const podcastProgramId = match.params.podcastProgramId

  return (
    <div>
      <PodcastProgramHeader podcastProgramId={podcastProgramId} noPreview />
      <StyledLayoutContent></StyledLayoutContent>
    </div>
  )
}

export default RecordingPage
