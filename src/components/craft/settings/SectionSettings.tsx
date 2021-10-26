import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { SectionProps } from 'lodestar-app-element/src/components/common/Section'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import CustomStyleInput from '../inputs/CustomStyleInput'
import { SpaceStyle } from '../inputs/SpaceStyleInput'
import { CraftSettings } from './CraftSettings'

type FieldValues = {
  customStyle: SpaceStyle
}

const SectionSettings: CraftSettings<SectionProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const { id: appId } = useApp()
  const [form] = useForm<FieldValues>()
  const [loading, setLoading] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          customStyle: {
            ...props.customStyle,
            ...values.customStyle,
          },
        })
      })
      .catch(() => {})
  }
  const initialVariables: FieldValues = {
    customStyle: props.customStyle || {},
  }
  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={initialVariables}
      onValuesChange={handleChange}
    >
      <Form.Item name="customStyle">
        <CustomStyleInput space border background />
      </Form.Item>
    </Form>
  )
}

export default SectionSettings
