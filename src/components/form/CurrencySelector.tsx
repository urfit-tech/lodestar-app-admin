import { Select } from 'antd'
import React from 'react'
import { useApp } from '../../contexts/AppContext'

const CurrencySelector: React.FC<{
  value?: string
  onChange?: (value?: string) => void
}> = ({ value, onChange }) => {
  const { currencies, enabledModules, settings } = useApp()

  return (
    <Select style={{ width: 120 }} value={value} onChange={onChange}>
      {Object.keys(currencies)
        .filter(currencyId => currencyId !== 'LSC' || enabledModules.coin)
        .map(currencyId => {
          return (
            <Select.Option key={currencyId} value={currencyId}>
              {(currencyId === 'LSC' && settings['coin.name']) || currencyId}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default CurrencySelector
