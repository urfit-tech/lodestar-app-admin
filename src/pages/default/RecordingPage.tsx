import { useMutation } from '@apollo/react-hooks'
import { message, Modal, Spin } from 'antd'
import moment from 'moment'
import { extname } from 'path'
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import { ReactSortable } from 'react-sortablejs'
import Recorder from 'recorder-js'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import AudioTrackCard from '../../components/podcast/AudioTrackCard'  
import PodcastProgramHeader from '../../components/podcast/PodcastProgramHeader'
import RecordButton from '../../components/podcast/RecordButton'
import RecordingController from '../../components/podcast/RecordingController'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { getFileDownloadableLink, handleError, uploadFile } from '../../helpers'
import {
  convertAudioBufferToMp3,
  decodeAudioArrayBuffer,
  mergeAudioBuffer,
  sliceAudioBuffer,
} from '../../helpers/audio'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import { UPDATE_PODCAST_PROGRAM_CONTENT, usePodcastProgramAdmin } from '../../hooks/podcast'
import types from '../../types'

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
  filename: string
}

const RecordingPage: React.FC = () => {
  const { id: appId } = useContext(AppContext)
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const { podcastProgramId } = useParams<{ podcastProgramId: string }>()
  const { podcastProgramAdmin, refetchPodcastProgramAdmin } = usePodcastProgramAdmin(podcastProgramId)

  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isInitializedAudio, setIsInitializedAudio] = useState(false)
  const [currentPlayingSecond, setCurrentPlayingSecond] = useState(0)
  const [currentAudioId, setCurrentAudioId] = useState<string | undefined>()
  const [playRate, setPlayRate] = useState(1)

  const [waveCollection, setWaveCollection] = useState<WaveCollectionProps[]>([])
  const audioObjectRef = useRef<{ waveCollection: WaveCollectionProps[]; currentAudioId: string | undefined }>()

  const [recorder, setRecorder] = useState<Recorder | null>(null)

  useEffect(() => {
    const initRecorder = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const _recorder = new Recorder(audioContext)
      _recorder.init(stream)

      return _recorder
    }
    !recorder && initRecorder().then(recorder => setRecorder(recorder))

    return () => {
      if (recorder) {
        ;(recorder as any).stream.getTracks().forEach((track: any) => track.stop())
        ;(recorder as any).audioContext.close()
      }
    }
  }, [recorder])

  const [updatePodcastProgramContent] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_CONTENT,
    types.UPDATE_PODCAST_PROGRAM_CONTENTVariables
  >(UPDATE_PODCAST_PROGRAM_CONTENT)
  const history = useHistory()

  const currentAudioIndex = waveCollection.findIndex(wave => wave.id === currentAudioId)

  useLayoutEffect(() => {
    audioObjectRef.current = {
      waveCollection,
      currentAudioId,
    }
  })

  const onGetRecordAudio = useCallback(
    (audioBuffer: AudioBuffer | null) => {
      if (audioBuffer && waveCollection) {
        const waveId = uuid()
        setWaveCollection([
          ...waveCollection,
          {
            id: waveId,
            audioBuffer,
            filename: moment().format('YYYY/MM/DD HH:mm:ss'),
          },
        ])
        setCurrentAudioId(waveId)
      }
      setIsGeneratingAudio(false)
    },
    [waveCollection],
  )

  useEffect(() => {
    const getAudioLink = async () => {
      if (podcastProgramAdmin?.contentType && waveCollection.length === 0 && !!appId && !isInitializedAudio) {
        setIsInitializedAudio(true)
        setIsGeneratingAudio(true)

        const fileKey = `audios/${appId}/${podcastProgramAdmin.id}.${podcastProgramAdmin.contentType}`
        const audioLink = await getFileDownloadableLink(fileKey, authToken)
        const audioRequest = new Request(audioLink)

        try {
          const response = await fetch(audioRequest)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await decodeAudioArrayBuffer(arrayBuffer)
          onGetRecordAudio(audioBuffer)
        } catch (error) {
          message.error(error)
        }
      }
    }
    getAudioLink()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(podcastProgramAdmin), appId, authToken, onGetRecordAudio, waveCollection.length])

  const onFinishPlaying = useCallback(() => {
    if (audioObjectRef.current) {
      const { waveCollection, currentAudioId } = audioObjectRef.current
      const nextAudioIndex = waveCollection.findIndex(wave => wave.id === currentAudioId)
      if (nextAudioIndex + 1 < waveCollection.length) {
        setCurrentAudioId(waveCollection[nextAudioIndex + 1].id)
      } else {
        setIsPlaying(false)
      }
    }
  }, [])

  const onForward = useCallback(() => {
    if (currentAudioIndex + 1 < waveCollection.length) {
      setCurrentAudioId(waveCollection[currentAudioIndex + 1].id)
    }
  }, [currentAudioIndex, waveCollection])

  const onBackward = useCallback(() => {
    if (currentAudioIndex > 0) {
      setCurrentAudioId(waveCollection[currentAudioIndex - 1].id)
    }
  }, [currentAudioIndex, waveCollection])

  const onDeleteAudioTrack = useCallback(() => {
    if (currentAudioIndex === 0 && waveCollection.length > 1) {
      setCurrentAudioId(waveCollection[1].id)
    } else if (currentAudioIndex > 0) {
      setCurrentAudioId(waveCollection[currentAudioIndex - 1].id)
    }
    setWaveCollection(waveCollection.filter(wave => wave.id !== currentAudioId))
  }, [currentAudioId, waveCollection, currentAudioIndex])

  const onPlayRateChange = useCallback(() => {
    playRate < 1 ? setPlayRate(1) : playRate < 1.5 ? setPlayRate(1.5) : playRate < 2 ? setPlayRate(2) : setPlayRate(0.5)
  }, [playRate])

  const onTrimAudio = useCallback(() => {
    const wave = waveCollection.find(wave => wave.id === currentAudioId)
    if (wave?.audioBuffer && currentPlayingSecond > 0) {
      const { duration, length } = wave.audioBuffer

      const audioSlicedFirst = sliceAudioBuffer(
        wave.audioBuffer,
        ~~((length * 0) / duration),
        ~~((length * currentPlayingSecond) / duration),
      )
      const audioSlicedLast = sliceAudioBuffer(
        wave.audioBuffer,
        ~~((length * currentPlayingSecond) / duration),
        ~~(length * 1),
      )
      setWaveCollection(
        waveCollection.reduce((acc: WaveCollectionProps[], wave: WaveCollectionProps) => {
          if (wave.id === currentAudioId) {
            const audioSlicedFirstId = uuid()
            acc.push({
              id: audioSlicedFirstId,
              audioBuffer: audioSlicedFirst,
              filename: wave.filename,
            })
            acc.push({
              id: uuid(),
              audioBuffer: audioSlicedLast,
              filename: wave.filename,
            })
            setCurrentAudioId(audioSlicedFirstId)
          } else {
            acc.push(wave)
          }
          return acc
        }, []),
      )
      setCurrentPlayingSecond(0)
    }
  }, [currentAudioId, currentPlayingSecond, waveCollection])

  const onUploadAudio = useCallback(() => {
    const showUploadingModal = () => {
      return Modal.info({
        icon: null,
        content: (
          <div className="text-center">
            <Spin size="large" className="my-5" />
            <p>{formatMessage(podcastMessages.text.uploadingVoice)}</p>
          </div>
        ),
        centered: true,
        okButtonProps: { disabled: true, className: 'modal-footer-hidden-button' },
      })
    }

    let dstAudioData = null
    if (waveCollection.length === 1) {
      dstAudioData = waveCollection[0].audioBuffer
    } else {
      dstAudioData = mergeAudioBuffer(waveCollection[0].audioBuffer, waveCollection[1].audioBuffer)
      for (let i = 2; i < waveCollection.length; i++) {
        if (dstAudioData) {
          dstAudioData = mergeAudioBuffer(dstAudioData, waveCollection[i].audioBuffer)
        }
      }
    }
    if (dstAudioData) {
      const modal = showUploadingModal()
      const mp3Data = convertAudioBufferToMp3(dstAudioData)
      const file = new File([mp3Data], 'record.mp3', { type: 'audio/mp3', lastModified: Date.now() })
      const durationMinute = Math.ceil(dstAudioData.duration / 60)
      uploadFile(`audios/${appId}/${podcastProgramId}` + extname(file.name), file, authToken, {})
        .then(() => {
          updatePodcastProgramContent({
            variables: {
              updatedAt: new Date(),
              podcastProgramId,
              contentType: 'mp3',
              duration: durationMinute,
            },
          })
            .then(async () => {
              await refetchPodcastProgramAdmin()
              message.success(formatMessage(commonMessages.event.successfullyUpload))
              history.push(`/podcast-programs/${podcastProgramId}`)
            })
            .catch(error => handleError(error))
            .finally(() => modal.destroy())
        })
        .catch(error => {
          handleError(error)
        })
    } else {
      handleError(new Error(formatMessage(errorMessages.event.failedPodcastRecording)))
    }
  }, [
    appId,
    authToken,
    formatMessage,
    history,
    podcastProgramId,
    refetchPodcastProgramAdmin,
    updatePodcastProgramContent,
    waveCollection,
  ])

  const showUploadConfirmationModal = useCallback(() => {
    return Modal.confirm({
      icon: null,
      title: formatMessage(podcastMessages.ui.bulkUpload),
      content: formatMessage(podcastMessages.text.bulkUploadMessage),
      okText: formatMessage(podcastMessages.ui.bulkUpload),
      centered: true,
      onOk: () => onUploadAudio(),
    })
  }, [formatMessage, onUploadAudio])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { keyCode } = event
      if ([32, 39, 37, 68, 67, 83, 85].includes(keyCode)) {
        event.preventDefault()
        event.stopPropagation()
      }
      switch (keyCode) {
        // Press space key
        case 32:
          setIsPlaying(isPlaying => !isPlaying)
          break
        // Right key
        case 39:
          onForward()
          break
        // Left key
        case 37:
          onBackward()
          break
        // D key for delete
        case 68:
          onDeleteAudioTrack()
          break
        // C key for cut
        case 67:
          onTrimAudio()
          break
        // S key for speed
        case 83:
          onPlayRateChange()
          break
        // U key for upload
        case 85:
          showUploadConfirmationModal()
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onBackward, onForward, onDeleteAudioTrack, onTrimAudio, onPlayRateChange, showUploadConfirmationModal])

  return (
    <div>
      <PodcastProgramHeader podcastProgramId={podcastProgramId} title={podcastProgramAdmin?.title} noPreview />
      <StyledLayoutContent>
        <StyledContainer className="container">
          <div className="text-center mb-5">
            <StyledPageTitle>{formatMessage(podcastMessages.ui.recordAudio)}</StyledPageTitle>
            <RecordButton
              recorder={recorder}
              onStart={() => setIsRecording(true)}
              onStop={() => {
                setIsRecording(false)
                setIsGeneratingAudio(true)
              }}
              onGetAudio={onGetRecordAudio}
            />
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
                  playRate={playRate}
                  audioBuffer={wave.audioBuffer}
                  filename={wave.filename}
                  onClick={() => {
                    setIsPlaying(false)
                    setCurrentAudioId(wave.id)
                  }}
                  isActive={wave.id === currentAudioId}
                  isPlaying={wave.id === currentAudioId && isPlaying}
                  onAudioPlaying={second => setCurrentPlayingSecond(second)}
                  onFinishPlaying={onFinishPlaying}
                  onChangeFilename={(id, filename) => {
                    setWaveCollection(
                      waveCollection.map(wave =>
                        wave.id === id
                          ? {
                              ...wave,
                              filename: filename,
                            }
                          : wave,
                      ),
                    )
                  }}
                />
              )
            })}
          </ReactSortable>
        </StyledContainer>
      </StyledLayoutContent>

      <RecordingController
        hidden={isRecording}
        name={`${(currentAudioIndex + 1).toString().padStart(2, '0')} ${formatMessage(podcastMessages.ui.voiceFile)}`}
        duration={currentPlayingSecond}
        playRate={playRate}
        isPlaying={isPlaying}
        isEditing={isEditing}
        isDeleteDisabled={waveCollection.length < 1}
        isUploadDisabled={waveCollection.length < 1}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEdit={() => {
          setIsEditing(isEditing => !isEditing)
        }}
        onTrim={onTrimAudio}
        onDelete={() => {
          onDeleteAudioTrack()
          setIsEditing(false)
        }}
        onUpload={() => {
          showUploadConfirmationModal()
          setIsEditing(false)
        }}
        onForward={onForward}
        onBackward={onBackward}
        onPlayRateChange={onPlayRateChange}
      />

      <Modal visible={isGeneratingAudio} closable={false} footer={false}>
        <div className="text-center">
          <Spin size="large" className="my-5" />
          <p className="mb-5">{formatMessage(podcastMessages.text.generatingVoice)}</p>
        </div>
      </Modal>
    </div>
  )
}

export default RecordingPage
