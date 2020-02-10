import React from 'react'
import { FormattedMessage } from 'react-intl'
import { PeriodType } from '../schemas/common'

export const getShortenPeriodTypeLabel = (periodType: PeriodType | string) => {
  switch (periodType) {
    case 'D':
      return <FormattedMessage id="common.label.shortenDay" defaultMessage="天" />
    case 'W':
      return <FormattedMessage id="common.label.shortenWeek" defaultMessage="週" />
    case 'M':
      return <FormattedMessage id="common.label.shortenMonth" defaultMessage="月" />
    case 'Y':
      return <FormattedMessage id="common.label.shortenYear" defaultMessage="年" />
    default:
      return <FormattedMessage id="common.label.unknownPeriod" defaultMessage="未知週期" />
  }
}
