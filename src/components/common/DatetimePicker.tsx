import { DatePicker, TimePicker } from 'antd'
import { Moment } from 'moment'
import React from 'react'

const DatetimePicker: React.FC<{
  value?: Moment
  onChange?: (value: Moment | null) => void
}> = ({ value, onChange }) => {
  return (
    <div>
      <DatePicker size="middle" value={value} onChange={onChange} className="mr-2" />
      <TimePicker size="middle" value={value} onChange={onChange} format="HH:mm" />
    </div>
  )
}

export default DatetimePicker
