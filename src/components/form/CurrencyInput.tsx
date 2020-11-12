import { InputNumber } from 'antd'
import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { Currency } from '../../types/app'

const CurrencyInput: React.FC<{
  currencyId?: string
  value?: number
  onChange?: (value?: number) => void
  noUnit?: boolean
  noLabel?: boolean
}> = ({ currencyId, value, onChange, noLabel, noUnit }) => {
  const { currencies, settings } = useApp()
  const currency: Currency = currencies[currencyId || settings['currency_id'] || 'TWD']

  return (
    <InputNumber
      value={value}
      onChange={v => onChange && onChange(typeof v === 'number' ? v : undefined)}
      min={0}
      formatter={value => {
        const label = noLabel ? '' : currency.label + ' '
        const unit = noUnit ? '' : ' ' + currency.unit
        return label + value + unit
      }}
      parser={value => (value ? value.replace(/\D/g, '') : '')}
    />
  )
}

export default CurrencyInput
