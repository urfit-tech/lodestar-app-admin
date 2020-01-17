import { useQuery } from '@apollo/react-hooks'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import React from 'react'
import * as types from '../../types'

type ProgramSelectorProps = SelectProps & {
  allText?: string
}
const ProgramSelector: React.FC<ProgramSelectorProps> = ({ allText, ...selectProps }) => {
  const { loading, error, data } = useQuery<types.GET_PROGRAM_ENROLLED>(GET_PROGRAM_ENROLLED)
  const SelectOptions =
    data?.program_enrollment
      .filter(programEnrollment => programEnrollment.program)
      .map(programEnrollment => (
        <Select.Option key={programEnrollment.program_id}>{programEnrollment.program?.title}</Select.Option>
      )) || []

  return (
    <Select disabled={!!error} loading={loading} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">{allText || '全部課程'}</Select.Option>
      {SelectOptions}
    </Select>
  )
}

const GET_PROGRAM_ENROLLED = gql`
  query GET_PROGRAM_ENROLLED {
    program_enrollment(distinct_on: program_id) {
      program_id
      program {
        title
      }
    }
  }
`

export default ProgramSelector
