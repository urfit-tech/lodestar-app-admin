import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Flex } from '@chakra-ui/react'
import { Button, Form, Input, InputNumber, message, Radio, Select, Skeleton, Spin, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { useService } from '../../hooks/service'
import { AppointmentPlanAdmin, MeetGenerationMethod, ReservationType } from '../../types/appointment'
import { StyledTips } from '../admin'

const messages = defineMessages({
  hoursAgo: { id: 'appointment.label.hoursAgo', defaultMessage: '小時前' },
  daysAgo: { id: 'appointment.label.daysAgo', defaultMessage: '天前' },
  appointmentDeadline: {
    id: 'appointment.text.appointmentDeadline',
    defaultMessage: '限定用戶於時段開始前多久需完成預約',
  },
  isReschedule: {
    id: 'appointment.text.isReschedule',
    defaultMessage: '是否允許更換預約時段',
  },
})

type FieldProps = {
  title: string
  phone: string
  reservationAmount: number
  reservationType: ReservationType
  rescheduleAmount: number
  rescheduleType: ReservationType
  meetGenerationMethod: MeetGenerationMethod
  defaultMeetGateway: string
  meetingLinkUrl: string
}

const UpdateAppointmentPlan = gql`
  mutation UpdateAppointmentPlan(
    $appointmentPlanId: uuid!
    $title: String!
    $phone: String!
    $reservationAmount: numeric
    $reservationType: String
    $rescheduleAmount: Int
    $rescheduleType: String
    $meetGenerationMethod: String
    $defaultMeetGateway: String
    $meetingLinkUrl: String
  ) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: {
        title: $title
        phone: $phone
        reservation_amount: $reservationAmount
        reservation_type: $reservationType
        reschedule_amount: $rescheduleAmount
        reschedule_type: $rescheduleType
        meet_generation_method: $meetGenerationMethod
        default_meet_gateway: $defaultMeetGateway
        meeting_link_url: $meetingLinkUrl
      }
    ) {
      affected_rows
    }
  }
`

const AppointmentPlanBasicForm: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdmin | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [isReschedule, setIsReschedule] = useState<boolean>(appointmentPlanAdmin?.rescheduleAmount !== -1)

  const { loading: loadingService, services } = useService()
  const [updateAppointmentPlan] = useMutation<hasura.UpdateAppointmentPlan, hasura.UpdateAppointmentPlanVariables>(
    UpdateAppointmentPlan,
  )
  const [loading, setLoading] = useState(false)
  const [meetGenerationMethod, setMeetGenerationMethod] = useState<'manual' | 'auto'>(
    appointmentPlanAdmin?.meetGenerationMethod as 'auto' | 'manual',
  )
  const [reservationType, setReservationType] = useState(appointmentPlanAdmin?.reservationType as ReservationType)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppointmentPlan({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        title: values.title,
        phone: values.phone,
        reservationAmount: values.reservationAmount,
        reservationType: values.reservationType,
        rescheduleAmount: values.rescheduleAmount ? values.rescheduleAmount : -1,
        rescheduleType: values.rescheduleType ? values.rescheduleType : null,
        meetGenerationMethod: values.meetGenerationMethod,
        defaultMeetGateway:
          meetGenerationMethod === 'auto' && values.defaultMeetGateway ? values.defaultMeetGateway : 'jitsi',
        meetingLinkUrl: values.meetingLinkUrl || null,
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
        title: appointmentPlanAdmin.title || '',
        phone: appointmentPlanAdmin.phone,
        reservationAmount: appointmentPlanAdmin.reservationAmount || 0,
        reservationType: appointmentPlanAdmin.reservationType || 'hour',
        rescheduleAmount: appointmentPlanAdmin.rescheduleAmount || 1,
        rescheduleType: appointmentPlanAdmin.rescheduleType || 'hour',
        meetGenerationMethod: appointmentPlanAdmin.meetGenerationMethod,
        defaultMeetGateway: appointmentPlanAdmin.defaultMeetGateway ?? 'jitsi',
        meetingLinkUrl: appointmentPlanAdmin.meetingLinkUrl,
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
        className="mb-0"
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
            <InputNumber min={0} max={reservationType === 'hour' ? 23 : undefined} />
          </Form.Item>

          <Form.Item
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
            <Select style={{ width: '150px' }} onChange={v => setReservationType(v as 'hour' | 'day')}>
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

      <Form.Item
        className="align-items-baseline mb-0"
        label={
          <span className="d-flex align-items-center">
            {formatMessage(appointmentMessages.label.reschedule)}
            <Tooltip placement="top" title={<StyledTips>{formatMessage(messages.isReschedule)}</StyledTips>}>
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
        <Radio.Group
          value={isReschedule}
          onChange={e => {
            setIsReschedule(e.target.value)
            form.setFieldsValue({ rescheduleAmount: e.target.value ? 1 : -1 })
          }}
        >
          <Radio value={true} className="mb-2">
            {formatMessage(appointmentMessages.label.isReschedule)}
          </Radio>
          <Radio value={false}>{formatMessage(appointmentMessages.label.unReschedule)}</Radio>
        </Radio.Group>
        {isReschedule && (
          <Input.Group compact>
            <Form.Item
              name="rescheduleAmount"
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(appointmentMessages.label.rescheduleAmount),
                  }),
                },
              ]}
            >
              <InputNumber min={1} />
            </Form.Item>

            <Form.Item
              className="ml-2"
              name="rescheduleType"
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(appointmentMessages.label.rescheduleType),
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
        )}
      </Form.Item>

      <Form.Item label={formatMessage(appointmentMessages.label.meetingLink)} style={{ marginBottom: '0px' }}>
        <Flex>
          <Form.Item name="meetGenerationMethod">
            <Select
              style={{ width: '150px' }}
              onChange={value => setMeetGenerationMethod(value as 'auto' | 'manual')}
              defaultValue={appointmentPlanAdmin?.meetGenerationMethod}
            >
              <Select.Option key="auto" value="auto">
                {formatMessage(appointmentMessages.label.automaticallyGenerated)}
              </Select.Option>
              <Select.Option key="manual" value="manual">
                {formatMessage(appointmentMessages.label.manuallyDistributed)}
              </Select.Option>
            </Select>
          </Form.Item>

          {meetGenerationMethod === 'manual' && (
            <Form.Item
              name="meetingLinkUrl"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.trim() === '') {
                      return Promise.resolve()
                    }
                    try {
                      new URL(value)
                      return Promise.resolve()
                    } catch {
                      return Promise.reject(new Error(formatMessage(appointmentMessages.text.validURL)))
                    }
                  },
                },
              ]}
            >
              <Input style={{ width: '300px' }} placeholder={formatMessage(appointmentMessages.label.meetingLinkUrl)} />
            </Form.Item>
          )}
        </Flex>
      </Form.Item>

      {loadingService ? (
        <Spin />
      ) : enabledModules.meet_service &&
        services.filter(service => service.gateway === 'zoom').length !== 0 &&
        meetGenerationMethod === 'auto' ? (
        <Form.Item label="預設會議系統" name="defaultMeetGateway">
          <Select style={{ width: '150px' }} defaultValue="zoom">
            <Select.Option key="zoom" value="zoom">
              Zoom
            </Select.Option>
            <Select.Option key="jitsi" value="jitsi">
              Jitsi
            </Select.Option>
          </Select>
        </Form.Item>
      ) : null}

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
export default AppointmentPlanBasicForm
