import { Select } from 'antd'
import React, { useContext } from 'react'
import { AppContext } from '../../contexts/AppContext'

const CurrencySelector: React.FC<{
  value?: string
  onChange?: (value?: string) => void
}> = ({ value, onChange }) => {
  const { currencies } = useContext(AppContext)
  return (
    <Select style={{ width: 120 }} value={value} onChange={onChange}>
      {Object.keys(currencies).map(currencyId => (
        <Select.Option key={currencyId} value={currencyId}>
          {currencyId}
        </Select.Option>
      ))}
    </Select>
  )
}

export default CurrencySelector
