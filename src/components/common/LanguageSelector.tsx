import { Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'

const LanguageSelector: React.FC<{
  value?: string
  onChange?: (value: string) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <Select
      mode="multiple"
      value={value}
      onChange={onChange}
      placeholder={formatMessage(commonMessages.term.supportedLanguages)}
    >
      <Select.Option key="zh">繁體中文</Select.Option>
      <Select.Option key="en">English</Select.Option>
      <Select.Option key="vi">Tiếng việt</Select.Option>
    </Select>
  )
}

export default LanguageSelector
