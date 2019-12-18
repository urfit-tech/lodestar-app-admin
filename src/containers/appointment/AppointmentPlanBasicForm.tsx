import { Button, Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanBasicForm: React.FC<FormComponentProps> = ({ form }) => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      console.log(values)
      setLoading(false)
    })
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label="方案名稱">
        {appointmentPlan &&
          form.getFieldDecorator('title', {
            initialValue: appointmentPlan.title,
            rules: [{ required: true, message: '請輸入方案名稱' }],
          })(<Input />)}
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => form.resetFields()} className="mr-2">
          取消
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          儲存
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_APPOINTMENT_PLAN_TITLE = gql`
  mutation UPDATE_APPOINTMENT_PLAN_TITLE($appointmentPlanId: uuid!, $title: String!) {
    update_appointment_plan(where: { id: { _eq: $appointmentPlanId } }, _set: { title: $title }) {
      affected_rows
    }
  }
`

export default Form.create<FormComponentProps>()(AppointmentPlanBasicForm)
