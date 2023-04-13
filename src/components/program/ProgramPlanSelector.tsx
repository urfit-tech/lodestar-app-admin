import { gql, useQuery } from '@apollo/client'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React from 'react'
import hasura from '../../hasura'

const ProgramPlanSelector: React.FC<
  SelectProps<string> & {
    programId: string
  }
> = ({ programId, ...selectProps }) => {
  const { loading, data } = useQuery<hasura.GET_PROGRAM_PLANS, hasura.GET_PROGRAM_PLANSVariables>(GET_PROGRAM_PLANS, {
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
