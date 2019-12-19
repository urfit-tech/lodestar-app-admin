import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { handleError } from '../../helpers'
import types from '../../types'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanBasicForm: React.FC<FormComponentProps> = ({ form }) => {
  const { loadingAppointmentPlan, appointmentPlan, refetch } = useContext(AppointmentPlanContext)
  const [updateAppointmentPlanTitle] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_TITLE,
    types.UPDATE_APPOINTMENT_PLAN_TITLEVariables
  >(UPDATE_APPOINTMENT_PLAN_TITLE)
  const [loading, setLoading] = useState(false)

  if (loadingAppointmentPlan || !appointmentPlan) {
    return <Skeleton active />
  }

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateAppointmentPlanTitle({
        variables: {
          appointmentPlanId: appointmentPlan.id,
          title: values.title,
        },
      })
        .then(() => {
          refetch && refetch()
          message.success('儲存成功')
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
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
        {form.getFieldDecorator('title', {
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
