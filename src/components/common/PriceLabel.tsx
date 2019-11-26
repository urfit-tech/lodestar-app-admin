import React from 'react'
import styled from 'styled-components'
import { currencyFormatter, getShortenPeriodTypeLabel } from '../../helpers'
import { ProgramPlanPeriodType } from '../../schemas/program'

const StyledPriceLabel = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.2px;

  &:first-child {
    font-size: 28px;
    font-weight: bold;
    line-height: normal;
    letter-spacing: 0.35px;

    span:last-child {
      font-size: 16px;
      letter-spacing: 0.2px;
    }
  }
  &.discount-down-price {
    ::before {
      content: '首期';
    }
  }
  &.discount-down-price + & {
    ::before {
      content: '第二期開始';
    }
  }
  &.sale-price + & {
    ::before {
      content: '原價';
    }

    color: var(--black-45);
    font-size: 14px;
    line-height: normal;
    letter-spacing: 0.18px;
    text-decoration: line-through;
  }
`

const PriceLabel: React.FC<{
  listPrice: number
  salePrice?: number
  downPrice?: number
  periodAmount?: number
  periodType?: ProgramPlanPeriodType
}> = ({ listPrice, salePrice, downPrice, periodAmount, periodType }) => {
  const price = salePrice || listPrice
  const firstPeriodPrice = price - (downPrice || 0)

  return (
    <div>
      {typeof downPrice === 'number' && (
        <StyledPriceLabel className="discount-down-price">
          {firstPeriodPrice <= 0 ? '免費' : ''}
          {' ' + currencyFormatter(firstPeriodPrice)}
        </StyledPriceLabel>
      )}

      {typeof salePrice === 'number' && (
        <StyledPriceLabel className="sale-price">
          <span>
            {salePrice === 0 ? '免費' : ''}
            {' ' + currencyFormatter(salePrice)}
          </span>
          <span>
            {periodType &&
              ` 每${periodAmount && periodAmount > 1 ? ` ${periodAmount} ` : ''}` +
                `${periodType === 'M' ? '個' : ''}${getShortenPeriodTypeLabel(periodType)}`}
          </span>
        </StyledPriceLabel>
      )}

      <StyledPriceLabel>
        <span>
          {listPrice === 0 ? '免費 ' : ''}
          {currencyFormatter(listPrice)}
        </span>
        <span>
          {periodType &&
            ` 每${periodAmount && periodAmount > 1 ? ` ${periodAmount} ` : ''}` +
              `${periodType === 'M' ? '個' : ''}${getShortenPeriodTypeLabel(periodType)}`}
        </span>
      </StyledPriceLabel>
    </div>
  )
}

export default PriceLabel
