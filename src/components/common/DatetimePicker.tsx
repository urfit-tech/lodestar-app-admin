import { DatePicker, TimePicker } from 'antd'
import { Moment } from 'moment'
import React from 'react'

type DatetimePickerProps = {
  value?: Moment
  onChange?: (value: Moment | null) => void
}
const DatetimePicker: React.FC<DatetimePickerProps> = ({ value, onChange }, ref) => {
  return (
    <div>
      <DatePicker size="default" value={value} onChange={onChange} className="mr-2" />
      <TimePicker size="default" value={value} onChange={onChange} />
    </div>
  )
}

export default React.forwardRef(DatetimePicker)
