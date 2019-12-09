import { Button, Form, Input, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { handleError } from '../../helpers'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

type AppointmentPlanCreationModalProps = FormComponentProps & {
  onCreate?: (props: {
    onSuccess?: (data: { appointmentPlanId: string }) => void
    onError?: (error: Error) => void
    data: {
      creatorId: string
      title: string
    }
  }) => void
}
const AppointmentPlanCreationModal: React.FC<AppointmentPlanCreationModalProps> = ({ form, onCreate }) => {
  const { history } = useRouter()
  const [visible, setVisible] = useState(false)
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
      <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
        建立方案
      </Button>

      <Modal title={null} footer={null} centered destroyOnClose visible={visible} onCancel={() => setVisible(false)}>
        <StyledTitle className="mb-4">建立方案</StyledTitle>

        <Form
          hideRequiredMark
          colon={false}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
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

          <Form.Item className="m-0 text-right">
            <Button className="mr-2" onClick={() => setVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              建立
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Form.create<AppointmentPlanCreationModalProps>()(AppointmentPlanCreationModal)
