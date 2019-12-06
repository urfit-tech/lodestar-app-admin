import { Button, Form, Input, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import styled from 'styled-components'
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
    onSuccess?: () => void
    onError?: (error: Error) => void
    data: {
      creatorId: string
      title: string
    }
  }) => void
}
const AppointmentPlanCreationModal: React.FC<AppointmentPlanCreationModalProps> = ({ form, onCreate }) => {
  const [visible, setVisible] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      onCreate &&
        onCreate({
          onSuccess: () => {},
          onError: error => handleError(error),
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
          <Form.Item label="選擇老師"></Form.Item>
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
            <Button type="primary" htmlType="submit">
              建立
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Form.create<AppointmentPlanCreationModalProps>()(AppointmentPlanCreationModal)
