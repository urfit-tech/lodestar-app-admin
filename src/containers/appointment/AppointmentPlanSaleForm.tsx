import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, InputNumber, message, Skeleton, Tooltip } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { StyledTips } from '../../components/admin'
import CurrencyInput from '../../components/admin/CurrencyInput'
import CurrencySelector from '../../components/admin/CurrencySelector'
import AppointmentPlanContext from '../../contexts/AppointmentPlanContext'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const AppointmentPlanSaleForm: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { loadingAppointmentPlan, errorAppointmentPlan, appointmentPlan, refetchAppointmentPlan } = useContext(
    AppointmentPlanContext,
  )
  const [updateAppointmentPlanSale] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_SALE,
    types.UPDATE_APPOINTMENT_PLAN_SALEVariables
  >(UPDATE_APPOINTMENT_PLAN_SALE)
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

      updateAppointmentPlanSale({
        variables: {
          appointmentPlanId: appointmentPlan.id,
          duration: values.duration,
          listPrice: values.listPrice,
          currencyId: values.currencyId,
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
      <Form.Item
        label={
          <span>
            <span className="mr-2">{formatMessage(appointmentMessages.label.duration)}</span>
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(appointmentMessages.text.durationTips)}</StyledTips>}
            >
              <QuestionCircleFilled />
            </Tooltip>
          </span>
        }
      >
        {form.getFieldDecorator('duration', {
          initialValue: appointmentPlan.duration,
          rules: [{ required: true, message: formatMessage(errorMessages.form.duration) }],
        })(<InputNumber min={0} />)}
      </Form.Item>

      <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
        {form.getFieldDecorator('listPrice', {
          initialValue: appointmentPlan.listPrice,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.listPrice),
              }),
            },
          ],
        })(<CurrencyInput noLabel currencyId={form.getFieldValue('currencyId') || appointmentPlan.currencyId} />)}
      </Form.Item>

      <Form.Item label={formatMessage(commonMessages.term.currency)}>
        {form.getFieldDecorator('currencyId', {
          initialValue: appointmentPlan.currencyId,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.listPrice),
              }),
            },
          ],
        })(<CurrencySelector />)}
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

const UPDATE_APPOINTMENT_PLAN_SALE = gql`
  mutation UPDATE_APPOINTMENT_PLAN_SALE(
    $appointmentPlanId: uuid!
    $duration: numeric
    $listPrice: numeric
    $currencyId: String
  ) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: { duration: $duration, price: $listPrice, currency_id: $currencyId }
    ) {
      affected_rows
    }
  }
`

export default Form.create<FormComponentProps>()(AppointmentPlanSaleForm)
