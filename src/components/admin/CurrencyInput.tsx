import { InputNumber } from 'antd'
import React, { forwardRef } from 'react'

const CurrencyInput: React.FC<{
  value?: number
  onChange?: (value: number | undefined) => void
}> = ({ value, onChange }, ref) => {
  return (
    <InputNumber
      ref={ref}
      value={value}
      onChange={onChange}
      min={0}
      formatter={value => `NT$ ${value}`}
      parser={value => (value ? value.replace(/\D/g, '') : '')}
    />
  )
}

export default forwardRef(CurrencyInput)
