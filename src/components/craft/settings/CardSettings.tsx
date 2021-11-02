import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CardProps } from 'lodestar-app-element/src/components/cards/Card'
import React from 'react'
import { CSSObject } from 'styled-components'
import { CraftElementSettings } from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'
import BackgroundInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'

type FieldValues = {
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle?: CSSObject
}

const CardSettings: CraftElementSettings<CardProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
            ...values.borderStyle,
            ...values.backgroundStyle,
          },
        })
      })
      .catch(() => {})
  }
  const initialValues: FieldValues = {
    spaceStyle: props?.customStyle || {},
    borderStyle: props?.customStyle || {},
    backgroundStyle: props?.customStyle || {},
  }
  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={initialValues}
      onValuesChange={handleChange}
    >
      <Form.Item name="spaceStyle">
        <SpaceStyleInput />
      </Form.Item>

      <Form.Item name="borderStyle">
        <BorderStyleInput />
      </Form.Item>

      <Form.Item name="backgroundStyle">
        <BackgroundInput />
      </Form.Item>
    </Form>
  )
}

export default CardSettings
