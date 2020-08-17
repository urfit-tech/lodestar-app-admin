import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { AppointmentPlanAdminProps } from '../../types/appointment'

const AppointmentPlanBasicForm: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps | null
  refetch?: () => void
}> = ({ appointmentPlanAdmin, refetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()

  const [updateAppointmentPlanTitle] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_TITLE,
    types.UPDATE_APPOINTMENT_PLAN_TITLEVariables
  >(UPDATE_APPOINTMENT_PLAN_TITLE)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)

    updateAppointmentPlanTitle({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        title: values.title,
        phone: values.phone,
        supportLocales: !values.languages || values.languages.length === 0 ? null : values.languages,
      },
    })
      .then(() => {
        refetch && refetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      onFinish={handleSubmit}
      initialValues={{
        title: appointmentPlanAdmin.title,
        phone: appointmentPlanAdmin.phone,
      }}
    >
      <Form.Item
        label={formatMessage(appointmentMessages.term.planTitle)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(appointmentMessages.term.planTitle),
            }),
          },
        ]}
      >
        <Input maxLength={10} />
      </Form.Item>
      <Form.Item
        label={formatMessage(appointmentMessages.term.contactPhone)}
        name="phone"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(appointmentMessages.term.contactPhone),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_APPOINTMENT_PLAN_TITLE = gql`
  mutation UPDATE_APPOINTMENT_PLAN_TITLE(
    $appointmentPlanId: uuid!
    $title: String!
    $phone: String!
    $supportLocales: jsonb
  ) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: { title: $title, phone: $phone, support_locales: $supportLocales }
    ) {
      affected_rows
    }
  }
`

export default AppointmentPlanBasicForm
