import Icon from '@ant-design/icons'
import { Typography } from 'antd'
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
  line-height: 1.5rem;
`
const StyledTypographyText = styled(Typography.Text)`
  color: var(--gray-darker);
  font-size: 12px;
  letter-spacing: 0.6px;
  line-height: 1.5rem;
  font-weight: 600;
`

const AudioTrackCard: React.FC<
  HTMLAttributes<HTMLDivElement> & {
    id: string
    handleClassName?: string
    position: number
    playRate?: number
    audioBuffer: AudioBuffer
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
  audioBuffer,
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
  useEffect(() => {
    if (!wavesurfer && waveformRef.current && audioBuffer) {
      const _wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#cecece',
        progressColor: theme['@primary-color'] || '#555',
        skipLength: 5,
        height: 90,
        autoCenter: true,
        closeAudioContext: true,
        scrollParent: true,
        minPxPerSec: 100,
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
      _wavesurfer.on('finish', () => onFinishPlaying && onFinishPlaying())
      _wavesurfer.on('seek', (progress: number) => onAudioPlaying && onAudioPlaying(audioBuffer.duration * progress))
      _wavesurfer.on('audioprocess', (second: number) => onAudioPlaying && onAudioPlaying(second))
      _wavesurfer.loadDecodedBuffer(audioBuffer)
      setWaveSurfer(_wavesurfer)
    }
  }, [wavesurfer, waveformRef, waveformTimelineRef, audioBuffer, theme, onAudioPlaying, onFinishPlaying])

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

  return (
    <TrackWrapper ref={trackWrapperRef} {...divProps}>
      <ActionBlock className="flex-shrink-0 text-center">
        <div>{`${position + 1}`.padStart(2, '0')}</div>
        <StyledIcon component={() => <MoveIcon />} className={`cursor-pointer ${handleClassName || 'handle'}`} />
      </ActionBlock>

      <StyledCard className="p-4 flex-grow-1" isActive={isActive}>
        <WaveWrapper className="mb-3">
          <WaveTimelineBlock ref={waveformTimelineRef} />
          <WaveBlock ref={waveformRef} />
        </WaveWrapper>

        <div className="d-flex align-items-center justify-content-between">
          <StyledTypographyText editable={{ onChange: filename => onChangeFilename && onChangeFilename(id, filename) }}>
            {filename}
          </StyledTypographyText>
          <StyledText>
            {formatMessage(podcastMessages.label.totalDuration)} {durationFormatter(audioBuffer.duration)}
          </StyledText>
        </div>
      </StyledCard>
    </TrackWrapper>
  )
}

export default AudioTrackCard
