import { gql, useMutation } from '@apollo/client'
import { Button, DatePicker, Form, InputNumber, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, orderMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

const messages = defineMessages({
  modifyOrderStatus: { id: 'order.ui.modifyOrderStatus', defaultMessage: '變更訂單狀態' },
  modifyOrderStatusDescription: {
    id: 'order.text.modifyOrderStatusDescription',
    defaultMessage: '此操作僅更改狀態顯示並控制使用者權限，實際退款或金額異動請到金流平台操作。',
  },
  paidPrice: { id: 'order.label.paidPrice', defaultMessage: '支付金額' },
  hasPaid: { id: 'order.label.hasPaid', defaultMessage: '已支付' },
  hasRefunded: { id: 'order.label.hasRefunded', defaultMessage: '已退款' },
})

type FieldProps = {
  type: 'paid' | 'refunded'
  price: number
  paidAt: Moment
}

const ModifyOrderStatusModal: React.VFC<{
  orderLogId: string
  defaultPrice?: number
  onRefetch?: () => void
}> = ({ orderLogId, defaultPrice = 0, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentMemberId } = useAuth()
  const [insertPaymentLog] = useMutation<hasura.INSERT_PAYMENT_LOG, hasura.INSERT_PAYMENT_LOGVariables>(
    INSERT_PAYMENT_LOG,
  )
  const [updateOrderLogStatus] = useMutation<hasura.UPDATE_ORDER_LOG_STATUS, hasura.UPDATE_ORDER_LOG_STATUSVariables>(
    UPDATE_ORDER_LOG_STATUS,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (onFinished?: () => void) => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      const status = values.type === 'paid' ? 'SUCCESS' : 'REFUND'
      const paidAt = values.paidAt.toISOString(true)

      await insertPaymentLog({
        variables: {
          data: {
            order_id: orderLogId,
            no: `${Date.now()}`,
            status: status,
            price: values.price,
            gateway: 'lodestar',
            options: {
              authorId: currentMemberId,
            },
            paid_at: paidAt,
          },
        },
      })

      await updateOrderLogStatus({
        variables: {
          orderLogId,
          status: status,
          lastPaidAt: paidAt,
        },
      })

      onRefetch?.()
      onFinished?.()
    } catch (error) {
      handleError(error)
    }
    setLoading(false)
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button size="middle" className="mr-2" onClick={() => setVisible(true)}>
          {formatMessage(messages.modifyOrderStatus)}
        </Button>
      )}
      title={formatMessage(messages.modifyOrderStatus)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button onClick={() => setVisible(false)} className="mr-2">
            {formatMessage(commonMessages.ui.back)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
    >
      <div className="mb-5">{formatMessage(messages.modifyOrderStatusDescription)}</div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'paid',
          price: defaultPrice,
          paidAt: moment().startOf('minute'),
        }}
      >
        <div className="row">
          <div className="col-6">
            <Form.Item label={formatMessage(orderMessages.label.orderLogStatus)} name="type">
              <Select<string>>
                <Select.Option value="paid">{formatMessage(messages.hasPaid)}</Select.Option>
                <Select.Option value="refunded">{formatMessage(messages.hasRefunded)}</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="col-6">
            <Form.Item label={formatMessage(messages.paidPrice)} name="price">
              <InputNumber
                min={0}
                formatter={value => `NT$ ${value}`}
                parser={value => value?.replace(/\D/g, '') || ''}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item label={formatMessage(orderMessages.label.paymentLogPaidAt)} name="paidAt">
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{
              defaultValue: moment('00:00:00', 'HH:mm:ss'),
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_PAYMENT_LOG = gql`
  mutation INSERT_PAYMENT_LOG($data: payment_log_insert_input!) {
    insert_payment_log_one(object: $data) {
      no
    }
  }
`
const UPDATE_ORDER_LOG_STATUS = gql`
  mutation UPDATE_ORDER_LOG_STATUS($orderLogId: String!, $status: String!, $lastPaidAt: timestamptz!) {
    update_order_log(where: { id: { _eq: $orderLogId } }, _set: { status: $status, last_paid_at: $lastPaidAt }) {
      affected_rows
    }
  }
`

export default ModifyOrderStatusModal
