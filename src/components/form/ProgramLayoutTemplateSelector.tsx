import { Select } from 'antd'
import React from 'react'
import { ProgramLayoutTemplate } from '../../types/program'

export const ProgramLayoutTemplateSelect: React.FC<{
  value?: string
  programLayoutTemplates: ProgramLayoutTemplate[]
  defaultTemplate?: ProgramLayoutTemplate
  onChange?: (value: string) => void
}> = ({ value, programLayoutTemplates, defaultTemplate, onChange }) => {
  return (
    <Select value={value} onChange={onChange} defaultValue={defaultTemplate?.id}>
      {programLayoutTemplates.map(programLayoutTemplate => (
        <Select.Option key={programLayoutTemplate.id} value={programLayoutTemplate.id}>
          {programLayoutTemplate.name}
        </Select.Option>
      ))}
    </Select>
  )
}
