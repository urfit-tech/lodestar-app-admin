import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, Icon, message, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { StyledSelect } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'
import { handleError } from '../../helpers'
import types from '../../types'

const AppointmentPlanScheduleCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { loadingAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(AppointmentPlanContext)
  const [createAppointmentSchedule] = useMutation<
    types.CREATE_APPOINTMENT_SCHEDULE,
    types.CREATE_APPOINTMENT_SCHEDULEVariables
  >(CREATE_APPOINTMENT_SCHEDULE)
  const [loading, setLoading] = useState(false)
  const [withRepeat, setWithRepeat] = useState(false)

  if (loadingAppointmentPlan || !appointmentPlan) {
    return (
      <Button type="primary" icon="file-add" disabled>
        建立時段
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
          message.success('儲存成功')
          setVisible(false)
        })
        .catch(error => {
          handleError(error)
          setLoading(false)
        })
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          建立時段
        </Button>
      )}
      icon={<Icon type="file-add" />}
      title="建立時段"
      maskClosable={false}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit({ setVisible })}>
            建立
          </Button>
        </>
      )}
    >
      <Form hideRequiredMark colon={false}>
        <Form.Item label="起始時間">
          {form.getFieldDecorator('startedAt', {
            initialValue: moment()
              .add(1, 'hour')
              .startOf('hour'),
            rules: [{ required: true, message: '請選擇起始時間' }],
          })(
            <DatePicker
              placeholder="選擇起始時間"
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              disabledDate={currentTime => (currentTime ? currentTime < moment().startOf('day') : false)}
            />,
          )}
        </Form.Item>

        <Checkbox className="mb-2" defaultChecked={withRepeat} onChange={e => setWithRepeat(e.target.checked)}>
          重複週期
        </Checkbox>
        <div className={withRepeat ? 'd-block mb-4' : 'd-none'}>
          {form.getFieldDecorator('periodType', {
            initialValue: 'D',
          })(
            <StyledSelect className="ml-4">
              <Select.Option value="D">每日</Select.Option>
              <Select.Option value="W">每週</Select.Option>
              <Select.Option value="M">每月</Select.Option>
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
