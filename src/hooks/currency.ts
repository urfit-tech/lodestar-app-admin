import { useIntl } from 'react-intl'
import { useApp } from '../contexts/AppContext'
import { Currency } from '../types/app'

export const useCurrency = (value: number, currencyId?: string) => {
  const { locale } = useIntl()
  const { currencies, settings } = useApp()

  const currentCurrencyId = currencyId || settings['currency_id'] || 'TWD'
  const currency: Currency = currencies[currentCurrencyId]

  const currencyFormatter = (value: number, currencyId?: string) => {
    if (currencyId === 'LSC') {
      return value + ' ' + settings['coin.unit']
    }
    return (
      value.toLocaleString(locale, {
        style: 'currency',
        currency: currentCurrencyId,
        maximumFractionDigits: currency['minorUnits'],
        minimumFractionDigits: 0,
      }) || ''
    )
  }

  const formatedCurrency = currencyFormatter(value, currencyId)

  return {
    formatedCurrency,
    currencyFormatter,
  }
}
