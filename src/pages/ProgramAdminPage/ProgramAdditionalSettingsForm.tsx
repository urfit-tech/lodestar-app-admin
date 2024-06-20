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
  LayoutTemplateModuleName,
  LayoutTemplateModuleType,
  ModuleDataProps,
  ProgramLayoutTemplateConfigType,
} from '../../types/program'
import ProgramAdminPageMessages from './translation'

const StyledDatePicker = styled(DatePicker)<DatePickerProps>`
  min-width: 100%;
`

const StyledInputNumber = styled(InputNumber)`
  min-width: 100%;
`

type ExtractValue<T> = T extends infer V ? V : never

type ExtractValueType<T> = T extends { value: infer V } ? V : never

type ModuleDataType = {
  [K in keyof ModuleDataProps]?: ExtractValueType<ModuleDataProps[K]>
}

type FieldProps = {} & ModuleDataType

function typedObjectEntries<T extends Record<string, any>>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

const ProgramAdditionalSettingsForm: React.FC<{
  programLayoutTemplateConfig?: ProgramLayoutTemplateConfigType[]
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

  const filteredLayoutTemplateModule = programLayoutTemplateConfig.filter(config => config.isActive)[0]
  if (!filteredLayoutTemplateModule) return <></>

  const LayoutTemplateModuleData = filteredLayoutTemplateModule.moduleData
  const constructModuleData = (values: FieldProps) => {
    const moduleData: ModuleDataProps = {}

    if (values && typeof values === 'object') {
      typedObjectEntries(LayoutTemplateModuleData).forEach(([key, config]) => {
        let result = null

        switch (config?.type) {
          case LayoutTemplateModuleType.DATE:
            result = values[key] ? values[key] : ''

            break
          case LayoutTemplateModuleType.NUMBER:
            result = values[key] ? values[key] : 0
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

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProgramLayoutTemplateConfigIntro({
      variables: {
        programLayoutTemplateConfigId: filteredLayoutTemplateModule.id,
        moduleData: constructModuleData(values),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const renderModuleComponent = (moduleData: ExtractValue<ModuleDataProps[keyof ModuleDataProps]>) => {
    switch (moduleData?.type) {
      case LayoutTemplateModuleType.NUMBER:
        return <StyledInputNumber min={0} key={moduleData.id} />
      case LayoutTemplateModuleType.DATE:
        return (
          <StyledDatePicker
            key={moduleData.id}
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
          />
        )
      default:
        return null
    }
  }

  return (
    <Form
      form={form}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        [LayoutTemplateModuleName.EXPECTED_START_DATE]: LayoutTemplateModuleData?.expectedStartDate?.value
          ? moment(LayoutTemplateModuleData.expectedStartDate.value)
          : '',
        [LayoutTemplateModuleName.EXPECTED_DURATION]: LayoutTemplateModuleData?.expectedDuration?.value ?? '',
        [LayoutTemplateModuleName.EXPECTED_SECTIONS]: LayoutTemplateModuleData?.expectedSections?.value ?? '',
        [LayoutTemplateModuleName.COMPLETED_RELEASE]: LayoutTemplateModuleData?.completeRelease?.value
          ? moment(LayoutTemplateModuleData?.completeRelease.value)
          : '',
      }}
      onFinish={handleSubmit}
    >
      {typedObjectEntries(LayoutTemplateModuleData).map(([key, moduleData]) => (
        <Form.Item
          key={moduleData?.id}
          label={formatMessage(ProgramAdminPageMessages.ProgramOtherForm[key])}
          name={key}
        >
          {renderModuleComponent(moduleData)}
        </Form.Item>
      ))}

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
