import { Form, Input, InputNumber, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { LayoutProps } from 'lodestar-app-element/src/components/common/Layout'
import React from 'react'
import { useIntl } from 'react-intl'
import styled, { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import PositionStyleInput from '../inputs/PositionStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import { CraftSettings } from './CraftSettings'

const StyledFullWidthSelect = styled(Select)`
  && {
    width: 100%;
  }

  .ant-select-selection-selected-value {
    margin-right: 0.5rem;
  }
`
const StyledInputNumber = styled(InputNumber)`
  width: 100% !important;
`

type FieldProps = {
  ratios: string
  spaceStyle: CSSObject
  positionStyle: CSSObject
}

const LayoutSettings: CraftSettings<LayoutProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          ratios: values.ratios.split(':').map(r => Number(r)),
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
            ...values.positionStyle,
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
      <Form.Item name="ratios" label={formatMessage(craftPageMessages.label.ratio)}>
        <Input />
      </Form.Item>
      <Form.Item name="spaceStyle" label={formatMessage(craftPageMessages.label.spaceStyle)}>
        <SpaceStyleInput />
      </Form.Item>
      <Form.Item name="spaceStyle" label={formatMessage(craftPageMessages.label.spaceStyle)}>
        <PositionStyleInput />
      </Form.Item>
    </Form>
  )
}

export default LayoutSettings
