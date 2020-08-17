import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment from 'moment'
import momentTz from 'moment-timezone'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import types from '../../types'
import { AppointmentPlanAdminProps } from '../../types/appointment'
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

const AppointmentPlanScheduleCreationModal: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps | null
  refetch?: () => void
}> = ({ appointmentPlanAdmin, refetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [createAppointmentSchedule] = useMutation<
    types.CREATE_APPOINTMENT_SCHEDULE,
    types.CREATE_APPOINTMENT_SCHEDULEVariables
  >(CREATE_APPOINTMENT_SCHEDULE)
  const [withRepeat, setWithRepeat] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return (
      <Button type="primary" icon={<FileAddOutlined />} disabled>
        {formatMessage(appointmentMessages.label.createPeriod)}
      </Button>
    )
  }

  const handleSubmit: (props: { setVisible: React.Dispatch<React.SetStateAction<boolean>> }) => void = ({
    setVisible,
  }) => {
    form
      .validateFields()
      .then(values => {
        setLoading(true)

        createAppointmentSchedule({
          variables: {
            appointmentPlanId: appointmentPlanAdmin.id,
            startedAt: values.startedAt.toDate(),
            intervalAmount: withRepeat ? 1 : null,
            intervalType: withRepeat ? values.periodType : null,
          },
        })
          .then(() => {
            refetch && refetch()
            message.success(formatMessage(commonMessages.event.successfullyCreated))
            setVisible(false)
          })
          .catch(error => handleError(error))
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <>
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-4">
            {formatMessage(appointmentMessages.label.createPeriod)}
          </Button>
          <StyledTimeStandardBlock>
            {formatMessage(appointmentMessages.text.timezone, {
              city: momentTz.tz.guess().split('/')[1],
              timezone: moment().zone(momentTz.tz.guess()).format('Z'),
            })}
          </StyledTimeStandardBlock>
        </>
      )}
      icon={<FileAddOutlined />}
      title={
        <>
          <div className="mb-3">{formatMessage(appointmentMessages.label.createPeriod)}</div>
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
          <Button type="primary" loading={loading} onClick={() => handleSubmit({ setVisible })}>
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
          label={formatMessage(appointmentMessages.term.startedAt)}
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
          {formatMessage(appointmentMessages.term.periodType)}
        </Checkbox>
        <div className={withRepeat ? 'd-block mb-4' : 'd-none'}>
          <Form.Item name="periodType">
            <StyledSelect className="ml-4">
              <Select.Option value="D">{formatMessage(commonMessages.label.perDay)}</Select.Option>
              <Select.Option value="W">{formatMessage(commonMessages.label.week)}</Select.Option>
              <Select.Option value="M">{formatMessage(commonMessages.label.month)}</Select.Option>
            </StyledSelect>
          </Form.Item>
        </div>
      </Form>
    </AdminModal>
  )
}

const CREATE_APPOINTMENT_SCHEDULE = gql`
  mutation CREATE_APPOINTMENT_SCHEDULE(
    $appointmentPlanId: uuid!
    $startedAt: timestamptz!
    $intervalType: String
    $intervalAmount: Int
  ) {
    insert_appointment_schedule(
      objects: {
        appointment_plan_id: $appointmentPlanId
        started_at: $startedAt
        interval_type: $intervalType
        interval_amount: $intervalAmount
      }
    ) {
      affected_rows
    }
  }
`

export default AppointmentPlanScheduleCreationModal
