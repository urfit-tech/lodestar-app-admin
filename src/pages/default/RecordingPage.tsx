import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled, { ThemeContext } from 'styled-components'
import useRouter from 'use-react-router'
import AudioTrackCard, { WaveBlock } from '../../components/podcast/AudioTrackCard'
import RecordButton from '../../components/podcast/RecordButton'
import RecordingController from '../../components/podcast/RecordingController'
import PodcastProgramHeader from '../../containers/podcast/PodcastProgramHeader'
import { podcastMessages } from '../../helpers/translation'
import { usePodcastProgramCollection } from '../../hooks/podcast'

const StyledLayoutContent = styled.div`
  height: calc(100vh - 64px);
  overflow-y: auto;
`
const StyledContainer = styled.div`
  padding-top: 5rem;
  padding-bottom: 12rem;
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
  const theme = useContext(ThemeContext)
  const { podcastProgram } = usePodcastProgramCollection(podcastProgramId)

  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedWaveIds, setSelectedWaveIds] = useState<string[]>([])

  // ! fake data
  const [waveCollection, setWaveCollection] = useState<
    {
      id: string
      duration: number
    }[]
  >([
    {
      id: 'wave-1',
      duration: 8.66,
    },
    {
      id: 'wave-2',
      duration: 238.12,
    },
    {
      id: 'wave-3',
      duration: 300.03,
    },
  ])

  return (
    <div>
      <PodcastProgramHeader podcastProgramId={podcastProgramId} title={podcastProgram?.title} noPreview />
      <StyledLayoutContent>
        <StyledContainer className="container">
          <div className="text-center mb-5">
            <StyledPageTitle>{formatMessage(podcastMessages.ui.recordAudio)}</StyledPageTitle>
            <RecordButton onStart={() => setIsRecording(true)} onStop={() => setIsRecording(false)} />
          </div>

          <ReactSortable
            handle=".handle"
            list={waveCollection}
            setList={newWaveCollection => setWaveCollection(newWaveCollection)}
          >
            {waveCollection.map((wave, index) => (
              <AudioTrackCard
                key={wave.id}
                id={wave.id}
                position={index}
                duration={wave.duration}
                isSelected={isEditing ? selectedWaveIds.includes(wave.id) : undefined}
                onSelected={(id, checked) => {
                  checked
                    ? setSelectedWaveIds([...selectedWaveIds, id])
                    : setSelectedWaveIds(selectedWaveIds.filter(waveId => waveId !== id))
                }}
              >
                {/* // ! fake data */}
                <WaveBlock ref={null} width={wave.duration * 75} style={{ background: theme['@primary-color'] }} />
              </AudioTrackCard>
            ))}
          </ReactSortable>
        </StyledContainer>
      </StyledLayoutContent>

      <RecordingController
        hidden={isRecording}
        name="01 音檔"
        duration={0}
        isPlaying={isPlaying}
        isEditing={isEditing}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEdit={() => setIsEditing(isEditing => !isEditing)}
      />
    </div>
  )
}

export default RecordingPage
