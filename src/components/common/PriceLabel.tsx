import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'

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

  &.sale-price + & {
    color: var(--black-45);
    font-size: 14px;
    line-height: normal;
    letter-spacing: 0.18px;
    text-decoration: line-through;
  }
`

const messages = defineMessages({
  firstPeriod: { id: 'price.label.firstPeriod', defaultMessage: '首期' },
  second: { id: 'price.label.second', defaultMessage: '第二期開始' },
  originalPrice: { id: 'price.label.originalPrice', defaultMessage: '原價' },
  free: { id: 'price.label.free', defaultMessage: '免費' },
  perPeriods: { id: 'price.label.perPeriods', defaultMessage: '每 {amount} {unit}' },
})

const PriceLabel: React.FC<{
  listPrice: number
  salePrice?: number
  downPrice?: number
  periodAmount?: number
  periodType?: PeriodType
}> = ({ listPrice, salePrice, downPrice, periodAmount, periodType }) => {
  const { formatMessage } = useIntl()
  const price = salePrice || listPrice
  const firstPeriodPrice = price - (downPrice || 0)

  return (
    <div>
      {typeof downPrice === 'number' && (
        <StyledPriceLabel className="discount-down-price">
          {formatMessage(messages.firstPeriod)}
          {firstPeriodPrice <= 0 ? formatMessage(messages.free) : ''}
          {' ' + currencyFormatter(firstPeriodPrice)}
        </StyledPriceLabel>
      )}

      {typeof salePrice === 'number' && (
        <StyledPriceLabel className="sale-price">
          <span className="mr-1">
            {typeof downPrice === 'number' ? formatMessage(messages.second) : ''}
            {salePrice === 0 ? formatMessage(messages.free) : ''}
            {' ' + currencyFormatter(salePrice)}
          </span>
          <span>
            {periodType &&
              formatMessage(messages.perPeriods, {
                amount: periodAmount && periodAmount > 1 ? ` ${periodAmount} ` : '',
                unit:
                  periodType === 'D'
                    ? formatMessage(commonMessages.label.day)
                    : periodType === 'W'
                    ? formatMessage(commonMessages.label.week)
                    : periodType === 'M'
                    ? formatMessage(commonMessages.label.month)
                    : periodType === 'Y'
                    ? formatMessage(commonMessages.label.year)
                    : '',
              })}
          </span>
        </StyledPriceLabel>
      )}

      <StyledPriceLabel>
        <span className="mr-1">
          {typeof downPrice === 'number' && typeof salePrice === 'undefined' ? formatMessage(messages.second) : ''}
          {typeof salePrice === 'number' ? formatMessage(messages.originalPrice) : ''}
          {listPrice === 0 ? formatMessage(messages.free) : ''}
          {' ' + currencyFormatter(listPrice)}
        </span>
        <span>
          {periodType &&
            formatMessage(messages.perPeriods, {
              amount: periodAmount && periodAmount > 1 ? ` ${periodAmount} ` : '',
              unit:
                periodType === 'D'
                  ? formatMessage(commonMessages.label.day)
                  : periodType === 'W'
                  ? formatMessage(commonMessages.label.week)
                  : periodType === 'M'
                  ? formatMessage(commonMessages.label.month)
                  : periodType === 'Y'
                  ? formatMessage(commonMessages.label.year)
                  : '',
            })}
        </span>
      </StyledPriceLabel>
    </div>
  )
}

export default PriceLabel
