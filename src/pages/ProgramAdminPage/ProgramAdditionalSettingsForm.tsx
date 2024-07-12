import { Button, DatePicker, Form, Input, InputNumber, Skeleton } from 'antd'
import { DatePickerProps } from 'antd/lib/date-picker'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useProgramLayoutTemplate, useUpdateCustomAttributeFormValue } from '../../hooks/programLayoutTemplate'
import { ModuleDataType } from '../../types/program'
import ProgramAdminPageMessages from './translation'

const StyledDatePicker = styled(DatePicker)<DatePickerProps>`
  min-width: 100%;
`

const StyledInputNumber = styled(InputNumber)`
  min-width: 100%;
`

const StyledInputText = styled(Input)`
  min-width: 100%;
`

type FieldProps = {} & ModuleDataType

const renderModuleComponent = (type: 'Number' | 'Date' | 'Text') => {
  console.log(type)
  switch (type) {
    case 'Number':
      return <StyledInputNumber min={0} />
    case 'Date':
      return (
        <StyledDatePicker
          format="YYYY-MM-DD HH:mm"
          showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
        />
      )
    case 'Text':
      return <StyledInputText />
    default:
      return null
  }
}

const ProgramAdditionalSettingsForm: React.FC<{
  programId: string
  programLayoutTemplateConfigId: string
  onRefetch?: () => void
}> = ({ programId, programLayoutTemplateConfigId, onRefetch }) => {
  const { layoutTemplateLoading, error, customAttributesDefinitions, customAttributesFormValue } =
    useProgramLayoutTemplate(programLayoutTemplateConfigId)

  const { updateCustomAttributesValue } = useUpdateCustomAttributeFormValue(programId, programLayoutTemplateConfigId)

  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customAttributesFormValue) {
      console.log(JSON.stringify(customAttributesFormValue.customAttributeValue))
      form.setFieldsValue(customAttributesFormValue.customAttributeValue)
    }
  }, [customAttributesFormValue, form])

  if (!programLayoutTemplateConfigId) {
    return <Skeleton active />
  }

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    await updateCustomAttributesValue(values)
    setLoading(false)
    if (onRefetch) {
      onRefetch()
    }
  }

  return (
    <Form
      form={form}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      onFinish={handleSubmit}
    >
      {customAttributesDefinitions &&
        customAttributesDefinitions.customAttributes.map(v => {
          return (
            <Form.Item key={v.id} label={v.name} name={v.id}>
              {renderModuleComponent(v.type)}
            </Form.Item>
          )
        })}

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()} loading={loading}>
          {formatMessage(ProgramAdminPageMessages['*'].cancel)}
        </Button>
        <Button type="primary" htmlType="submit">
          {formatMessage(ProgramAdminPageMessages['*'].save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ProgramAdditionalSettingsForm
