import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import React, { useState } from 'react'
import Recorder from 'recorder-js'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { decodeAudio } from '../../helpers/audio'
import { useInterval } from '../../hooks/util'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as StopCircleIcon } from '../../images/icon/stop-circle.svg'

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
    recorder: Recorder | null
    onStart?: () => void
    onStop?: () => void
    onGetAudio?: (audioBuffer: AudioBuffer | null) => void
  }
> = ({ recorder, onStart, onStop, onGetAudio, ...buttonProps }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const [duration, setDuration] = useState(0)

  const handleClickRecordButton = () => {
    if (isRecording) {
      onStop && onStop()
      if (recorder) {
        recorder.stop().then(async ({ blob }) => {
          const audioFile = new File([blob], 'untitled.wav')
          const audioBuffer = await decodeAudio(audioFile)
          onGetAudio && onGetAudio(audioBuffer)
        })
      }
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
