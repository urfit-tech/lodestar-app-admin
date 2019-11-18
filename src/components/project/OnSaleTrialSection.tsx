import React from 'react'
import styled from 'styled-components'
import { Carousel, Icon } from 'antd'
import FundingCoverBlock from './FundingCoverBlock'
import Responsive, { BREAK_POINT } from '../common/Responsive'

type Video = {
  src: string
  title: string
}

type OnSaleTrialSectionProps = {
  title: string
  videos: Video[]
}

const StyledSection = styled.section`
  h3 {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 0.23px;
    color: var(--gray-darker);
    margin: 0 auto;
    text-align: center;
  }
`

const StyledContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 270px;
  padding-bottom: 80px;
  
  @media (min-width: ${BREAK_POINT}px) {
    max-width: 640px;
  }
`

const StyledCarousel = styled(Carousel)`
  && .slick-dots {
    li {
      margin-left: 32px;

      button {
        width: 12px;
        height: 12px;
        background: #cdcdcd;
        border-radius: 50%;
        transition: transform 0.2s ease-in-out;
      }
    }
    li::first-child {
      margin-left: 0;
    }
    li.slick-active {
      button {
        width: 12px;
        transform: scale(1.25, 1.25);
        background: #ff5760;
      }
    }
  }

  && .slick-track {
    display: flex;
  }
`

const StyledSlide = styled.div`
  max-width: 100vw;
  padding: 32px 16px;

  h4 {
    padding-top: 10px;
    text-align: center;
  }

  @media (min-width: ${BREAK_POINT}px) {
    max-width: 320px;
  }
`

const StyledImage = styled.img`
  width: 40px;
  height: 40px;
`

const OnSaleTrialSection: React.FC<OnSaleTrialSectionProps> = ({ title, videos }) => {
  return (
    <StyledSection>
      <StyledContainer>
        <h3>{title}</h3>
        <Carousel
          arrows={true}
          draggable={true}
          slidesToShow={2}
          dots={false}
          slidesToScroll={1}
          prevArrow={<StyledImage src="https://files.kolable.com/images/xuemi/angle-thin-left.svg" />}
          nextArrow={<StyledImage src="https://files.kolable.com/images/xuemi/angle-thin-right.svg" />}
          responsive={[
            {
              breakpoint: BREAK_POINT,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
          ]}
        >
          {videos.map(video =>
            <StyledSlide key={video.src}>
              <FundingCoverBlock coverType="video" coverUrl={video.src} />
              <h4>{video.title}</h4>
            </StyledSlide>
          )}
        </Carousel>
      </StyledContainer>
    </StyledSection>
  )
}

export default OnSaleTrialSection
