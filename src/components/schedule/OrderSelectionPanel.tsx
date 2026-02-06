import { ExclamationCircleFilled } from '@ant-design/icons'
import { Checkbox, Empty, Table, Tabs, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import dayjs from 'dayjs'
import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Order, ScheduleType } from '../../types/schedule'
import { ScheduleCard } from './styles'
import scheduleMessages from './translation'

const { TabPane } = Tabs

const UnpaidIcon = styled(ExclamationCircleFilled)`
  color: #ff4d4f;
  margin-right: 4px;
`

const SubTitle = styled(Typography.Text)`
  display: block;
  margin-bottom: 12px;
`

const EmptyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`

interface OrderSelectionPanelProps {
  orders: Order[]
  selectedOrderIds: string[]
  onSelectOrders: (orderIds: string[]) => void
  scheduleType: ScheduleType
  usedMinutesByOrder?: Record<string, number>
  lastClassDateByOrderId?: Record<string, Date | null>
  expiryDateByOrderId?: Record<string, Date | null>
}

const OrderSelectionPanel: React.FC<OrderSelectionPanelProps> = ({
  orders,
  selectedOrderIds,
  onSelectOrders,
  scheduleType,
  usedMinutesByOrder = {},
  lastClassDateByOrderId = {},
  expiryDateByOrderId = {},
}) => {
  const { formatMessage } = useIntl()

  // Group orders by language
  const ordersByLanguage = useMemo(() => {
    const grouped: Record<string, Order[]> = {}
    orders.forEach(order => {
      const lang = order.language || '未指定'
      if (!grouped[lang]) {
        grouped[lang] = []
      }
      grouped[lang].push(order)
    })
    return grouped
  }, [orders])

  const availableLanguages = Object.keys(ordersByLanguage)

  // Get the language of currently selected orders
  const selectedLanguage = useMemo(() => {
    if (selectedOrderIds.length === 0) return null
    const firstSelectedOrder = orders.find(o => o.id === selectedOrderIds[0])
    return firstSelectedOrder?.language
  }, [selectedOrderIds, orders])

  const handleOrderToggle = useCallback(
    (orderId: string, checked: boolean, orderLanguage: string) => {
      if (checked) {
        // If selecting orders from a different language, clear previous selection
        if (selectedLanguage && selectedLanguage !== orderLanguage) {
          onSelectOrders([orderId])
        } else {
          onSelectOrders([...selectedOrderIds, orderId])
        }
      } else {
        onSelectOrders(selectedOrderIds.filter(id => id !== orderId))
      }
    },
    [selectedOrderIds, selectedLanguage, onSelectOrders],
  )

  const handleSelectAll = useCallback(
    (language: string, checked: boolean) => {
      const languageOrders = ordersByLanguage[language] || []
      if (checked) {
        // Clear other languages and select all in this language
        onSelectOrders(languageOrders.map(o => o.id))
      } else {
        onSelectOrders([])
      }
    },
    [ordersByLanguage, onSelectOrders],
  )

  const isOrderDisabled = useCallback(
    (orderLanguage: string): boolean => {
      return selectedLanguage !== null && selectedLanguage !== orderLanguage
    },
    [selectedLanguage],
  )

  const columns: ColumnsType<Order> = [
    {
      title: '',
      key: 'checkbox',
      width: 40,
      render: (_, record) => (
        <Checkbox
          checked={selectedOrderIds.includes(record.id)}
          disabled={isOrderDisabled(record.language)}
          onChange={e => handleOrderToggle(record.id, e.target.checked, record.language)}
        />
      ),
    },
    {
      title: formatMessage(scheduleMessages.OrderSelection.productName),
      dataIndex: 'productName',
      key: 'productName',
      render: (name, record) => (
        <span>
          {record.status !== 'SUCCESS' && <UnpaidIcon />}
          {name}
        </span>
      ),
    },
    {
      title: formatMessage(scheduleMessages.OrderSelection.lastClassDate),
      dataIndex: 'lastClassDate',
      key: 'lastClassDate',
      render: (_date, record) => {
        const lastClassDate = lastClassDateByOrderId[record.id] || record.lastClassDate
        return lastClassDate ? dayjs(lastClassDate).format('YYYY-MM-DD') : '-'
      },
    },
    {
      title: formatMessage(scheduleMessages.OrderSelection.availableMinutes),
      dataIndex: 'availableMinutes',
      key: 'availableMinutes',
      render: (minutes, record) => {
        const usedMinutes = usedMinutesByOrder[record.id] || 0
        const remainingMinutes = Math.max(0, minutes - usedMinutes)
        if (usedMinutes > 0) {
          return (
            <span>
              {remainingMinutes} 分鐘
              <Typography.Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                (已排 {Math.round(usedMinutes)})
              </Typography.Text>
            </span>
          )
        }
        return `${minutes} 分鐘`
      },
    },
    {
      title: formatMessage(scheduleMessages.OrderSelection.expiresAt),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date, record) => {
        const displayDate = expiryDateByOrderId[record.id] || date
        return displayDate ? dayjs(displayDate).format('YYYY-MM-DD') : '-'
      },
    },
  ]

  if (orders.length === 0) {
    return (
      <ScheduleCard title={formatMessage(scheduleMessages.OrderSelection.title)} size="small">
        <EmptyWrapper>
          <Empty description="無可用訂單" />
        </EmptyWrapper>
      </ScheduleCard>
    )
  }

  return (
    <ScheduleCard title={formatMessage(scheduleMessages.OrderSelection.title)} size="small">
      <SubTitle type="secondary">{formatMessage(scheduleMessages.OrderSelection.subtitle)}</SubTitle>

      <Tabs defaultActiveKey={availableLanguages[0]}>
        {availableLanguages.map(lang => {
          const languageOrders = ordersByLanguage[lang]
          const allSelected = languageOrders.every(o => selectedOrderIds.includes(o.id))
          const someSelected = languageOrders.some(o => selectedOrderIds.includes(o.id))

          return (
            <TabPane
              tab={
                <span>
                  {lang || '未指定'}
                  {someSelected && ` (${languageOrders.filter(o => selectedOrderIds.includes(o.id)).length})`}
                </span>
              }
              key={lang}
            >
              <div style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  disabled={isOrderDisabled(lang)}
                  onChange={e => handleSelectAll(lang, e.target.checked)}
                >
                  全選
                </Checkbox>
              </div>
              <Table columns={columns} dataSource={languageOrders} rowKey="id" pagination={false} size="small" />
            </TabPane>
          )
        })}
      </Tabs>
    </ScheduleCard>
  )
}

export default OrderSelectionPanel
