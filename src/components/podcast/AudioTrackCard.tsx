import Icon from '@ant-design/icons'
import { Slider, Typography } from 'antd'
import React, { HTMLAttributes, useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { ReactComponent as MoveDownIcon } from '../../images/icon/arrow-down.svg'
import { ReactComponent as MoveUpIcon } from '../../images/icon/arrow-up.svg'
import { BREAK_POINT } from '../common/Responsive'

const TrackWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
`
const ActionBlockWrapper = styled.div`
  margin-right: 10px;

  @media (min-width: ${BREAK_POINT}px) {
    margin-right: 20px;
  }
`
const ActionBlock = styled.div`
  border-radius: 4px;
  border: solid 1px var(--gray);
  background: #fff;
  text-align: center;
  width: 28px;
  height: 28px;
  color: var(--gray-dark);
`
const StyledIcon = styled(Icon)`
  /* margin-top: 0.75rem; */
  font-size: 24px;
`
const StyledCard = styled.div<{ isActive?: boolean }>`
  overflow: hidden;
  background: white;
  border-radius: 10px;
  box-shadow: ${props =>
    props.isActive ? '0 8px 20px 1px rgba(76, 91, 143, 0.6)' : '0 6px 12px 2px rgba(221, 221, 221, 0.5)'};
`
const PlayerWrapper = styled.div`
  padding: 20px 0 7px;
  width: 100%;
  overflow-x: auto;
`
const StyledDuration = styled.div`
  color: var(--gray-dark);
  letter-spacing: 0.4px;
`
const StyledTypographyText = styled(Typography.Text)`
  color: var(--gray-darker);
  font-size: 12px;
  letter-spacing: 0.6px;
  line-height: 1;
  font-weight: 600;
  & .anticon-edit {
    font-size: 16px;
  }
`
const SliderWrapper = styled.div`
  height: 18px;
  padding: 5px;
`
const StyledSlider = styled(Slider)`
  && {
    padding: 0;
    width: 100%;
    height: 0.25rem;
    border-radius: 6px;
  }
  .ant-slider-rail {
    border-radius: 0;
    height: 8px;
  }
  .ant-slider-track {
    background: ${props => props.theme['@primary-color']};
    border-radius: 0;
    height: 8px;
  }
  .ant-slider-step {
    cursor: pointer;
  }
  .ant-slider-handle {
    width: 18px;
    height: 18px;
    box-shadow: 0 2px 6px 1px rgba(76, 91, 143, 0.4);
    background: #fff;
    cursor: pointer;
  }
`
export interface AudioTrackCardRef {
  play: () => void
  backward: () => void
  forward: () => void
  init: () => void
}

const AudioTrackCard: React.ForwardRefRenderFunction<
  AudioTrackCardRef,
  HTMLAttributes<HTMLDivElement> & {
    id: string
    currentAudioId?: string
    handleClassName?: string
    position: number
    playRate?: number
    audioUrl: string
    filename: string
    isActive?: boolean
    isPlaying?: boolean
    onAudioPlaying?: (second: number) => void
    onEditingTitle?: (isEditingTitle: boolean) => void
    onIsPlayingChanged?: (isPlaying: boolean) => void
    onFinishPlaying?: () => void
    onChangeFilename?: (id: string, filename: string) => void
    onMoveUp?: (id: string) => void
    onMoveDown?: (id: string) => void
  }
> = (
  {
    id,
    currentAudioId,
    handleClassName,
    position,
    playRate,
    audioUrl,
    filename,
    isActive,
    isPlaying,
    onAudioPlaying,
    onEditingTitle,
    onIsPlayingChanged,
    onFinishPlaying,
    onChangeFilename,
    onMoveUp,
    onMoveDown,
    children,
    ...divProps
  },
  ref,
) => {
  const trackWrapperRef = useRef() as React.RefObject<HTMLDivElement>
  const playerRef = useRef<ReactPlayer | null>(null)

  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [progress, setProgress] = useState(0)

  const onFinishPlayingRef = useRef(onFinishPlaying)
  onFinishPlayingRef.current = onFinishPlaying

  useEffect(() => {
    if (isSeeking) {
      onAudioPlaying && onAudioPlaying(progress)
    }
  }, [isSeeking, onAudioPlaying, progress])

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        trackWrapperRef.current && trackWrapperRef.current.scrollIntoView()
      }, 0)
    }
  }, [isActive, trackWrapperRef])

  // initialize when changing
  useEffect(() => {
    if (!isActive && progress > 0) {
      setProgress(0)
      playerRef.current?.seekTo(0)
    }
  }, [isActive, progress])

  React.useImperativeHandle(ref, () => ({
    play: () => {
      if (playerRef == null) {
        console.warn('playerRef has not been initialized')
        return
      }

      if (onIsPlayingChanged) {
        onIsPlayingChanged(true)
      }
    },
    backward: () => {
      playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 5)
    },
    forward: () => {
      playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 5)
    },
    init: () => {
      setProgress(0)
      playerRef.current?.seekTo(0)
    },
  }))

  return (
    <TrackWrapper ref={trackWrapperRef} {...divProps}>
      <ActionBlockWrapper>
        <ActionBlock className="mb-3">
          <StyledIcon
            component={() => <MoveUpIcon onClick={() => onMoveUp && onMoveUp(id)} />}
            className={`cursor-pointer ${handleClassName || 'handle'}`}
          />
        </ActionBlock>
        <ActionBlock>
          <StyledIcon
            component={() => <MoveDownIcon onClick={() => onMoveDown && onMoveDown(id)} />}
            className={`cursor-pointer ${handleClassName || 'handle'}`}
          />
        </ActionBlock>
      </ActionBlockWrapper>

      <StyledCard className="p-3 flex-grow-1" isActive={isActive}>
        <StyledTypographyText
          editable={{
            onStart: () => onEditingTitle && onEditingTitle(true),
            onChange: filename => {
              onEditingTitle && onEditingTitle(false)
              onChangeFilename && onChangeFilename(id, filename)
            },
          }}
        >
          {filename}
        </StyledTypographyText>
        <PlayerWrapper>
          <ReactPlayer
            ref={playerRef}
            url={audioUrl}
            style={{ display: 'none' }}
            playing={isPlaying}
            playbackRate={playRate}
            progressInterval={500}
            onPlay={() => {
              onIsPlayingChanged && onIsPlayingChanged(true)
            }}
            onPause={() => {
              setIsSeeking(false)
            }}
            onDuration={duration => setDuration(duration)}
            onProgress={progress => {
              if (!isSeeking) {
                setProgress(progress.playedSeconds)
                onAudioPlaying && onAudioPlaying(progress.playedSeconds)
              }
            }}
            onEnded={() => {
              setIsSeeking(false)
              if (onFinishPlayingRef.current == null) return
              onFinishPlayingRef.current()
            }}
          />
          <SliderWrapper className="d-flex align-items-center justify-content-between">
            <StyledSlider
              max={Math.floor(duration)}
              step={Math.floor(duration) / 100}
              value={progress}
              onChange={(value: number) => {
                setProgress(value)
              }}
              onAfterChange={(value: number) => {
                setIsSeeking(false)
                playerRef.current && playerRef.current.seekTo(value, 'seconds')
              }}
            />
          </SliderWrapper>
        </PlayerWrapper>

        <div className="d-flex align-items-center justify-content-between">
          <StyledDuration>{durationFormatter(progress)}</StyledDuration>
          <StyledDuration>{duration ? durationFormatter(duration) : '--:--'}</StyledDuration>
        </div>
      </StyledCard>
    </TrackWrapper>
  )
}

export default React.forwardRef(AudioTrackCard)
