import { gql, useMutation } from '@apollo/client'
import { message, Modal, Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import AudioTrackCard, { AudioTrackCardRef } from '../components/podcast/AudioTrackCard'
import { UPDATE_PODCAST_PROGRAM_DURATION } from '../components/podcast/PodcastProgramContentForm'
import PodcastProgramHeader from '../components/podcast/PodcastProgramHeader'
import RecordButton from '../components/podcast/RecordButton'
import RecordingController from '../components/podcast/RecordingController'
import hasura from '../hasura'
import { getFileDownloadableLink, handleError, uploadFile } from '../helpers'
import { commonMessages, podcastMessages } from '../helpers/translation'
import { usePodcastProgramAdmin } from '../hooks/podcast'
import { PodcastProgramAudio } from '../types/podcast'
import {
  appendPodcastProgramAudio,
  deletePodcastProgramAudio,
  exportPodcastProgram,
  splitPodcastProgramAudio,
} from './RecordingPageHelpers'
import pageMessages from './translation'
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
  const { formatMessage } = useIntl()
  const { podcastProgramId } = useParams<{ podcastProgramId: string }>()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const { podcastProgramAdmin, refetchPodcastProgramAdmin } = usePodcastProgramAdmin(podcastProgramId)

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
    hasura.UPDATE_PODCAST_PROGRAM_DURATION,
    hasura.UPDATE_PODCAST_PROGRAM_DURATIONVariables
  >(UPDATE_PODCAST_PROGRAM_DURATION)

  const [updatePodcastProgramAudioData] = useMutation<
    hasura.UPDATE_PODCAST_PROGRAM_AUDIO_DATA,
    hasura.UPDATE_PODCAST_PROGRAM_AUDIO_DATAVariables
  >(UPDATE_PODCAST_PROGRAM_AUDIO_DATA)
  const [updatePodcastProgramAudioPosition] = useMutation<
    hasura.UPDATE_PODCAST_PROGRAM_AUDIO_POSITION,
    hasura.UPDATE_PODCAST_PROGRAM_AUDIO_POSITIONVariables
  >(UPDATE_PODCAST_PROGRAM_AUDIO_POSITION)

  const currentAudioIndex = signedPodCastProgramAudios.findIndex(body => body.id === currentAudioId)

  useEffect(() => {
    refetchPodcastProgramAdmin()
  }, [refetchPodcastProgramAdmin])

  const onGetRecordAudio = useCallback(
    (blob: Blob, duration: number) => {
      const filename = `${formatMessage(pageMessages.RecordingPage.Unnamed)}${`${
        signedPodCastProgramAudios.length + 1
      }`.padStart(2, '0')}.mp3`
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
              durationSecond: totalDurationSecond,
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
      refetchPodcastProgramAdmin,
      signedPodCastProgramAudios,
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
          setCurrentAudioId(currentAudioId => currentAudioId || signedPodCastProgramAudios[0].id)
        }
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message)
        }
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
            durationSecond: totalDurationSecond,
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
    currentAudioIndex,
    podcastProgramId,
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

    const [, filename, originalFileName, ,] = /^(([^()]+)\(?(\d+)?\)?)\.(\w+)?$/.exec(audio.filename) || []
    const serialNumber =
      Math.max(
        ...signedPodCastProgramAudios
          .filter(audio => audio.filename.includes(originalFileName))
          .map(audio => (/^(([^()]+)\(?(\d+)?\)?)\.(\w+)?$/.exec(audio.filename) || [])[3] || '0')
          .map(Number),
      ) + 1

    setIsGeneratingAudio(true)

    try {
      const [, audioId2] = await splitPodcastProgramAudio(authToken, appId, audio.id, currentPlayingSecond, {
        filenames: [filename, `${originalFileName}(${serialNumber})`],
      })

      setCurrentPlayingSecond(0)
      setCurrentAudioId(audioId2)

      await refetchPodcastProgramAdmin()
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
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
      .then(async () => {
        const totalDurationSecond = signedPodCastProgramAudios.reduce((sum, audio) => (sum += audio.duration), 0)
        const totalDuration = Math.ceil(totalDurationSecond / 60 || 0)
        await updatePodcastProgramDuration({
          variables: {
            updatedAt: new Date(),
            podcastProgramId,
            duration: totalDuration,
            durationSecond: totalDurationSecond,
          },
        })
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
  }, [
    appId,
    authToken,
    formatMessage,
    history,
    podcastProgramId,
    refetchPodcastProgramAdmin,
    signedPodCastProgramAudios,
    updatePodcastProgramDuration,
  ])

  const showUploadConfirmationModal = useCallback(() => {
    return Modal.confirm({
      icon: null,
      title: formatMessage(podcastMessages.ui.bulkUpload),
      content: formatMessage(podcastMessages.text.bulkUploadMessage),
      okText: formatMessage(podcastMessages.ui.bulkUpload),
      cancelText: formatMessage(commonMessages.ui.cancel),
      centered: true,
      onOk: () => onUploadAudio(),
    })
  }, [formatMessage, onUploadAudio])

  const showDeleteConfirmationModal = useCallback(() => {
    return Modal.confirm({
      icon: null,
      title: formatMessage(podcastMessages.ui.deleteAudio),
      content: formatMessage(podcastMessages.text.deleteMessage),
      okText: formatMessage(podcastMessages.ui.deleteAudio),
      cancelText: formatMessage(commonMessages.ui.cancel),
      centered: true,
      onOk: () => onDeleteAudioTrack(),
    })
  }, [formatMessage, onDeleteAudioTrack])

  const onMoveUp = useCallback(
    audioId => {
      const oldIndex = signedPodCastProgramAudios.findIndex(audio => audio.id === audioId)
      if (oldIndex === 0) return
      const newIndex = oldIndex - 1
      const newAudios = signedPodCastProgramAudios.map(v => v)
      const currentAudio = newAudios.splice(oldIndex, 1)[0]
      newAudios.splice(newIndex, 0, currentAudio)
      updatePodcastProgramAudioPosition({
        variables: {
          podcastProgramAudios: newAudios.map((audio, index) => ({
            id: audio.id,
            podcast_program_id: audio.id,
            data: {},
            position: index,
          })),
        },
      })
      setSignedPodCastProgramAudios(newAudios)
    },
    [signedPodCastProgramAudios, updatePodcastProgramAudioPosition],
  )

  const onMoveDown = useCallback(
    audioId => {
      const oldIndex = signedPodCastProgramAudios.findIndex(audio => audio.id === audioId)
      if (oldIndex === signedPodCastProgramAudios.length - 1) return
      const newIndex = oldIndex + 1
      const newAudios = signedPodCastProgramAudios.map(v => v)
      const currentAudio = newAudios.splice(oldIndex, 1)[0]
      newAudios.splice(newIndex, 0, currentAudio)
      updatePodcastProgramAudioPosition({
        variables: {
          podcastProgramAudios: newAudios.map((audio, index) => ({
            id: audio.id,
            podcast_program_id: audio.id,
            data: {},
            position: index,
          })),
        },
      })
      setSignedPodCastProgramAudios(newAudios)
    },
    [signedPodCastProgramAudios, updatePodcastProgramAudioPosition],
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
          showDeleteConfirmationModal()
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
    showDeleteConfirmationModal,
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
              id="recordButton"
              onStart={() => {
                setIsRecording(true)
              }}
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
                onIsEditingTitleChanged={isEditingTitle => setonEditingTitle(isEditingTitle)}
                onIsPlayingChanged={isPlaying => setIsPlaying(isPlaying)}
                onFinishPlaying={onFinishPlaying}
                onChangeFilename={(id, filename) => {
                  const audios = signedPodCastProgramAudios.map(audio => {
                    if (audio.id !== id) {
                      return audio
                    }

                    const targetAudio = podcastAudios?.find(audio => audio.id === id)
                    if (targetAudio) {
                      updatePodcastProgramAudioData({
                        variables: {
                          podcastProgramAudioId: id,
                          data: {
                            key: targetAudio.key,
                            duration: targetAudio.duration,
                            filename,
                          },
                        },
                      })
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
          showDeleteConfirmationModal()
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

const UPDATE_PODCAST_PROGRAM_AUDIO_DATA = gql`
  mutation UPDATE_PODCAST_PROGRAM_AUDIO_DATA($podcastProgramAudioId: uuid!, $data: jsonb) {
    update_podcast_program_audio(where: { id: { _eq: $podcastProgramAudioId } }, _set: { data: $data }) {
      affected_rows
    }
  }
`

const UPDATE_PODCAST_PROGRAM_AUDIO_POSITION = gql`
  mutation UPDATE_PODCAST_PROGRAM_AUDIO_POSITION($podcastProgramAudios: [podcast_program_audio_insert_input!]!) {
    insert_podcast_program_audio(
      objects: $podcastProgramAudios
      on_conflict: { constraint: podcast_program_audio_pkey, update_columns: position }
    ) {
      affected_rows
    }
  }
`

export default RecordingPage
