import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import AdminModal from '../common/AdminModal'
import ProgramCategorySelector from '../program/ProgramCategorySelector'

type ActivityCreationModalProps = FormComponentProps & {
  onCreate?: (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      description: string
      activityCategoryIds: string[]
    },
  ) => void
}
const ActivityCreationModal: React.FC<ActivityCreationModalProps> = ({ form, onCreate }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFields((error, value) => {
      if (error) {
        return
      }

      if (onCreate) {
        onCreate(setVisible, setLoading, {
          title: value.title,
          description: '',
          activityCategoryIds: value.categoryIds,
        })
      }
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          建立
        </Button>
      )}
      icon={() => <Icon type="file-add" />}
      title="建立"
      renderFooter={({ setVisible }) => (
        <div>
          <Button onClick={() => setVisible(false)} className="mr-2">
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            建立
          </Button>
        </div>
      )}
    >
      <Form hideRequiredMark>
        <Form.Item label="名稱">
          {form.getFieldDecorator('title', { rules: [{ required: true, message: '請輸入名稱' }] })(<Input />)}
        </Form.Item>
        <Form.Item label="類別">
          {form.getFieldDecorator('categoryIds', { initialValue: [] })(<ProgramCategorySelector />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<ActivityCreationModalProps>()(ActivityCreationModal)
