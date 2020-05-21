import { useQuery } from '@apollo/react-hooks'
import { Button, Select } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import AppContext from '../../contexts/AppContext'
import { categorySchema } from '../../schemas/program'
import types from '../../types'

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
const ProgramCategorySelector = ({ flatten, value, onChange }: ProgramCategorySelectorProps, ref: any) => {
  const { id: appId } = useContext(AppContext)
  const { loading, data } = useQuery<types.GET_PROGRAM_CATEGORIES, types.GET_PROGRAM_CATEGORIESVariables>(
    GET_PROGRAM_CATEGORIES,
    {
      variables: { appId },
    },
  )
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

export const GET_PROGRAM_CATEGORIES = gql`
  query GET_PROGRAM_CATEGORIES($appId: String!) {
    category(where: { app_id: { _eq: $appId }, class: { _eq: "program" } }, order_by: { position: asc }) {
      id
      name
      position
    }
  }
`

export default React.forwardRef(ProgramCategorySelector)
