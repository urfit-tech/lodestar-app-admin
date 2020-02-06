import { useQuery } from '@apollo/react-hooks'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'

type ProgramSelectorProps = SelectProps & {
  allText?: string
}
const ProgramSelector: React.FC<ProgramSelectorProps> = ({ allText, ...selectProps }) => {
  const { formatMessage } = useIntl()
  const { loading, error, data } = useQuery<types.GET_PROGRAM_ENROLLED>(GET_PROGRAM_ENROLLED)

  const SelectOptions =
    data?.program_enrollment
      .filter(programEnrollment => programEnrollment.program)
      .map(programEnrollment => (
        <Select.Option key={programEnrollment.program_id}>{programEnrollment.program?.title}</Select.Option>
      )) || []

  return (
    <Select disabled={!!error} loading={loading} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">{allText || formatMessage(commonMessages.label.allProgram)}</Select.Option>
      {SelectOptions}
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
  }
`

export default ProgramSelector
