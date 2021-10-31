import { Form, Radio, Space } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { CraftSettingLabel, CraftSlider } from '../settings/CraftSettings'
import ColorPicker from './ColorPicker'

export type BorderStyle = Pick<CSSObject, 'borderColor' | 'borderWidth' | 'borderStyle' | 'borderRadius'>
const messages = defineMessages({
  none: { id: 'craft.inputs.border.none', defaultMessage: '無框線' },
  solid: { id: 'craft.inputs.border.solid', defaultMessage: '實線' },
})
const BorderStyleInput: React.VFC<{
  value?: BorderStyle
  onChange?: (value: BorderStyle) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const [radioType, setRadioType] = useState<'none' | 'solid'>(Number(value?.borderWidth) ? 'solid' : 'none')
  return (
    <div>
      <Form.Item>
        <Radio.Group value={radioType} onChange={e => setRadioType(e.target.value)}>
          <Space direction="vertical">
            <Radio value="none">{formatMessage(messages.none)}</Radio>
            <Radio value="solid">{formatMessage(messages.solid)}</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      {radioType === 'solid' && (
        <>
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.radius)}</CraftSettingLabel>}>
            <CraftSlider
              min={0}
              step={0.1}
              value={Number(value?.borderRadius) || 0}
              onChange={(borderRadius: number) => onChange?.({ ...value, borderRadius })}
            />
          </Form.Item>
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.width)}</CraftSettingLabel>}>
            <CraftSlider
              min={0}
              step={0.1}
              value={Number(value?.borderWidth) || 0}
              onChange={(borderWidth: number) => onChange?.({ ...value, borderWidth })}
            />
          </Form.Item>
          <Form.Item noStyle>
            <ColorPicker value={value?.borderColor} onChange={color => onChange?.({ ...value, borderColor: color })} />
          </Form.Item>
        </>
      )}
    </div>
  )
}

export default BorderStyleInput
