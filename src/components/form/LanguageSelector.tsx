import { Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'

const LanguageSelector: React.FC<{
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <Select<string[]>
      mode="multiple"
      value={value}
      onChange={onChange}
      placeholder={formatMessage(commonMessages.label.supportedLanguages)}
    >
      <Select.Option value="zh-tw">繁體中文</Select.Option>
      <Select.Option value="zh-cn">简体中文</Select.Option>
      <Select.Option value="en-us">English</Select.Option>
      <Select.Option value="vi">Tiếng việt</Select.Option>
      <Select.Option value="ja"> 日本語</Select.Option>
      <Select.Option value="ko"> 한국어</Select.Option>
    </Select>
  )
}

export default LanguageSelector
