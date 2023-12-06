import Cookies from 'js-cookie'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useContext, useEffect, useRef } from 'react'
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js'
import 'video.js/dist/video-js.min.css'
import 'videojs-contrib-quality-levels'
import 'videojs-hls-quality-selector'
import LocaleContext from '../../contexts/LocaleContext'

const isMobile: boolean = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)

const isIOS = /(iPhone|iPad|iPod|iOS)/i.test(window.navigator.userAgent)

type VideoJsPlayerProps = {
  loading?: boolean
  sources: { src: string; type: string; withCredentials?: boolean }[]
}
const VideoPlayer: React.VFC<VideoJsPlayerProps> = props => {
  ;(videojs as any).Vhs.xhr.beforeRequest = (options: videojs.XhrOptions) => {
    const signed = Cookies.get('cloudfront-signed')

    console.log(props.sources)

    console.log(signed)
    if (options.uri && options.uri.includes('kolable.com/')) options.uri = options.uri + signed
    return options
  }
  const playerRef = useRef<VideoJsPlayer | null>(null)
  const { currentLocale } = useContext(LocaleContext)
  const { enabledModules } = useApp()
  const videoOptions: VideoJsPlayerOptions = {
    html5: {
      vhs: {
        overrideNative: !videojs.browser.IS_SAFARI,
        limitRenditionByPlayerDimensions: false,
        useBandwidthFromLocalStorage: true,
        useNetworkInformationApi: true,
      },
      nativeTextTracks: videojs.browser.IS_SAFARI,
      nativeAudioTracks: videojs.browser.IS_SAFARI,
      nativeVideoTracks: videojs.browser.IS_SAFARI,
    },
    language: currentLocale,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4],
    autoplay: true,
    responsive: true,
    fluid: true,
    plugins: {
      hlsQualitySelector: {
        displayCurrentQuality: true,
      },
    },
    sources: props.sources,
    textTrackSettings: {
      persistTextTrackSettings: true,
    },
    userActions: {
      hotkeys: function (event) {
        event.preventDefault()
        // `this` is the player in this context
        const player = this as VideoJsPlayer

        switch (event.which) {
          // whitespace
          case 32:
            player.paused() ? player.play() : player.pause()
            break
          // left arrow
          case 37:
            player.currentTime(player.currentTime() - 10)
            break
          // right arrow
          case 39:
            player.currentTime(player.currentTime() + 10)
            break
        }
      },
    },
    controlBar:
      isMobile && isIOS && enabledModules.background_mode
        ? {
            pictureInPictureToggle: false,
          }
        : undefined,
  }

  const setCaption = (player: VideoJsPlayer) => {
    const textTracks = player?.textTracks() ?? []
    for (let i = 0; i < textTracks.length; i++) {
      let track = textTracks[i]
      if (track.kind === 'captions' || track.kind === 'subtitles') {
        track.mode = 'showing'
        break
      }
    }
  }

  const handleOnLoadedData = () => {
    if (!playerRef.current) {
      return
    }

    setCaption(playerRef.current)
  }

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose()
        playerRef.current = null
      }
    }
  }, [playerRef])

  //   if (props.loading) return <spinner width="100%" height="400px" />

  return (
    <div>
      <video
        controlsList="nodownload"
        width="100%"
        className="video-js vjs-big-play-centered"
        ref={ref => {
          if (ref && !playerRef.current && Number(videoOptions.sources?.length) > 0) {
            playerRef.current = videojs(ref, videoOptions, function () {})
          }
        }}
        onLoadedData={handleOnLoadedData}
        autoPlay
        controls
      />
    </div>
  )
}

export default VideoPlayer
