import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import AudioRecorder from 'audio-recorder-polyfill'
import mpegEncoder from 'audio-recorder-polyfill/mpeg-encoder'
import React, { useState } from 'react'
import Recorder from 'recorder-js'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { useInterval } from '../../hooks/util'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as StopCircleIcon } from '../../images/icon/stop-circle.svg'

// Use mp3 encoding
AudioRecorder.encoder = mpegEncoder
AudioRecorder.prototype.mimeType = 'audio/mpeg'

const StyledButton = styled(Button)`
  && {
    height: 56px;
    border-radius: 56px;
    padding: 6px;
  }
`
const StyledIcon = styled(Icon)<{ size?: number }>`
  width: 42px;
  font-size: ${props => props.size || 42}px;
`

const StyledDuration = styled.span`
  font-size: 18px;
`

const RecordIcon: React.FC<{ isRecording: boolean }> = React.memo(
  ({ isRecording }) =>
    isRecording ? (
      <StyledIcon component={() => <StopCircleIcon />} />
    ) : (
      <StyledIcon component={() => <MicrophoneIcon />} size={36} />
    ),
  (prevProps, nextProps) => prevProps.isRecording === nextProps.isRecording,
)

const RecordButton: React.FC<
  ButtonProps & {
    onStart?: () => void
    onStop?: () => void
    onGetAudio?: (data: Blob, duration: number) => void
  }
> = ({ onStart, onStop, onGetAudio, ...buttonProps }) => {
  const [recorder, setRecorder] = useState<any | undefined>(undefined)
  const [isRecording, setIsRecording] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const [duration, setDuration] = useState(0)

  const handleAudioDataAvailable = (e: any) => {
    onStop && onStop()
    setIsRecording(false)
    setStartedAt(0)

    const blob: Blob = e.data
    if (onGetAudio) {
      getAudioDuration(blob).then(duration => {
        onGetAudio(blob, duration)
      })
    }
  }

  const handleStopRecording = () => {
    // rely on the `dataavailable` callback of AudioRecorder for
    // onGetAudio callback
    recorder.stop()
    for (const track of recorder.stream.getTracks()) {
      track.stop()
    }
  }

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder_ = new AudioRecorder(stream)

      recorder_.addEventListener('dataavailable', handleAudioDataAvailable)

      // Start recording
      recorder_.start()

      onStart && onStart()
      setIsRecording(true)
      setStartedAt(Date.now())

      setRecorder(recorder_)
    })
  }

  const handleClickRecordButton = () => {
    if (isRecording) {
      handleStopRecording()
    } else {
      handleStartRecording()
    }
  }

  useInterval(() => {
    if (startedAt) {
      setDuration((Date.now() - startedAt) / 1000)
    } else if (duration) {
      setDuration(0)
    }
  }, 100)

  return (
    <StyledButton
      type="primary"
      size="large"
      shape="round"
      onClick={handleClickRecordButton}
      className={isRecording ? 'px-2' : undefined}
      {...buttonProps}
    >
      <div className="d-flex align-items-center justify-content-start">
        <RecordIcon isRecording={isRecording} />

        {isRecording && <StyledDuration className="ml-2">{durationFormatter(duration)}</StyledDuration>}
      </div>
    </StyledButton>
  )
}

function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const aud = document.createElement('audio')
    aud.src = URL.createObjectURL(blob)

    aud.onloadedmetadata = function () {
      // handle chrome's bug
      if (aud.duration === Infinity) {
        // set it to bigger than the actual duration
        aud.currentTime = 1e101
        aud.ontimeupdate = function () {
          this.ontimeupdate = () => {
            return
          }
          aud.currentTime = 0

          resolve(aud.duration)
        }
      } else {
        resolve(aud.duration)
      }
    }
  })
}

export default RecordButton
