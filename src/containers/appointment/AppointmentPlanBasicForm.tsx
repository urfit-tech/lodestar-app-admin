import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const AppointmentPlanBasicForm: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  // const { enabledModules } = useContext(AppContext)
  const { loadingAppointmentPlan, errorAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(
    AppointmentPlanContext,
  )
  const [updateAppointmentPlanTitle] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_TITLE,
    types.UPDATE_APPOINTMENT_PLAN_TITLEVariables
  >(UPDATE_APPOINTMENT_PLAN_TITLE)
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

      updateAppointmentPlanTitle({
        variables: {
          appointmentPlanId: appointmentPlan.id,
          title: values.title,
          phone: values.phone,
          supportLocales: values.languages,
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
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label={formatMessage(appointmentMessages.term.planTitle)}>
        {form.getFieldDecorator('title', {
          initialValue: appointmentPlan.title,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(appointmentMessages.term.planTitle),
              }),
            },
          ],
        })(<Input maxLength={10} />)}
      </Form.Item>
      <Form.Item label={formatMessage(appointmentMessages.term.contactPhone)}>
        {form.getFieldDecorator('phone', {
          initialValue: appointmentPlan.phone,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(appointmentMessages.term.contactPhone),
              }),
            },
          ],
        })(<Input />)}
      </Form.Item>
      {/* {enabledModules.locale && (
        <Form.Item
          label={
            <>
              {formatMessage(commonMessages.label.languages)}
              <Tooltip placement="topLeft" title="當前台為指定語系時才會顯示，若不選擇全語系皆顯示">
                <Icon type="question-circle" theme="filled" className="ml-2" />
              </Tooltip>
            </>
          }
        >
          {form.getFieldDecorator('languages', {
            initialValue: appointmentPlan.supportLocales.map(supportLocale => supportLocale),
          })(<LanguageSelector />)}
        </Form.Item>
      )} */}
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
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

const UPDATE_APPOINTMENT_PLAN_TITLE = gql`
  mutation UPDATE_APPOINTMENT_PLAN_TITLE(
    $appointmentPlanId: uuid!
    $title: String!
    $phone: String!
    $supportLocales: jsonb
  ) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: { title: $title, phone: $phone, support_locales: $supportLocales }
    ) {
      affected_rows
    }
  }
`

export default Form.create<FormComponentProps>()(AppointmentPlanBasicForm)
