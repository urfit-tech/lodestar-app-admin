import { Icon, Popover, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { ReactComponent as TextIcon } from '../../images/icon/text.svg'
import { ProductInventoryLogProps } from '../../types/general'

const StyledQuantity = styled.span<{ quantity: number }>`
  color: ${props => (props.quantity > 0 ? '#4ed1b3' : '#ff7d62')};
`
const StyledIcon = styled(Icon)`
  color: ${props => props.theme['@primary-color']};
`
const StyledContent = styled.div`
  padding: 0.75rem;
  max-width: 13rem;
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;
`

const MerchandiseInventoryTable: React.FC<{
  inventoryLogs: ProductInventoryLogProps[]
}> = ({ inventoryLogs }) => {
  const { formatMessage } = useIntl()

  const STATUS: { [Key: string]: string } = {
    arrange: formatMessage(merchandiseMessages.status.arrange),
  }

  const columns: ColumnProps<ProductInventoryLogProps>[] = [
    {
      dataIndex: 'date',
      title: formatMessage(commonMessages.label.date),
      render: (text, record, index) => moment(record.createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      dataIndex: 'status',
      title: formatMessage(merchandiseMessages.label.status),
      render: (text, record, index) => (
        <>
          <span>{STATUS[text] || 'unknown'}</span>
          {!!record.comment && (
            <Popover placement="topLeft" content={<StyledContent>{record.comment}</StyledContent>} trigger="click">
              <StyledIcon component={() => <TextIcon />} className="ml-2" />
            </Popover>
          )}
        </>
      ),
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
    <Table<ProductInventoryLogProps>
      columns={columns}
      rowKey={inventoryLog => inventoryLog.id}
      dataSource={inventoryLogs}
    />
  )
}

export default MerchandiseInventoryTable
