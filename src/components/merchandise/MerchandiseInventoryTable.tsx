import { Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { MerchandiseInventoryLog } from '../../types/merchandise'

const MerchandiseInventoryTable: React.FC<{
  merchandiseId: string
  inventoryLogs: MerchandiseInventoryLog[]
}> = ({ inventoryLogs }) => {
  const { formatMessage } = useIntl()

  const columns: ColumnProps<MerchandiseInventoryLog>[] = [
    {
      dataIndex: 'date',
      title: formatMessage(commonMessages.label.date),
      render: (text, record, index) => moment(record.createdAt).format('YYYYMMDD HH:mm'),
    },
    {
      dataIndex: 'status',
      title: formatMessage(merchandiseMessages.label.status),
    },
    {
      dataIndex: 'meta',
      title: formatMessage(merchandiseMessages.label.meta),
    },
    {
      dataIndex: 'amount',
      title: formatMessage(merchandiseMessages.label.amount),
      align: 'right',
    },
  ]

  return <Table<MerchandiseInventoryLog> columns={columns} dataSource={inventoryLogs} />
}

export default MerchandiseInventoryTable
