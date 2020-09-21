import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { AppointmentPlanAdminProps } from '../../types/appointment'
import AdminBraftEditor from '../form/AdminBraftEditor'

const AppointmentPlanIntroForm: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updateAppointmentPlanDescription] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_DESCRIPTION,
    types.UPDATE_APPOINTMENT_PLAN_DESCRIPTIONVariables
  >(UPDATE_APPOINTMENT_PLAN_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateAppointmentPlanDescription({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        description: values.description.toRAW(),
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
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
                      field: formatMessage(commonMessages.term.planTitle),
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
