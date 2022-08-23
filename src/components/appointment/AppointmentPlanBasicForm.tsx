import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, InputNumber, message, Select, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { AppointmentPlanAdminProps, ReservationType } from '../../types/appointment'
import { StyledTips } from '../admin'

const messages = defineMessages({
  hoursAgo: { id: 'appointment.label.hoursAgo', defaultMessage: '小時前' },
  daysAgo: { id: 'appointment.label.daysAgo', defaultMessage: '天前' },
  appointmentDeadline: {
    id: 'appointment.text.appointmentDeadline.',
    defaultMessage: '限定用戶於時段開始前多久需完成預約',
  },
})

type FieldProps = {
  title: string
  phone: string
  reservationAmount: number
  reservationType: ReservationType
}

const AppointmentPlanBasicForm: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const [updateAppointmentPlanTitle] = useMutation<
    hasura.UPDATE_APPOINTMENT_PLAN_TITLE,
    hasura.UPDATE_APPOINTMENT_PLAN_TITLEVariables
  >(UPDATE_APPOINTMENT_PLAN_TITLE)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppointmentPlanTitle({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        title: values.title,
        phone: values.phone,
        reservationAmount: values.reservationAmount,
        reservationType: values.reservationType,
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
      colon={false}
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: appointmentPlanAdmin.title,
        phone: appointmentPlanAdmin.phone,
        reservationAmount: appointmentPlanAdmin.reservationAmount || 0,
        reservationType: appointmentPlanAdmin.reservationType || 'hour',
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(appointmentMessages.label.planTitle)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(appointmentMessages.label.planTitle),
            }),
          },
        ]}
      >
        <Input maxLength={10} />
      </Form.Item>
      <Form.Item
        label={formatMessage(appointmentMessages.label.contactPhone)}
        name="phone"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(appointmentMessages.label.contactPhone),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(appointmentMessages.label.reservationPlan)}
            <Tooltip placement="top" title={<StyledTips>{formatMessage(messages.appointmentDeadline)}</StyledTips>}>
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
        <Input.Group compact>
          <Form.Item
            name="reservationAmount"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(appointmentMessages.label.reservationAmount),
                }),
              },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            className="ml-2"
            name="reservationType"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(appointmentMessages.label.reservationType),
                }),
              },
            ]}
          >
            <Select style={{ width: '100px' }}>
              <Select.Option key="hour" value="hour">
                {formatMessage(messages.hoursAgo)}
              </Select.Option>
              <Select.Option key="day" value="day">
                {formatMessage(messages.daysAgo)}
              </Select.Option>
            </Select>
          </Form.Item>
        </Input.Group>
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
    $reservationAmount: numeric
    $reservationType: String
  ) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: { title: $title, phone: $phone, reservation_amount: $reservationAmount, reservation_type: $reservationType }
    ) {
      affected_rows
    }
  }
`

export default AppointmentPlanBasicForm
