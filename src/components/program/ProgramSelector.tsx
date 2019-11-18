import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React from 'react'
import { useEditablePrograms, useEnrolledProgramIds, useProgram } from '../../hooks/data'

type ProgramSelectorProps = SelectProps<string> & {
  memberId: string
}

const WrappedEditableProgramSelector: React.FC<ProgramSelectorProps> = ({ memberId, ...selectProps }, ref) => {
  const { programs, loadingPrograms } = useEditablePrograms(memberId)
  return (
    <Select ref={ref} loading={loadingPrograms} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">全部課程</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id}>{program.title}</Select.Option>
      ))}
    </Select>
  )
}

const WrappedEnrolledProgramSelector: React.FC<ProgramSelectorProps> = ({ memberId, ...selectProps }, ref) => {
  const { enrolledProgramIds, loadingProgramIds } = useEnrolledProgramIds(memberId, true)
  return (
    <Select ref={ref} loading={loadingProgramIds} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">全部課程</Select.Option>
      {enrolledProgramIds.map(programId => {
        return (
          <Select.Option key={programId}>
            <ProgramSelectOptionValue programId={programId} />
          </Select.Option>
        )
      })}
    </Select>
  )
}
const ProgramSelectOptionValue: React.FC<{ programId: string }> = ({ programId }) => {
  const { program } = useProgram(programId)
  return <>{program && program.title}</>
}

export const EditableProgramSelector = React.forwardRef(WrappedEditableProgramSelector)
export const EnrolledProgramSelector = React.forwardRef(WrappedEnrolledProgramSelector)
