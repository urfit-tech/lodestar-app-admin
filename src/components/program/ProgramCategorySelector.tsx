import { Button, Select } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import styled from 'styled-components'
import { InferType } from 'yup'
import { categorySchema } from '../../schemas/program'

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

type ProgramCategorySelectorProps = {
  value?: string
  onChange?: (value: string) => void
  flatten?: boolean
}
const ProgramCategorySelector: React.FC<ProgramCategorySelectorProps> = ({ flatten, value, onChange }, ref) => {
  const { loading, data } = useQuery(GET_PROGRAM_CATEGORIES, {
    variables: { appId: process.env.REACT_APP_ID },
  })
  const categories: InferType<typeof categorySchema>[] = (data && data.category) || []
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

const GET_PROGRAM_CATEGORIES = gql`
  query GET_CATEGORIES($appId: String!) {
    category(where: { app_id: { _eq: $appId }, class: { _eq: "program" } }, order_by: { position: asc }) {
      id
      name
      position
    }
  }
`

export default React.forwardRef(ProgramCategorySelector)
