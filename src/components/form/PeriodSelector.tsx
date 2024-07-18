import { InputNumber, Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'

type ExtendedPeriodType = PeriodType | 'H' | 'm'

const defaultOptions: ExtendedPeriodType[] = ['D', 'W', 'M', 'Y']

const PeriodSelector: React.FC<{
  value?: { type: ExtendedPeriodType; amount: number }
  onChange?: (value: { type: ExtendedPeriodType; amount: number }) => void
  options?: ExtendedPeriodType[]
}> = ({ value, onChange, options = defaultOptions }) => {
  const { formatMessage } = useIntl()

  const optionTextMap: Record<ExtendedPeriodType, string> = {
    H: formatMessage(commonMessages.unit.hour),
    m: formatMessage(commonMessages.unit.minute),
    D: formatMessage(commonMessages.unit.day),
    W: formatMessage(commonMessages.unit.week),
    M: formatMessage(commonMessages.unit.month),
    Y: formatMessage(commonMessages.unit.year),
  }

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
            onChange={(type: ExtendedPeriodType) => onChange && onChange({ ...value, type })}
            style={{ width: '90px' }}
          >
            {options.map(option => (
              <Select.Option key={option} value={option}>
                {optionTextMap[option]}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}
    </div>
  )
}

export default PeriodSelector
