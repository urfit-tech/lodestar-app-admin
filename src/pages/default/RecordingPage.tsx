import { message, Modal, Spin } from 'antd'
import { isEqual } from 'lodash'
import React, { useCallback, useContext, useEffect, useState } from 'react'
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
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { usePodcastProgramAdmin } from '../../hooks/podcast'
import { PodcastProgramAudio } from '../../types/podcast'
import {
  appendPodcastProgramAduio,
  deletePodcastProgramAduio,
  exportPodcastProgram,
  movePodcastProgramAduio,
  splitPodcastProgramAduio,
} from './RecordingPageHelpers'

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

interface SignedPodCastProgramAudio {
  id: string
  url: string
  filename: string
  duration: number
}

async function signPodCastProgramAudios(
  authToken: string,
  audios: PodcastProgramAudio[],
): Promise<SignedPodCastProgramAudio[]> {
  const audioKeys = audios.map(audio => audio.key)
  const audioUrls = await Promise.all(audioKeys.map(key => getFileDownloadableLink(key, authToken)))

  const signedAudios: SignedPodCastProgramAudio[] = []
  for (let i = 0; i < audios.length; i++) {
    const audio = audios[i]
    const { id, filename, duration } = audio

    signedAudios.push({
      id,
      filename,
      duration,
      url: audioUrls[i],
    })
  }
  return signedAudios
}

