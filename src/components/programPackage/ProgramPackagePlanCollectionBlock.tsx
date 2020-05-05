import { Divider } from 'antd'
import moment from 'moment-timezone'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { PeriodType } from '../../types/general'
import { ProgramPackagePlanProps } from '../../types/programPackage'
import PriceLabel from '../common/PriceLabel'
import { BraftContent } from '../common/StyledBraftEditor'

const ProgramPackagePlanCollectionBlock: React.FC<{
  programPackageId: string
  plans: ProgramPackagePlanProps[]
  onRefetch?: () => void
}> = ({ programPackageId, plans, onRefetch }) => {
  return (
    <div className="row py-5">
      {plans.map(plan => (
        <div key={plan.id} className="col-12 col-md-6 mb-4">
          <ProgramPackagePlanCard
            title={plan.title}
            description={plan.description}
            periodAmount={plan.periodAmount}
            periodType={plan.periodType}
            listPrice={plan.listPrice}
            salePrice={plan.salePrice ?? 0}
            soldAt={plan.soldAt}
            discountDownPrice={plan.discountDownPrice}
            soldQuantity={plan.soldQuantity}
          />
        </div>
      ))}
    </div>
  )
}

const StyledCard = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
`
const StyledTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
const StyledEnrollment = styled.div`
  color: var(--black-45);
  text-align: right;
  font-size: 14px;
  letter-spacing: 0.18px;
`

const messages = defineMessages({
  people: { id: 'programPackage.term.people', defaultMessage: '人' },
})

const ProgramPackagePlanCard: React.FC<{
  title: string
  description: string | null
  periodAmount: number
  periodType: PeriodType
  listPrice: number
  salePrice: number
  soldAt: Date | null
  discountDownPrice: number
  soldQuantity: number
}> = ({
  title,
  description,
  periodAmount,
  periodType,
  listPrice,
  salePrice,
  soldAt,
  discountDownPrice,
  soldQuantity,
}) => {
  const { formatMessage } = useIntl()
  const isOnSale = soldAt && moment(new Date()) < moment(soldAt)

  return (
    <StyledCard>
      <StyledTitle className="mb-3">{title}</StyledTitle>
      <PriceLabel
        listPrice={listPrice}
        salePrice={isOnSale ? salePrice : undefined}
        downPrice={discountDownPrice || undefined}
        periodType={periodType}
        periodAmount={periodAmount}
      />
      <Divider className="my-3" />

      <div className="mb-3">
        <BraftContent>{description}</BraftContent>
      </div>
      <StyledEnrollment className="mb-3">
        <span className="mr-2">{soldQuantity || 0}</span>
        <span>{formatMessage(messages.people)}</span>
      </StyledEnrollment>
    </StyledCard>
  )
}

export default ProgramPackagePlanCollectionBlock
