import { Select } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useGetProgramTemplate } from '../../hooks/data'
import { TemplateModuleProps } from '../../types/program'

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

export type ProgramTemplateType = {
  id: string
  name: string
  status?: string | null
  moduleName?: string[] | null
  description?: string | null
  createdBy?: string | null
  programTemplateConfig?: {
    id: string
    moduleData?: TemplateModuleProps | null
    version?: number | null
    supportLocales?: string[] | null
    isIssuesOpen?: boolean | null
    isIntroductionSectionVisible?: boolean | null
    isEnrolledCountVisible?: boolean | null
    displayHeader?: boolean | null
    displayFooter?: boolean | null
    coverUrl?: string | null
    coverMobileUrl?: string | null
    coverThumbnailUrl?: string | null
  } | null
}

export const ProgramTemplateSelect: React.FC<{
  value?: string
  getTemplateData: React.MutableRefObject<ProgramTemplateType['programTemplateConfig'] | undefined>
}> = ({ value, getTemplateData }) => {
  const { loading, programTemplates } = useGetProgramTemplate()

  const handleChange = (selectValue: string) => {
    const selectedTemplate = programTemplates.find(template => template.id === selectValue)
    if (getTemplateData && selectedTemplate) {
      getTemplateData.current = selectedTemplate.templateConfig
    }
  }

  return (
    <StyledSelect value={value} loading={loading} onChange={handleChange}>
      {programTemplates.map(programTemplateName => (
        <Select.Option key={programTemplateName.id} value={programTemplateName.id} style={{ borderRadius: '4px' }}>
          {programTemplateName.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}
