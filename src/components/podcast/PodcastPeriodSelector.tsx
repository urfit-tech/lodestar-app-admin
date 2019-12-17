import { InputNumber, Select } from 'antd'
import React from 'react'
import { PeriodType } from '../../schemas/common'

const PodcastPeriodSelector: React.FC<{
  value?: { type: PeriodType, amount: number }
  onChange?: (value: { type: PeriodType, amount: number }) => void
}> = ({ value, onChange }, ref) => {

  return (
    <div ref={ref}>
      {value ? (
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
            style={{width: '90px'}}
          >
            <Select.Option value="D">天</Select.Option>
            <Select.Option value="W">週</Select.Option>
            <Select.Option value="M">月</Select.Option>
            <Select.Option value="Y">年</Select.Option>
          </Select>
        </div>
      ) : null}
    </div>
  )
}

export default React.forwardRef(PodcastPeriodSelector)
