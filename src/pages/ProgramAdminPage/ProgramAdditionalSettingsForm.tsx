import { Button, DatePicker, Form, Input, InputNumber, message, Skeleton } from 'antd'
import { DatePickerProps } from 'antd/lib/date-picker'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import moment, { MomentInput } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { handleError } from '../../helpers'
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
  render(options?: any): JSX.Element | null
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
  render(options: any): JSX.Element | null {
    return <AdminBraftEditor customControls={options?.controls} />
  }
}

class RenderStrategyContext {
  private strategyMap: Record<string, RenderStrategy> = {
    Number: new NumberStrategy(),
    Date: new DateStrategy(),
    Text: new TextStrategy(),
    TextEditor: new TextEditorStrategy(),
  }

  public renderModuleComponent(type: string, options?: any): JSX.Element | null {
    const strategy = this.strategyMap[type]
    return strategy ? strategy.render(options) : null
  }
}

type FieldProps = {}

const ProgramAdditionalSettingsForm: React.FC<{
  programId: string
  programLayoutTemplateConfigId: string
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ programId, programLayoutTemplateConfigId, program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const { updateCustomAttributesValue } = useUpdateCustomAttributeFormValue(programId, programLayoutTemplateConfigId)
  const renderContext = new RenderStrategyContext()

  const customAttrDefinition = program?.programLayoutTemplateConfig?.ProgramLayoutTemplate || {
    id: 'notFoundCustomAttr',
    customAttributes: null,
  }

  const isMomentInput = (value: any): value is MomentInput => {
    return moment(value).isValid()
  }

  const isEditorState = (value: any): value is EditorState => {
    return value && typeof value.getCurrentContent === 'function'
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
            if (attributeDefinition && attributeDefinition.type === 'TextEditor' && typeof value === 'string') {
              return [key, BraftEditor.createEditorState(value)]
            }
            return [key, value]
          }),
        ),
      }
    : null

  if (!programLayoutTemplateConfigId) {
    return <Skeleton active />
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    const formatCustomAttributeValue = (values: any) => {
      return Object.entries(values || {})
        .map(([key, value]) => {
          const attributeDefinition = customAttrDefinition?.customAttributes?.find(attr => attr.id === key)
          if (attributeDefinition && attributeDefinition.type === 'Date' && isMomentInput(value)) {
            return { [key]: moment(value).format('YYYY-MM-DD HH:mm:ss') }
          }
          if (attributeDefinition && attributeDefinition.type === 'TextEditor' && isEditorState(value)) {
            return { [key]: value?.toHTML() }
          }
          return { [key]: value }
        })
        .reduce((acc, cur) => ({ ...acc, ...cur }), {})
    }
    await updateCustomAttributesValue(formatCustomAttributeValue(values))
      .then(() => message.success(formatMessage(ProgramAdminPageMessages['*'].successfullySaved)))
      .catch(error => handleError(error))
      .finally(() => {
        setLoading(false)
        onRefetch?.()
      })
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
            <Form.Item
              key={v.id}
              name={v.id}
              label={formatMessage(
                ProgramAdminPageMessages.ProgramAdditionalSettingsForm[
                  v.name as keyof typeof ProgramAdminPageMessages.ProgramAdditionalSettingsForm
                ],
              )}
              wrapperCol={{ md: { span: v.type === 'TextEditor' ? 20 : 12 } }}
            >
              {renderContext.renderModuleComponent(v.type, v?.options)}
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
