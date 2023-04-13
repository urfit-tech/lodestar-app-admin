import { gql, useMutation } from '@apollo/client'
import { Button, Form, InputNumber, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProgramAdminProps } from '../../types/program'
import SaleInput, { SaleProps } from '../form/SaleInput'

type FieldProps = {
  listPrice: number
  sale: SaleProps
}

const ProgramPerpetualPlanAdminCard: React.FC<{
  program: ProgramAdminProps
  onSubmit?: (values: FieldProps) => void
  onRefetch?: () => void
}> = ({ program, onSubmit, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateProgram] = useMutation<
    hasura.UPDATE_PROGRAM_PERPETUAL_PLAN,
    hasura.UPDATE_PROGRAM_PERPETUAL_PLANVariables
  >(UPDATE_PROGRAM_PERPETUAL_PLAN)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProgram({
      variables: {
        programId: program.id,
        listPrice: values.listPrice || 0,
        salePrice: values.sale ? values.sale.price : null,
        soldAt: values.sale?.soldAt || null,
        isCountdownTimerVisible: !!values.sale?.isTimerVisible,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
        onSubmit?.(values)
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
        listPrice: program.plans[0]?.listPrice || 0,
        sale: program.plans[0]?.soldAt
          ? {
              price: program.plans[0]?.salePrice,
              soldAt: program.plans[0]?.soldAt,
              timerVisible: !!program?.isCountdownTimerVisible,
            }
          : null,
      }}
      onFinish={handleSubmit}
    >
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
        <InputNumber
          min={0}
          formatter={value => `NT$ ${value}`}
          parser={value => (value ? value.replace(/\D/g, '') : '')}
        />
      </Form.Item>

      <Form.Item
        name="sale"
        rules={[{ validator: (rule, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
      >
        <SaleInput withTimer />
      </Form.Item>

      <Form.Item>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_PROGRAM_PERPETUAL_PLAN = gql`
  mutation UPDATE_PROGRAM_PERPETUAL_PLAN(
    $programId: uuid!
    $listPrice: numeric
    $salePrice: numeric
    $soldAt: timestamptz
    $isCountdownTimerVisible: Boolean!
  ) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: {
        list_price: $listPrice
        sale_price: $salePrice
        sold_at: $soldAt
        is_countdown_timer_visible: $isCountdownTimerVisible
      }
    ) {
      affected_rows
    }
    update_program_plan(where: { program_id: { _eq: $programId } }, _set: { sold_at: $soldAt }) {
      affected_rows
    }
  }
`

export default ProgramPerpetualPlanAdminCard
