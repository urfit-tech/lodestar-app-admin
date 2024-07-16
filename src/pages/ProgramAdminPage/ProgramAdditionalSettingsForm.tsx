import { Button, DatePicker, Form, Input, InputNumber, Skeleton } from 'antd'
import { DatePickerProps } from 'antd/lib/date-picker'
import { useForm } from 'antd/lib/form/Form'
import moment, { MomentInput } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useUpdateCustomAttributeFormValue } from '../../hooks/programLayoutTemplate'
import { ProgramAdminProps } from '../../types/program'
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

interface RenderStrategy {
  render(): JSX.Element | null
}

class NumberStrategy implements RenderStrategy {
  render() {
    return <StyledInputNumber min={0} />
  }
}

class DateStrategy implements RenderStrategy {
  render() {
    return (
      <StyledDatePicker
        format="YYYY-MM-DD HH:mm"
        showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
      />
    )
  }
}

class TextStrategy implements RenderStrategy {
  render() {
    return <StyledInputText />
  }
}

class TextEditorStrategy implements RenderStrategy {
  render() {
    return null
  }
}

class RenderStrategyContext {
  private strategyMap: Record<string, RenderStrategy> = {
    Number: new NumberStrategy(),
    Date: new DateStrategy(),
    Text: new TextStrategy(),
    TextEditor: new TextEditorStrategy(),
  }

  public renderModuleComponent(type: string): JSX.Element | null {
    const strategy = this.strategyMap[type]
    return strategy ? strategy.render() : null
  }
}

type FieldProps = {}

const ProgramAdditionalSettingsForm: React.FC<{
  programId: string
  programLayoutTemplateConfigId: string
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ programId, programLayoutTemplateConfigId, program, onRefetch }) => {
  const customAttrDefinition = program?.programLayoutTemplateConfig?.ProgramLayoutTemplate || {
    id: 'notFoundCustomAttr',
    customAttributes: null,
  }

  const renderContext = new RenderStrategyContext()

  const isMomentInput = (value: any): value is MomentInput => {
    return moment(value).isValid()
  }

  const customAttributesValue = program?.programLayoutTemplateConfig?.moduleData
    ? {
        id: program?.programLayoutTemplateConfig?.id,
        customAttributeValue: Object.fromEntries(
          Object.entries(program?.programLayoutTemplateConfig?.moduleData).map(([key, value]) => {
            const attributeDefinition = customAttrDefinition?.customAttributes?.find(attr => attr.id === key)
            if (attributeDefinition && attributeDefinition.type === 'Date' && isMomentInput(value)) {
              return [key, moment(value)]
            }
            return [key, value]
          }),
        ),
      }
    : null

  const { updateCustomAttributesValue } = useUpdateCustomAttributeFormValue(programId, programLayoutTemplateConfigId)

  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

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
      initialValues={customAttributesValue?.customAttributeValue}
    >
      {customAttrDefinition &&
        customAttrDefinition.customAttributes?.map(v => {
          return (
            <Form.Item key={v.id} label={v.name} name={v.id}>
              {renderContext.renderModuleComponent(v.type)}
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
