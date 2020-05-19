import { Button, Form, Icon, Input, message, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import CreatorSelector from '../../components/common/CreatorSelector'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useCreateProgram } from '../../hooks/program'
import AdminModal from '../admin/AdminModal'
import ProgramCategorySelector from './ProgramCategorySelector'

const messages = defineMessages({
  createProgram: { id: 'program.label.createProgram', defaultMessage: '建立課程' },
  programPlanType: { id: 'program.label.programPlanType', defaultMessage: '選擇課程付費方案' },
  perpetualPlanType: { id: 'program.label.perpetualPlanType', defaultMessage: '單次付費' },
  subscriptionPlanType: { id: 'program.label.subscriptionPlanType', defaultMessage: '訂閱付費' },
})

type ProgramCreationModalProps = FormComponentProps & {
  withSelector?: boolean
}
const ProgramCreationModal: React.FC<ProgramCreationModalProps> = ({ form, withSelector }) => {
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { history } = useRouter()

  const createProgram = useCreateProgram()

  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (!error && currentMemberId) {
        setLoading(true)
        createProgram({
          variables: {
            ownerId: currentMemberId,
            instructorId: values.memberId || currentMemberId,
            appId,
            title: values.title,
            isSubscription: values.isSubscription,
            programCategories: values.categoryIds.map((categoryId: string, idx: number) => ({
              category_id: categoryId,
              position: idx,
            })),
          },
        })
          .then((res: any) => {
            const { id } = res.data.insert_program.returning[0]
            history.push(`/programs/${id}`)
          })
          .catch(error => {
            setLoading(false)
            message.error(error.message)
          })
      }
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" className="mb-4" onClick={() => setVisible(true)}>
          {formatMessage(messages.createProgram)}
        </Button>
      )}
      title={formatMessage(messages.createProgram)}
      icon={<Icon type="file-add" />}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.create)}
          </Button>
        </>
      )}
    >
      <Form>
        {withSelector && (
          <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
            {form.getFieldDecorator('memberId', {
              initialValue: currentMemberId,
            })(<CreatorSelector />)}
          </Form.Item>
        )}
        <Form.Item label={formatMessage(programMessages.label.programTitle)} className="mb-1">
          {form.getFieldDecorator('title', {
            rules: [{ required: true }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.category)}>
          {form.getFieldDecorator('categoryIds', {
            initialValue: [],
          })(<ProgramCategorySelector />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.programPlanType)}>
          {form.getFieldDecorator('isSubscription', {
            initialValue: false,
            rules: [{ required: true }],
          })(
            <Radio.Group
              options={[
                { label: formatMessage(messages.perpetualPlanType), value: false },
                { label: formatMessage(messages.subscriptionPlanType), value: true },
              ]}
            />,
          )}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<ProgramCreationModalProps>()(ProgramCreationModal)
