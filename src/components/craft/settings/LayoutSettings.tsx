import { Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { LayoutProps } from 'lodestar-app-element/src/components/common/Layout'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import { CraftSettings } from './CraftSettings'

type FieldValues = {
  ratios: string
  spaceStyle: CSSObject
  positionStyle: CSSObject
}

const LayoutSettings: CraftSettings<LayoutProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onValuesChange={handleChange}>
      <Form.Item name="ratios" label={formatMessage(craftPageMessages.label.ratio)}>
        <Input
          value={props.ratios.join(':')}
          onChange={e => onPropsChange?.({ ...props, ratios: e.target.value.split(':').map(v => Number(v.trim())) })}
        />
      </Form.Item>
      <Form.Item label={formatMessage(craftPageMessages.label.spaceStyle)}>
        <SpaceStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item label={formatMessage(craftPageMessages.label.borderStyle)}>
        <BorderStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
    </Form>
  )
}

export default LayoutSettings
