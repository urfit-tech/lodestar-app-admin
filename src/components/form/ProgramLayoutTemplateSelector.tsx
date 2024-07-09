import { Select } from 'antd'
import React from 'react'
import { DEFAULT_TEMPLATE } from '../../pages/ProgramAdminPage/ProgramBasicForm'

type ProgramLayoutTemplate = {
  id: string
  name: string
}

export const ProgramLayoutTemplateSelect: React.FC<{
  value?: string
  programLayoutTemplates: ProgramLayoutTemplate[]
  onChange?: (value: string) => void
}> = ({ value, programLayoutTemplates, onChange }) => {
  console.log('ProgramLayoutTemplateSelect', value)
  const defaultTemplate = {
    id: DEFAULT_TEMPLATE,
    name: '標準版型-sys',
  }
  if (!value) {
    value = DEFAULT_TEMPLATE
  }
  const templates = [...programLayoutTemplates, defaultTemplate]
  return (
    <Select value={value} onChange={onChange} defaultValue={defaultTemplate?.id}>
      {templates.map(programLayoutTemplate => (
        <Select.Option key={programLayoutTemplate.id} value={programLayoutTemplate.id}>
          {programLayoutTemplate.name}
        </Select.Option>
      ))}
    </Select>
  )
}
