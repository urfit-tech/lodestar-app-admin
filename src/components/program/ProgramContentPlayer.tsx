import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ReactPlayer, { ReactPlayerProps } from 'react-player'
import styled from 'styled-components'
import { InferType } from 'yup'
import { useMember } from '../../hooks/member'
import { programContentBodySchema } from '../../schemas/program'

const StyledWrapper = styled.div`
  position: relative;
  padding-top: 56.25%;
`

const messages = defineMessages({
  memberWatchOnly: { id: 'program.text.memberWatchOnly', defaultMessage: '僅提供 {name} 觀看' },
})

const ProgramContentPlayer: React.FC<ReactPlayerProps & {
  programContentBody: InferType<typeof programContentBodySchema>
  memberId: string
}> = ({ programContentBody, memberId, onProgress, onEnded }) => {
  const { formatMessage } = useIntl()
  const { member } = useMember(memberId)

  return (
    <StyledWrapper>
      <ReactPlayer
        url={`https://vimeo.com/${programContentBody.data.vimeoVideoId}`}
        width="100%"
        height="100%"
        onProgress={onProgress}
        onEnded={onEnded}
        controls
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
        }}
      />

      {member && (
        <div
          className="p-1 p-sm-2"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          {formatMessage(messages.memberWatchOnly, { name: `${member.name}-${member.email}` })}
        </div>
      )}
    </StyledWrapper>
  )
}

export default ProgramContentPlayer
