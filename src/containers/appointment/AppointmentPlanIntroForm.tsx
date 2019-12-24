import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import AdminBraftEditor from '../../components/admin/AdminBraftEditor'
import { handleError } from '../../helpers'
import types from '../../types'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanIntroForm: React.FC<FormComponentProps> = ({ form }) => {
  const { loadingAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(AppointmentPlanContext)
  const [updateAppointmentPlanDescription] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_DESCRIPTION,
    types.UPDATE_APPOINTMENT_PLAN_DESCRIPTIONVariables
  >(UPDATE_APPOINTMENT_PLAN_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  if (loadingAppointmentPlan || !appointmentPlan) {
    return <Skeleton active />
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
          message.success('儲存成功')
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
                value.isEmpty() ? callback('請輸入方案簡介') : callback()
              },
            },
          ],
        })(<AdminBraftEditor />)}
      </Form.Item>
      <Form.Item>
        <Button onClick={() => form.resetFields()} className="mr-2">
          取消
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          儲存
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
