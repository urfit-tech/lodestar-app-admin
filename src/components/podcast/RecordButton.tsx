import { Button, Icon } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import React, { useState } from 'react'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { useInterval } from '../../hooks/util'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as StopCircleIcon } from '../../images/icon/stop-circle.svg'

const StyledButton = styled(Button)`
  && {
    height: 56px;
    border-radius: 56px;
    padding: 6px;
  }

  span {
    font-size: 18px;
  }
`
const StyledIcon = styled(Icon)<{ size?: number }>`
  width: 42px;
  font-size: ${props => props.size || 42}px;
`

const RecordButton: React.FC<
  ButtonProps & {
    onStart?: () => void
    onStop?: () => void
  }
> = ({ onStart, onStop, ...buttonProps }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const [duration, setDuration] = useState(0)

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
      onClick={() => {
        if (isRecording) {
          onStop && onStop()
          setIsRecording(false)
          setStartedAt(0)
        } else {
          onStart && onStart()
          setIsRecording(true)
          setStartedAt(Date.now())
        }
      }}
      className={isRecording ? 'px-2' : undefined}
      {...buttonProps}
    >
      <div className="d-flex align-items-center justify-content-start">
        {isRecording ? (
          <StyledIcon component={() => <StopCircleIcon />} />
        ) : (
          <StyledIcon component={() => <MicrophoneIcon />} size={36} />
        )}

        {isRecording && <span className="ml-2">{durationFormatter(duration)}</span>}
      </div>
    </StyledButton>
  )
}

export default RecordButton
