import { InputNumber } from 'antd'
import React from 'react'
import { useCurrency } from '../../hooks/currency'

const CurrencyInput: React.FC<{
  currencyId?: string
  value?: number
  onChange?: (value?: number) => void
  noUnit?: boolean
  noLabel?: boolean
}> = ({ currencyId, value, onChange, noLabel, noUnit }) => {
  const { currencyFormatter } = useCurrency(value ? +value : 0, currencyId)
  return (
    <InputNumber
      value={value}
      onChange={v => onChange && onChange(typeof v === 'number' ? v : undefined)}
      min={0}
      formatter={value => {
        // TODO: base on noLabel and noUnit to define price format
        return currencyFormatter(value ? +value : 0, currencyId)
      }}
      parser={value => (value ? value.replace(/[^\d.]/g, '') : '')}
    />
  )
}

export default CurrencyInput
