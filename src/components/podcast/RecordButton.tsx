import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { decodeAudio } from '../../helpers/audio'
import { useInterval } from '../../hooks/util'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as StopCircleIcon } from '../../images/icon/stop-circle.svg'
const { default: AudioRecorder } = require('audio-recorder-polyfill')
const { default: mpegEncoder } = require('audio-recorder-polyfill/mpeg-encoder')

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

const RecordButton: React.FC<
  ButtonProps & {
    onStart?: () => void
    onStop?: () => void
    onGetAudio?: (audioBuffer: AudioBuffer | null) => void
  }
> = ({ onStart, onStop, onGetAudio, ...buttonProps }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const [duration, setDuration] = useState(0)

  const [recorder, setRecorder] = useState<any | null>(null)

  useEffect(() => {
    const initRecorder = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const _recorder = new AudioRecorder(stream)
      _recorder.addEventListener('dataavailable', async (e: any) => {
        const audioBuffer = await decodeAudio(e.data)
        onGetAudio && onGetAudio(audioBuffer)
        setRecorder(null)
      })

      return _recorder
    }

    !recorder && initRecorder().then(recorder => setRecorder(recorder))
  }, [recorder, onGetAudio])

  const handleClickRecordButton = () => {
    if (isRecording) {
      onStop && onStop()
      recorder?.stop()
      recorder?.stream.getTracks().forEach((track: any) => track.stop())
      setIsRecording(false)
      setStartedAt(0)
    } else {
      onStart && onStart()
      recorder?.start()
      setIsRecording(true)
      setStartedAt(Date.now())
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
        {isRecording ? (
          <StyledIcon component={() => <StopCircleIcon />} />
        ) : (
          <StyledIcon component={() => <MicrophoneIcon />} size={36} />
        )}

        {isRecording && <StyledDuration className="ml-2">{durationFormatter(duration)}</StyledDuration>}
      </div>
    </StyledButton>
  )
}

export default RecordButton
