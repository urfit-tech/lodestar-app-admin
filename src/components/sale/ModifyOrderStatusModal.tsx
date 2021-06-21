import { Button, DatePicker, Form, InputNumber, Select } from 'antd'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
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

const ModifyOrderStatusModal: React.VFC<{
  orderLogId: string
  defaultPrice?: number
}> = ({ orderLogId, defaultPrice = 0 }) => {
  const { formatMessage } = useIntl()

  const handleSubmit = async () => {}

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button onClick={() => setVisible(true)}>{formatMessage(messages.modifyOrderStatus)}</Button>
      )}
      title={formatMessage(messages.modifyOrderStatus)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button onClick={() => setVisible(false)} className="mr-2">
            {formatMessage(commonMessages.ui.back)}
          </Button>
          <Button type="primary" onClick={async () => await handleSubmit()}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
    >
      <div className="mb-5">{formatMessage(messages.modifyOrderStatusDescription)}</div>
      <Form
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

export default ModifyOrderStatusModal
