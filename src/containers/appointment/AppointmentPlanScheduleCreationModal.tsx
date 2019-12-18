import { Button, Checkbox, DatePicker, Form, Icon, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { AdminBlockSubTitle, StyledSelect } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanScheduleCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  const [loading, setLoading] = useState(false)
  const [withRepeat, setWithRepeat] = useState(false)

  if (!appointmentPlan) {
    return null
  }

  const handleSubmit: (props: { setVisible: React.Dispatch<React.SetStateAction<boolean>> }) => void = ({
    setVisible,
  }) => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      console.log('create schedule:', values)

      setLoading(false)
      setVisible(false)
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
      <AdminBlockSubTitle className="mb-2">僅可設定三個月內的預約時段</AdminBlockSubTitle>

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
