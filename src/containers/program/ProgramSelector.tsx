import { useQuery } from '@apollo/react-hooks'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import { uniqBy } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'

const ProgramSelector: React.FC<SelectProps & {
  allText?: string
}> = ({ allText, ...selectProps }) => {
  const { formatMessage } = useIntl()
  const { loading, error, data } = useQuery<types.GET_PROGRAM_ENROLLED>(GET_PROGRAM_ENROLLED)

  const programs: {
    id: string
    title: string
  }[] =
    loading || error || !data
      ? []
      : uniqBy(program => program.id, [
          ...data.program_enrollment.map(programEnrollment => ({
            id: programEnrollment.program_id,
            title: programEnrollment.program?.title || '',
          })),
          ...data.program_plan_enrollment.map(programPlanEnrollment => ({
            id: programPlanEnrollment.program_plan?.program_id || '',
            title: programPlanEnrollment.program_plan?.program.title || '',
          })),
        ])

  return (
    <Select disabled={!!error} loading={loading} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">{allText || formatMessage(commonMessages.label.allProgram)}</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id}>{program.title}</Select.Option>
      ))}
    </Select>
  )
}

const GET_PROGRAM_ENROLLED = gql`
  query GET_PROGRAM_ENROLLED {
    program_enrollment(distinct_on: program_id, where: { program: { published_at: { _is_null: false } } }) {
      program_id
      program {
        title
      }
    }
    program_plan_enrollment(
      distinct_on: program_plan_id
      where: { program_plan: { program: { published_at: { _is_null: false } } } }
    ) {
      program_plan_id
      program_plan {
        program_id
        program {
          title
        }
      }
    }
  }
`

export default ProgramSelector
