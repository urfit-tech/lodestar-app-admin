import Icon from '@ant-design/icons'
import { Slider, Typography } from 'antd'
import React, { HTMLAttributes, useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'

const TrackWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
`
const ActionBlock = styled.div`
  margin-right: 0.75rem;
  color: var(--gray-dark);
`
const StyledIcon = styled(Icon)`
  margin-top: 0.75rem;
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

const durationFormat: (time: number) => string = time => {
  return `${Math.floor(time / 60)}:${Math.floor(time % 60)
    .toString()
    .padStart(2, '0')}`
}

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
    onIsEditingTitle?: (isEditingTitle: boolean) => void
    onIsPlayingChanged?: (isPlaying: boolean) => void
    onFinishPlaying?: () => void
    onChangeFilename?: (id: string, filename: string) => void
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
    onIsEditingTitle,
    onIsPlayingChanged,
    onFinishPlaying,
    onChangeFilename,
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

  const onAudioPlayingRef = useRef(onAudioPlaying)
  const onFinishPlayingRef = useRef(onFinishPlaying)

  onAudioPlayingRef.current = onAudioPlaying
  onFinishPlayingRef.current = onFinishPlaying

  useEffect(() => {
    if (isSeeking) {
      onAudioPlayingRef.current && onAudioPlayingRef.current(progress)
    }
  }, [isSeeking, progress])

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
      <ActionBlock className="flex-shrink-0 text-center">
        <StyledIcon component={() => <MoveIcon />} className={`cursor-pointer ${handleClassName || 'handle'}`} />
      </ActionBlock>

      <StyledCard className="p-3 flex-grow-1" isActive={isActive}>
        <StyledTypographyText
          editable={{
            onStart: () => onIsEditingTitle && onIsEditingTitle(true),
            onChange: filename => {
              onIsEditingTitle && onIsEditingTitle(false)
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
            onDuration={duration => {
              setDuration(duration)
            }}
            onProgress={progress => {
              if (!isSeeking) {
                setProgress(progress.playedSeconds)
              }
            }}
            onEnded={() => {
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
                setIsSeeking(true)
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
          <StyledDuration>{durationFormat(progress)}</StyledDuration>
          <StyledDuration>{duration ? durationFormat(duration) : '--:--'}</StyledDuration>
        </div>
      </StyledCard>
    </TrackWrapper>
  )
}

export default React.forwardRef(AudioTrackCard)
