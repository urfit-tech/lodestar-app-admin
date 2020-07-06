import { Button, Icon } from 'antd'
import Slider from 'rc-slider'
import 'rc-slider/dist/rc-slider.css'
import React, { useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import { ReactComponent as PlaySpeed05xIcon } from '../../images/icon/multiple-0-5.svg'
import { ReactComponent as PlaySpeed10xIcon } from '../../images/icon/multiple-1-0.svg'
import { ReactComponent as PlaySpeed15xIcon } from '../../images/icon/multiple-1-5.svg'
import { ReactComponent as PlaySpeed20xIcon } from '../../images/icon/multiple-2-0.svg'
import { ReactComponent as MuteIcon } from '../../images/icon/mute.svg'
import { ReactComponent as PauseCircleIcon } from '../../images/icon/pause-circle.svg'
import { ReactComponent as PlayCircleIcon } from '../../images/icon/play-circle.svg'
import { ReactComponent as VoiceIcon } from '../../images/icon/voice.svg'

const StyledWrapper = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  background: #323232;
  color: white;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2);

  .ant-btn {
    padding: 0;
  }
  .anticon {
    font-size: 24px;
  }
  .control-play {
    margin-right: 0.75rem;

    .anticon {
      font-size: 36px;
    }
  }
`
const StyledSlider = styled(Slider)`
  && {
    padding: 0;
  }
  .rc-slider-rail {
    border-radius: 0;
  }
  .rc-slider-track {
    background: ${props => props.theme['@primary-color']};
  }
  .rc-slider-handle {
    width: 20px;
    height: 20px;
    margin-top: -9px;
    opacity: 0;
  }
`
const StyledInformationBlock = styled.div`
  overflow: hidden;
`
const StyledTitle = styled.div`
  overflow: hidden;
  line-height: 1.5;
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const StyledDuration = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`

const durationFormat: (time: number) => string = time => {
  return `${Math.floor(time / 60)}:${Math.floor(time % 60)
    .toString()
    .padStart(2, '0')}`
}

const PodcastPlayer: React.FC = () => {
  const playerRef = useRef<ReactPlayer | null>(null)

  const [maxDuration, setMaxDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // ! fake data
  const podcastProgramContent = {
    id: 'podcast-program-content-1',
    title: '扭轉直覺偏誤，發現世界比你想像的更美好',
    url: 'https://file-examples.com/wp-content/uploads/2017/11/file_example_OOG_1MG.ogg',
  }

  return (
    <>
      <ReactPlayer
        ref={playerRef}
        url={podcastProgramContent.url}
        style={{
          display: 'none',
        }}
        playing={isPlaying}
        playbackRate={playSpeed}
        muted={isMuted}
        progressInterval={0.5}
        onDuration={duration => setMaxDuration(duration)}
        onProgress={progress => {
          if (!isSeeking) {
            setProgress(progress.playedSeconds)
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <StyledWrapper>
        <StyledSlider
          max={maxDuration}
          step={0.1}
          value={progress}
          onBeforeChange={() => {
            setIsPlaying(false)
            setIsSeeking(true)
          }}
          onChange={value => {
            setProgress(value)
          }}
          onAfterChange={value => {
            setIsSeeking(false)
            playerRef.current && playerRef.current.seekTo(value, 'seconds')
            setIsPlaying(true)
          }}
        />

        <div className="container d-flex align-items-center justify-content-between py-2">
          <Button type="link" className="flex-shrink-0 control-play" onClick={() => setIsPlaying(!isPlaying)}>
            <Icon component={() => (isPlaying ? <PauseCircleIcon /> : <PlayCircleIcon />)} />
          </Button>

          <StyledInformationBlock className="flex-grow-1">
            <StyledTitle>{podcastProgramContent.title}</StyledTitle>
            <StyledDuration>
              {durationFormat(progress)}/{durationFormat(maxDuration)}
            </StyledDuration>
          </StyledInformationBlock>

          <Button
            type="link"
            className="flex-shrink-0 ml-4"
            onClick={() => {
              if (playSpeed < 1) {
                setPlaySpeed(1)
              } else if (playSpeed < 1.5) {
                setPlaySpeed(1.5)
              } else if (playSpeed < 2) {
                setPlaySpeed(2)
              } else {
                setPlaySpeed(0.5)
              }
            }}
          >
            <Icon
              component={() =>
                playSpeed < 1 ? (
                  <PlaySpeed05xIcon />
                ) : playSpeed < 1.5 ? (
                  <PlaySpeed10xIcon />
                ) : playSpeed < 2 ? (
                  <PlaySpeed15xIcon />
                ) : (
                  <PlaySpeed20xIcon />
                )
              }
            />
          </Button>

          <Button type="link" className="flex-shrink-0 ml-4" onClick={() => setIsMuted(!isMuted)}>
            <Icon component={() => (isMuted ? <MuteIcon /> : <VoiceIcon />)} />
          </Button>
        </div>
      </StyledWrapper>
    </>
  )
}

export default PodcastPlayer
