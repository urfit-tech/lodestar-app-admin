import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import AudioTrackCard from '../../components/podcast/AudioTrackCard'
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

interface WaveCollectionProps {
  id: string
  audioBuffer: AudioBuffer
}

const RecordingPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { podcastProgramId } = useParams<{ podcastProgramId: string }>()
  const { podcastProgram } = usePodcastProgramCollection(podcastProgramId)

  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedWaveIds, setSelectedWaveIds] = useState<string[]>([])
  const [selectedAudioTarget, setSelectedAudioTarget] = useState<string | undefined>()

  const [waveCollection, setWaveCollection] = useState<WaveCollectionProps[]>([])

  const onRecordStop = (audioBuffer: AudioBuffer | null) => {
    if (audioBuffer) {
      const waveId = uuidv4()

      setWaveCollection([
        ...waveCollection,
        {
          id: waveId,
          audioBuffer,
        },
      ])

      if (!selectedAudioTarget) {
        setSelectedAudioTarget(waveId)
      }
    }
    setIsRecording(false)
  }

  const onChangeAudioTrackCard = (waveId: string) => {
    setIsPlaying(false)
    setSelectedAudioTarget(waveId)
  }

  const onAudioPlaying = (second: number) => {
    console.log(second)
  }

  const onFinishPlaying = () => {
    console.log(waveCollection)
    // const selectAudioIndex = waveCollectionRef.current.findIndex(wave => wave.id === selectedAudioTarget)
    // console.log(selectedAudioTarget)
    // console.log(selectAudioIndex)
    // if (selectAudioIndex < waveCollectionRef.current.length) {
    //   setSelectedAudioTarget(waveCollectionRef.current[selectAudioIndex + 1].id)
    // } else {
    //   setIsPlaying(false)
    // }
  }

  return (
    <div>
      <PodcastProgramHeader podcastProgramId={podcastProgramId} title={podcastProgram?.title} noPreview />
      <StyledLayoutContent>
        <StyledContainer className="container">
          <div className="text-center mb-5">
            <StyledPageTitle>{formatMessage(podcastMessages.ui.recordAudio)}</StyledPageTitle>
            <RecordButton onStart={() => setIsRecording(true)} onStop={onRecordStop} />
          </div>

          <ReactSortable
            handle=".handle"
            list={waveCollection}
            setList={newWaveCollection => setWaveCollection(newWaveCollection)}
          >
            {waveCollection.map((wave, index) => {
              return (
                <AudioTrackCard
                  key={wave.id}
                  id={wave.id}
                  position={index}
                  audioBuffer={wave.audioBuffer}
                  onClick={() => onChangeAudioTrackCard(wave.id)}
                  isActive={wave.id === selectedAudioTarget}
                  isPlaying={wave.id === selectedAudioTarget && isPlaying}
                  isSelected={isEditing ? selectedWaveIds.includes(wave.id) : undefined}
                  onSelected={(id, checked) => {
                    console.log(waveCollection)
                    checked
                      ? setSelectedWaveIds([...selectedWaveIds, id])
                      : setSelectedWaveIds(selectedWaveIds.filter(waveId => waveId !== id))
                  }}
                  onAudioPlaying={onAudioPlaying}
                  onFinishPlaying={onFinishPlaying}
                />
              )
            })}
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
