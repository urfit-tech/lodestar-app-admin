import { Button, DatePicker, Form, InputNumber, Skeleton } from 'antd'
import { DatePickerProps } from 'antd/lib/date-picker'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import useProgramLayoutTemplate from '../../hooks/programLayoutTemplate'
import { ModuleDataType } from '../../types/program'
import ProgramAdminPageMessages from './translation'

const StyledDatePicker = styled(DatePicker)<DatePickerProps>`
  min-width: 100%;
`

const StyledInputNumber = styled(InputNumber)`
  min-width: 100%;
`

type FieldProps = {} & ModuleDataType

const renderModuleComponent = (type: 'NUMBER' | 'DATE') => {
  switch (type) {
    case 'NUMBER':
      return <StyledInputNumber min={0} />
    case 'DATE':
      return (
        <StyledDatePicker
          format="YYYY-MM-DD HH:mm"
          showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
        />
      )
    default:
      return null
  }
}

const ProgramAdditionalSettingsForm: React.FC<{
  programId: string
  programLayoutTemplateConfigId: string
  onRefetch?: () => void
}> = ({ programId, programLayoutTemplateConfigId, onRefetch }) => {
  console.log(programLayoutTemplateConfigId)
  const { layoutTemplateLoading, error, customAttributesDefinitions, customAttributesFormValue } =
    useProgramLayoutTemplate(programLayoutTemplateConfigId)

  console.log(customAttributesDefinitions, customAttributesFormValue)

  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  if (!programLayoutTemplateConfigId) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    //   updateProgramLayoutTemplateConfigIntro({
    //     variables: {
    //       programLayoutTemplateConfigId: programLayoutTemplateConfig.id,
    //       moduleData: constructModuleData(values, layoutTemplateModuleData),
    //     },
    //   })
    //     .then(() => {
    //       message.success(formatMessage(commonMessages.event.successfullySaved))
    //       onRefetch?.()
    //     })
    //     .catch(handleError)
    //     .finally(() => setLoading(false))
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
        customAttributesDefinitions?.customAttributes.map(v => {
          const attrType: 'NUMBER' | 'DATE' = v.type === 'NUMBER' ? 'NUMBER' : 'DATE'
          return (
            <Form.Item key={v.id} label={v.name} name={v.name}>
              {renderModuleComponent(attrType)}
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
