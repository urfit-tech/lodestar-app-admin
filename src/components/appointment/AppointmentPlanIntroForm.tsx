import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { AppointmentPlanAdmin } from '../../types/appointment'
import AdminBraftEditor from '../form/AdminBraftEditor'

type FieldProps = {
  description: EditorState
}

const AppointmentPlanIntroForm: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdmin | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateAppointmentPlanDescription] = useMutation<
    hasura.UPDATE_APPOINTMENT_PLAN_DESCRIPTION,
    hasura.UPDATE_APPOINTMENT_PLAN_DESCRIPTIONVariables
  >(UPDATE_APPOINTMENT_PLAN_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppointmentPlanDescription({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      initialValues={{
        description: BraftEditor.createEditorState(appointmentPlanAdmin.description || ''),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="description"
        validateTrigger="onSubmit"
        rules={[
          {
            validator: (rule, value: EditorState, callback) => {
              value.isEmpty()
                ? callback(
                    formatMessage(errorMessages.form.isRequired, {
                      field: formatMessage(commonMessages.label.planTitle),
                    }),
                  )
                : callback()
            },
          },
        ]}
      >
        <AdminBraftEditor />
      </Form.Item>

      <Form.Item>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_APPOINTMENT_PLAN_DESCRIPTION = gql`
  mutation UPDATE_APPOINTMENT_PLAN_DESCRIPTION($appointmentPlanId: uuid!, $description: String!) {
    update_appointment_plan(where: { id: { _eq: $appointmentPlanId } }, _set: { description: $description }) {
      affected_rows
    }
  }
`

export default AppointmentPlanIntroForm
