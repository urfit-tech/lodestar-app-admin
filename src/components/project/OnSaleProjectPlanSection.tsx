import React from 'react'
import styled from 'styled-components'
import { BREAK_POINT } from '../common/Responsive'
import ProjectPlan, { ProjectPlanProps } from './ProjectPlan'

type OnSaleProjectPlanSectionProps = {
  projectPlans: ProjectPlanProps[]
}

const StyledSection = styled.section`
  background-color: var(--gray-lighter);
`

const StyledWrapper = styled.section`
  padding: 20px;
  > h3 {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 0.23px;
    color: var(--gray-darker);
  }
  > p {
    margin: 0 auto;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
    text-align: center;
    color: var(--gray-darker);
    width: 100%;
    max-width: 320px;
    padding-bottom: 40px;
  }
  @media (min-width: ${BREAK_POINT}px) {
    padding: 120px 0;
    > h3 {
      font-size: 40px;
      letter-spacing: 1px;
      color: var(--gray-darker);
    }
    p {
      width: 100%;
      padding-bottom: 64px;
    }
  }
`

const StyledContainer = styled.div`
  margin: 0 auto;
  max-width: 348px;

  > div {
    padding-bottom: 20px;
  }

  @media (min-width: ${BREAK_POINT}px) {
    width: 100%;
    max-width: 700px;
  }
`

const OnSaleProjectPlanSection: React.FC<OnSaleProjectPlanSectionProps> = ({ projectPlans }) => {
  return (
    <StyledSection>
      <StyledWrapper>
        <h3>方案介紹</h3>
        <p>立即成為VIP，開啟你的全方位設計核心能力，學習設計不用花大錢！</p>
        <StyledContainer className="row">
          {projectPlans.map(projectPlan => (
            <div key={projectPlan.id} className="col-lg-6 col-12">
              <ProjectPlan {...projectPlan} />
            </div>
          ))}
        </StyledContainer>
      </StyledWrapper>
    </StyledSection>
  )
}

export default OnSaleProjectPlanSection
