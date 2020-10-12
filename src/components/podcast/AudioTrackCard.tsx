import Icon from '@ant-design/icons'
import { Typography } from 'antd'
import { throttle } from 'lodash'
import moment from 'moment'
import React, { HTMLAttributes, useContext, useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled, { ThemeContext } from 'styled-components'
import WaveSurfer from 'wavesurfer.js'
import { durationFormatter } from '../../helpers'
import { podcastMessages } from '../../helpers/translation'
import { ReactComponent as MoveIcon } from '../../images/icon/move.svg'
const TimelinePlugin = require('wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js')

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
const WaveWrapper = styled.div`
  height: 116px;
  width: 100%;
  overflow-x: auto;
`
export const WaveBlock = styled.div<{ width?: number }>`
  width: ${props => props.width}px;
  min-width: 100%;
  height: 90px;
`
export const WaveTimelineBlock = styled.div<{ width?: number }>`
  width: ${props => props.width}px;
  min-width: 100%;
  height: 25px;
`
const StyledText = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
  line-height: 1;
  min-width: 100px;
  text-align: right;
`
const StyledTypographyText = styled(Typography.Text)`
  color: var(--gray-darker);
  font-size: 12px;
  letter-spacing: 0.6px;
  line-height: 1;
  font-weight: 600;
`

const AudioTrackCard: React.FC<
  HTMLAttributes<HTMLDivElement> & {
    id: string
    handleClassName?: string
    position: number
    playRate?: number
    audioUrl: string
    filename: string
    isActive?: boolean
    isPlaying?: boolean
    onAudioPlaying?: (second: number) => void
    onFinishPlaying?: () => void
    onChangeFilename?: (id: string, filename: string) => void
  }
> = ({
  id,
  handleClassName,
  position,
  playRate,
  audioUrl,
  filename,
  isActive,
  isPlaying,
  onAudioPlaying,
  onFinishPlaying,
  onChangeFilename,
  children,
  ...divProps
}) => {
  const { formatMessage } = useIntl()
  const theme = useContext(ThemeContext)

  const trackWrapperRef = useRef() as React.RefObject<HTMLDivElement>
  const waveformRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const waveformTimelineRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const [wavesurfer, setWaveSurfer] = useState<WaveSurfer | null>(null)
  const [duration, setDuration] = useState<number | undefined>()

  // ref to variable used in wavesurfer initialization
  const onAudioPlayingRef = useRef(onAudioPlaying)
  const onFinishPlayingRef = useRef(onFinishPlaying)
  const durationRef = useRef(duration)

  onAudioPlayingRef.current = onAudioPlaying
  onFinishPlayingRef.current = onFinishPlaying

  useEffect(() => {
    if (!wavesurfer && waveformRef.current && waveformTimelineRef.current) {
      const _wavesurfer = WaveSurfer.create({
        backend: 'MediaElement',
        container: waveformRef.current,
        waveColor: '#cecece',
        progressColor: theme['@primary-color'] || '#555',
        skipLength: 5,
        height: 90,
        scrollParent: true,
        minPxPerSec: 70,
        pixelRatio: 1,
        plugins: [
          TimelinePlugin.create({
            container: waveformTimelineRef.current,
            height: 20,
            timeInterval: 0.2,
            primaryLabelInterval: 5,
            formatTimeCallback: (recordingSeconds: number) => {
              const intSeconds = Math.round(recordingSeconds)
              return recordingSeconds >= 3600
                ? moment.utc(intSeconds * 1000).format('HH:mm:ss.SS')
                : moment.utc(intSeconds * 1000).format('mm:ss.SS')
            },
          }),
        ],
      })
      _wavesurfer.on('finish', () => {
        if (onFinishPlayingRef.current == null) {
          return
        }

        onFinishPlayingRef.current()
      })
      _wavesurfer.on(
        'seek',
        throttle((progress: number) => {
          if (durationRef.current == null) {
            return
          }

          onAudioPlayingRef.current && onAudioPlayingRef.current(durationRef.current * progress)
        }, 100),
      )
      _wavesurfer.on(
        'audioprocess',
        throttle((second: number) => {
          onAudioPlayingRef.current && onAudioPlayingRef.current(second)
        }, 100),
      )
      _wavesurfer.on('ready', () => {
        const duration = _wavesurfer.getDuration()

        durationRef.current = duration
        setDuration(duration)
      })
      _wavesurfer.load(audioUrl, [], 'none')

      setWaveSurfer(_wavesurfer)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wavesurfer, waveformRef, waveformTimelineRef])

  useEffect(() => {
    return () => {
      if (wavesurfer) {
        wavesurfer.pause()
      }
    }
  }, [wavesurfer])

  useEffect(() => {
    if (isPlaying === true) wavesurfer?.play()
    if (isPlaying === false) wavesurfer?.pause()
  }, [isPlaying, wavesurfer])

  useEffect(() => {
    if (wavesurfer && playRate) {
      wavesurfer.setPlaybackRate(playRate)
    }
  }, [playRate, wavesurfer])

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        trackWrapperRef.current && trackWrapperRef.current.scrollIntoView()
      }, 0)
    }
  }, [isActive, trackWrapperRef])

  useEffect(() => {
    if (!isActive && wavesurfer) {
      wavesurfer.getCurrentTime() > 0 && wavesurfer.seekTo(0)
    }
  }, [isActive, wavesurfer])

  return (
    <TrackWrapper ref={trackWrapperRef} {...divProps}>
      <ActionBlock className="flex-shrink-0 text-center">
        <StyledIcon component={() => <MoveIcon />} className={`cursor-pointer ${handleClassName || 'handle'}`} />
      </ActionBlock>

      <StyledCard className="p-3 flex-grow-1" isActive={isActive}>
        <WaveWrapper className="mb-3">
          <WaveTimelineBlock ref={waveformTimelineRef} />
          <WaveBlock ref={waveformRef} />
        </WaveWrapper>

        <div className="d-flex align-items-center justify-content-between">
          <StyledTypographyText editable={{ onChange: filename => onChangeFilename && onChangeFilename(id, filename) }}>
            {filename}
          </StyledTypographyText>
          <StyledText>
            {formatMessage(podcastMessages.label.totalDuration)} {duration ? durationFormatter(duration) : '--:--'}
          </StyledText>
        </div>
      </StyledCard>
    </TrackWrapper>
  )
}

export default AudioTrackCard
