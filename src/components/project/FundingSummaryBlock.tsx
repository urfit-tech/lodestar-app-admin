import { Icon } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import FundingProgressBlock from '../../containers/project/FundingProgressBlock'
import ProjectEnrollmentCounts from '../../containers/project/ProjectEnrollmentCounts'
import { useInterval } from '../../hooks/util'
import { BREAK_POINT } from '../common/Responsive'

const StyledFundingSummaryBlock = styled.div`
  padding: 1.5rem 15px;
  color: var(--gray-darker);

  .text-primary {
    color: ${props => props.theme['@primary-color']};
  }

  @media (min-width: ${BREAK_POINT}px) {
    padding: 0 15px;
  }
`
const StyledTitle = styled.h1`
  && {
    color: var(--gray-darker);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: 0.3px;
  }

  @media (min-width: ${BREAK_POINT}px) {
    && {
      font-size: 40px;
    }
  }
`
const StyledDescription = styled.div`
  && {
    color: var(--gray-darker);
    font-size: 14px;
    font-weight: 500;
  }
`
const StyledCountDownBlock = styled.div`
  background: #f8f8f8;
`

type FundingSummaryBlockProps = {
  projectId: string
  title: string
  abstract: string
  targetAmount: number
  expiredAt: Date | null
  type?: string
}
const FundingSummaryBlock: React.FC<FundingSummaryBlockProps> = ({
  projectId,
  title,
  abstract,
  targetAmount,
  expiredAt,
  type,
}) => {
  return (
    <StyledFundingSummaryBlock>
      <StyledTitle>{title}</StyledTitle>
      <StyledDescription className="mb-3">{abstract}</StyledDescription>

      {type === 'funding' && (
        <>
          <FundingProgressBlock projectId={projectId} targetAmount={targetAmount} />
          {expiredAt && (
            <StyledDescription>
              <CountDownTimeBlock expiredAt={expiredAt} />
            </StyledDescription>
          )}
        </>
      )}

      {type === 'pre-order' && expiredAt && (
        <>
          <StyledCountDownBlock className="mb-3 p-4">
            <Icon type="calendar" className="mr-2" />
            <CountDownTimeBlock expiredAt={expiredAt} />
          </StyledCountDownBlock>
          <StyledDescription>
            <ProjectEnrollmentCounts projectId={projectId} />
          </StyledDescription>
        </>
      )}
    </StyledFundingSummaryBlock>
  )
}

export const CountDownTimeBlock: React.FC<{
  expiredAt: Date
}> = ({ expiredAt }) => {
  const [seconds, setSeconds] = useState((expiredAt.getTime() - Date.now()) / 1000)
  useInterval(() => setSeconds((expiredAt.getTime() - Date.now()) / 1000), 1000)

  if (expiredAt.getTime() < Date.now()) {
    return null
  }

  return (
    <>
      <span className="mr-1">優惠倒數</span>
      {seconds > 86400 && (
        <>
          <span className="mr-1 text-primary" >{Math.floor(seconds / 86400)}</span>
          <span className="mr-1">天</span>
        </>
      )}
      {seconds > 3600 && (
        <>
          <span className="mr-1 text-primary" >{Math.floor((seconds % 84600) / 3600)}</span>
          <span className="mr-1">時</span>
        </>
      )}
      {seconds > 60 && (
        <>
          <span className="mr-1 text-primary" >{Math.floor((seconds % 3600) / 60)}</span>
          <span className="mr-1">分</span>
        </>
      )}
      {seconds && (
        <>
          <span className="mr-1 text-primary" >{Math.floor(seconds % 60)}</span>
          <span className="mr-1">秒</span>
        </>
      )}
    </>
  )
}
export default FundingSummaryBlock
