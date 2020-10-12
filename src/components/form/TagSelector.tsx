import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React from 'react'
import { useTags } from '../../hooks/data'

const TagSelector: React.FC<
  SelectProps<string[]> & {
    value?: string[]
    onChange?: (value: string[]) => void
  }
> = ({ value, onChange, ...props }) => {
  const { tags } = useTags()

  return (
    <Select {...props} mode="tags" value={value} onChange={onChange}>
      {tags.map(tag => (
        <Select.Option key={tag} value={tag}>
          {tag}
        </Select.Option>
      ))}
    </Select>
  )
}

export default TagSelector
