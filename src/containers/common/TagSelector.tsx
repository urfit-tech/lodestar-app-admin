import { Select } from 'antd'
import React, { forwardRef } from 'react'
import { useTags } from '../../hooks/data'

const TagSelector: React.FC<{ value?: string; onChange?: (value: string) => void }> = ({ value, onChange }, ref) => {
  const { tags } = useTags()

  return (
    <Select ref={ref} mode="tags" value={value} onChange={onChange}>
      {tags.map(tag => (
        <Select.Option key={tag}>{tag}</Select.Option>
      ))}
    </Select>
  )
}

export default forwardRef(TagSelector)
