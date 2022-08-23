import { Form, Radio, Space } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import craftMessages from '../translation'

export type PositionStyle = Pick<CSSObject, 'position' | 'zIndex' | 'top' | 'right' | 'bottom' | 'left'>

const PositionStyleInput: React.VFC<{
  value?: PositionStyle
  onChange?: (value: PositionStyle) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const [radioType, setRadioType] = useState<'none' | 'solid'>('none')
  return (
    <div>
      <Form.Item>
        <Radio.Group onChange={e => setRadioType(e.target.value)}>
          <Space direction="vertical">
            <Radio value="none">{formatMessage(craftMessages.PositionStyleInput.none)}</Radio>
            <Radio value="solid">{formatMessage(craftMessages.PositionStyleInput.solid)}</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      {radioType === 'solid' && (
        <Form.Item noStyle>
          {/* <ColorPicker value={value?.borderColor} onChange={color => onChange?.({ ...value, borderColor: color })} /> */}
        </Form.Item>
      )}
    </div>
  )
}

export default PositionStyleInput