const RecordingPage: React.FC = () => {
  const { id: appId } = useContext(AppContext)
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const { podcastProgramId } = useParams<{ podcastProgramId: string }>()
  const { podcastProgramAdmin, loadingPodcastProgramAdmin, refetchPodcastProgramAdmin } = usePodcastProgramAdmin(
    appId,
    podcastProgramId,
  )

  console.log('loadingPodcastProgramAdmin', loadingPodcastProgramAdmin)

  const [signedPodCastProgramAudios, setSignedPodCastProgramAudios] = useState<SignedPodCastProgramAudio[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(true)
  const [currentPlayingSecond, setCurrentPlayingSecond] = useState(0)
  const [currentAudioId, setCurrentAudioId] = useState<string | undefined>()
  const [playRate, setPlayRate] = useState(1)

  const history = useHistory()

  const currentAudioIndex = signedPodCastProgramAudios.findIndex(body => body.id === currentAudioId)

  const onGetRecordAudio = useCallback(
    (blob: Blob, duration: number) => {
      const filename = `${uuid()}.mp3`
      const audioKey = `audios/${appId}/${podcastProgramId}/${filename}`

      setIsGeneratingAudio(true)
      uploadFile(audioKey, blob, authToken, {})
        .then(async () => {
          await appendPodcastProgramAduio(authToken, appId, podcastProgramId, audioKey, filename, duration)
          await refetchPodcastProgramAdmin()
        })
        .catch(error => {
          handleError(error)
        })
        .finally(() => {
          setIsGeneratingAudio(false)
        })
    },
    [appId, authToken, podcastProgramId, refetchPodcastProgramAdmin],
  )

  useEffect(() => {
    async function signAudios() {
      if (authToken == null) {
        return
      }
      if (podcastProgramAdmin == null) {
        return
      }

      if (podcastProgramAdmin.contentType == null) {
        return
      }

      setIsGeneratingAudio(true)

      try {
        const signedPodCastProgramAudios = await signPodCastProgramAudios(authToken, podcastProgramAdmin.audios)
        setSignedPodCastProgramAudios(signedPodCastProgramAudios)
      } catch (error) {
        message.error(error.message)
      }

      setIsGeneratingAudio(false)
    }

    signAudios()
  }, [authToken, podcastProgramAdmin])

  const onFinishPlaying = useCallback(() => {
    if (currentAudioIndex + 1 < signedPodCastProgramAudios.length) {
      setCurrentAudioId(signedPodCastProgramAudios[currentAudioIndex + 1].id)
    } else {
      setIsPlaying(false)
    }
  }, [currentAudioIndex, signedPodCastProgramAudios])

  const onForward = useCallback(() => {
    if (currentAudioIndex + 1 < signedPodCastProgramAudios.length) {
      setCurrentAudioId(signedPodCastProgramAudios[currentAudioIndex + 1].id)
    }
  }, [currentAudioIndex, signedPodCastProgramAudios])

  const onBackward = useCallback(() => {
    if (currentAudioIndex > 0) {
      setCurrentAudioId(signedPodCastProgramAudios[currentAudioIndex - 1].id)
    }
  }, [currentAudioIndex, signedPodCastProgramAudios])

  const onDeleteAudioTrack = useCallback(() => {
    if (currentAudioIndex === 0 && signedPodCastProgramAudios.length > 1) {
      setCurrentAudioId(signedPodCastProgramAudios[1].id)
    } else if (currentAudioIndex > 0) {
      setCurrentAudioId(signedPodCastProgramAudios[currentAudioIndex - 1].id)
    }

    const audio = signedPodCastProgramAudios[currentAudioIndex]

    setIsGeneratingAudio(true)
    deletePodcastProgramAduio(authToken, appId, audio.id)
      .then(async () => {
        await refetchPodcastProgramAdmin()
      })
      .catch(error => {
        handleError(error)
      })
      .finally(() => {
        setIsGeneratingAudio(false)
      })
  }, [appId, authToken, currentAudioIndex, refetchPodcastProgramAdmin, signedPodCastProgramAudios])

  const onPlayRateChange = useCallback(() => {
    playRate < 1 ? setPlayRate(1) : playRate < 1.5 ? setPlayRate(1.5) : playRate < 2 ? setPlayRate(2) : setPlayRate(0.5)
  }, [playRate])

  const onTrimAudio = useCallback(async () => {
    const audio = signedPodCastProgramAudios.find(audio => audio.id === currentAudioId)
    if (audio == null) {
      console.warn('Cannot find audio with id', currentAudioId)

      return
    }

    if (currentPlayingSecond <= 0) {
      return
    }

    setIsGeneratingAudio(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [audioId1, _] = await splitPodcastProgramAduio(authToken, appId, audio.id, currentPlayingSecond)

      setCurrentPlayingSecond(0)
      setCurrentAudioId(audioId1)

      await refetchPodcastProgramAdmin()
    } catch (error) {
      message.error(error.message)
    }

    setIsGeneratingAudio(false)
  }, [appId, authToken, currentAudioId, currentPlayingSecond, refetchPodcastProgramAdmin, signedPodCastProgramAudios])

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

    const modal = showUploadingModal()
    exportPodcastProgram(authToken, appId, podcastProgramId)
      .then(() => {
        return refetchPodcastProgramAdmin()
      })
      .then(
        async () => {
          message.success(formatMessage(commonMessages.event.successfullyUpload))
          history.push(`/podcast-programs/${podcastProgramId}`)
        },
        error => handleError(error),
      )
      .finally(() => modal.destroy())
  }, [appId, authToken, formatMessage, history, podcastProgramId, refetchPodcastProgramAdmin])

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
              onStart={() => setIsRecording(true)}
              onStop={() => {
                setIsRecording(false)
              }}
              onGetAudio={onGetRecordAudio}
            />
          </div>

          <ReactSortable
            handle=".handle"
            list={signedPodCastProgramAudios}
            setList={newAudios => {
              if (isEqual(newAudios, signedPodCastProgramAudios)) {
                // ReactSortable seems to be calling this callback when user
                // drag the first time, and setting signedPodCastProgramAudios
                // would invalidate the drag

                return
              }

              console.log('setSignedPodCastProgramAudios')
              setSignedPodCastProgramAudios(newAudios)
            }}
            onEnd={e => {
              const oldIndex = e.oldIndex
              const newIndex = e.newIndex

              if (oldIndex == null || newIndex == null) {
                console.warn('Either oldIndex or newIndex are zero in ReactSortable.onEnd')

                return
              }

              if (oldIndex === newIndex) {
                return
              }

              const audioId = e.item.dataset['id']
              if (!audioId) {
                console.warn('Got empty audioId')

                return
              }

              movePodcastProgramAduio(authToken, appId, audioId, newIndex)
            }}
          >
            {signedPodCastProgramAudios.map((audio, index) => {
              return (
                <AudioTrackCard
                  key={audio.id}
                  id={audio.id}
                  position={index}
                  playRate={playRate}
                  filename={audio.filename}
                  audioUrl={audio.url}
                  onClick={() => {
                    setIsPlaying(false)
                    setCurrentAudioId(audio.id)
                  }}
                  isActive={audio.id === currentAudioId}
                  isPlaying={audio.id === currentAudioId && isPlaying}
                  onAudioPlaying={second => setCurrentPlayingSecond(second)}
                  onFinishPlaying={onFinishPlaying}
                  onChangeFilename={(id, filename) => {
                    const audios = signedPodCastProgramAudios.map(audio => {
                      if (audio.id !== id) {
                        return audio
                      }

                      return {
                        ...audio,
                        filename,
                      }
                    })

                    setSignedPodCastProgramAudios(audios)
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
        isDeleteDisabled={signedPodCastProgramAudios.length < 1}
        isUploadDisabled={signedPodCastProgramAudios.length < 1}
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
