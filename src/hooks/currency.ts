import { useContext } from 'react'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import LocaleContext from '../contexts/LocaleContext'
import { Currency } from '../types/app'

export const useCurrency = (currencyId?: string) => {
  const { currencies, settings } = useApp()
  const { currentLocale } = useContext(LocaleContext)

  const formatCurrency = (value: number) => {
    const currentCurrencyId = currencyId || settings['currency_id'] || 'TWD'
    const currency: Currency = currencies[currentCurrencyId]

    if (currentCurrencyId === 'LSC') {
      return value + ' ' + (settings['coin.unit'] || 'LSC')
    }
    return (
      value.toLocaleString(currentLocale || navigator.language, {
        style: 'currency',
        currency: currentCurrencyId,
        maximumFractionDigits: currency?.minorUnits || 0,
        minimumFractionDigits: 0,
      }) || ''
    )
  }

  return {
    formatCurrency,
  }
}
// TODO: create useFormatter containing other formatter in helpers and replace it
