import { InputNumber } from 'antd'
import React, { useContext } from 'react'
import { AppContext } from '../../contexts/AppContext'
import { Currency } from '../../types/app'

const CurrencyInput: React.FC<{
  currencyId?: string
  value?: number
  onChange?: (value?: number) => void
  noUnit?: boolean
  noLabel?: boolean
}> = ({ currencyId, value, onChange, noLabel, noUnit }) => {
  const { currencies, settings } = useContext(AppContext)
  const currency: Currency = currencies[currencyId || settings['currency_id'] || 'TWD'] || {
    id: 'LSC',
    name: settings['coin.name'] || '極星幣',
    label: settings['coin.label'] || '',
    unit: settings['coin.unit'] || 'Coin',
  }
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
