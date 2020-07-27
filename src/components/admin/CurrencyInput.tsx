import { InputNumber } from 'antd'
import React from 'react'

const CurrencyInput: React.FC<{
  value?: number
  onChange?: (value?: number) => void
}> = ({ value, onChange }) => {
  return (
    <InputNumber
      value={value}
      onChange={v => onChange && onChange(typeof v === 'number' ? v : undefined)}
      min={0}
      formatter={value => `NT$ ${value}`}
      parser={value => (value ? value.replace(/\D/g, '') : '')}
    />
  )
}

export default CurrencyInput
