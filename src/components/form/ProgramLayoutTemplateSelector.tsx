import { Select } from 'antd'
import React from 'react'

export const ProgramLayoutTemplateSelect: React.FC<{
  value?: string
  programLayoutTemplates: any[]
  onChange?: (value: string) => void
}> = ({ value, programLayoutTemplates, onChange }) => {
  return (
    <Select value={value} onChange={onChange}>
      {programLayoutTemplates.map(programLayoutTemplate => (
        <Select.Option key={programLayoutTemplate.id} value={programLayoutTemplate.id}>
          {programLayoutTemplate.name}
        </Select.Option>
      ))}
    </Select>
  )
}
