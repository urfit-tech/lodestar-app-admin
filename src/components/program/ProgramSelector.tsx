import { Select, TreeSelect } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { TreeSelectProps } from 'antd/lib/tree-select'
import React from 'react'
import { useIntl } from 'react-intl'
import { programMessages } from '../../helpers/translation'
import { usePrograms } from '../../hooks/program'

type ProgramSelectorProps = {
  allowContentType?: string
  memberId?: string
}

export const OwnedProgramSelector: React.FC<SelectProps<string>> = selectProps => {
  const { formatMessage } = useIntl()
  const { loadingPrograms, programs } = usePrograms({ isPublished: true })

  return (
    <Select loading={loadingPrograms} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option value="all">{formatMessage(programMessages.label.wholeProgram)}</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id} value={program.id}>
          {program.title}
        </Select.Option>
      ))}
    </Select>
  )
}

export const EditableProgramSelector: React.FC<ProgramSelectorProps & SelectProps<string>> = ({
  memberId,
  ...selectProps
}) => {
  const { formatMessage } = useIntl()
  const { programs, loadingPrograms } = usePrograms({ memberId })

  return (
    <Select loading={loadingPrograms} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option value="all">{formatMessage(programMessages.label.wholeProgram)}</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id} value={program.id}>
          {program.title}
        </Select.Option>
      ))}
    </Select>
  )
}

export const ProgramTreeSelector: React.FC<ProgramSelectorProps & TreeSelectProps<string>> = ({
  allowContentType,
  memberId,
  ...selectProps
}) => {
  const { formatMessage } = useIntl()
  const { loadingPrograms, programs } = usePrograms({
    allowContentType,
    memberId,
    isPublished: true,
    withContentSection: true,
    withContent: true,
  })
  const treeData = programs.map(program => ({
    key: program.id,
    title: program.title,
    value: program.id,
    group: 'program',
    children: program.contentSections.map(section => ({
      key: section.id,
      title: section.title,
      value: section.id,
      group: 'programContentSection',
      children: section.contents.map(content => ({
        key: content.id,
        title: content.title,
        value: content.id,
        group: 'programContent',
      })),
    })),
  }))
  return (
    <TreeSelect
      allowClear
      showSearch
      loading={loadingPrograms}
      style={{ width: '100%' }}
      defaultValue="all"
      filterTreeNode={(inputValue, treeNode) => !!treeNode?.title?.toString().toLowerCase().includes(inputValue)}
      treeData={[{ key: 'all', value: 'all', title: formatMessage(programMessages.label.wholeProgram) }, ...treeData]}
      {...selectProps}
    />
  )
}
