import { InputNumber, Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { PeriodType } from '../../schemas/common'

const PodcastPeriodSelector: React.FC<{
  value?: { type: PeriodType; amount: number }
  onChange?: (value: { type: PeriodType; amount: number }) => void
}> = ({ value, onChange }, ref) => {
  const { formatMessage } = useIntl()

  return (
    <div ref={ref}>
      {typeof value !== 'undefined' && (
        <div className="d-flex">
          <InputNumber
            min={1}
            value={value.amount}
            onChange={amount => amount && onChange && onChange({ ...value, amount })}
            className="mr-3"
          />
          <Select
            value={value.type}
            onChange={(type: PeriodType) => onChange && onChange({ ...value, type })}
            style={{ width: '90px' }}
          >
            <Select.Option value="D">{formatMessage(commonMessages.label.day)}</Select.Option>
            <Select.Option value="W">{formatMessage(commonMessages.label.week)}</Select.Option>
            <Select.Option value="M">{formatMessage(commonMessages.label.month)}</Select.Option>
            <Select.Option value="Y">{formatMessage(commonMessages.label.year)}</Select.Option>
          </Select>
        </div>
      )}
    </div>
  )
}

export default React.forwardRef(PodcastPeriodSelector)
