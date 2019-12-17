import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import useRouter from 'use-react-router'
import AdminModal from '../../components/admin/AdminModal'
import CreatorSelector from '../common/CreatorSelector'

export type CreateAppointmentEvent = {
  onSuccess?: (data: { appointmentPlanId: string }) => void
  onError?: (error: Error) => void
  data: {
    creatorId: string
    title: string
  }
}

const AppointmentPlanCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { history } = useRouter()

  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)
      console.log(values)
      history.push(`/admin/appointment-plans/appointmentPlan-id`)
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          建立方案
        </Button>
      )}
      title="建立方案"
      icon={<Icon type="file-add" />}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            建立
          </Button>
        </>
      )}
    >
      <Form hideRequiredMark colon={false} onSubmit={e => e.preventDefault()}>
        <Form.Item label="選擇老師">
          {form.getFieldDecorator('creatorId', {
            initialValue: '',
            rules: [{ required: true, message: '請選擇老師' }],
          })(<CreatorSelector />)}
        </Form.Item>
        <Form.Item label="方案名稱">
          {form.getFieldDecorator('title', {
            initialValue: '未命名方案',
            rules: [{ required: true, message: '請輸入方案名稱' }],
          })(<Input />)}
        </Form.Item>

        <Form.Item className="m-0 text-right"></Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<FormComponentProps>()(AppointmentPlanCreationModal)
