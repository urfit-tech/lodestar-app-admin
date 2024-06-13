import { gql, useMutation } from '@apollo/client'
import { Button, DatePicker, Form, InputNumber, message, Skeleton } from 'antd'
import { DatePickerProps } from 'antd/lib/date-picker'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import {
  ExtractModuleDataValue,
  LayoutTemplateModuleType,
  ModuleDataProps,
  ModuleDataType,
  ProgramLayoutTemplateConfig,
} from '../../types/program'
import ProgramAdminPageMessages from './translation'

const StyledDatePicker = styled(DatePicker)<DatePickerProps>`
  min-width: 100%;
`

const StyledInputNumber = styled(InputNumber)`
  min-width: 100%;
`

type FieldProps = {} & ModuleDataType

const typedObjectEntries = <T extends Record<string, any>>(obj: T) => {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

const constructModuleData = (values: FieldProps, layoutTemplateModuleData: ModuleDataProps) => {
  const moduleData: ModuleDataProps = {}

  if (values && typeof values === 'object' && layoutTemplateModuleData) {
    typedObjectEntries(layoutTemplateModuleData).forEach(([key, config]) => {
      let result = null

      switch (config?.type) {
        case LayoutTemplateModuleType.DATE:
          result = values[key] ? values[key] : null

          break
        case LayoutTemplateModuleType.NUMBER:
          result = values[key] ? values[key] : null
          break

        default:
          break
      }

      Object.defineProperty(moduleData, key, {
        value: {
          ...config,
          value: result,
        },
        writable: true,
        enumerable: true,
        configurable: true,
      })
    })
  }

  return moduleData
}

const getInitialValues = (layoutTemplateModuleData: ModuleDataProps | undefined) => {
  const moduleData: ModuleDataProps = {}
  if (!layoutTemplateModuleData) return
  typedObjectEntries(layoutTemplateModuleData).forEach(([key, config]) => {
    let result

    switch (config?.type) {
      case LayoutTemplateModuleType.NUMBER:
        result = config.value ? config.value : null
        break

      case LayoutTemplateModuleType.DATE:
        result = config.value ? moment(config.value) : null
        break

      default:
        break
    }

    Object.defineProperty(moduleData, key, {
      value: result,
      writable: true,
      enumerable: true,
      configurable: true,
    })
  })

  return moduleData
}

const renderModuleComponent = (moduleData: ExtractModuleDataValue<ModuleDataProps[keyof ModuleDataProps]>) => {
  switch (moduleData?.type) {
    case LayoutTemplateModuleType.NUMBER:
      return <StyledInputNumber min={0} />
    case LayoutTemplateModuleType.DATE:
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
  programLayoutTemplateConfig?: ProgramLayoutTemplateConfig
  onRefetch?: () => void
}> = ({ programLayoutTemplateConfig, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [updateProgramLayoutTemplateConfigIntro] = useMutation<
    hasura.UpdateProgramLayoutTemplateConfigData,
    hasura.UpdateProgramLayoutTemplateConfigDataVariables
  >(UpdateProgramLayoutTemplateConfigData)

  if (!programLayoutTemplateConfig) {
    return <Skeleton active />
  }

  const layoutTemplateModuleData = programLayoutTemplateConfig.moduleData
  const initialModuleData = getInitialValues(layoutTemplateModuleData)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProgramLayoutTemplateConfigIntro({
      variables: {
        programLayoutTemplateConfigId: programLayoutTemplateConfig.id,
        moduleData: constructModuleData(values, layoutTemplateModuleData),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={initialModuleData}
      onFinish={handleSubmit}
    >
      {layoutTemplateModuleData &&
        typedObjectEntries(layoutTemplateModuleData).map(([key, moduleData]) => {
          return (
            <Form.Item
              key={moduleData?.id}
              label={formatMessage(ProgramAdminPageMessages.ProgramOtherForm[key])}
              name={key}
            >
              {renderModuleComponent(moduleData)}
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

const UpdateProgramLayoutTemplateConfigData = gql`
  mutation UpdateProgramLayoutTemplateConfigData($programLayoutTemplateConfigId: uuid!, $moduleData: jsonb!) {
    update_program_layout_template_config(
      where: { id: { _eq: $programLayoutTemplateConfigId } }
      _set: { module_data: $moduleData }
    ) {
      affected_rows
    }
  }
`

export default ProgramAdditionalSettingsForm
