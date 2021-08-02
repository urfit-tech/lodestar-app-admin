import { InputNumber } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { priceFormatter } from '../../helpers'
import { Currency } from '../../types/app'

const CurrencyInput: React.FC<{
  currencyId?: string
  value?: number
  onChange?: (value?: number) => void
  noUnit?: boolean
  noLabel?: boolean
}> = ({ currencyId, value, onChange, noLabel, noUnit }) => {
  const { locale } = useIntl()
  const { currencies, settings } = useApp()
  const currency: Currency = currencies[currencyId || settings['currency_id'] || 'TWD']
  return (
    <InputNumber
      value={value}
      onChange={v => onChange && onChange(typeof v === 'number' ? v : undefined)}
      min={0}
      formatter={value => {
        const formattedPrice = priceFormatter(value, currencyId, locale, settings['coin.unit'])
        return formattedPrice
      }}
      parser={value => (value ? value.replace(/[^\d.]/g, '') : '')}
    />
  )
}

export default CurrencyInput
