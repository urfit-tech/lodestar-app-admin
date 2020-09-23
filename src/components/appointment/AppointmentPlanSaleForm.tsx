import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, InputNumber, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { AppointmentPlanAdminProps } from '../../types/appointment'
import { StyledTips } from '../admin'
import CurrencyInput from '../form/CurrencyInput'
import CurrencySelector from '../form/CurrencySelector'

const AppointmentPlanSaleForm: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updateAppointmentPlanSale] = useMutation<
    types.UPDATE_APPOINTMENT_PLAN_SALE,
    types.UPDATE_APPOINTMENT_PLAN_SALEVariables
  >(UPDATE_APPOINTMENT_PLAN_SALE)
  const [loading, setLoading] = useState(false)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateAppointmentPlanSale({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        duration: values.duration,
        listPrice: values.listPrice,
        currencyId: values.currencyId,
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
      layout="vertical"
      colon={false}
      hideRequiredMark
      initialValues={{
        duration: appointmentPlanAdmin.duration,
        listPrice: appointmentPlanAdmin.listPrice,
        currencyId: appointmentPlanAdmin.currencyId,
      }}
      onFinish={handleSubmit}
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
        name="duration"
        rules={[{ required: true, message: formatMessage(errorMessages.form.duration) }]}
      >
        <InputNumber min={0} />
      </Form.Item>

      <Form.Item
        label={formatMessage(commonMessages.term.listPrice)}
        name="listPrice"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.term.listPrice),
            }),
          },
        ]}
      >
        <CurrencyInput noLabel currencyId={form.getFieldValue('currencyId') || appointmentPlanAdmin.currencyId} />
      </Form.Item>

      <Form.Item
        label={formatMessage(commonMessages.term.currency)}
        name="currencyId"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.term.listPrice),
            }),
          },
        ]}
      >
        <CurrencySelector />
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

export default AppointmentPlanSaleForm
