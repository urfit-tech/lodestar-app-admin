import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'

type ProgramSelectorProps = SelectProps & {
  allText?: string
  value?: string
  onChange?: (value: string) => void
}
const ProgramSelector: React.FC<ProgramSelectorProps> = ({ allText, value, onChange, ...selectProps }) => {
//   const {} = useAuth()
  return (
    <Select style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">{allText || '全部課程'}</Select.Option>
      <Select.Option key={'foo'}>Foo</Select.Option>
      <Select.Option key={'bar'}>Bar</Select.Option>
    </Select>
  )
}

export default ProgramSelector
