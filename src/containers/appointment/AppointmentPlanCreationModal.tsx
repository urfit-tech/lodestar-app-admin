import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import useRouter from 'use-react-router'
import AdminModal from '../../components/admin/AdminModal'
import { handleError } from '../../helpers'
import CreatorSelector from '../common/CreatorSelector'

export type CreateAppointmentEvent = (props: {
  onSuccess?: (data: { appointmentPlanId: string }) => void
  onError?: (error: Error) => void
  data: {
    creatorId: string
    title: string
  }
}) => void

type AppointmentPlanCreationModalProps = FormComponentProps & {
  onCreate?: CreateAppointmentEvent
}
const AppointmentPlanCreationModal: React.FC<AppointmentPlanCreationModalProps> = ({ form, onCreate }) => {
  const { history } = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      onCreate &&
        onCreate({
          onSuccess: ({ appointmentPlanId }) => {
            history.push(`/admin/appointment-plans/${appointmentPlanId}`)
          },
          onError: error => {
            handleError(error)
            setLoading(false)
          },
          data: {
            creatorId: values.creatorId,
            title: values.title,
          },
        })
    })
  }

  return (
    <>
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
    </>
  )
}

export default Form.create<AppointmentPlanCreationModalProps>()(AppointmentPlanCreationModal)
