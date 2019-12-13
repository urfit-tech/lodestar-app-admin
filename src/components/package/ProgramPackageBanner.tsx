import React from 'react'
import styled from 'styled-components'
import BlurredBanner from '../common/BlurredBanner'
import { BREAK_POINT } from '../common/Responsive'

const StyledWrapper = styled.div`
  @media (min-width: ${BREAK_POINT}px) {
    padding: 4rem 0;
  }
`
const StyledCenterBox = styled.div`
  position: relative;
  margin: 0 auto;
  padding: 2.5rem 6rem 2.5rem 1.5rem;
  width: 100%;
  max-width: 600px;
  color: white;

  @media (min-width: ${BREAK_POINT}px) {
    padding: 5.25rem 6rem;
    border: 1px solid white;
    text-align: center;
  }
`
const StyledDecoration = styled.div`
  position: absolute;
  top: 0;
  right: 1rem;
  overflow: hidden;
  padding: 10px 12px 20px;

  span {
    z-index: 2;
    position: relative;
    font-size: 14px;
    font-weight: bold;
    line-height: 1.29;
    letter-spacing: 0.18px;
  }

  ::before,
  ::after {
    z-index: 1;
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: ${props => props.theme['@primary-color']};
    content: '';
  }

  ::before {
    transform-origin: left bottom;
    transform: skewY(-20deg);
  }

  ::after {
    transform-origin: right bottom;
    transform: skewY(20deg);
  }
`
const StyledTitle = styled.h1`
  color: white;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 0.23px;

  @media (min-width: ${BREAK_POINT}px) {
    font-size: 40px;
  }
`
const StyledMeta = styled.div`
  font-weight: 500;
  letter-spacing: 0.2px;
`

type ProgramPackageBannerProps = {
  title: string
  coverUrl?: string
  programCount: number
  totalDuration: number
}
const ProgramPackageBanner: React.FC<ProgramPackageBannerProps> = ({
  title,
  coverUrl,
  programCount,
  totalDuration,
}) => {
  return (
    <BlurredBanner coverUrl={coverUrl}>
      <StyledWrapper>
        <StyledCenterBox>
          <StyledDecoration>
            <span>
              課程
              <br />
              組合
            </span>
          </StyledDecoration>
          <StyledTitle className="mb-3">{title}</StyledTitle>
          {/* <StyledMeta>
            {programCount} 堂課・{Math.floor(totalDuration / 60)} 分鐘
          </StyledMeta> */}
        </StyledCenterBox>
      </StyledWrapper>
    </BlurredBanner>
  )
}

export default ProgramPackageBanner
