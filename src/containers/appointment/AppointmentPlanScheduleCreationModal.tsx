import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, Icon, message, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { StyledSelect } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import types from '../../types'

const AppointmentPlanScheduleCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { loadingAppointmentPlan, errorAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(
    AppointmentPlanContext,
  )
  const [createAppointmentSchedule] = useMutation<
    types.CREATE_APPOINTMENT_SCHEDULE,
    types.CREATE_APPOINTMENT_SCHEDULEVariables
  >(CREATE_APPOINTMENT_SCHEDULE)
  const [loading, setLoading] = useState(false)
  const [withRepeat, setWithRepeat] = useState(false)

  if (loadingAppointmentPlan || errorAppointmentPlan || !appointmentPlan) {
    return (
      <Button type="primary" icon="file-add" disabled>
        {formatMessage(appointmentMessages.label.createPeriod)}
      </Button>
    )
  }

  const handleSubmit: (props: { setVisible: React.Dispatch<React.SetStateAction<boolean>> }) => void = ({
    setVisible,
  }) => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      createAppointmentSchedule({
        variables: {
          appointmentPlanId: appointmentPlan.id,
          startedAt: values.startedAt.toDate(),
          intervalAmount: withRepeat ? 1 : null,
          intervalType: withRepeat ? values.periodType : null,
        },
      })
        .then(() => {
          refetchAppointmentPlan && refetchAppointmentPlan()
          message.success(formatMessage(commonMessages.event.successfullyCreated))
          setVisible(false)
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          {formatMessage(appointmentMessages.label.createPeriod)}
        </Button>
      )}
      icon={<Icon type="file-add" />}
      title={formatMessage(appointmentMessages.label.createPeriod)}
      maskClosable={false}
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
      <Form hideRequiredMark colon={false}>
        <Form.Item label={formatMessage(appointmentMessages.term.startedAt)}>
          {form.getFieldDecorator('startedAt', {
            initialValue: moment()
              .add(1, 'hour')
              .startOf('hour'),
            rules: [{ required: true, message: formatMessage(appointmentMessages.text.selectStartedAt) }],
          })(
            <DatePicker
              placeholder={formatMessage(appointmentMessages.text.selectStartedAt)}
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              disabledDate={currentTime => (currentTime ? currentTime < moment().startOf('day') : false)}
            />,
          )}
        </Form.Item>

        <Checkbox className="mb-2" defaultChecked={withRepeat} onChange={e => setWithRepeat(e.target.checked)}>
          {formatMessage(appointmentMessages.term.periodType)}
        </Checkbox>
        <div className={withRepeat ? 'd-block mb-4' : 'd-none'}>
          {form.getFieldDecorator('periodType', {
            initialValue: 'D',
          })(
            <StyledSelect className="ml-4">
              <Select.Option value="D">{formatMessage(commonMessages.label.perDay)}</Select.Option>
              <Select.Option value="W">{formatMessage(commonMessages.label.week)}</Select.Option>
              <Select.Option value="M">{formatMessage(commonMessages.label.month)}</Select.Option>
            </StyledSelect>,
          )}
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

export default Form.create<FormComponentProps>()(AppointmentPlanScheduleCreationModal)
