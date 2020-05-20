import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React from 'react'
import { useIntl } from 'react-intl'
import { programMessages } from '../../helpers/translation'
import { useEditablePrograms, useOwnedPrograms } from '../../hooks/program'

type ProgramSelectorProps = SelectProps<string> & {
  memberId: string
}

export const OwnedProgramSelector: React.FC<SelectProps<string>> = selectProps => {
  const { formatMessage } = useIntl()
  const { loadingPrograms, programs } = useOwnedPrograms()

  return (
    <Select loading={loadingPrograms} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">{formatMessage(programMessages.label.programTitle)}</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id}>{program.title}</Select.Option>
      ))}
    </Select>
  )
}

export const EditableProgramSelector: React.FC<ProgramSelectorProps> = ({ memberId, ...selectProps }) => {
  const { formatMessage } = useIntl()
  const { programs, loadingPrograms } = useEditablePrograms(memberId)

  return (
    <Select loading={loadingPrograms} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">{formatMessage(programMessages.label.programTitle)}</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id}>{program.title}</Select.Option>
      ))}
    </Select>
  )
}
