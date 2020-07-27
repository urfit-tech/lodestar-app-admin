import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { useMutation } from '@apollo/react-hooks'
import { Button, message, Skeleton } from 'antd'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AdminBraftEditor from '../../components/admin/AdminBraftEditor'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const AppointmentPlanIntroForm: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { loadingAppointmentPlan, errorAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(
    AppointmentPlanContext,
  )
  const [updateAppointmentPlanDescription] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_DESCRIPTION,
    types.UPDATE_APPOINTMENT_PLAN_DESCRIPTIONVariables
  >(UPDATE_APPOINTMENT_PLAN_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  if (loadingAppointmentPlan) {
    return <Skeleton active />
  }

  if (errorAppointmentPlan || !appointmentPlan) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)

      updateAppointmentPlanDescription({
        variables: {
          appointmentPlanId: appointmentPlan.id,
          description: values.description.toRAW(),
        },
      })
        .then(() => {
          refetchAppointmentPlan && refetchAppointmentPlan()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item>
        {form.getFieldDecorator('description', {
          initialValue: BraftEditor.createEditorState(appointmentPlan.description || ''),
          validateTrigger: 'onSubmit',
          rules: [
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
          ],
        })(<AdminBraftEditor />)}
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

export default Form.create<FormComponentProps>()(AppointmentPlanIntroForm)
