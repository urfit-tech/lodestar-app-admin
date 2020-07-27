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
  value?: string
  onChange?: (value: string) => void
  flatten?: boolean
}> = ({ flatten, value, onChange, classType }) => {
  const { loading, categories } = useCategory(classType)

  return flatten ? (
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
  ) : (
    <StyledSelect mode="multiple" loading={loading} value={value} onChange={onChange}>
      {categories.map(category => (
        <Select.Option style={{ borderRadius: '4px' }} value={category.id}>
          {category.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default CategorySelector
