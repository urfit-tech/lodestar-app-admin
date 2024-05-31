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
import { ProgramAdminProps, TemplateModuleProps } from '../../types/program'
import ProgramAdminPageMessages from './translation'

const StyledDatePicker = styled(DatePicker)<DatePickerProps>`
  min-width: 100%;
`

const StyledInputNumber = styled(InputNumber)`
  min-width: 100%;
`

type FieldProps = {} & TemplateModuleProps

const ProgramOtherForm: React.FC<{
  program?: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [updateProgramIntro] = useMutation<
    hasura.updateProgramTemplateModule,
    hasura.updateProgramTemplateModuleVariables
  >(updateProgramModuleData)

  if (!program) {
    return <Skeleton active />
  }

  const templateModule = program?.moduleData
  if (!templateModule) return <></>

  const constructModuleData = (values: FieldProps) => {
    const moduleData: TemplateModuleProps = {}

    if (values && typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null || value !== undefined) {
          value = moment.isMoment(value) ? moment(value).utc().toDate() : value
          Object.defineProperty(moduleData, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true,
          })
        }
      })
    }

    return moduleData
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProgramIntro({
      variables: {
        programId: program.id,
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

  return (
    <Form
      form={form}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        expectedStartDate: templateModule?.expectedStartDate ? moment(templateModule.expectedStartDate) : '',
        expectedDuration: templateModule?.expectedDuration ?? '',
        expectedSections: templateModule?.expectedSections ?? '',
        completeRelease: templateModule?.completeRelease ? moment(templateModule?.completeRelease) : '',
      }}
      onFinish={handleSubmit}
    >
      {templateModule?.expectedStartDate !== undefined && (
        <Form.Item
          label={formatMessage(ProgramAdminPageMessages.ProgramOtherForm.expectedStartDate)}
          name="expectedStartDate"
        >
          <StyledDatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
          />
        </Form.Item>
      )}

      {templateModule?.expectedDuration !== undefined && (
        <Form.Item
          label={formatMessage(ProgramAdminPageMessages.ProgramOtherForm.expectedDuration)}
          name="expectedDuration"
        >
          <StyledInputNumber min={0}></StyledInputNumber>
        </Form.Item>
      )}

      {templateModule?.expectedSections !== undefined && (
        <Form.Item
          label={formatMessage(ProgramAdminPageMessages.ProgramOtherForm.expectedSections)}
          name="expectedSections"
        >
          <StyledInputNumber min={0}></StyledInputNumber>
        </Form.Item>
      )}

      {templateModule?.completeRelease !== undefined && (
        <Form.Item
          label={formatMessage(ProgramAdminPageMessages.ProgramOtherForm.completeRelease)}
          name="completeRelease"
        >
          <StyledDatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
          />
        </Form.Item>
      )}

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

const updateProgramModuleData = gql`
  mutation updateProgramTemplateModule($programId: uuid!, $moduleData: jsonb!) {
    update_program(where: { id: { _eq: $programId } }, _set: { module_data: $moduleData }) {
      affected_rows
    }
  }
`

export default ProgramOtherForm
