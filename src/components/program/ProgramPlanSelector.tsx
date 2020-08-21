import { useQuery } from '@apollo/react-hooks'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import React from 'react'
import types from '../../types'

const ProgramPlanSelector: React.FC<
  SelectProps<string> & {
    programId: string
  }
> = ({ programId, ...selectProps }) => {
  const { loading, data } = useQuery<types.GET_PROGRAM_PLANS, types.GET_PROGRAM_PLANSVariables>(GET_PROGRAM_PLANS, {
    variables: { programId },
    fetchPolicy: 'no-cache',
  })

  return (
    <Select mode="multiple" loading={loading} style={{ width: '100%' }} {...selectProps}>
      {data?.program_plan?.map(programPlan => (
        <Select.Option key={programPlan.id} value={programPlan.id}>
          {programPlan.title}
        </Select.Option>
      ))}
    </Select>
  )
}

const GET_PROGRAM_PLANS = gql`
  query GET_PROGRAM_PLANS($programId: uuid!) {
    program_plan(where: { program_id: { _eq: $programId } }) {
      id
      title
    }
  }
`

export default ProgramPlanSelector
