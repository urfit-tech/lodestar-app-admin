import { InputNumber } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { CraftElementSettings } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SizeStyleInput, { extractNumber, extractSizeUnit } from '../inputs/SizeStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  url: string
  customStyle: CSSObject
}

const ImageSettings: CraftElementSettings<ImageProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onChange={handleChange}>
      <SizeStyleInput
        value={props.customStyle}
        onChange={value =>
          onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value }, ratio: undefined })
        }
      />
      <Form.Item label={formatMessage(craftMessages.ImageSettings.ratio)}>
        <InputNumber
          value={props.ratio}
          onChange={v => {
            const ratio = Number(v) || undefined
            onPropsChange?.({
              ...props,
              ratio,
              customStyle: {
                ...props.customStyle,
                height:
                  ratio && props.customStyle?.width
                    ? ratio * (extractNumber(props.customStyle.width.toString()) || 0) +
                      (extractSizeUnit(props.customStyle.width.toString()) || 'px')
                    : props.customStyle?.height,
              },
            })
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
