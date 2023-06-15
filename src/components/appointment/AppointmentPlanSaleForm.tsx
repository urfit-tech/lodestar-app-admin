import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, InputNumber, message, Radio, Skeleton, Space, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { AppointmentPlanAdminProps } from '../../types/appointment'
import { StyledTips } from '../admin'
import CurrencyInput from '../form/CurrencyInput'
import CurrencySelector from '../form/CurrencySelector'

type FieldProps = {
  duration: number
  listPrice: number
  currencyId: string
  capacity: number
}

const AppointmentPlanSaleForm: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdminProps | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateAppointmentPlanSale] = useMutation<
    hasura.UPDATE_APPOINTMENT_PLAN_SALE,
    hasura.UPDATE_APPOINTMENT_PLAN_SALEVariables
  >(UPDATE_APPOINTMENT_PLAN_SALE)
  const [loading, setLoading] = useState(false)
  const [isLimited, setIsLimited] = useState(appointmentPlanAdmin?.capacity !== -1)

  useEffect(() => {
    setIsLimited(appointmentPlanAdmin?.capacity !== -1)
  }, [appointmentPlanAdmin?.capacity])

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppointmentPlanSale({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        duration: values.duration,
        listPrice: values.listPrice,
        currencyId: values.currencyId,
        capacity: values.capacity,
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
      layout="vertical"
      colon={false}
      hideRequiredMark
      initialValues={{
        duration: appointmentPlanAdmin.duration,
        listPrice: appointmentPlanAdmin.listPrice,
        currencyId: appointmentPlanAdmin.currencyId,
        capacity: appointmentPlanAdmin.capacity,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={
          <span className="d-flex align-items-center">
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

      <div className="mb-2">{formatMessage(appointmentMessages.label.maximumCapacity)}</div>
      <Radio.Group
        value={isLimited}
        onChange={e => {
          setIsLimited(e.target.value)
          form.setFieldsValue({ capacity: e.target.value ? 1 : -1 })
        }}
      >
        <Space direction="vertical">
          <Radio value={false} className="mb-2">
            {formatMessage(appointmentMessages.label.unlimited)}
          </Radio>
          <Radio value={true}>{formatMessage(appointmentMessages.label.limited)}</Radio>
        </Space>
      </Radio.Group>

      <Form.Item name="capacity">
        <InputNumber min={1} className="ml-4 mt-2" />
      </Form.Item>

      <Form.Item
        label={formatMessage(commonMessages.label.listPrice)}
        name="listPrice"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.label.listPrice),
            }),
          },
        ]}
      >
        <CurrencyInput noLabel currencyId={form.getFieldValue('currencyId') || appointmentPlanAdmin.currencyId} />
      </Form.Item>

      <Form.Item
        label={formatMessage(commonMessages.label.currency)}
        name="currencyId"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.label.currency),
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
    $capacity: Int
  ) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: { duration: $duration, price: $listPrice, currency_id: $currencyId, capacity: $capacity }
    ) {
      affected_rows
    }
  }
`

export default AppointmentPlanSaleForm
