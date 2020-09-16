import { Button, Select } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useCategory } from '../../hooks/data'
import { ClassType } from '../../types/general'

const StyledButton = styled(Button)`
  padding: 0 20px;
  font-size: 14px;
`
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
  flatten?: boolean
  single?: boolean
  value?: string
  onChange?: (value: string) => void
}> = ({ classType, flatten, single, value, onChange }) => {
  const { loading, categories } = useCategory(classType)

  if (flatten) {
    return (
      <>
        {categories.map(category => {
          return (
            <StyledButton
              className="mr-2 mb-2"
              key={category.id}
              type={category.id === value ? 'primary' : 'default'}
              shape="round"
              onClick={() => onChange && onChange(category.id)}
            >
              {category.name}
            </StyledButton>
          )
        })}
      </>
    )
  }

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
