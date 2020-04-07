import { Button, Select } from 'antd'
import React, { useContext } from 'react'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useCategory } from '../../hooks/category'
import { ClassType } from '../../types/category'

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

type CategorySelectorProps = {
  classType: ClassType
  value?: string
  onChange?: (value: string) => void
  flatten?: boolean
}
const CategorySelector: React.FC<CategorySelectorProps> = ({ flatten, value, onChange, classType }, ref) => {
  const { id: appId } = useContext(AppContext)
  const { loading, categories } = useCategory(appId, classType)

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
    <StyledSelect ref={ref} mode="multiple" loading={loading} value={value} onChange={onChange}>
      {categories.map(category => (
        <Select.Option style={{ borderRadius: '4px' }} key={category.id}>
          {category.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default React.forwardRef(CategorySelector)
