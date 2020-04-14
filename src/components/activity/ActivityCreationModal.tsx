import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
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
  const { currentMemberId, currentUserRole } = useAuth()
  const { history } = useRouter()
  const { formatMessage } = useIntl()
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
            history.push(
              currentUserRole === 'app-owner' ? `/admin/activities/${activityId}` : `/studio/activities/${activityId}`,
            )
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
      renderFooter={({ setVisible }) => (
        <div>
          <Button onClick={() => setVisible(false)} className="mr-2">
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.create)}
          </Button>
        </div>
      )}
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
          {form.getFieldDecorator('categoryIds', { initialValue: [] })(<CategorySelector classType="program" />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<ActivityCreationModalProps>()(ActivityCreationModal)
