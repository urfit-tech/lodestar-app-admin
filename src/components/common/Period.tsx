import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { PeriodType } from '../../schemas/common'

export const PeriodTypeLabel: React.FC<{ periodType: PeriodType | string }> = ({ periodType }) => {
  const { formatMessage } = useIntl()

  switch (periodType) {
    case 'W':
      return <>{formatMessage(commonMessages.label.perWeek)}</>
    case 'M':
      return <>{formatMessage(commonMessages.label.perMonth)}</>
    case 'Y':
      return <>{formatMessage(commonMessages.label.perYear)}</>
    default:
      return <>{formatMessage(commonMessages.label.unknownPeriod)}</>
  }
}

export const ShortenPeriodTypeLabel: React.FC<{ periodType: PeriodType | string }> = ({ periodType }) => {
  const { formatMessage } = useIntl()

  switch (periodType) {
    case 'D':
      return <>{formatMessage(commonMessages.label.day)}</>
    case 'W':
      return <>{formatMessage(commonMessages.label.week)}</>
    case 'M':
      return <>{formatMessage(commonMessages.label.month)}</>
    case 'Y':
      return <>{formatMessage(commonMessages.label.year)}</>
    default:
      return <>{formatMessage(commonMessages.label.unknownPeriod)}</>
  }
}
