import { Select } from 'antd'
import React from 'react'
import { useTags } from '../../hooks/data'

const TagSelector: React.FC<{ value?: string; onChange?: (value: string) => void }> = ({ value, onChange }) => {
  const { tags } = useTags()

  return (
    <Select mode="tags" value={value} onChange={onChange}>
      {tags.map((tag) => (
        <Select.Option key={tag}>{tag}</Select.Option>
      ))}
    </Select>
  )
}

export default TagSelector
