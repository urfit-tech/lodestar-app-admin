import { Button, Form, Icon, InputNumber, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import { StyledTips } from '../../components/admin'
import CurrencyInput from '../../components/admin/CurrencyInput'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanSaleForm: React.FC<FormComponentProps> = ({ form }) => {
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
        {appointmentPlan &&
          form.getFieldDecorator('duration', {
            initialValue: appointmentPlan.duration,
            rules: [{ required: true, message: '請輸入時間長度' }],
          })(<InputNumber min={0} />)}
      </Form.Item>

      <Form.Item label="定價">
        {appointmentPlan &&
          form.getFieldDecorator('listPrice', {
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

export default Form.create<FormComponentProps>()(AppointmentPlanSaleForm)
