import { EditOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { currencyFormatter } from '../../../helpers'
import { PlusIcon, TrashOIcon } from '../../../images/icon'
import saleMessages from '../translation'
import { EditablePaymentLog } from './types'

const PaymentLogsTab: React.VFC<{
  paymentLogs: EditablePaymentLog[]
  onAdd: () => void
  onEdit: (paymentLog: EditablePaymentLog) => void
  onDelete: (id: string) => void
}> = ({ paymentLogs, onAdd, onEdit, onDelete }) => {
  const { formatMessage } = useIntl()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
        <Button type="link" size="small" icon={<PlusIcon />} onClick={onAdd}>
          {formatMessage(saleMessages.SaleCollectionExpandRow.addPaymentLog)}
        </Button>
      </div>
      {paymentLogs.map(paymentLog => (
        <div
          key={paymentLog.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px',
            marginBottom: '4px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          }}
        >
          <div>
            <span>{paymentLog.no || '無編號'}</span>
            {' - '}
            {currencyFormatter(paymentLog.price)}
            {' - '}
            {paymentLog.status || 'UNPAID'}
          </div>
          <div>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(paymentLog)}
            />
            <Button
              type="link"
              size="small"
              danger
              icon={<TrashOIcon />}
              onClick={() => onDelete(paymentLog.id)}
            />
          </div>
        </div>
      ))}
      {paymentLogs.length === 0 && (
        <Typography.Text type="secondary">暫無付款紀錄，請點擊「新增付款紀錄」添加</Typography.Text>
      )}
    </div>
  )
}

export default PaymentLogsTab
