import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, InputNumber, message, Skeleton, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { StyledTips } from '../../components/admin'
import CurrencyInput from '../../components/admin/CurrencyInput'
import { handleError } from '../../helpers'
import types from '../../types'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanSaleForm: React.FC<FormComponentProps> = ({ form }) => {
  const { loadingAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(AppointmentPlanContext)
  const [updateAppointmentPlanSale] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_SALE,
    types.UPDATE_APPOINTMENT_PLAN_SALEVariables
  >(UPDATE_APPOINTMENT_PLAN_SALE)
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
      updateAppointmentPlanSale({
        variables: {
          appointmentPlanId: appointmentPlan.id,
          duration: values.duration,
          listPrice: values.listPrice,
        },
      })
        .then(() => {
          refetchAppointmentPlan && refetchAppointmentPlan()
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
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item
        label={
          <span>
            <span className="mr-2">時間長度(分鐘)</span>
            <Tooltip title={<StyledTips>設定單次預約服務的時間長度</StyledTips>}>
              <Icon type="question-circle" theme="filled" />
            </Tooltip>
          </span>
        }
      >
        {form.getFieldDecorator('duration', {
          initialValue: appointmentPlan.duration,
          rules: [{ required: true, message: '請輸入時間長度' }],
        })(<InputNumber min={0} />)}
      </Form.Item>

      <Form.Item label="定價">
        {form.getFieldDecorator('listPrice', {
          initialValue: appointmentPlan.listPrice,
          rules: [{ required: true, message: '請輸入定價' }],
        })(<CurrencyInput />)}
      </Form.Item>

      <Form.Item>
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

const UPDATE_APPOINTMENT_PLAN_SALE = gql`
  mutation UPDATE_APPOINTMENT_PLAN_SALE($appointmentPlanId: uuid!, $duration: numeric, $listPrice: numeric) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: { duration: $duration, price: $listPrice }
    ) {
      affected_rows
    }
  }
`

export default Form.create<FormComponentProps>()(AppointmentPlanSaleForm)
