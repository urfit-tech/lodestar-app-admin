import { Form, Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'

const LanguageSelector: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  return (
    <>
      <Form.Item label={formatMessage(commonMessages.label.languages)}>
        <Select mode="multiple" placeholder={formatMessage(commonMessages.term.supportedLanguages)}>
          <Select.Option key="zh">繁體中文</Select.Option>
          <Select.Option key="en">English</Select.Option>
          <Select.Option key="vi">Tiếng việt</Select.Option>
        </Select>
      </Form.Item>
    </>
  )
}

export default LanguageSelector
