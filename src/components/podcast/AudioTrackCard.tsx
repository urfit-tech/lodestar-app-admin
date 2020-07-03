import { Icon } from 'antd'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'

const TrackWrapper = styled.div`
  margin-bottom: 2.5rem;
`
const ActionBlock = styled.div`
  margin-right: 0.75rem;
  color: var(--gray-dark);
`
const StyledIcon = styled(Icon)`
  margin-top: 0.75rem;
  font-size: 24px;
`
const StyledCard = styled.div`
  overflow: hidden;
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 10px 1px rgba(76, 91, 143, 0.3);
`
const WaveWrapper = styled.div`
  height: 106px;
  width: 100%;
  overflow-x: auto;
`
export const WaveBlock = styled.div<{ width?: number }>`
  width: ${props => props.width}px;
  min-width: 100%;
  height: 90px;
`
const StyledText = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`

const AudioTrackCard: React.FC<
  HTMLAttributes<HTMLDivElement> & {
    handleClassName?: string
    position: number
    duration: number
  }
> = ({ handleClassName, position, duration, children, ...divProps }) => {
  return (
    <TrackWrapper {...divProps} className="d-flex align-items-center">
      <ActionBlock className="flex-shrink-0 text-center">
        <div>{`${position + 1}`.padStart(2, '0')}</div>
        <StyledIcon component={() => <MoveIcon />} className={`cursor-pointer ${handleClassName || 'handle'}`} />
      </ActionBlock>
      <StyledCard className="p-4 flex-grow-1">
        <WaveWrapper className="mb-3">{children}</WaveWrapper>
        <StyledText>{durationFormatter(duration)}</StyledText>
      </StyledCard>
    </TrackWrapper>
  )
}

export default AudioTrackCard
