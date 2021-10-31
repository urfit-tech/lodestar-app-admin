import { InputNumber } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import { CraftSettings } from './CraftSettings'

type FieldValues = {
  url: string
  customStyle: CSSObject
}

const messages = defineMessages({
  width: { id: 'craft.settings.image.width', defaultMessage: '寬度' },
  height: { id: 'craft.settings.image.height', defaultMessage: '高度' },
  ratio: { id: 'craft.settings.image.ratio', defaultMessage: '比例' },
})

const ImageSettings: CraftSettings<ImageProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onChange={handleChange}>
      <Form.Item label={formatMessage(messages.width)}>
        <InputNumber value={props.width} onChange={v => onPropsChange?.({ ...props, width: Number(v) || undefined })} />
      </Form.Item>
      <Form.Item label={formatMessage(messages.height)}>
        <InputNumber
          value={props.height}
          onChange={v => onPropsChange?.({ ...props, height: Number(v) || undefined })}
        />
      </Form.Item>
      <Form.Item label={formatMessage(messages.ratio)}>
        <InputNumber
          value={props.ratio}
          onChange={v => {
            const ratio = Number(v) || undefined
            onPropsChange?.({ ...props, ratio, height: ratio && props.width ? ratio * props.width : props.height })
          }}
        />
      </Form.Item>
      <Form.Item>
        <SpaceStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BorderStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BackgroundStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
    </Form>
  )
}

export default ImageSettings
