import { useQuery } from '@apollo/react-hooks'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import React from 'react'
import types from '../../types'

type ProgramPlanSelectorProps = SelectProps & {
  programId: string
}
const ProgramPlanSelector: React.FC<ProgramPlanSelectorProps> = ({ programId, ...selectProps }, ref) => {
  const { loading, data } = useQuery<types.GET_PROGRAM_PLANS, types.GET_PROGRAM_PLANSVariables>(GET_PROGRAM_PLANS, {
    variables: { programId },
    fetchPolicy: 'no-cache',
  })

  return (
    <Select ref={ref} mode="multiple" loading={loading} style={{ width: '100%' }} {...selectProps}>
      {data &&
        data.program_plan &&
        data.program_plan.map(programPlan => <Select.Option key={programPlan.id}>{programPlan.title}</Select.Option>)}
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

export default React.forwardRef(ProgramPlanSelector)
