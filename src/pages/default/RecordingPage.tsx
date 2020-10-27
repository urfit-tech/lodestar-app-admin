import { useMutation } from '@apollo/react-hooks'
import { message, Modal, Spin } from 'antd'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import AudioTrackCard, { AudioTrackCardRef } from '../../components/podcast/AudioTrackCard'
import { UPDATE_PODCAST_PROGRAM_DURATION } from '../../components/podcast/PodcastProgramContentForm'
import PodcastProgramHeader from '../../components/podcast/PodcastProgramHeader'
import RecordButton from '../../components/podcast/RecordButton'
import RecordingController from '../../components/podcast/RecordingController'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { getFileDownloadableLink, handleError, uploadFile } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { usePodcastProgramAdmin } from '../../hooks/podcast'
import types from '../../types'
import { PodcastProgramAudio } from '../../types/podcast'
import {
  appendPodcastProgramAudio,
  deletePodcastProgramAudio,
  exportPodcastProgram,
  movePodcastProgramAudio,
  splitPodcastProgramAudio,
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
  const { podcastProgramAdmin, refetchPodcastProgramAdmin } = usePodcastProgramAdmin(appId, podcastProgramId)

  const [signedPodCastProgramAudios, setSignedPodCastProgramAudios] = useState<SignedPodCastProgramAudio[]>([])
  const podcastAudios = podcastProgramAdmin?.audios

  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [onEditingTitle, setonEditingTitle] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [currentPlayingSecond, setCurrentPlayingSecond] = useState(0)
  const [currentAudioId, setCurrentAudioId] = useState<string | undefined>()
  const [playRate, setPlayRate] = useState(1)

  const history = useHistory()

  const [updatePodcastProgramDuration] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_DURATION,
    types.UPDATE_PODCAST_PROGRAM_DURATIONVariables
  >(UPDATE_PODCAST_PROGRAM_DURATION)

  const currentAudioIndex = signedPodCastProgramAudios.findIndex(body => body.id === currentAudioId)

  const onGetRecordAudio = useCallback(
    (blob: Blob, duration: number) => {
      const filename = `未命名${`${signedPodCastProgramAudios.length + 1}`.padStart(2, '0')}.mp3`
      const audioKey = `audios/${appId}/${podcastProgramId}/${filename}`

      const totalDurationSecond = signedPodCastProgramAudios.reduce((sum, audio) => (sum += audio.duration), 0)
      const totalDuration = Math.ceil((duration + totalDurationSecond) / 60 || 0)

      setIsGeneratingAudio(true)
      uploadFile(audioKey, blob, authToken, {})
        .then(async () => {
          await appendPodcastProgramAudio(authToken, appId, podcastProgramId, audioKey, filename, duration)
          await refetchPodcastProgramAdmin()
          await updatePodcastProgramDuration({
            variables: {
              updatedAt: new Date(),
              podcastProgramId,
              duration: totalDuration,
            },
          })
        })
        .catch(error => {
          handleError(error)
        })
        .finally(() => {
          setIsGeneratingAudio(false)
        })
    },
    [
      appId,
      authToken,
      podcastProgramId,
      signedPodCastProgramAudios,
      refetchPodcastProgramAdmin,
      updatePodcastProgramDuration,
    ],
  )

  useEffect(() => {
    async function signAudios() {
      if (authToken == null) {
        return
      }
      if (podcastProgramAdmin == null) {
        return
      }

      setIsGeneratingAudio(true)

      try {
        const signedPodCastProgramAudios = await signPodCastProgramAudios(authToken, podcastProgramAdmin.audios)
        setSignedPodCastProgramAudios(signedPodCastProgramAudios)
        if (signedPodCastProgramAudios.length) {
          setCurrentAudioId(signedPodCastProgramAudios[0].id)
        }
      } catch (error) {
        message.error(error.message)
      }

      setIsGeneratingAudio(false)
    }

    signAudios()
  }, [authToken, podcastProgramAdmin])

  const audioTrackRefMap: Map<string, React.RefObject<AudioTrackCardRef>> = useMemo(() => {
    if (podcastAudios == null) {
      return new Map()
    }

    const m = new Map<string, React.RefObject<AudioTrackCardRef>>()
    for (const audio of podcastAudios) {
      m.set(audio.id, React.createRef())
    }
    return m
  }, [podcastAudios])

  // Use this method to actively play a track inside user interaction callback
  const onPlay = React.useCallback(() => {
    if (currentAudioId == null) {
      console.log('No audio is selected')

      return
    }

    const audioTrack = audioTrackRefMap.get(currentAudioId)?.current
    if (audioTrack == null) {
      console.warn('audioTrack is null or undefined')

      return
    }

    audioTrack.play()
  }, [audioTrackRefMap, currentAudioId])

  const onFinishPlaying = useCallback(() => {
    if (currentAudioIndex + 1 < signedPodCastProgramAudios.length) {
      setCurrentAudioId(signedPodCastProgramAudios[currentAudioIndex + 1].id)

      const _currentAudioId = signedPodCastProgramAudios[currentAudioIndex + 1].id
      const audioTrack = audioTrackRefMap.get(_currentAudioId)?.current
      if (audioTrack == null) {
        console.warn('audioTrack is null or undefined')
        return
      } else {
        audioTrack.init()
        audioTrack.play()
      }
    } else {
      setIsPlaying(false)
    }
  }, [audioTrackRefMap, currentAudioIndex, signedPodCastProgramAudios])

  const onForward = useCallback(() => {
    if (currentAudioId == null) {
      console.log('No audio is selected')

      return
    }

    const audioTrack = audioTrackRefMap.get(currentAudioId)?.current
    if (audioTrack == null) {
      console.warn('audioTrack is null or undefined')

      return
    }

    audioTrack.forward()
  }, [audioTrackRefMap, currentAudioId])

  const onBackward = useCallback(() => {
    if (currentAudioId == null) {
      console.log('No audio is selected')

      return
    }

    const audioTrack = audioTrackRefMap.get(currentAudioId)?.current
    if (audioTrack == null) {
      console.warn('audioTrack is null or undefined')

      return
    }

    audioTrack.backward()
  }, [audioTrackRefMap, currentAudioId])

  const onDeleteAudioTrack = useCallback(() => {
    if (currentAudioIndex === 0 && signedPodCastProgramAudios.length > 1) {
      setCurrentAudioId(signedPodCastProgramAudios[1].id)
    } else if (currentAudioIndex > 0) {
      setCurrentAudioId(signedPodCastProgramAudios[currentAudioIndex - 1].id)
    }

    const audio = signedPodCastProgramAudios[currentAudioIndex]
    const totalDurationSecond = signedPodCastProgramAudios
      .filter(_audio => _audio.id !== audio.id)
      .reduce((sum, audio) => (sum += audio.duration), 0)
    const totalDuration = Math.ceil(totalDurationSecond / 60 || 0)

    setIsGeneratingAudio(true)
    deletePodcastProgramAudio(authToken, appId, audio.id)
      .then(async () => {
        await refetchPodcastProgramAdmin()
        await updatePodcastProgramDuration({
          variables: {
            updatedAt: new Date(),
            podcastProgramId,
            duration: totalDuration,
          },
        })
      })
      .catch(error => {
        handleError(error)
      })
      .finally(() => {
        setIsGeneratingAudio(false)
      })
  }, [
    appId,
    authToken,
    podcastProgramId,
    currentAudioIndex,
    refetchPodcastProgramAdmin,
    signedPodCastProgramAudios,
    updatePodcastProgramDuration,
  ])

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

    const [, originalFileName] = /^([^()]+)(.+)?$/.exec(audio.filename) || []
    const serialNumber =
      Math.max(
        ...signedPodCastProgramAudios
          .filter(audio => audio.filename.includes(originalFileName))
          .map(audio => (/^([^.()]+)([(]+)([1-9])([)]+)?$/.exec(audio.filename) || [])[3] || '0')
          .map(Number),
      ) + 1

    setIsGeneratingAudio(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [audioId1, _] = await splitPodcastProgramAudio(authToken, appId, audio.id, currentPlayingSecond, {
        filenames: [audio.filename, `${originalFileName}(${serialNumber})`],
      })

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

  const onMoveUp = useCallback(
    audioId => {
      const oldIndex = signedPodCastProgramAudios.findIndex(audio => audio.id === audioId)
      if (oldIndex === 0) return
      const newIndex = oldIndex - 1
      const newAudios = signedPodCastProgramAudios.map(v => v)
      const currentAudio = newAudios.splice(oldIndex, 1)[0]
      newAudios.splice(newIndex, 0, currentAudio)
      setSignedPodCastProgramAudios(newAudios)
      movePodcastProgramAudio(authToken, appId, audioId, newIndex)
    },
    [appId, authToken, signedPodCastProgramAudios],
  )

  const onMoveDown = useCallback(
    audioId => {
      const oldIndex = signedPodCastProgramAudios.findIndex(audio => audio.id === audioId)
      if (oldIndex === signedPodCastProgramAudios.length - 1) return
      const newIndex = oldIndex + 1
      const newAudios = signedPodCastProgramAudios.map(v => v)
      const currentAudio = newAudios.splice(oldIndex, 1)[0]
      newAudios.splice(newIndex, 0, currentAudio)
      setSignedPodCastProgramAudios(newAudios)
      movePodcastProgramAudio(authToken, appId, audioId, newIndex)
    },
    [appId, authToken, signedPodCastProgramAudios],
  )

  useEffect(() => {
    if (onEditingTitle) return
    const onKeyDown = (event: KeyboardEvent) => {
      const { code: keyCode } = event
      if (['Space', 'ArrowRight', 'ArrowLeft', 'KeyD', 'KeyC', 'KeyS', 'KeyU'].includes(keyCode)) {
        event.preventDefault()
        event.stopPropagation()
      }
      switch (keyCode) {
        // Press space key
        case 'Space':
          if (isPlaying) {
            setIsPlaying(false)
          } else {
            onPlay()
          }
          break
        // Right key
        case 'ArrowRight':
          onForward()
          break
        // Left key
        case 'ArrowLeft':
          onBackward()
          break
        // D key for delete
        case 'KeyD':
          onDeleteAudioTrack()
          break
        // C key for cut
        case 'KeyC':
          onTrimAudio()
          break
        // S key for speed
        case 'KeyS':
          onPlayRateChange()
          break
        // U key for upload
        case 'KeyU':
          showUploadConfirmationModal()
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    onBackward,
    onForward,
    onDeleteAudioTrack,
    onTrimAudio,
    onPlayRateChange,
    showUploadConfirmationModal,
    isPlaying,
    onPlay,
    onEditingTitle,
  ])

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
          {signedPodCastProgramAudios.map((audio, index) => {
            return (
              <AudioTrackCard
                ref={audioTrackRefMap.get(audio.id)}
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
                onEditingTitle={onEditingTitle => setonEditingTitle(onEditingTitle)}
                onIsPlayingChanged={isPlaying => setIsPlaying(isPlaying)}
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
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
              />
            )
          })}

          {/* </ReactSortable> */}
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
        onPlay={onPlay}
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
