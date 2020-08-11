import { InputNumber } from 'antd'
import React, { useContext } from 'react'
import { AppContext } from '../../contexts/AppContext'

const CurrencyInput: React.FC<{
  currencyId?: string
  value?: number
  onChange?: (value?: number) => void
}> = ({ currencyId, value, onChange }) => {
  const { currencies } = useContext(AppContext)
  const currency = currencies[currencyId || 'TWD']
  return (
    <InputNumber
      value={value}
      onChange={v => onChange && onChange(typeof v === 'number' ? v : undefined)}
      min={0}
      formatter={value => `${currency.label || ''} ${value} ${currency.unit}`}
      parser={value => (value ? value.replace(/\D/g, '') : '')}
    />
  )
}

export default CurrencyInput
