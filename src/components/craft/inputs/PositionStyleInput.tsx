import { Form, Radio, Space } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import ColorPicker from './ColorPicker'

const messages = defineMessages({
  none: { id: 'craft.inputs.border.none', defaultMessage: '無框線' },
  solid: { id: 'craft.inputs.border.solid', defaultMessage: '實線' },
})
const PositionStyleInput: React.VFC<{
  value?: CSSObject
  onChange?: (value: CSSObject) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const [radioType, setRadioType] = useState<'none' | 'solid'>('none')
  return (
    <div>
      <Form.Item>
        <Radio.Group onChange={e => setRadioType(e.target.value)}>
          <Space direction="vertical">
            <Radio value="none">{formatMessage(messages.none)}</Radio>
            <Radio value="solid">{formatMessage(messages.solid)}</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      {radioType === 'solid' && (
        <Form.Item noStyle>
          <ColorPicker value={value?.borderColor} onChange={color => onChange?.({ ...value, borderColor: color })} />
        </Form.Item>
      )}
    </div>
  )
}

export default PositionStyleInput
