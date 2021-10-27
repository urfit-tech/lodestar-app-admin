import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import React from 'react'
import { CSSObject } from 'styled-components'
import EmptyCover from '../../../images/default/empty-cover.png'
import CustomStyleInput from '../inputs/CustomStyleInput'
import { CraftSettings } from './CraftSettings'

type FieldValues = {
  url: string
  customStyle: CSSObject
}

const ImageSettings: CraftSettings<ImageProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          src: values.url,
          customStyle: values.customStyle,
        })
      })
      .catch(() => {})
  }

  const initialValues: FieldValues = {
    url: props.src || EmptyCover,
    customStyle: props.customStyle || {},
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={initialValues}
      onChange={handleChange}
    >
      <Form.Item name="customStyle">
        <CustomStyleInput space border background />
      </Form.Item>
    </Form>
  )
}

export default ImageSettings
