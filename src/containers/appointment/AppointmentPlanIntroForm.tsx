import { Button, Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useContext, useState } from 'react'
import AdminBraftEditor from '../../components/admin/AdminBraftEditor'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanIntroForm: React.FC<FormComponentProps> = ({ form }) => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      console.log(values.description.toRAW())
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
      <Form.Item>
        {appointmentPlan &&
          form.getFieldDecorator('description', {
            initialValue: BraftEditor.createEditorState(appointmentPlan.description),
            rules: [
              {
                validator: (rule, value: EditorState, callback) => {
                  value.isEmpty() ? callback('請輸入問題內容') : callback()
                },
              },
            ],
          })(<AdminBraftEditor />)}
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

export default Form.create<FormComponentProps>()(AppointmentPlanIntroForm)
