import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { FileAddOutlined } from '@ant-design/icons'
import { Button, Input, Radio } from 'antd'
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
    withCategorySelector?: boolean
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
  withCategorySelector,
  onCreate,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, { title, categoryIds, creatorId, isSubscription }) => {
      if (errors || !onCreate) {
        return
      }
      setLoading(true)
      onCreate({
        title,
        categoryIds: categoryIds || [],
        creatorId,
        isSubscription,
      }).catch(error => {
        handleError(error)
        setLoading(false)
      })
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.create)}
        </Button>
      )}
      icon={<FileAddOutlined />}
      title={formatMessage(commonMessages.ui.create)}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okText={formatMessage(commonMessages.ui.create)}
      okButtonProps={{ loading }}
      onOk={() => handleSubmit()}
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
        {withCategorySelector && (
          <Form.Item label={formatMessage(commonMessages.term.category)}>
            {form.getFieldDecorator('categoryIds', { initialValue: [] })(<CategorySelector classType={classType} />)}
          </Form.Item>
        )}
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
