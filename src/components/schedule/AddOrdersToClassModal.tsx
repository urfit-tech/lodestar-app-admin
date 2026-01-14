import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Modal, Spin, Table, Tag, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import dayjs from 'dayjs'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAddOrderToClassGroup, useAvailableOrdersForClass } from '../../hooks/scheduleManagement'
import { ScheduleType } from '../../types/schedule'

const SearchWrapper = styled.div`
  margin-bottom: 16px;
`

const InfoText = styled(Typography.Text)`
  display: block;
  margin-bottom: 12px;
`

interface OrderForDisplay {
  orderId: string
  memberId: string
  memberName: string
  memberEmail: string
  productName: string
  language: string
  classType: string
  totalSessions: number
  createdAt: string
  status?: string
  expiredAt?: string | null
  campusId?: string | null
}

interface AddOrdersToClassModalProps {
  visible: boolean
  classGroupId: string
  scheduleType: ScheduleType
  language: string
  existingOrderIds: string[]
  campusId?: string
  onClose: () => void
  onOrdersAdded: () => void
}

const AddOrdersToClassModal: React.FC<AddOrdersToClassModalProps> = ({
  visible,
  classGroupId,
  scheduleType,
  language,
  existingOrderIds,
  campusId,
  onClose,
  onOrdersAdded,
}) => {
  const { formatMessage } = useIntl()
  const [searchText, setSearchText] = useState('')
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [addingOrders, setAddingOrders] = useState(false)

  // Fetch available orders (not yet assigned to any class group)
  const classType = scheduleType === 'semester' ? 'semester' : 'group'
  const { orders, loading, refetch } = useAvailableOrdersForClass(classType, language, existingOrderIds)
  const { addOrderToClassGroup } = useAddOrderToClassGroup()

  // Transform orders to display format
  const displayOrders = useMemo((): OrderForDisplay[] => {
    if (!orders) return []

    const now = new Date()

    return orders
      .map(order => {
        const firstProduct = order.order_products?.[0]
        const productOptions = firstProduct?.options as any
        const productMeta = productOptions?.options || {}
        const orderOptions = order.options as any
        const campusFromOptions =
          orderOptions?.campus_id || orderOptions?.campusId || productMeta?.campus_id || productMeta?.campusId || null

        return {
          orderId: order.id,
          memberId: order.member_id,
          memberName: order.member?.name || '(未設定姓名)',
          memberEmail: order.member?.email || '',
          productName: productMeta?.title || productOptions?.title || firstProduct?.name || '-',
          language: productMeta?.language || '-',
          classType: productMeta?.class_type || '-',
          totalSessions: productMeta?.total_sessions?.max || productOptions?.quantity || 0,
          createdAt: order.created_at,
          status: order.status,
          expiredAt: order.expired_at,
          campusId: campusFromOptions,
        }
      })
      .filter(order => {
        if ((order.status || '').includes('EXPIRED')) return false
        if (order.expiredAt && new Date(order.expiredAt) < now) return false
        if (campusId && order.campusId && order.campusId !== campusId) return false
        return true
      })
  }, [orders, campusId])

  // Filter by search text
  const filteredOrders = useMemo(() => {
    if (!searchText) return displayOrders

    const search = searchText.toLowerCase()
    return displayOrders.filter(
      o =>
        o.memberName.toLowerCase().includes(search) ||
        o.memberEmail.toLowerCase().includes(search) ||
        o.productName.toLowerCase().includes(search),
    )
  }, [displayOrders, searchText])

  const handleAddOrders = useCallback(async () => {
    if (selectedOrderIds.length === 0) {
      message.warning('請選擇要加入的訂單')
      return
    }

    setAddingOrders(true)
    try {
      let successCount = 0
      for (const orderId of selectedOrderIds) {
        const success = await addOrderToClassGroup(classGroupId, orderId)
        if (success) successCount++
      }

      if (successCount > 0) {
        message.success(`已成功加入 ${successCount} 筆訂單`)
        setSelectedOrderIds([])
        refetch()
        onOrdersAdded()
      }

      if (successCount === selectedOrderIds.length) {
        onClose()
      }
    } catch (error) {
      console.error('Failed to add orders:', error)
      message.error('加入訂單失敗')
    } finally {
      setAddingOrders(false)
    }
  }, [selectedOrderIds, classGroupId, addOrderToClassGroup, refetch, onOrdersAdded, onClose])

  const columns: ColumnsType<OrderForDisplay> = [
    {
      title: '學生',
      key: 'member',
      render: (_, record) => (
        <div>
          <div>{record.memberName}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.memberEmail}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: '產品',
      key: 'product',
      dataIndex: 'productName',
      ellipsis: true,
    },
    {
      title: '語言',
      key: 'language',
      dataIndex: 'language',
      width: 80,
      render: lang => <Tag>{lang}</Tag>,
    },
    {
      title: '堂數',
      key: 'sessions',
      dataIndex: 'totalSessions',
      width: 80,
      render: sessions => `${sessions} 堂`,
    },
    {
      title: '訂購日期',
      key: 'createdAt',
      dataIndex: 'createdAt',
      width: 110,
      render: date => dayjs(date).format('YYYY-MM-DD'),
    },
  ]

  const rowSelection = {
    selectedRowKeys: selectedOrderIds,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedOrderIds(selectedKeys as string[])
    },
  }

  const handleClose = () => {
    setSearchText('')
    setSelectedOrderIds([])
    onClose()
  }

  // 學期班 searches for 團體班 orders, 小組班 searches for 小組班 orders
  const classTypeLabel = scheduleType === 'semester' ? '團體班' : '小組班'

  return (
    <Modal
      title={`加入${classTypeLabel}訂單`}
      visible={visible}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddOrders}
          loading={addingOrders}
          disabled={selectedOrderIds.length === 0}
        >
          加入選取的訂單 ({selectedOrderIds.length})
        </Button>,
      ]}
    >
      <InfoText type="secondary">
        以下顯示尚未加入任何班級的「{classTypeLabel}」訂單。選擇訂單後點擊「加入」按鈕。
      </InfoText>

      <SearchWrapper>
        <Input
          placeholder="搜尋學生姓名、Email 或產品名稱"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
      </SearchWrapper>

      <Spin spinning={loading}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredOrders}
          rowKey="orderId"
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{
            emptyText: loading ? '載入中...' : '目前沒有可加入的訂單',
          }}
        />
      </Spin>
    </Modal>
  )
}

export default AddOrdersToClassModal
