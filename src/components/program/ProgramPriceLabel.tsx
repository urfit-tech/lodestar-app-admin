import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { InferType } from 'yup'
import { currencyFormatter } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { programSchema } from '../../schemas/program'
import { ShortenPeriodTypeLabel } from '../common/Period'

const StyledPriceLabel = styled.div`
  color: ${props => props.theme['@primary-color']};

  & > span:first-child:not(:last-child) {
    color: ${props => props.theme['@text-color-secondary']};
    text-decoration: line-through;
  }
`

type ProgramPriceLabelProps = {
  program: InferType<typeof programSchema>
}
const ProgramPriceLabel: React.FC<ProgramPriceLabelProps> = ({ program }) => {
  const { formatMessage } = useIntl()

  if (program.isSubscription && program.plans.length === 0) {
    return <span>{formatMessage(commonMessages.label.unavailableSelling)}</span>
  }

  if (program.isSubscription) {
    const plan = program.plans[0]
    const isOnSale = plan.soldAt && new Date() < plan.soldAt

    return (
      <StyledPriceLabel>
        <span>{currencyFormatter(plan.listPrice)}</span>
        {isOnSale && <span className="ml-2">{currencyFormatter(plan.salePrice)}</span>}
        {'/'}
        <ShortenPeriodTypeLabel periodType={plan.periodType} />
      </StyledPriceLabel>
    )
  }

  const isOnSale = program.soldAt && new Date() < program.soldAt

  return (
    <StyledPriceLabel>
      <span>{currencyFormatter(program.listPrice)}</span>
      {isOnSale && <span className="ml-2">{currencyFormatter(program.salePrice)}</span>}
    </StyledPriceLabel>
  )
}

export default ProgramPriceLabel
