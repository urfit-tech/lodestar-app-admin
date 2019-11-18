import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { InferType } from 'yup'
import { programPlanSchema } from '../../schemas/program'

type ProgramPlanSelectorProps = SelectProps & {
  programId: string
}
const ProgramPlanSelector: React.FC<ProgramPlanSelectorProps> = ({ programId, ...selectProps }, ref) => {
  const { loading, data } = useQuery(GET_PROGRAM_PLANS, {
    variables: { programId },
    fetchPolicy: 'no-cache',
  })
  return (
    <Select ref={ref} mode="multiple" loading={loading} style={{ width: '100%' }} {...selectProps}>
      {data &&
        data.program_plan &&
        data.program_plan.map((programPlan: InferType<typeof programPlanSchema>) => (
          <Select.Option key={programPlan.id}>{programPlan.title}</Select.Option>
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

export default React.forwardRef(ProgramPlanSelector)
