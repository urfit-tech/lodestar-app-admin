import React from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { StyledCategories, StyledReactPlayer, StyledTitle, StyledVideoWrapper } from '.'
import { programSchema } from '../../../schemas/program'
import BlurredBanner from '../../common/BlurredBanner'
import { BREAK_POINT } from '../../common/Responsive'

const StyledTitleBlock = styled.div<{ noVideo?: boolean }>`
  position: relative;
  padding: ${props => (props.noVideo ? '6rem 2rem' : '2rem')};

  @media (min-width: ${BREAK_POINT}px) {
    padding: ${props => (props.noVideo ? '7.5rem 2rem' : '4rem 2rem')};
  }
`
const StyledVideoBlock = styled.div`
  position: relative;
  margin-bottom: -1px;
  padding-bottom: 2px;
  background: linear-gradient(to bottom, transparent 50%, white 50%);
`

const PerpetualProgramBanner: React.FC<{
  program: InferType<typeof programSchema>
}> = ({ program }) => {
  return (
    <BlurredBanner coverUrl={program.coverUrl || undefined}>
      <StyledTitleBlock noVideo={!program.coverVideoUrl}>
        <StyledCategories className="text-white text-center">
          {program.programCategories.map(programCategory => (
            <span key={programCategory.category.id} className="mr-2">
              #{programCategory.category.name}
            </span>
          ))}
        </StyledCategories>

        <StyledTitle className="text-white text-center">{program.title}</StyledTitle>
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
    </BlurredBanner>
  )
}

export default PerpetualProgramBanner
