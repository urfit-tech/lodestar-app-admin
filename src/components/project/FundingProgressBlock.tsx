import { Progress } from 'antd'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { currencyFormatter } from '../../helpers'

const StyledWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: #f8f8f8;
`
const StyledTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.3px;
`
const StyledMeta = styled.div`
  margin-bottom: 1.25rem;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
`
const StyledDescription = styled.div`
  font-size: 14px;
  font-weight: bold;
`

type FundingProgressBlockProps = {
  targetAmount: number
  sales: number
  enrollmentCounts: number
}
const FundingProgressBlock: React.FC<FundingProgressBlockProps> = ({ targetAmount, sales, enrollmentCounts }) => {
  const theme = useContext(ThemeContext)

  return (
    <StyledWrapper className="d-flex justify-content-between align-items-center">
      <div>
        <StyledTitle>{currencyFormatter(sales)}</StyledTitle>
        <StyledMeta>目標 {currencyFormatter(targetAmount)}</StyledMeta>
        <StyledDescription>參與人數 {enrollmentCounts} 人</StyledDescription>
      </div>

      <Progress
        type="circle"
        percent={Math.floor((sales * 100) / targetAmount)}
        format={() => `${Math.floor((sales * 100) / targetAmount)}%`}
        status="normal"
        width={70}
        strokeColor={theme['@primary-color']}
        strokeWidth={10}
      />
    </StyledWrapper>
  )
}

export default FundingProgressBlock
