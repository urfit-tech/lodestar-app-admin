import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { SectionProps } from 'lodestar-app-element/src/components/common/Section'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import { CraftSettings } from './CraftSettings'

type FieldProps = {
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle: CSSObject
}

const SectionSettings: CraftSettings<SectionProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)

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

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={props}
      onValuesChange={handleChange}
    >
      <Form.Item name="spaceStyle">
        <SpaceStyleInput />
      </Form.Item>
      <Form.Item name="borderStyle">
        <BorderStyleInput />
      </Form.Item>
      <Form.Item name="backgroundStyle">
        <BackgroundStyleInput />
      </Form.Item>
    </Form>
  )
}

export default SectionSettings
