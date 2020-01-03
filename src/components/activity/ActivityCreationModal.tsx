import { Button, Form, Icon, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import useRouter from 'use-react-router'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { useAuth } from '../../contexts/AuthContext'
import AdminModal from '../admin/AdminModal'
import ProgramCategorySelector from '../program/ProgramCategorySelector'

export type CreateActivityEvent = {
  values: {
    memberId: string
    title: string
    description: string
    activityCategoryIds: string[]
  }
  onSuccess?: (activityId: string) => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

type ActivityCreationModalProps = FormComponentProps & {
  onCreate?: (event: CreateActivityEvent) => void
}
const ActivityCreationModal: React.FC<ActivityCreationModalProps> = ({ form, onCreate }) => {
  const { currentMemberId, currentUserRole } = useAuth()
  const { history } = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onCreate) {
        setLoading(true)

        onCreate({
          values: {
            memberId: values.memberId || currentMemberId,
            title: values.title,
            description: '',
            activityCategoryIds: values.categoryIds,
          },
          onSuccess: activityId => {
            message.success('成功建立活動')
            history.push(
              currentUserRole === 'app-owner' ? `/admin/activities/${activityId}` : `/studio/activities/${activityId}`,
            )
          },
          onError: error => {
            if (process.env.NODE_ENV === 'development') {
              console.error(error)
            }
            message.error('建立活動失敗')
            setLoading(false)
          },
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
      icon={<Icon type="file-add" />}
      title="建立"
      renderFooter={({ setVisible }) => (
        <div>
          <Button onClick={() => setVisible(false)} className="mr-2">
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            建立
          </Button>
        </div>
      )}
    >
      <Form hideRequiredMark>
        {currentUserRole === 'app-owner' && (
          <Form.Item label="選擇老師">
            {form.getFieldDecorator('memberId', {
              initialValue: currentMemberId,
            })(<CreatorSelector variant="single"/>)}
          </Form.Item>
        )}
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
