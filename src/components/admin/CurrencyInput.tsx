import { InputNumber } from 'antd'
import React from 'react'

const CurrencyInput: React.FC<{
  value?: number
  onChange?: (value: number | undefined) => void
}> = ({ value, onChange }) => {
  return (
    <InputNumber
      value={value}
      onChange={onChange}
      min={0}
      formatter={value => `NT$ ${value}`}
      parser={value => (value ? value.replace(/\D/g, '') : '')}
    />
  )
}

export default CurrencyInput
