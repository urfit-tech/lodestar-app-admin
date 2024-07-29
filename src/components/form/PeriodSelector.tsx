import { InputNumber, Select } from 'antd'
import { PeriodType } from 'lodestar-app-element/src/types/data'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'


const PeriodSelector: React.FC<{
  value?: { type: PeriodType; amount: number }
  onChange?: (value: { type: PeriodType; amount: number }) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <div>
      {typeof value !== 'undefined' && (
        <div className="d-flex">
          <InputNumber
            min={1}
            value={value.amount}
            onChange={amount => typeof amount === 'number' && onChange && onChange({ ...value, amount })}
            className="mr-3"
          />
          <Select
            value={value.type}
            onChange={(type: PeriodType) => onChange && onChange({ ...value, type })}
            style={{ width: '90px' }}
          >
            <Select.Option value="D">{formatMessage(commonMessages.unit.day)}</Select.Option>
            <Select.Option value="W">{formatMessage(commonMessages.unit.week)}</Select.Option>
            <Select.Option value="M">{formatMessage(commonMessages.unit.month)}</Select.Option>
            <Select.Option value="Y">{formatMessage(commonMessages.unit.year)}</Select.Option>
          </Select>
        </div>
      )}
    </div>
  )
}

export default PeriodSelector
