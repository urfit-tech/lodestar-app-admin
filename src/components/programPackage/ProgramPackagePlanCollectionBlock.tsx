import { Typography } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { ProgramPackagePlan } from '../../types/programPackage'
import AdminCard from '../admin/AdminCard'
import { BraftContent } from '../common/StyledBraftEditor'

const ProgramPackagePlanCollectionBlock: React.FC<{ plans: ProgramPackagePlan[] }> = ({ plans }) => {
  return (
    <div className="row py-5">
      {plans.map(plan => (
        <div key={plan.id} className="col-12 col-md-6 mb-4">
          <ProgramPackagePlanCard {...plan} />
        </div>
      ))}
    </div>
  )
}
const StyledPlanTitle = styled(Typography.Title)`
  && {
    margin-top: 0;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 0.2px;
    color: var(--gray-darker);
  }
`
const StyledPrice = styled(Typography.Title)`
  && {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 0.35px;
    color: var(--gray-darker);
  }
`
const StyledPeriod = styled.span`
  font-size: 16px;
`
const StyledHorizontalLine = styled.div`
  border-top: 1px solid var(--gray-light);
`
const StyledOriginalPrice = styled(Typography.Title)`
  && {
    font-size: 14px;
    color: var(--gray);
    letter-spacing: 0.18px;
    text-decoration: line-through;
  }
`

const ProgramPackagePlanCard: React.FC<ProgramPackagePlan> = ({ title, listPrice, salePrice, soldAt, description }) => {
  return (
    <AdminCard>
      <StyledPlanTitle level={2}>{title}</StyledPlanTitle>

      <StyledPrice level={3} className="mb-4">
        <span className="mr-1">{soldAt && soldAt > new Date() ? salePrice : listPrice}</span>
        <StyledPeriod></StyledPeriod>
        <StyledOriginalPrice level={4}>{listPrice}</StyledOriginalPrice>
      </StyledPrice>

      <StyledHorizontalLine className="mb-4" />

      <BraftContent>{description}</BraftContent>
    </AdminCard>
  )
}

export default ProgramPackagePlanCollectionBlock
