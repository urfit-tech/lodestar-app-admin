import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled, { ThemeContext } from 'styled-components'
import useRouter from 'use-react-router'
import AudioTrackCard, { WaveBlock } from '../../components/podcast/AudioTrackCard'
import RecordButton from '../../components/podcast/RecordButton'
import PodcastProgramHeader from '../../containers/podcast/PodcastProgramHeader'
import { podcastMessages } from '../../helpers/translation'

const StyledLayoutContent = styled.div`
  height: calc(100vh - 64px);
  overflow-y: auto;
`
const StyledContainer = styled.div`
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
  const theme = useContext(ThemeContext)

  const [isSelectMode, setIsSelectMode] = useState(false)
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
      <PodcastProgramHeader podcastProgramId={podcastProgramId} noPreview />
      <StyledLayoutContent>
        <StyledContainer className="container">
          <div className="text-center mb-5">
            <StyledPageTitle>{formatMessage(podcastMessages.ui.recordAudio)}</StyledPageTitle>
            <RecordButton />
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
                isSelected={isSelectMode ? selectedWaveIds.includes(wave.id) : undefined}
                onSelected={(id, checked) => {
                  checked
                    ? setSelectedWaveIds([...selectedWaveIds, id])
                    : setSelectedWaveIds(selectedWaveIds.filter(waveId => waveId !== id))
                }}
              >
                {/* // ! fake data */}
                <WaveBlock ref={null} width={wave.duration * 10} style={{ background: theme['@primary-color'] }} />
              </AudioTrackCard>
            ))}
          </ReactSortable>
        </StyledContainer>
      </StyledLayoutContent>
    </div>
  )
}

export default RecordingPage
