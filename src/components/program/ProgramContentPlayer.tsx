import React from 'react'
import ReactPlayer, { ReactPlayerProps } from 'react-player'
import styled from 'styled-components'
import { InferType } from 'yup'
import { useMember } from '../../hooks/data'
import { programContentBodySchema } from '../../schemas/program'

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
`
const StyledReactPlayer = styled(ReactPlayer)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const ProgramContentPlayer: React.FC<
  ReactPlayerProps & {
    programContentBody: InferType<typeof programContentBodySchema>
    memberId: string
  }
> = ({ programContentBody, memberId, onProgress, onEnded }) => {
  const { member } = useMember(memberId)

  return (
    <StyledWrapper>
      <StyledReactPlayer
        url={`https://player.vimeo.com/${programContentBody.data.vimeoVideoId}`}
        width="100%"
        height="100%"
        onProgress={onProgress}
        onEnded={onEnded}
        controls
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
          僅提供 {member.name}-{member.email} 觀看
        </div>
      )}
    </StyledWrapper>
  )
}

export default ProgramContentPlayer
