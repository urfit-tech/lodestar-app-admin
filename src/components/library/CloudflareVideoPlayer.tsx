import { Stream, StreamProps } from '@cloudflare/stream-react'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useContext, useEffect, useState } from 'react'
import LocaleContext from '../../contexts/LocaleContext'
import { commonMessages } from '../../helpers/translation'

const CloudflareVideoPlayer: React.VFC<{ videoId: string; animated?: boolean } & Partial<StreamProps>> = ({
  videoId,
  animated,
  ...streamProps
}) => {
  const { currentLocale } = useContext(LocaleContext)
  const { authToken, isAuthenticating } = useAuth()
  const [streamOptions, setStreamOptions] = useState<{ token: string; poster: string }>()
  useEffect(() => {
    authToken &&
      axios
        .post(
          `${process.env.REACT_APP_API_BASE_ROOT}/videos/${videoId}/token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        )
        .then(({ data }) => {
          if (data.code === 'SUCCESS') {
            setStreamOptions({
              token: data.result.token,
              poster: data.result.cloudflareOptions.thumbnail,
            })
          }
        })
  }, [authToken, videoId])
  return isAuthenticating ? (
    <div className="text-center">Authenticating...</div>
  ) : !authToken ? (
    <div>{commonMessages.status.noAuthority}</div>
  ) : streamOptions ? (
    <Stream
      controls
      defaultTextTrack={currentLocale}
      poster={animated ? streamOptions.poster.replace('jpg', 'gif') : streamOptions.poster}
      {...streamProps}
      src={streamOptions.token}
    />
  ) : null
}

export default CloudflareVideoPlayer
