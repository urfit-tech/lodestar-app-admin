import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button, Checkbox, DatePicker, Form, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment, { Moment } from 'moment'
import momentTz from 'moment-timezone'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { INSERT_APPOINTMENT_SCHEDULES } from '../../hooks/appointment'
import { AppointmentPlanAdmin } from '../../types/appointment'
import { PeriodType } from '../../types/general'
import { StyledSelect } from '../admin'
import AdminModal from '../admin/AdminModal'

const StyledTimeStandardBlock = styled.div`
  border-radius: 4px;
  width: 100%;
  color: var(--gray-darker);
  font-size: 14px;
`
const StyledTimeZoneBlock = styled.div`
  border-radius: 4px;
  width: 100%;
  color: var(--gray-dark);
  font-size: 14px;
`

type FieldProps = {
  startedAt: Moment
  periodType: PeriodType
}

const AppointmentPlanScheduleCreationModal: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdmin | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [insertAppointmentSchedules] = useMutation<
    hasura.INSERT_APPOINTMENT_SCHEDULES,
    hasura.INSERT_APPOINTMENT_SCHEDULESVariables
  >(INSERT_APPOINTMENT_SCHEDULES)
  const [withRepeat, setWithRepeat] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return (
      <Button type="primary" icon={<FileAddOutlined />} disabled>
        {formatMessage(appointmentMessages.ui.createPeriod)}
      </Button>
    )
  }

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        insertAppointmentSchedules({
          variables: {
            data: [
              {
                appointment_plan_id: appointmentPlanAdmin.id,
                started_at: values.startedAt.toDate(),
                interval_amount: withRepeat ? 1 : null,
                interval_type: withRepeat ? values.periodType : null,
              },
            ],
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullyCreated))
            onSuccess()
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <div>
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-2">
            {formatMessage(appointmentMessages.ui.createPeriod)}
          </Button>
          <StyledTimeStandardBlock>
            {formatMessage(appointmentMessages.text.timezone, {
              city: momentTz.tz.guess().split('/')[1],
              timezone: moment().zone(momentTz.tz.guess()).format('Z'),
            })}
          </StyledTimeStandardBlock>
        </div>
      )}
      icon={<FileAddOutlined />}
      title={
        <>
          <div className="mb-3">{formatMessage(appointmentMessages.ui.createPeriod)}</div>
          <StyledTimeZoneBlock>
            {formatMessage(appointmentMessages.text.timezone, {
              city: momentTz.tz.guess().split('/')[1],
              timezone: moment().zone(momentTz.tz.guess()).format('Z'),
            })}
          </StyledTimeZoneBlock>
        </>
      }
      maskClosable={false}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.create)}
          </Button>
        </>
      )}
    >
      <Form
        form={form}
        colon={false}
        hideRequiredMark
        initialValues={{
          startedAt: moment().add(1, 'hour').startOf('hour'),
          periodType: 'D',
        }}
      >
        <Form.Item
          label={formatMessage(appointmentMessages.label.startedAt)}
          name="startedAt"
          rules={[{ required: true, message: formatMessage(appointmentMessages.text.selectStartedAt) }]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            disabledDate={currentTime => (currentTime ? currentTime < moment().startOf('day') : false)}
            showToday={false}
            placeholder={formatMessage(appointmentMessages.text.selectStartedAt)}
          />
        </Form.Item>

        <Checkbox className="mb-2" defaultChecked={withRepeat} onChange={e => setWithRepeat(e.target.checked)}>
          {formatMessage(appointmentMessages.label.periodType)}
        </Checkbox>
        <div className={withRepeat ? 'd-block mb-4' : 'd-none'}>
          <Form.Item name="periodType">
            <StyledSelect className="ml-4">
              <Select.Option value="D">{formatMessage(commonMessages.unit.day)}</Select.Option>
              <Select.Option value="W">{formatMessage(commonMessages.unit.week)}</Select.Option>
              <Select.Option value="M">{formatMessage(commonMessages.unit.month)}</Select.Option>
            </StyledSelect>
          </Form.Item>
        </div>
      </Form>
    </AdminModal>
  )
}

export default AppointmentPlanScheduleCreationModal
