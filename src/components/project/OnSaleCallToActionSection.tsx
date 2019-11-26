import { Button, Icon } from 'antd'
import React from 'react'
import { animateScroll } from 'react-scroll'
import styled from 'styled-components'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import { BREAK_POINT } from '../common/Responsive'
import { CountDownTimeBlock } from './FundingSummaryBlock'


const StyledJoin = styled.div`
  background-color: #563952;
  padding: 64px 0;
  margin-bottom: 76px;

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
      left: -15px;
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
    padding: 80px 0;

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
    padding-right: 16px;
    span:first-child {
      display: none;
    }
  }

  @media (min-width: ${BREAK_POINT}px) {
    p span:first-child {
      display: inline-block;
    }
  }
`
const StyledCountDownTime = styled.div`
  display: inline-block;
  color: white;

  .text-primary {
    color: ${props => props.theme['@primary-color']};
  }
`

type OnSaleCallToActionSectionProps = {
  updates: {
    headers: String[]
    promotes: String[]
    callToAction: string
  }
  expiredAt: Date | null
}
const OnSaleCallToActionSection: React.FC<OnSaleCallToActionSectionProps> = ({ updates, expiredAt }) => {
  return (
    <section className="d-flex flex-column">
      <StyledJoin className="d-flex justify-content-center align-items-center">
        <StyledWrapper className="container">
          <h3>
            {updates.headers.map(header => (
              <span>{header}</span>
            ))}
          </h3>
          <StyledButton
            type="primary"
            onClick={() => {
              const projectPlanSection = document.getElementById('project-plan-section')
              projectPlanSection &&
                animateScroll.scrollTo(projectPlanSection.offsetTop, {
                  containerId: 'layout-content',
                })
            }}
          >
            <span>{updates.callToAction}</span>
          </StyledButton>
        </StyledWrapper>
      </StyledJoin>
      <StyledView className="d-flex align-items-center">
        <div className="container d-flex justify-content-between align-items-center">
          <p>
            {updates.promotes.map(promote => (
              <span>{promote}</span>
            ))}
          </p>
          <div>
            <StyledCountDownTime>
              {<Icon component={() => <CalendarOIcon />} className="mr-2" />}
              {expiredAt && <CountDownTimeBlock expiredAt={expiredAt} />}
            </StyledCountDownTime>
            <Button
              type="primary"
              className="ml-2"
              onClick={() => {
                const projectPlanSection = document.getElementById('project-plan-section')
                projectPlanSection &&
                  animateScroll.scrollTo(projectPlanSection.offsetTop, {
                    containerId: 'layout-content',
                  })
              }}
            >
              <span>查看方案</span>
            </Button>
          </div>
        </div>
      </StyledView>
    </section>
  )
}

export default OnSaleCallToActionSection
