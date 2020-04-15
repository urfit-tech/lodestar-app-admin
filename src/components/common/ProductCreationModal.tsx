import { Button, Form, Icon, Input, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import { ClassType } from '../../types/general'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import CategorySelector from '../common/CategorySelector'
import CreatorSelector from './CreatorSelector'

type ProductCreationModalProps = FormComponentProps &
  AdminModalProps & {
    classType: ClassType
    withCreatorSelector?: boolean
    withProgramType?: boolean
    onCreate?: (values: {
      title: string
      categoryIds: string[]
      creatorId?: string
      isSubscription?: boolean
    }) => Promise<any>
  }

const ProductCreationModal: React.FC<ProductCreationModalProps> = ({
  form,
  classType,
  withCreatorSelector,
  withProgramType,
  onCreate,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors || !onCreate) {
        return
      }
      setLoading(true)
      onCreate({
        title: values.title,
        categoryIds: values.categoryIds || [],
        creatorId: values.creatorId,
        isSubscription: values.isSubscription,
      }).catch(error => {
        handleError(error)
        setLoading(false)
      })
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
      {...props}
    >
      <Form>
        {withCreatorSelector && (
          <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
            {form.getFieldDecorator('creatorId', {
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
          {form.getFieldDecorator('categoryIds', { initialValue: [] })(<CategorySelector classType={classType} />)}
        </Form.Item>
        {withProgramType && (
          <Form.Item label={formatMessage(programMessages.label.programPlanType)}>
            {form.getFieldDecorator('isSubscription', {
              initialValue: false,
              rules: [{ required: true }],
            })(
              <Radio.Group
                options={[
                  { label: formatMessage(programMessages.label.perpetualPlanType), value: false },
                  { label: formatMessage(programMessages.label.subscriptionPlanType), value: true },
                ]}
              />,
            )}
          </Form.Item>
        )}
      </Form>
    </AdminModal>
  )
}

export default Form.create<ProductCreationModalProps>()(ProductCreationModal)
