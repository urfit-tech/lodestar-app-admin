import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'

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
      return <>{formatMessage(commonMessages.unit.day)}</>
    case 'W':
      return <>{formatMessage(commonMessages.unit.week)}</>
    case 'M':
      return <>{formatMessage(commonMessages.unit.month)}</>
    case 'Y':
      return <>{formatMessage(commonMessages.unit.year)}</>
    default:
      return <>{formatMessage(commonMessages.label.unknownPeriod)}</>
  }
}
