import { Button } from 'antd'
import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import Responsive, { BREAK_POINT } from '../common/Responsive'
import { ProjectPlanProps } from './ProjectPlan'
import ProjectPlanCollection from './ProjectPlanCollection'

const StyledIntroductionContent = styled.div`
  img {
    width: 100%;
  }
`
const TabPaneContent = styled.div<{ collapsed?: boolean }>`
  position: relative;

  ${props =>
    props.collapsed
      ? css`
          @media (max-width: ${BREAK_POINT - 1}px) {
            position: relative;
            overflow: hidden;
            max-height: 100vh;

            &::before {
              content: ' ';
              display: block;
              position: absolute;
              bottom: 0;
              width: 100%;
              height: 200px;
              background: linear-gradient(to bottom, transparent, white);
            }
          }
        `
      : ''}
`
const StyledExpandButton = styled(Button)`
  position: absolute;
  top: 100vh;
  font-weight: 600;
  width: calc(100% - 30px);
  color: black;
  transform: translateY(-100%);
`

const FundingIntroductionPane: React.FC<{
  introduction: string
  projectPlans: ProjectPlanProps[]
}> = ({ introduction, projectPlans }) => {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="container">
      <div className="row">
        <TabPaneContent className="col-12 col-lg-8 mb-5" collapsed={collapsed}>
          <StyledIntroductionContent dangerouslySetInnerHTML={{ __html: introduction }} />

          {collapsed && (
            <Responsive.Default>
              <StyledExpandButton onClick={() => setCollapsed(false)}>展開內容並試聽</StyledExpandButton>
            </Responsive.Default>
          )}
        </TabPaneContent>

        <div className="col-12 col-lg-4">
          <ProjectPlanCollection projectPlans={projectPlans} />
        </div>
      </div>
    </div>
  )
}

export default FundingIntroductionPane
