import { Select } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useGetProgramLayoutTemplate } from '../../hooks/data'
import { ProgramLayoutTemplateType } from '../../types/program'

const StyledSelect = styled(Select)<{ value?: any; onChange?: any }>`
  width: 100%;

  && .ant-select-selection__choice {
    padding-right: 2rem;
    background: var(--gray-lighter);
    color: var(--gray-darker);
  }

  .ant-select-selection--multiple .ant-select-selection__choice {
    border: none;
    border-radius: 4px;
  }

  .ant-select-selection--multiple .ant-select-selection__choice__remove {
    right: 0.5rem;
    color: #9b9b9b;
  }
`

export const ProgramLayoutTemplateSelect: React.FC<{
  value?: string
  getProgramLayoutTemplateData?: React.MutableRefObject<ProgramLayoutTemplateType | undefined>
}> = ({ value, getProgramLayoutTemplateData }) => {
  const { loading, programLayoutTemplates } = useGetProgramLayoutTemplate()

  const handleChange = (selectId: string) => {
    const selectedTemplate = programLayoutTemplates.find(template => template.id === selectId)
    if (getProgramLayoutTemplateData && selectedTemplate) {
      getProgramLayoutTemplateData.current = selectedTemplate
      return true
    }
    return false
  }

  return (
    <StyledSelect value={value} loading={loading} onChange={handleChange}>
      {programLayoutTemplates.map(programLayoutTemplate => (
        <Select.Option key={programLayoutTemplate.id} value={programLayoutTemplate.id} style={{ borderRadius: '4px' }}>
          {programLayoutTemplate.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}