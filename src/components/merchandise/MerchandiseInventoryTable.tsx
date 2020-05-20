import { Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { MerchandiseInventoryLog } from '../../types/merchandise'

const StyledQuantity = styled.span<{ quantity: number }>`
  color: ${props => (props.quantity > 0 ? '#4ed1b3' : '#ff7d62')};
`

const MerchandiseInventoryTable: React.FC<{
  inventoryLogs: MerchandiseInventoryLog[]
}> = ({ inventoryLogs }) => {
  const { formatMessage } = useIntl()

  const STATUS: { [Key: string]: string } = {
    arrange: formatMessage(merchandiseMessages.status.arrange),
  }

  const columns: ColumnProps<MerchandiseInventoryLog>[] = [
    {
      dataIndex: 'date',
      title: formatMessage(commonMessages.label.date),
      render: (text, record, index) => moment(record.createdAt).format('YYYYMMDD HH:mm'),
    },
    {
      dataIndex: 'status',
      title: formatMessage(merchandiseMessages.label.status),
      render: (text, record, index) => STATUS[text] || 'unknown',
    },
    {
      dataIndex: 'specification',
      title: formatMessage(merchandiseMessages.label.specification),
    },
    {
      dataIndex: 'quantity',
      title: formatMessage(merchandiseMessages.label.quantity),
      align: 'right',
      render: (text, record, index) => (
        <StyledQuantity quantity={record.quantity}>
          {record.quantity > 0 ? `+${record.quantity}` : record.quantity}
        </StyledQuantity>
      ),
    },
  ]

  return (
    <Table<MerchandiseInventoryLog>
      columns={columns}
      rowKey={inventoryLog => inventoryLog.id}
      dataSource={inventoryLogs}
    />
  )
}

export default MerchandiseInventoryTable
