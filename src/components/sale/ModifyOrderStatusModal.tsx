import { gql, useMutation } from '@apollo/client'
import { Button, DatePicker, Form, InputNumber, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, orderMessages } from '../../helpers/translation'
import { useMemberPermissionGroups } from '../../hooks/member'
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
  price: number
  paidAt: Moment
  bankAccountInfo?: string
}

type ModifyType = 'paid' | 'refunded' | 'expired'

const ModifyOrderStatusModal: React.VFC<{
  orderLogId: string
  defaultOrderStatus: string
  paymentLogs: {
    price: number
    status: string | null | undefined
    gateway?: string | null
    method?: string | null
    no?: string
  }[]
  onRefetch?: (status: string) => void
  canModifyOperations?: string[]
  renderTrigger?: (props: { setVisible: React.Dispatch<React.SetStateAction<boolean>> }) => React.ReactElement
  targetPaymentNo?: string
  minPrice?: number
  totalPrice: number
  showBankAccountSelect?: boolean
}> = ({
  orderLogId,
  defaultOrderStatus,
  paymentLogs,
  onRefetch,
  canModifyOperations,
  renderTrigger,
  targetPaymentNo,
  minPrice,
  totalPrice,
  showBankAccountSelect = false,
}) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentMemberId } = useAuth()
  const [upsertPaymentLog] = useMutation<hasura.UpsertPaymentLog, hasura.UpsertPaymentLogVariables>(UpsertPaymentLog)
  const [updateOrderLogStatus] = useMutation<hasura.UPDATE_ORDER_LOG_STATUS, hasura.UPDATE_ORDER_LOG_STATUSVariables>(
    UPDATE_ORDER_LOG_STATUS,
  )
  const { memberPermissionGroups } = useMemberPermissionGroups(currentMemberId || '')
  const currentUserPermissionGroupId = memberPermissionGroups.map(group => group.permission_group_id)

  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<ModifyType>('paid')
  const { settings } = useApp()

  const maxPrice =
    type === 'paid'
      ? totalPrice - sum(paymentLogs.filter(p => p.status === 'SUCCESS').map(p => p.price))
      : type === 'refunded'
      ? sum(paymentLogs.filter(p => p.status === 'SUCCESS').map(p => p.price)) -
        sum(paymentLogs.filter(p => p.status === 'REFUND').map(p => p.price))
      : 0

  const paymentMethod = paymentLogs[0]?.method

  const customSetting = JSON.parse(settings['custom'] || '{}')
  const paymentCompanies: {
    permissionGroupId?: string
    bankAccountInfo?: { optionName: string; bankAccountNumber?: string }[]
  }[] = customSetting.paymentCompanies || []

  const matchedPermissionGroupId = paymentCompanies.filter(
    company => company.permissionGroupId && currentUserPermissionGroupId.includes(company.permissionGroupId),
  )

  const bankOptionName = matchedPermissionGroupId
    .flatMap(company => company.bankAccountInfo ?? [])
    .map(info => {
      const rawNumber = info.bankAccountNumber?.replace(/-/g, '') || ''
      const lastFourDigits = rawNumber.slice(-4)
      info.optionName = `${info.optionName}: ${lastFourDigits}`
      return {
        label: info.optionName,
        value: info.optionName,
      }
    })

  const handleSubmit = async (onFinished?: () => void) => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      if (type !== 'expired') {
        const paymentStatus = type === 'paid' ? 'SUCCESS' : 'REFUND'
        const paidAt = values.paidAt.toISOString(true)
        await upsertPaymentLog({
          variables: {
            data: {
              order_id: orderLogId,
              no: targetPaymentNo || `${Date.now()}`,
              status: paymentStatus,
              price: values.price,
              gateway: 'lodestar',
              options: {
                gateway: paymentLogs[0]?.gateway || 'lodestar',
                method: paymentLogs[0]?.method,
                authorId: currentMemberId,
                bankAccountInfo: values.bankAccountInfo,
              },
              paid_at: paidAt,
            },
          },
        })
        let newPaymentLogs = paymentLogs.filter(p => p.no !== targetPaymentNo)
        newPaymentLogs.push({ status: paymentStatus, price: values.price })
        const totalAmount = totalPrice
        const hasRefundPayment =
          newPaymentLogs.filter(v => v.status === 'REFUND').length > 0 || paymentStatus === 'REFUND'
        const paidAmount = sum(newPaymentLogs.filter(v => v.status === 'SUCCESS').map(v => v.price))
        const refundAmount = sum(newPaymentLogs.filter(v => v.status === 'REFUND').map(v => v.price))
        let orderStatus = defaultOrderStatus

        if (totalAmount <= 0 || paidAmount - refundAmount >= totalAmount) {
          orderStatus = 'SUCCESS'
        } else if (hasRefundPayment && paidAmount <= refundAmount) {
          orderStatus = 'REFUND'
        } else if (!hasRefundPayment && totalAmount > 0 && paidAmount - refundAmount < totalAmount) {
          orderStatus = 'PARTIAL_PAID'
        } else if (hasRefundPayment && paidAmount > refundAmount) {
          orderStatus = 'PARTIAL_REFUND'
        }

        await updateOrderLogStatus({
          variables: {
            orderLogId,
            status: orderStatus,
            lastPaidAt: paidAt,
          },
        })
        onRefetch?.(orderStatus)
      } else {
        await updateOrderLogStatus({
          variables: {
            orderLogId,
            status: 'EXPIRED',
          },
        })
        onRefetch?.('EXPIRED')
      }
      onFinished?.()
    } catch (error) {
      handleError(error)
    }
    setLoading(false)
  }

  return (
    <AdminModal
      renderTrigger={renderTrigger}
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
          price: maxPrice,
          paidAt: moment().startOf('minute'),
        }}
      >
        <div className="row">
          <div className="col-6">
            <Form.Item label={formatMessage(orderMessages.label.orderLogStatus)} name="type">
              <Select<string> defaultValue={type} value={type} onChange={e => setType(e as ModifyType)}>
                {[
                  { operation: 'paid', label: formatMessage(messages.hasPaid) },
                  { operation: 'refunded', label: formatMessage(messages.hasRefunded) },
                  { operation: 'expired', label: formatMessage(commonMessages.status.orderExpired) },
                ]
                  .filter(o => !canModifyOperations || canModifyOperations.includes(o.operation))
                  .map(o => (
                    <Select.Option key={o.operation} value={o.operation}>
                      {o.label}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-6">
            <Form.Item
              label={formatMessage(messages.paidPrice)}
              name="price"
              rules={[
                formInstance => ({
                  message: `金額不能超過 ${maxPrice}`,
                  validator() {
                    const price = formInstance.getFieldValue('price')
                    if (price > maxPrice) {
                      return Promise.reject(new Error())
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <InputNumber
                min={minPrice || 0}
                max={maxPrice}
                formatter={value => `NT$ ${value}`}
                parser={value => value?.replace(/\D/g, '') || ''}
              />
            </Form.Item>
          </div>
          {showBankAccountSelect && paymentMethod?.toLowerCase() === 'banktransfer' && (
            <div className="col-6">
              <Form.Item
                label={formatMessage(orderMessages.label.bankAccount)}
                name="bankAccountInfo"
                rules={[
                  {
                    required: true,
                    message: '請選擇收款帳號',
                  },
                ]}
              >
                <Select options={bankOptionName} placeholder="請選擇帳號名稱" />
              </Form.Item>
            </div>
          )}
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

const UpsertPaymentLog = gql`
  mutation UpsertPaymentLog($data: payment_log_insert_input!) {
    insert_payment_log_one(
      object: $data
      on_conflict: { constraint: payment_log_no_key, update_columns: [status, paid_at, options] }
    ) {
      no
    }
  }
`
const UPDATE_ORDER_LOG_STATUS = gql`
  mutation UPDATE_ORDER_LOG_STATUS($orderLogId: String!, $status: String!, $lastPaidAt: timestamptz) {
    update_order_log(where: { id: { _eq: $orderLogId } }, _set: { status: $status, last_paid_at: $lastPaidAt }) {
      affected_rows
    }
  }
`

export default ModifyOrderStatusModal
