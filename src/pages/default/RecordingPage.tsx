import { useMutation } from '@apollo/react-hooks'
import { message, Modal, Spin } from 'antd'
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
import { podcastMessages } from '../../helpers/translation'
import { UPDATE_PODCAST_PROGRAM_CONTENT, usePodcastProgramAdmin } from '../../hooks/podcast'
import types from '../../types'
import { PodcastProgramAudio } from '../../types/podcast'
import { appendPodcastProgramAduio } from './RecordingPageHelpers'

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

async function signPodCastProgramBody(
  authToken: string,
  audio: PodcastProgramAudio,
): Promise<SignedPodCastProgramAudio> {
  const url = await getFileDownloadableLink(audio.key, authToken)
  const { id, filename, duration } = audio

  return {
    id,
    url,
    filename,
    duration,
  }
}

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

  const [updatePodcastProgramContent] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_CONTENT,
    types.UPDATE_PODCAST_PROGRAM_CONTENTVariables
  >(UPDATE_PODCAST_PROGRAM_CONTENT)
  const history = useHistory()

  const currentAudioIndex = signedPodCastProgramAudios.findIndex(body => body.id === currentAudioId)

  const onGetRecordAudio = useCallback(
    (blob: Blob, duration: number) => {
      const filename = `${uuid()}.mp3`
      const audioKey = `audios/${appId}/${podcastProgramId}/${filename}`

      setIsGeneratingAudio(true)
      uploadFile(audioKey, blob, authToken, {})
        .then(async () => {
          await appendPodcastProgramAduio(appId, podcastProgramId, audioKey, filename, duration, authToken)
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
    console.log('onDeleteAudioTrack')
    // if (currentAudioIndex === 0 && signedPodCastProgramBodies.length > 1) {
    //   setCurrentAudioId(signedPodCastProgramBodies[1].id)
    // } else if (currentAudioIndex > 0) {
    //   setCurrentAudioId(signedPodCastProgramBodies[currentAudioIndex - 1].id)
    // }
    // setWaveCollection(signedPodCastProgramBodies.filter(wave => wave.id !== currentAudioId))
  }, [])

  const onPlayRateChange = useCallback(() => {
    playRate < 1 ? setPlayRate(1) : playRate < 1.5 ? setPlayRate(1.5) : playRate < 2 ? setPlayRate(2) : setPlayRate(0.5)
  }, [playRate])

  const onTrimAudio = useCallback(() => {
    console.log('onTrimAudio')
    // const wave = signedPodCastProgramBodies.find(wave => wave.id === currentAudioId)
    // if (wave?.audioBuffer && currentPlayingSecond > 0) {
    //   const { duration, length } = wave.audioBuffer

    //   const audioSlicedFirst = sliceAudioBuffer(
    //     wave.audioBuffer,
    //     ~~((length * 0) / duration),
    //     ~~((length * currentPlayingSecond) / duration),
    //   )
    //   const audioSlicedLast = sliceAudioBuffer(
    //     wave.audioBuffer,
    //     ~~((length * currentPlayingSecond) / duration),
    //     ~~(length * 1),
    //   )
    //   setWaveCollection(
    //     signedPodCastProgramBodies.reduce((acc: WaveCollectionProps[], wave: WaveCollectionProps) => {
    //       if (wave.id === currentAudioId) {
    //         const audioSlicedFirstId = uuid()
    //         acc.push({
    //           id: audioSlicedFirstId,
    //           audioBuffer: audioSlicedFirst,
    //           filename: wave.filename,
    //         })

    //         const [, originalFileName] = /^([^()]+)(.+)?$/.exec(wave.filename) || []
    //         const serialNumber =
    //           Math.max(
    //             ...signedPodCastProgramBodies
    //               .filter(wave => wave.filename.includes(originalFileName))
    //               .map(wave => (/^([^.()]+)([(]+)(\d+)([)]+)?$/.exec(wave.filename) || [])[3] || '0')
    //               .map(Number),
    //           ) + 1

    //         acc.push({
    //           id: uuid(),
    //           audioBuffer: audioSlicedLast,
    //           filename: `${originalFileName}(${serialNumber})`,
    //         })
    //         setCurrentAudioId(audioSlicedFirstId)
    //       } else {
    //         acc.push(wave)
    //       }
    //       return acc
    //     }, []),
    //   )
    //   setCurrentPlayingSecond(0)
    // }
  }, [])

  const onUploadAudio = useCallback(() => {
    console.log('onUploadAudio')
    // const showUploadingModal = () => {
    //   return Modal.info({
    //     icon: null,
    //     content: (
    //       <div className="text-center">
    //         <Spin size="large" className="my-5" />
    //         <p>{formatMessage(podcastMessages.text.uploadingVoice)}</p>
    //       </div>
    //     ),
    //     centered: true,
    //     okButtonProps: { disabled: true, className: 'modal-footer-hidden-button' },
    //   })
    // }

    // const modal = showUploadingModal()
    // let dstAudioData = null
    // if (signedPodCastProgramBodies.length === 1) {
    //   dstAudioData = signedPodCastProgramBodies[0].audioBuffer
    // } else {
    //   dstAudioData = mergeAudioBuffer(
    //     signedPodCastProgramBodies[0].audioBuffer,
    //     signedPodCastProgramBodies[1].audioBuffer,
    //   )
    //   for (let i = 2; i < signedPodCastProgramBodies.length; i++) {
    //     if (dstAudioData) {
    //       dstAudioData = mergeAudioBuffer(dstAudioData, signedPodCastProgramBodies[i].audioBuffer)
    //     }
    //   }
    // }
    // if (dstAudioData) {
    //   const mp3Data = convertAudioBufferToMp3(dstAudioData)
    //   const file = new File([mp3Data], 'record.mp3', { type: 'audio/mp3', lastModified: Date.now() })
    //   const durationMinute = Math.ceil(dstAudioData.duration / 60)
    //   uploadFile(`audios/${appId}/${podcastProgramId}` + extname(file.name), file, authToken, {})
    //     .then(() => {
    //       updatePodcastProgramContent({
    //         variables: {
    //           updatedAt: new Date(),
    //           podcastProgramId,
    //           contentType: 'mp3',
    //           duration: durationMinute,
    //         },
    //       })
    //         .then(async () => {
    //           await refetchPodcastProgramAdmin()
    //           message.success(formatMessage(commonMessages.event.successfullyUpload))
    //           history.push(`/podcast-programs/${podcastProgramId}`)
    //         })
    //         .catch(error => handleError(error))
    //         .finally(() => modal.destroy())
    //     })
    //     .catch(error => {
    //       handleError(error)
    //     })
    // } else {
    //   modal.destroy()
    //   handleError(new Error(formatMessage(errorMessages.event.failedPodcastRecording)))
    // }
  }, [])

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
            // setList={newWaveCollection => setWaveCollection(newWaveCollection)}
            setList={() => {}}
          >
            {/* {signedPodCastProgramBodies.map(body => {
              return <div>{JSON.stringify(body)}</div>
            })} */}

            {/* {signedPodCastProgramBodies.map((body, index) => {
              return (
                <AudioTrackCard key={body.id} id={body.id} position={index} filename="DLLM" audioUrl={body.audioUrl} />
              )
            })} */}

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
