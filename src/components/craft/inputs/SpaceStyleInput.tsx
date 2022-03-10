import { Form } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import craftMessages from '../translation'
import BoxModelInput from './BoxModelInput'

export type SpaceStyle = Pick<CSSObject, 'margin' | 'padding'>
const messages = defineMessages({
  margin: { id: 'craft.inputs.margin', defaultMessage: '外距' },
  padding: { id: 'craft.inputs.padding', defaultMessage: '內距' },
})
const SpaceStyleInput: React.VFC<{
  value?: SpaceStyle
  onChange?: (value: SpaceStyle) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  return (
    <>
      <Form.Item
        label={formatMessage(messages.margin)}
        rules={[
          {
            required: true,
            pattern: /^\d+;\d+;\d+;\d+$/,
            message: formatMessage(craftMessages.TypographyStyleInput.boxModelInputWarning),
          },
        ]}
      >
        <BoxModelInput value={value?.margin?.toString()} onChange={margin => onChange?.({ ...value, margin })} />
      </Form.Item>
      <Form.Item
        label={formatMessage(messages.padding)}
        rules={[
          {
            required: true,
            pattern: /^\d+;\d+;\d+;\d+$/,
            message: formatMessage(craftMessages.TypographyStyleInput.boxModelInputWarning),
          },
        ]}
      >
        <BoxModelInput value={value?.padding?.toString()} onChange={padding => onChange?.({ ...value, padding })} />
      </Form.Item>
    </>
  )
}

export default SpaceStyleInput
