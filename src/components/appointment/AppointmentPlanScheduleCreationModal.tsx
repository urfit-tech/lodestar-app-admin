import dayjs from 'dayjs'
import { FileAddOutlined } from '@ant-design/icons'
import { useApolloClient, useMutation } from '@apollo/client'
import { Button, Checkbox, DatePicker, Form, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { GET_APPOINTMENT_PERIOD, INSERT_APPOINTMENT_SCHEDULES } from '../../hooks/appointment'
import { AppointmentPlanAdmin } from '../../types/appointment'
import { PeriodType } from '../../types/general'
import { StyledSelect } from '../admin'
import AdminModal from '../admin/AdminModal'
import appointmentMessages from './translation'

dayjs.extend(utc)
dayjs.extend(timezone)

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
  const apolloClient = useApolloClient()
  const [insertAppointmentSchedules] = useMutation<
    hasura.INSERT_APPOINTMENT_SCHEDULES,
    hasura.INSERT_APPOINTMENT_SCHEDULESVariables
  >(INSERT_APPOINTMENT_SCHEDULES)
  const [withRepeat, setWithRepeat] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return (
      <Button type="primary" icon={<FileAddOutlined />} disabled>
        {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.createPeriod)}
      </Button>
    )
  }

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)
        const values = form.getFieldsValue()
        // moment is mutable
        const startedAt = values.startedAt.clone()
        const endedAt = values.startedAt.clone().add(appointmentPlanAdmin.duration, 'minutes')
        const { data: appointmentPeriodData } = await apolloClient.query<
          hasura.GET_APPOINTMENT_PERIOD,
          hasura.GET_APPOINTMENT_PERIODVariables
        >({
          query: GET_APPOINTMENT_PERIOD,
          variables: {
            appointmentPlanId: appointmentPlanAdmin.id,
            startedAt: startedAt.format('YYYY-MM-DDTHH:mm:00Z'),
            endedAt: endedAt.format('YYYY-MM-DDTHH:mm:00Z'),
          },
        })
        if (appointmentPeriodData.appointment_period.length > 0) {
          message.error('已有重複的時段')
          setLoading(false)
          return
        }
        insertAppointmentSchedules({
          variables: {
            data: [
              {
                appointment_plan_id: appointmentPlanAdmin.id,
                started_at: startedAt.format('YYYY-MM-DDTHH:mm:00Z'),
                interval_amount: withRepeat ? 1 : null,
                interval_type: withRepeat ? values.periodType : null,
              },
            ],
          },
        })
          .then(() => {
            message.success(formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.successfullyCreated))
            onSuccess()
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => {
            setLoading(false)
          })
      })
      .catch(error => handleError(error))
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <div>
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-2">
            {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.createPeriod)}
          </Button>
          <StyledTimeStandardBlock>
            {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.timezone, {
              city: dayjs.tz.guess().split('/')[1],
              timezone: dayjs().format('Z'),
            })}
          </StyledTimeStandardBlock>
        </div>
      )}
      icon={<FileAddOutlined />}
      title={
        <>
          <div className="mb-3">
            {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.createPeriod)}
          </div>
          <StyledTimeZoneBlock>
            {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.timezone, {
              city: dayjs.tz.guess().split('/')[1],
              timezone: dayjs().format('Z'),
            })}
          </StyledTimeZoneBlock>
        </>
      }
      maskClosable={false}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" disabled={loading} onClick={() => setVisible(false)}>
            {formatMessage(appointmentMessages['*'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(appointmentMessages['*'].create)}
          </Button>
        </>
      )}
      onCancel={() => form.resetFields()}
    >
      <Form
        form={form}
        colon={false}
        hideRequiredMark
        initialValues={{
          startedAt:
            appointmentPlanAdmin.reservationAmount && appointmentPlanAdmin.reservationType
              ? appointmentPlanAdmin.reservationType === 'day'
                ? moment()
                    .add(appointmentPlanAdmin.reservationAmount * 24, 'hour')
                    .add(1, 'minute')
                : appointmentPlanAdmin.reservationType === 'hour'
                ? moment().add(appointmentPlanAdmin.reservationAmount, 'hour').add(1, 'minute')
                : undefined
              : moment().add(1, 'h').startOf('hour'),
          periodType: 'D',
        }}
      >
        <Form.Item
          label={formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.startedAt)}
          name="startedAt"
          rules={[
            {
              required: true,
              message: formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.selectStartedAt),
            },
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{
              format: 'HH:mm',
              defaultValue: moment('00:00:00', 'HH:mm:ss'),
            }}
            disabledDate={currentTime =>
              appointmentPlanAdmin.reservationAmount && appointmentPlanAdmin.reservationType
                ? appointmentPlanAdmin.reservationType === 'day'
                  ? Number(currentTime.format('YYYYMMDD')) <
                    Number(dayjs().add(appointmentPlanAdmin.reservationAmount, 'day').format('YYYYMMDD'))
                  : appointmentPlanAdmin.reservationType === 'hour'
                  ? Number(currentTime.format('YYYYMMDD')) <
                    Number(dayjs().add(appointmentPlanAdmin.reservationAmount, 'hour').format('YYYYMMDD'))
                  : false
                : false
            }
            disabledTime={current => {
              const currentHour = dayjs().hour()
              const currentMinute = dayjs().minute()
              return {
                disabledHours: () => {
                  return current
                    ? appointmentPlanAdmin.reservationType === 'day'
                      ? Number(current?.format('YYYYMMDD')) ===
                        Number(dayjs().add(appointmentPlanAdmin.reservationAmount, 'day').format('YYYYMMDD'))
                        ? Array.from({ length: currentHour }, (_, index) => index)
                        : []
                      : appointmentPlanAdmin.reservationType === 'hour'
                      ? Number(current?.format('YYYYMMDD')) ===
                        Number(dayjs().add(appointmentPlanAdmin.reservationAmount, 'hour').format('YYYYMMDD'))
                        ? Array.from(
                            {
                              length:
                                currentHour + appointmentPlanAdmin.reservationAmount > 24
                                  ? currentHour + appointmentPlanAdmin.reservationAmount - 24
                                  : currentHour + appointmentPlanAdmin.reservationAmount,
                            },
                            (_, index) => index,
                          )
                        : []
                      : []
                    : []
                },
                disabledMinutes: () => {
                  return current && appointmentPlanAdmin.reservationType
                    ? Number(current?.format('YYYYMMDDHH')) ===
                      Number(
                        dayjs()
                          .add(appointmentPlanAdmin.reservationAmount, appointmentPlanAdmin.reservationType)
                          .format('YYYYMMDDHH'),
                      )
                      ? Array.from(
                          { length: currentMinute < 59 ? currentMinute + 1 : currentMinute },
                          (_, index) => index,
                        )
                      : Number(current?.format('YYYYMMDDHH')) <
                        Number(
                          dayjs()
                            .add(appointmentPlanAdmin.reservationAmount, appointmentPlanAdmin.reservationType)
                            .format('YYYYMMDDHH'),
                        )
                      ? Array.from({ length: 60 }, (_, index) => index)
                      : []
                    : []
                },
              }
            }}
            showToday={false}
            placeholder={formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.selectStartedAt)}
          />
        </Form.Item>

        <Checkbox className="mb-2" defaultChecked={withRepeat} onChange={e => setWithRepeat(e.target.checked)}>
          {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.periodType)}
        </Checkbox>
        <div className={withRepeat ? 'd-block mb-4' : 'd-none'}>
          <Form.Item name="periodType">
            <StyledSelect className="ml-4">
              <Select.Option value="D">
                {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.day)}
              </Select.Option>
              <Select.Option value="W">
                {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.week)}
              </Select.Option>
              <Select.Option value="M">
                {formatMessage(appointmentMessages.AppointmentPlanScheduleCreationModal.month)}
              </Select.Option>
            </StyledSelect>
          </Form.Item>
        </div>
      </Form>
    </AdminModal>
  )
}

export default AppointmentPlanScheduleCreationModal
