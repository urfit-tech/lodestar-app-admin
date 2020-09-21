import { Select } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useCategory } from '../../hooks/data'
import { ClassType } from '../../types/general'

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

const CategorySelector: React.FC<{
  classType: ClassType
  single?: boolean
  value?: string
  onChange?: (value: string) => void
}> = ({ classType, single, value, onChange }) => {
  const { loading, categories } = useCategory(classType)

  return (
    <StyledSelect mode={single ? undefined : 'multiple'} loading={loading} value={value} onChange={onChange}>
      {categories.map(category => (
        <Select.Option key={category.id} value={category.id} style={{ borderRadius: '4px' }}>
          {category.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default CategorySelector
