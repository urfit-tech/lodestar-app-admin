import { useIntl } from 'react-intl'
import { useApp } from '../contexts/AppContext'
import { Currency } from '../types/app'

export const useCurrency = () => {
  const { locale } = useIntl()
  const { currencies, settings } = useApp()

  const currencyFormatter = (value: number, currencyId?: string) => {
    const currentCurrencyId = currencyId || settings['currency_id'] || 'TWD'
    const currency: Currency = currencies[currentCurrencyId]

    if (currentCurrencyId === 'LSC') {
      return value + ' ' + settings['coin.unit']
    }
    return (
      value.toLocaleString(locale || navigator.language, {
        style: 'currency',
        currency: currentCurrencyId,
        maximumFractionDigits: currency['minorUnits'],
        minimumFractionDigits: 0,
      }) || ''
    )
  }

  return {
    currencyFormatter,
  }
}
