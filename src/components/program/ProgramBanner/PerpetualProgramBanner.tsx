import React from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { StyledCategories, StyledReactPlayer, StyledTitle, StyledVideoWrapper } from '.'
import { programSchema } from '../../../schemas/program'
import { BREAK_POINT } from '../../common/Responsive'

const StyledWrapper = styled.div`
  position: relative;
  overflow: hidden;

  ${StyledTitle}, ${StyledCategories} {
    color: white;
    text-align: center;
  }
`
const BlurredBackgroundWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(1.1);
`
const BlurredBackground = styled.div<{ coverUrl: string }>`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  background-image: url(${props => props.coverUrl});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: blur(6px);
`
const StyledTitleBlock = styled.div<{ noVideo?: boolean }>`
  position: relative;
  padding: ${props => (props.noVideo ? '6rem 2rem' : '2rem')};
  background: rgba(0, 0, 0, 0.6);

  @media (min-width: ${BREAK_POINT}px) {
    padding: ${props => (props.noVideo ? '7.5rem 2rem' : '4rem 2rem')};
  }
`
const StyledVideoBlock = styled.div`
  position: relative;
  margin-bottom: -0.25rem;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 50%, white 50%);
`

const PerpetualProgramBanner: React.FC<{
  program: InferType<typeof programSchema>
}> = ({ program }) => {
  return (
    <StyledWrapper>
      <BlurredBackgroundWrapper>
        <BlurredBackground coverUrl={program.coverUrl || ''} />
      </BlurredBackgroundWrapper>

      <StyledTitleBlock noVideo={!program.coverVideoUrl}>
        <StyledCategories>
          {program.programCategories.map(programCategory => (
            <span key={programCategory.category.id} className="mr-2">
              #{programCategory.category.name}
            </span>
          ))}
        </StyledCategories>

        <StyledTitle level={1}>{program.title}</StyledTitle>
      </StyledTitleBlock>

      {program.coverVideoUrl && (
        <StyledVideoBlock>
          <div className="container">
            <StyledVideoWrapper>
              <StyledReactPlayer url={program.coverVideoUrl} width="100%" height="100%" />
            </StyledVideoWrapper>
          </div>
        </StyledVideoBlock>
      )}
    </StyledWrapper>
  )
}

export default PerpetualProgramBanner
