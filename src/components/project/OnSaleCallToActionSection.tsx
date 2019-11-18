import { Button } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { BREAK_POINT } from '../common/Responsive'

type OnSaleCallToActionSectionProps = {
  updates: {
    headers: String[]
    promote: string
    callToAction: string
  }
}

const StyledSection = styled.section``

const StyledJoin = styled.div`
  background-color: #563952;
  height: calc(294px + 76px);
  padding-bottom: 76px;

  h3 {
    position: relative;
    margin: 0 auto;
    width: 100%;
    max-width: 420px;
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 0.77px;
    text-align: center;
    color: white;

    &::before {
      position: absolute;
      bottom: 0px;
      left: -30px;
      content: url('https://files.kolable.com/images/xuemi/shine-01.svg');
    }

    &::after {
      position: absolute;
      bottom: -130px;
      right: -10px;
      content: url('https://files.kolable.com/images/xuemi/shine-02.svg');
    }
  }

  @media (min-width: ${BREAK_POINT}px) {
    height: 324px;

    h3 {
      font-size: 28px;
      max-width: 560px;

      &::before {
        bottom: 0px;
        left: -100px;
      }

      &::after {
        top: 15px;
        right: -120px;
      }
    }
  }
`

const StyledWrapper = styled.div`
  h3 > span {
    display: block;
    margin: 0 auto;
    text-align: center;
  }
`

const StyledButton = styled(Button)`
  display: block;
  margin: 40px auto 0;
`

const StyledView = styled.div`
  z-index: 10;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 76px;
  background-color: #323232;

  p {
    color: white;
    margin: 0;
  }
`

const OnSaleCallToActionSection: React.FC<OnSaleCallToActionSectionProps> = ({ updates }) => (
  <StyledSection className="d-flex flex-column">
    <StyledJoin className="d-flex justify-content-center align-items-center">
      <StyledWrapper className="container">
        <h3>
          {updates.headers.map(header => (
            <span>{header}</span>
          ))}
        </h3>
        <StyledButton type="primary">
          <span>{updates.callToAction}</span>
        </StyledButton>
      </StyledWrapper>
    </StyledJoin>
    <StyledView className="d-flex align-items-center">
      <div className="container d-flex justify-content-between align-items-center">
        <p>{updates.promote}</p>
        <Button type="primary">
          <span>查看方案</span>
        </Button>
      </div>
    </StyledView>
  </StyledSection>
)

export default OnSaleCallToActionSection
