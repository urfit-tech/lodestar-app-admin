import { Button, Form, Input, InputNumber, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminModal from '../../admin/AdminModal'
import { commonMessages } from '../../../helpers/translation'
import saleMessages from '../translation'
import { EditablePaymentLog } from './types'

const PaymentLogEditModal: React.VFC<{
  paymentLog: EditablePaymentLog
  onSave: (paymentLog: EditablePaymentLog) => void
  onCancel: () => void
}> = ({ paymentLog, onSave, onCancel }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [isOpen, setIsOpen] = useState(true)

  React.useEffect(() => {
    form.setFieldsValue({
      no: paymentLog.no,
      price: paymentLog.price,
      status: paymentLog.status || 'SUCCESS',
      gateway: paymentLog.gateway || 'lodestar',
      method: paymentLog.method,
    })
  }, [paymentLog, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      onSave({
        ...paymentLog,
        no: values.no,
        price: values.price,
        status: values.status,
        gateway: values.gateway,
        method: values.method,
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <AdminModal
      title={formatMessage(saleMessages.SaleCollectionExpandRow.editPaymentLog)}
      footer={null}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onCancel={onCancel}
      renderFooter={() => (
        <>
          <Button onClick={onCancel} className="mr-2">
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="付款編號" name="no">
          <Input placeholder="可選" />
        </Form.Item>
        <Form.Item
          label={formatMessage(saleMessages.SaleCollectionExpandRow.paymentAmount)}
          name="price"
          rules={[{ required: true, message: '請輸入付款金額' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={formatMessage(saleMessages.SaleCollectionExpandRow.paymentStatus)} name="status">
          <Select>
            <Select.Option value="SUCCESS">成功</Select.Option>
            <Select.Option value="REFUND">退款</Select.Option>
            <Select.Option value="FAILED">失敗</Select.Option>
            <Select.Option value="PENDING">待處理</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label={formatMessage(saleMessages.SaleCollectionExpandRow.paymentGatewayLabel)} name="gateway">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(saleMessages.SaleCollectionExpandRow.paymentMethodLabel)} name="method">
          <Input placeholder="可選" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default PaymentLogEditModal
