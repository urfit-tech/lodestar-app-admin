import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'
import CategorySelector from '../common/CategorySelector'
import CreatorSelector from '../common/CreatorSelector'

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
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole } = useAuth()
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
            history.push(`/activities/${activityId}`)
          },
          onError: error => {
            handleError(error)
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
          {formatMessage(commonMessages.ui.create)}
        </Button>
      )}
      icon={<Icon type="file-add" />}
      title={formatMessage(commonMessages.ui.create)}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okText={formatMessage(commonMessages.ui.create)}
      okButtonProps={{ loading }}
      onOk={() => handleSubmit()}
    >
      <Form hideRequiredMark>
        {currentUserRole === 'app-owner' && (
          <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
            {form.getFieldDecorator('memberId', {
              initialValue: currentMemberId,
            })(<CreatorSelector />)}
          </Form.Item>
        )}
        <Form.Item label={formatMessage(commonMessages.term.title)}>
          {form.getFieldDecorator('title', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.title),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.category)}>
          {form.getFieldDecorator('categoryIds', { initialValue: [] })(<CategorySelector classType="activity" />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<ActivityCreationModalProps>()(ActivityCreationModal)
